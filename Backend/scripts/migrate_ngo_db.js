const pool = require('../config/db');

async function migrateNgo() {
  try {
    console.log('Migrating database for NGO (NCHD) features...');

    // 1. Add NGO columns to cases table
    await pool.query(`
      ALTER TABLE cases 
      ADD COLUMN IF NOT EXISTS ngo_aid_requested BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS ngo_contact_allowed BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS ngo_status VARCHAR(50) DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS ngo_assistance_offered BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS ngo_assistance_message TEXT,
      ADD COLUMN IF NOT EXISTS ngo_assistance_offered_at TIMESTAMP;
    `);
    console.log('✅ Added NGO columns to cases table');

    // 2. Create ngo_stories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ngo_stories (
        id SERIAL PRIMARY KEY,
        ngo_id INTEGER REFERENCES ngos(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        district VARCHAR(100) NOT NULL,
        category VARCHAR(100) DEFAULT 'Legal Aid & Human Rights',
        officer_name VARCHAR(150) DEFAULT 'NCHD Human Development Officer',
        program_name VARCHAR(150) DEFAULT 'NCHD Pro-Bono Legal Empowerment',
        is_featured BOOLEAN DEFAULT FALSE,
        published_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created ngo_stories table');

    // Verify
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cases' AND column_name LIKE 'ngo_%'");
    console.log('Verified cases columns:', cols.rows.map(r => r.column_name));

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    process.exit(0);
  }
}

migrateNgo();
