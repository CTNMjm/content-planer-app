import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { Pool } from 'pg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Optional: Einfache Authentifizierung (z.B. Secret im Body)
  if (req.body?.secret !== process.env.ADMIN_IMPORT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dump = fs.readFileSync('./dump.sql', 'utf-8');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Achtung: Das ist nur für kleine Dumps geeignet!
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await pool.query(dump);
    await pool.end();
    res.status(200).json({ status: 'Import erfolgreich' });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}