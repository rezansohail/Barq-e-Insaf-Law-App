const pool = require('../config/db');

async function inspect() {
  try {
    const casesCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cases' ORDER BY ordinal_position"
    );
    console.log('=== CASES COLUMNS ===');
    console.table(casesCols.rows);

    const storiesCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'media_stories' ORDER BY ordinal_position"
    );
    console.log('=== MEDIA_STORIES COLUMNS ===');
    console.table(storiesCols.rows);

    const mediaCols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'media' ORDER BY ordinal_position"
    );
    console.log('=== MEDIA COLUMNS ===');
    console.table(mediaCols.rows);

    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log('=== ALL TABLES ===');
    console.log(tables.rows.map(r => r.table_name));

  } catch (err) {
    console.error('Error inspecting DB:', err.message);
  } finally {
    await pool.end();
  }
}

inspect();
