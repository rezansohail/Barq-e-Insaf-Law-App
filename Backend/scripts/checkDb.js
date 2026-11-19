const db = require('../config/db');

async function main() {
  try {
    const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tables in database:');
    for (const row of res.rows) {
      console.log(' - ' + row.table_name);
    }

    // Inspect columns of interest
    const tablesToCheck = ['users', 'citizens', 'lawyers', 'ngos', 'media', 'cases', 'admins', 'admin_audit_logs', 'notifications'];
    for (const table of tablesToCheck) {
      const colRes = await db.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);
      if (colRes.rows.length > 0) {
        console.log(`\nColumns for ${table}:`);
        colRes.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type} (default: ${c.column_default})`));
      } else {
        console.log(`\nTable ${table} does NOT exist.`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

main();
