const db = require('../config/db');

async function migrateNgo() {
  try {
    console.log('Running ngos table migration on Neon PostgreSQL...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS ngos (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(30) UNIQUE,
        district VARCHAR(100),
        cnic VARCHAR(20) UNIQUE,
        password VARCHAR(255) NOT NULL,
        organization_type VARCHAR(100) DEFAULT 'NGO / Media',
        registration_number VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        verification_status VARCHAR(50) DEFAULT 'pending',
        status VARCHAR(50) DEFAULT 'Active',
        role VARCHAR(50) DEFAULT 'ngo',
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ngos_email ON ngos(email);
      CREATE INDEX IF NOT EXISTS idx_ngos_phone ON ngos(phone);
    `);

    console.log('ngos table created successfully with constraints and indexes!');

    const res = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ngos'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in ngos table:');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateNgo();
