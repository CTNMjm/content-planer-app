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

    // Prüfe ob dump.sql existiert
    const dumpPath = path.join(process.cwd(), 'dump.sql');
    try {
      const stats = await fs.stat(dumpPath);
      return NextResponse.json({ 
        message: 'Admin import endpoint ready',
        dumpFound: true,
        dumpSize: `${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usage: 'POST to this endpoint to import the dump.sql'
      });
    } catch {
      return NextResponse.json({ 
        message: 'Admin import endpoint ready',
        dumpFound: false,
        error: 'dump.sql not found in deployment'
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
      // Lese dump.sql aus dem Deployment
      const dumpPath = path.join(process.cwd(), 'dump.sql');
      console.log('Reading dump.sql from:', dumpPath);
      
      const sqlContent = await fs.readFile(dumpPath, 'utf-8');
      console.log(`Dump size: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);

      // Deaktiviere Constraints für schnelleren Import
      await client.query('SET session_replication_role = replica;');
      
      // Starte Transaktion
      await client.query('BEGIN;');
      
      try {
        // Teile bei echten Statement-Trennern
        const statements = sqlContent.split(/;\s*\n/g).filter(stmt => {
          const trimmed = stmt.trim();
          return trimmed && !trimmed.startsWith('--');
        });
        
        console.log(`Starting import of ${statements.length} statements...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i].trim();
          
          try {
            if (statement) {
              await client.query(statement);
              successCount++;
            }
          } catch (error) {
            errorCount++;
            console.error(`Error in statement ${i}:`, error);
            // Bestimmte Fehler ignorieren (z.B. "already exists")
            if (error instanceof Error && error.message.includes('already exists')) {
              console.log('Ignoring "already exists" error');
            } else {
              // Bei kritischen Fehlern abbrechen
              throw error;
            }
          }
          
          // Progress logging
          if (i % 1000 === 0) {
            console.log(`Progress: ${i}/${statements.length} statements (Success: ${successCount}, Errors: ${errorCount})`);
          }
        }
        
        await client.query('COMMIT;');
        console.log('Import completed successfully');
        
        // Constraints wieder aktivieren
        await client.query('SET session_replication_role = DEFAULT;');
        
        // ANALYZE für bessere Performance
        console.log('Running ANALYZE...');
        await client.query('ANALYZE;');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Import completed successfully',
          stats: {
            totalStatements: statements.length,
            successfulStatements: successCount,
            errors: errorCount
          }
        });
        
      } catch (error) {
        console.error('Import failed, rolling back...', error);
        await client.query('ROLLBACK;');
        throw error;
      }
      
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