const db = require('../config/db');

async function inspectCases() {
  try {
    const cols = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cases' 
      ORDER BY ordinal_position
    `);
    console.log('--- Columns in cases table ---');
    console.table(cols.rows);

    const countRes = await db.query('SELECT COUNT(*) as total FROM cases');
    console.log('Total cases in DB:', countRes.rows[0].total);

    const sample = await db.query('SELECT * FROM cases LIMIT 5');
    console.log('--- Sample cases ---');
    console.table(sample.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

inspectCases();
