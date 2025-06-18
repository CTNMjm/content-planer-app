import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lese dump.sql
    const dumpPath = path.join(process.cwd(), 'dump.sql');
    const sqlContent = await fs.readFile(dumpPath, 'utf-8');
    
    // Suche nach INSERT Statements
    const lines = sqlContent.split('\n');
    const insertStatements = lines.filter(line => 
      line.trim().toUpperCase().startsWith('INSERT INTO')
    );
    
    // Analysiere welche Tabellen INSERTs haben
    const tableInserts: Record<string, number> = {};
    insertStatements.forEach(stmt => {
      const match = stmt.match(/INSERT INTO public\."?(\w+)"?/i);
      if (match) {
        const tableName = match[1];
        tableInserts[tableName] = (tableInserts[tableName] || 0) + 1;
      }
    });
    
    // Zeige auch COPY Statements (alternative zu INSERT)
    const copyStatements = lines.filter(line => 
      line.trim().toUpperCase().startsWith('COPY')
    );
    
    const tableCopies: Record<string, number> = {};
    copyStatements.forEach(stmt => {
      const match = stmt.match(/COPY public\."?(\w+)"?/i);
      if (match) {
        const tableName = match[1];
        tableCopies[tableName] = (tableCopies[tableName] || 0) + 1;
      }
    });

    // Prüfe Dateigröße
    const stats = await fs.stat(dumpPath);

    return NextResponse.json({
      success: true,
      dumpInfo: {
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        totalLines: lines.length,
        insertStatements: insertStatements.length,
        copyStatements: copyStatements.length,
        tableInserts,
        tableCopies,
        sampleInserts: insertStatements.slice(0, 5).map(s => s.substring(0, 100) + '...'),
        sampleCopies: copyStatements.slice(0, 5).map(s => s.substring(0, 100) + '...')
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Dump analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// ...existing POST function...