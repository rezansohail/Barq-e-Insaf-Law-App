const { pool } = require('../config/db');

async function migrate() {
  console.log('Running Neon PostgreSQL migrations...');

  try {
    // 1. Users table (for Auth: citizen, lawyer, admin)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'citizen',
        phone VARCHAR(50),
        district VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked table: users');

    // 2. Lawyers columns check & update
    await pool.query(`
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS sbc_number VARCHAR(100);
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS specialty VARCHAR(100);
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'approved';
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1) DEFAULT 5.0;
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS total_ratings INT DEFAULT 0;
    `);
    console.log('Checked table: lawyers (columns updated)');

    // 3. Cases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id SERIAL PRIMARY KEY,
        citizen_id INT REFERENCES users(id) ON DELETE CASCADE,
        lawyer_id INT REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(200) NOT NULL,
        type VARCHAR(100),
        description TEXT,
        district VARCHAR(100),
        court VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        hearing_date DATE,
        notes TEXT,
        is_flagged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked table: cases');

    // 4. Appointments table (if not exists)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        citizen_id INT REFERENCES users(id) ON DELETE CASCADE,
        lawyer_id INT REFERENCES users(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        case_summary TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked table: appointments');

    // 5. Chat history table (if not exists)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        legal_category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Checked table: chat_history');

    console.log('All migrations completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
