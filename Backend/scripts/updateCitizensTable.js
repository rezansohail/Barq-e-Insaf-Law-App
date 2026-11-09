const { pool } = require('../config/db');

async function updateCitizens() {
  console.log('Updating citizens table schema...');
  try {
    // 1. Remove cnic column
    await pool.query(`ALTER TABLE citizens DROP COLUMN IF EXISTS cnic;`);

    // 2. Add district, password, and user_id columns
    await pool.query(`
      ALTER TABLE citizens ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE citizens ADD COLUMN IF NOT EXISTS password VARCHAR(255);
      ALTER TABLE citizens ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 3. Add UNIQUE constraints on email and phone
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_citizens_email') THEN
          ALTER TABLE citizens ADD CONSTRAINT uq_citizens_email UNIQUE (email);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_citizens_phone') THEN
          ALTER TABLE citizens ADD CONSTRAINT uq_citizens_phone UNIQUE (phone);
        END IF;
      END $$;
    `);

    console.log('Citizens table schema successfully updated with constraints!');
  } catch (err) {
    console.error('Error updating citizens table:', err);
  } finally {
    await pool.end();
  }
}

updateCitizens();
