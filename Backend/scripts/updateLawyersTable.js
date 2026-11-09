const { pool } = require('../config/db');

async function updateLawyers() {
  console.log('Updating lawyers table schema...');
  try {
    // 1. Sync existing rows so sbc_number matches license_number
    await pool.query(`UPDATE lawyers SET sbc_number = license_number WHERE sbc_number IS NULL;`);

    // 2. Add CNIC and password columns if they don't exist
    await pool.query(`
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS cnic VARCHAR(20);
      ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS password VARCHAR(255);
      ALTER TABLE lawyers ALTER COLUMN license_number DROP NOT NULL;
    `);

    // 3. Add UNIQUE constraints on sbc_number and cnic
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_lawyers_sbc_number') THEN
          ALTER TABLE lawyers ADD CONSTRAINT uq_lawyers_sbc_number UNIQUE (sbc_number);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_lawyers_cnic') THEN
          ALTER TABLE lawyers ADD CONSTRAINT uq_lawyers_cnic UNIQUE (cnic);
        END IF;
      END $$;
    `);

    // 4. Set defaults for new registrations
    await pool.query(`
      ALTER TABLE lawyers ALTER COLUMN verification_status SET DEFAULT 'pending';
      ALTER TABLE lawyers ALTER COLUMN is_verified SET DEFAULT FALSE;
    `);

    console.log('Lawyers table schema successfully updated with constraints!');
  } catch (err) {
    console.error('Error updating lawyers table:', err);
  } finally {
    await pool.end();
  }
}

updateLawyers();
