const { pool } = require('../config/db');

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position;
    `);
    console.log('Appointments columns:');
    res.rows.forEach(r => console.log(` - ${r.column_name}: ${r.data_type}`));

    // Add any missing columns just in case
    await pool.query(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS case_id INT REFERENCES cases(id) ON DELETE SET NULL;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS shared_evidence JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS problem_statement TEXT;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS time_slots JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS lawyer_signed BOOLEAN DEFAULT FALSE;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS lawyer_signature VARCHAR(255);
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS lawyer_signed_at TIMESTAMP;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_signed BOOLEAN DEFAULT FALSE;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_signature VARCHAR(255);
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS citizen_signed_at TIMESTAMP;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS agreement_terms TEXT;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS decline_reason TEXT;
    `);
    console.log('Ensured all required consultation columns exist in appointments table!');

    // Also check cases table columns
    await pool.query(`
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS media_coverage_requested BOOLEAN DEFAULT FALSE;
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS media_contact_allowed BOOLEAN DEFAULT TRUE;
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS media_status VARCHAR(50) DEFAULT 'none';
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS media_notes TEXT;
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS ngo_aid_requested BOOLEAN DEFAULT FALSE;
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS ngo_status VARCHAR(50) DEFAULT 'none';
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS ngo_notes TEXT;
      ALTER TABLE cases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('Ensured all required case columns exist in cases table!');

    process.exit(0);
  } catch (err) {
    console.error('Error checking appointments table:', err.message);
    process.exit(1);
  }
}

check();
