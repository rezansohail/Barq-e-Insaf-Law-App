const db = require('../config/db');
(async () => {
  const r = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'evidence_vault'");
  console.log('evidence_vault cols:', r.rows.map(x => x.column_name));
  process.exit(0);
})();
