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
    
    // Zeige auch COPY Statements
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

// POST function bleibt wie vorher - aber ohne den fehlerhaften Code
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      const dumpPath = path.join(process.cwd(), 'dump.sql');
      console.log('Reading dump.sql from:', dumpPath);
      
      const sqlContent = await fs.readFile(dumpPath, 'utf-8');
      console.log(`Dump size: ${(sqlContent.length / 1024).toFixed(2)} KB`);

      await client.query('SET session_replication_role = replica;');
      
      const lines = sqlContent.split('\n');
      let currentCopy: { table?: string; columns?: string; data: string[] } | null = null;
      let processedCopyCommands = 0;
      let processedStatements = 0;
      let errors = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.trim().toUpperCase().startsWith('COPY')) {
          if (currentCopy && currentCopy.table && currentCopy.data.length > 0) {
            try {
              console.log(`Processing ${currentCopy.data.length} rows for ${currentCopy.table}`);
              
              for (const dataLine of currentCopy.data) {
                const values = dataLine.split('\t');
                const columns = currentCopy.columns?.replace(/[()]/g, '').split(', ') || [];
                
                if (values.length > 0 && columns.length > 0) {
                  const insertQuery = `INSERT INTO ${currentCopy.table} (${columns.join(', ')}) VALUES (${values.map((v) => {
                    if (v === '\\N') return 'NULL';
                    if (v === 't') return 'true';
                    if (v === 'f') return 'false';
                    const escaped = v.replace(/'/g, "''");
                    return `'${escaped}'`;
                  }).join(', ')})`;
                  
                  try {
                    await client.query(insertQuery);
                    processedStatements++;
                  } catch (err) {
                    console.error(`Error inserting into ${currentCopy.table}:`, err);
                    errors++;
                  }
                }
              }
              
              processedCopyCommands++;
            } catch (err) {
              console.error(`Error processing COPY for ${currentCopy.table}:`, err);
              errors++;
            }
          }
          
          const match = line.match(/COPY\s+public\."?(\w+)"?\s*(\([^)]+\))?\s+FROM\s+stdin/i);
          if (match) {
            currentCopy = {
              table: `public."${match[1]}"`,
              columns: match[2],
              data: []
            };
          }
        } 
        else if (currentCopy && !line.startsWith('--')) {
          if (line === '\\.') {
            if (currentCopy.table && currentCopy.data.length > 0) {
              try {
                console.log(`Processing ${currentCopy.data.length} rows for ${currentCopy.table}`);
                
                for (const dataLine of currentCopy.data) {
                  const values = dataLine.split('\t');
                  const columns = currentCopy.columns?.replace(/[()]/g, '').split(', ') || [];
                  
                  if (values.length > 0 && columns.length > 0) {
                    const insertQuery = `INSERT INTO ${currentCopy.table} (${columns.join(', ')}) VALUES (${values.map((v) => {
                      if (v === '\\N') return 'NULL';
                      if (v === 't') return 'true';
                      if (v === 'f') return 'false';
                      const escaped = v.replace(/'/g, "''");
                      return `'${escaped}'`;
                    }).join(', ')})`;
                    
                    try {
                      await client.query(insertQuery);
                      processedStatements++;
                    } catch (err) {
                      console.error(`Error inserting into ${currentCopy.table}:`, err);
                      errors++;
                    }
                  }
                }
                
                processedCopyCommands++;
              } catch (err) {
                console.error(`Error processing COPY for ${currentCopy.table}:`, err);
                errors++;
              }
            }
            currentCopy = null;
          } else {
            currentCopy.data.push(line);
          }
        }
        else if (!currentCopy && line.trim() && !line.trim().startsWith('--')) {
          if (line.trim().endsWith(';')) {
            try {
              await client.query(line);
              processedStatements++;
            } catch (err) {
              if (err instanceof Error && !err.message.includes('already exists')) {
                console.error(`Error executing statement:`, err.message);
                errors++;
              }
            }
          }
        }
      }
      
      await client.query('SET session_replication_role = DEFAULT;');
      
      console.log('Running ANALYZE...');
      await client.query('ANALYZE;');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Import completed',
        stats: {
          processedCopyCommands,
          processedStatements,
          errors
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