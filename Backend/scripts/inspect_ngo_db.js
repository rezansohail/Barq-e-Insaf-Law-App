const pool = require('../config/db');

async function inspectNgo() {
  try {
    const casesCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cases' ORDER BY ordinal_position"
    );
    console.log('=== CASES COLUMNS ===');
    console.table(casesCols.rows);

    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log('=== ALL TABLES ===');
    console.log(tables.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

inspectNgo();
