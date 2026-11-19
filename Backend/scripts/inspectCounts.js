const db = require('../config/db');

async function main() {
  try {
    const counts = await Promise.all([
      db.query('SELECT COUNT(*)::int AS count FROM users'),
      db.query('SELECT COUNT(*)::int AS count FROM citizens'),
      db.query('SELECT COUNT(*)::int AS count FROM lawyers'),
      db.query('SELECT COUNT(*)::int AS count FROM ngos'),
      db.query('SELECT COUNT(*)::int AS count FROM media'),
      db.query('SELECT COUNT(*)::int AS count FROM cases'),
      db.query('SELECT COUNT(*)::int AS count FROM admins'),
    ]);
    console.log({
      users: counts[0].rows[0].count,
      citizens: counts[1].rows[0].count,
      lawyers: counts[2].rows[0].count,
      ngos: counts[3].rows[0].count,
      media: counts[4].rows[0].count,
      cases: counts[5].rows[0].count,
      admins: counts[6].rows[0].count,
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
