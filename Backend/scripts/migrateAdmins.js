const db = require('../config/db');

async function migrateAdmins() {
  try {
    console.log('Running admins table migration on Neon PostgreSQL...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(30) UNIQUE,
        district VARCHAR(100),
        cnic VARCHAR(20) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_super_admin BOOLEAN DEFAULT FALSE,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
      CREATE INDEX IF NOT EXISTS idx_admins_phone ON admins(phone);
    `);

    console.log('admins table created successfully with constraints and indexes!');

    const res = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'admins'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in admins table:');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateAdmins();
