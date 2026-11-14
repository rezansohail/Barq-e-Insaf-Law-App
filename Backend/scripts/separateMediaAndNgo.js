const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function separateMediaAndNgo() {
  try {
    console.log('--- Step 1: Updating schema for ngos and media tables ---');

    // 1. Add resource_person to ngos if missing
    await db.query(`
      ALTER TABLE ngos ADD COLUMN IF NOT EXISTS resource_person VARCHAR(255);
    `);
    console.log('✓ Verified resource_person column in ngos table');

    // 2. Create media table
    await db.query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        channel_name VARCHAR(255),
        resource_person VARCHAR(255),
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(50),
        district VARCHAR(100) DEFAULT 'Sindh',
        cnic VARCHAR(30),
        password VARCHAR(255) NOT NULL,
        media_type VARCHAR(100) DEFAULT 'News Channel',
        registration_number VARCHAR(100),
        is_verified BOOLEAN DEFAULT TRUE,
        verification_status VARCHAR(50) DEFAULT 'approved',
        status VARCHAR(50) DEFAULT 'Active',
        role VARCHAR(50) DEFAULT 'media',
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_media_email ON media(email);
      CREATE INDEX IF NOT EXISTS idx_media_phone ON media(phone);
    `);
    console.log('✓ Created/verified media table');

    // 3. Clean up old dummy rows from ngos
    await db.query(`DELETE FROM ngos WHERE email IN ('test_ngo_1794215031437@edhi.org.pk', 'contact@humtv.org.pk') OR full_name ILIKE '%HUM TV%' OR full_name ILIKE '%Human Rights Commission Sindh%'`);
    await db.query(`DELETE FROM users WHERE email IN ('test_ngo_1794215031437@edhi.org.pk', 'contact@humtv.org.pk')`);
    console.log('✓ Cleaned up old dummy entries from ngos and users');

    // 4. Setup NGO: National commission for human development (NCHD)
    // Resources person name: Abdul Wajid Shaikh (Director NCHD)
    const ngoHashedPassword = await bcrypt.hash('Nchd@12345', 10);
    const ngoEmail = 'contact@nchd.org.pk';
    const ngoName = 'National Commission for Human Development (NCHD)';
    const ngoResourcePerson = 'Abdul Wajid Shaikh (Director NCHD)';
    const ngoPhone = '021-99201234';
    const ngoDistrict = 'Sindh';

    // Insert or update users table for NCHD
    const ngoUserRes = await db.query(`
      INSERT INTO users (name, email, password, role, phone, district)
      VALUES ($1, $2, $3, 'ngo', $4, $5)
      ON CONFLICT (email) DO UPDATE 
        SET name = EXCLUDED.name, 
            password = EXCLUDED.password, 
            role = 'ngo', 
            phone = EXCLUDED.phone, 
            district = EXCLUDED.district
      RETURNING id;
    `, [ngoName, ngoEmail, ngoHashedPassword, ngoPhone, ngoDistrict]);
    const ngoUserId = ngoUserRes.rows[0].id;

    // Insert or update ngos table for NCHD
    await db.query(`
      INSERT INTO ngos (
        full_name,
        resource_person,
        email,
        phone,
        district,
        cnic,
        password,
        organization_type,
        registration_number,
        is_verified,
        verification_status,
        status,
        role,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, 'approved', 'Active', 'ngo', $10)
      ON CONFLICT (email) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            resource_person = EXCLUDED.resource_person,
            phone = EXCLUDED.phone,
            district = EXCLUDED.district,
            organization_type = EXCLUDED.organization_type,
            registration_number = EXCLUDED.registration_number,
            is_verified = TRUE,
            verification_status = 'approved',
            status = 'Active',
            role = 'ngo',
            user_id = EXCLUDED.user_id,
            updated_at = NOW();
    `, [
      ngoName,
      ngoResourcePerson,
      ngoEmail,
      ngoPhone,
      ngoDistrict,
      '42101-1234567-1',
      ngoHashedPassword,
      'Human Development / Legal Aid',
      'NCHD-FED-2002',
      ngoUserId,
    ]);
    console.log('✓ Registered NCHD into ngos table with role: ngo');

    // 5. Setup Media Partner: KTN news
    const mediaHashedPassword = await bcrypt.hash('Ktn@12345', 10);
    const mediaEmail = 'contact@ktnnews.tv';
    const mediaName = 'KTN News';
    const mediaChannelName = 'KTN News';
    const mediaResourcePerson = 'Bureau Chief KTN News';
    const mediaPhone = '021-3587654';
    const mediaDistrict = 'Sindh';

    // Insert or update users table for KTN News with role: 'media'
    const mediaUserRes = await db.query(`
      INSERT INTO users (name, email, password, role, phone, district)
      VALUES ($1, $2, $3, 'media', $4, $5)
      ON CONFLICT (email) DO UPDATE 
        SET name = EXCLUDED.name, 
            password = EXCLUDED.password, 
            role = 'media', 
            phone = EXCLUDED.phone, 
            district = EXCLUDED.district
      RETURNING id;
    `, [mediaName, mediaEmail, mediaHashedPassword, mediaPhone, mediaDistrict]);
    const mediaUserId = mediaUserRes.rows[0].id;

    // Clean up any old media entries
    await db.query(`DELETE FROM media WHERE email != $1`, [mediaEmail]);

    // Insert or update media table for KTN News
    await db.query(`
      INSERT INTO media (
        full_name,
        channel_name,
        resource_person,
        email,
        phone,
        district,
        cnic,
        password,
        media_type,
        registration_number,
        is_verified,
        verification_status,
        status,
        role,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, 'approved', 'Active', 'media', $11)
      ON CONFLICT (email) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            channel_name = EXCLUDED.channel_name,
            resource_person = EXCLUDED.resource_person,
            phone = EXCLUDED.phone,
            district = EXCLUDED.district,
            media_type = EXCLUDED.media_type,
            registration_number = EXCLUDED.registration_number,
            is_verified = TRUE,
            verification_status = 'approved',
            status = 'Active',
            role = 'media',
            user_id = EXCLUDED.user_id,
            updated_at = NOW();
    `, [
      mediaName,
      mediaChannelName,
      mediaResourcePerson,
      mediaEmail,
      mediaPhone,
      mediaDistrict,
      '42101-7654321-2',
      mediaHashedPassword,
      'Sindhi / National News Channel',
      'PEMRA-KTN-1992',
      mediaUserId,
    ]);
    console.log('✓ Registered KTN News into media table with role: media');

    // 6. Query and log final state of both tables
    const finalNgos = await db.query('SELECT id, full_name, resource_person, email, role, status FROM ngos');
    console.log('\n--- Final NGOS Table ---');
    console.table(finalNgos.rows);

    const finalMedia = await db.query('SELECT id, full_name, channel_name, resource_person, email, role, status FROM media');
    console.log('\n--- Final MEDIA Table ---');
    console.table(finalMedia.rows);

    const finalUsers = await db.query("SELECT id, name, email, role FROM users WHERE role IN ('ngo', 'media')");
    console.log('\n--- Final Users with role ngo / media ---');
    console.table(finalUsers.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error during separateMediaAndNgo:', err);
    process.exit(1);
  }
}

separateMediaAndNgo();
