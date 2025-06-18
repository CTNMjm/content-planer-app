import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

export const maxDuration = 300; // 5 Minuten Timeout
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Secret prüfen
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Debug: Liste Dateien im Root
    const files = await fs.readdir(process.cwd());
    
    // Prüfe ob dump.sql existiert
    const dumpPath = path.join(process.cwd(), 'dump.sql');
    try {
      const stats = await fs.stat(dumpPath);
      // Lese die ersten paar Zeilen für Debug
      const content = await fs.readFile(dumpPath, 'utf-8');
      const firstLines = content.split('\n').slice(0, 5).join('\n');
      
      return NextResponse.json({ 
        message: 'Admin import endpoint ready',
        dumpFound: true,
        dumpSize: `${(stats.size / 1024).toFixed(2)} KB`,
        dumpSizeBytes: stats.size,
        usage: 'POST to this endpoint to import the dump.sql',
        debug: {
          cwd: process.cwd(),
          filesInRoot: files.filter(f => !f.startsWith('.')),
          dumpPath: dumpPath,
          firstLines: firstLines.substring(0, 200) + '...'
        }
      });
    } catch (err) {
      return NextResponse.json({ 
        message: 'Admin import endpoint ready',
        dumpFound: false,
        error: 'dump.sql not found in deployment',
        debug: {
          cwd: process.cwd(),
          filesInRoot: files.filter(f => !f.startsWith('.')),
          dumpPath: dumpPath,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      });
    }
  } catch (error) {
    console.error('Admin import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Secret prüfen
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // PostgreSQL Verbindung
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    const client = new Client({
      connectionString: databaseUrl,
      statement_timeout: 0,
      query_timeout: 0,
    });

    await client.connect();

    try {
      // Erstelle fehlende Typen und Tabellen
      console.log('Creating missing types and tables...');
      
      // LocationStatus Enum
      try {
        await client.query(`
          CREATE TYPE "LocationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PLANNED');
        `);
        console.log('Created LocationStatus enum');
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          console.log('LocationStatus enum already exists');
        } else {
          console.error('Error creating LocationStatus:', error);
        }
      }

      // Weitere möglicherweise fehlende Typen
      const enumTypes = [
        { name: 'UserRole', values: "('USER', 'ADMIN')" },
        { name: 'NotificationType', values: "('EMAIL', 'PUSH', 'IN_APP')" },
        { name: 'EventStatus', values: "('DRAFT', 'PUBLISHED', 'ARCHIVED')" }
      ];

      for (const enumType of enumTypes) {
        try {
          await client.query(`CREATE TYPE "${enumType.name}" AS ENUM ${enumType.values};`);
          console.log(`Created ${enumType.name} enum`);
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            console.log(`${enumType.name} enum already exists`);
          }
        }
      }

      // Lese dump.sql aus dem Deployment
      const dumpPath = path.join(process.cwd(), 'dump.sql');
      console.log('Reading dump.sql from:', dumpPath);
      
      const sqlContent = await fs.readFile(dumpPath, 'utf-8');
      console.log(`Dump size: ${(sqlContent.length / 1024).toFixed(2)} KB`);

      // Deaktiviere Constraints für schnelleren Import
      await client.query('SET session_replication_role = replica;');
      
      // Teile den SQL-Content intelligent
      const statements = [];
      let currentStatement = '';
      const lines = sqlContent.split('\n');
      
      for (const line of lines) {
        // Skip comments and empty lines
        if (line.trim().startsWith('--') || line.trim() === '') {
          continue;
        }
        
        currentStatement += line + '\n';
        
        // Statement endet mit ; (aber nicht innerhalb von Strings)
        if (line.trim().endsWith(';')) {
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      }
      
      console.log(`Starting import of ${statements.length} statements...`);
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        try {
          if (statement && !statement.startsWith('--')) {
            await client.query(statement);
            successCount++;
          }
        } catch (error) {
          errorCount++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error in statement ${i}: ${errorMsg.substring(0, 100)}...`);
          
          // Sammle Fehler für den Report
          errors.push({
            statement: i,
            error: errorMsg.substring(0, 200),
            preview: statement.substring(0, 100) + '...'
          });
          
          // Ignoriere bestimmte Fehler
          if (errorMsg.includes('already exists') || 
              errorMsg.includes('duplicate key')) {
            console.log('Ignoring duplicate error');
          } else if (statements.length < 100) {
            // Bei wenigen Statements, stoppe bei Fehlern
            throw error;
          }
        }
        
        // Progress logging
        if (i % 100 === 0 && i > 0) {
          console.log(`Progress: ${i}/${statements.length} statements (Success: ${successCount}, Errors: ${errorCount})`);
        }
      }
      
      // Constraints wieder aktivieren
      await client.query('SET session_replication_role = DEFAULT;');
      
      // ANALYZE für bessere Performance
      console.log('Running ANALYZE...');
      await client.query('ANALYZE;');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Import completed',
        stats: {
          totalStatements: statements.length,
          successfulStatements: successCount,
          errors: errorCount,
          errorDetails: errors.slice(0, 10) // Erste 10 Fehler
        }
      });
      
    } finally {
      await client.end();
    }
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      error: 'Import failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}