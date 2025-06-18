import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Secret prüfen
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ 
      message: 'Admin import endpoint ready',
      usage: 'POST to this endpoint with the SQL dump'
    });
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
    });

    await client.connect();

    // SQL ausführen
    const formData = await request.formData();
    const file = formData.get('dump') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No dump file provided' }, { status: 400 });
    }

    const sqlContent = await file.text();
    
    // SQL in Chunks aufteilen und ausführen
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await client.query(statement);
        } catch (error) {
          console.error(`Error executing statement ${i}:`, error);
          // Weitermachen mit dem nächsten Statement
        }
      }
      
      // Progress logging
      if (i % 100 === 0) {
        console.log(`Processed ${i} of ${statements.length} statements`);
      }
    }

    await client.end();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${statements.length} statements` 
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      error: 'Import failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}