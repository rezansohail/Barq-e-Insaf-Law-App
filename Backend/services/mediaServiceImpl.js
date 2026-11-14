const MediaService = require('./mediaService');
const Media = require('../domain/Media');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class MediaServiceImpl extends MediaService {
  /**
   * Registers a new Media Partner entity with validation and duplicate checks
   * @param {RegisterMediaDTO} dto
   * @returns {Promise<{ media: Object, token: string, message: string }>}
   */
  async registerMedia(dto) {
    // 1. Validate DTO input fields
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    // 2. Duplicate Checks: Email across users
    const userRoleCheck = await db.query('SELECT role FROM users WHERE email = $1', [dto.email]);
    if (userRoleCheck.rows.length > 0) {
      const actualRole = userRoleCheck.rows[0].role;
      const roleNames = { lawyer: 'Lawyer', citizen: 'Citizen', admin: 'Admin', ngo: 'NGO', media: 'Media Partner' };
      const displayName = roleNames[actualRole] || actualRole;
      const error = new Error(`This email is already registered as a ${displayName}. You cannot register it as a Media Partner.`);
      error.statusCode = 409;
      throw error;
    }

    const existingEmail = await db.query(
      'SELECT id FROM media WHERE email = $1',
      [dto.email]
    );
    if (existingEmail.rows.length > 0) {
      const error = new Error('A media organization with this email address is already registered.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Duplicate Checks: Phone
    if (dto.phone) {
      const existingPhone = await db.query(
        'SELECT id FROM media WHERE phone = $1',
        [dto.phone]
      );
      if (existingPhone.rows.length > 0) {
        const error = new Error('A media organization with this phone number is already registered.');
        error.statusCode = 409;
        throw error;
      }
    }

    // 4. Securely Hash Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 5. Synchronize into users table with role 'media'
    let userId = null;
    try {
      const userResult = await db.query(
        `INSERT INTO users (name, email, password, role, phone, district)
         VALUES ($1, $2, $3, 'media', $4, $5)
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'media'
         RETURNING id`,
        [dto.fullName, dto.email, hashedPassword, dto.phone, dto.district]
      );
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }
    } catch (userErr) {
      console.warn('Note: Could not link to users table, proceeding with media table:', userErr.message);
    }

    // 6. Insert into media table
    const insertQuery = `
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
      RETURNING *;
    `;

    const values = [
      dto.fullName,
      dto.channelName || dto.fullName,
      dto.resourcePerson || null,
      dto.email,
      dto.phone,
      dto.district,
      dto.cnic,
      hashedPassword,
      dto.mediaType,
      dto.registrationNumber,
      userId,
    ];

    const result = await db.query(insertQuery, values);
    const createdRow = result.rows[0];

    // 7. Create Domain Entity
    const mediaEntity = new Media(createdRow);

    // 8. Generate JWT Access Token with role: 'media'
    const token = jwt.sign(
      {
        id: mediaEntity.id,
        userId: userId,
        email: mediaEntity.email,
        role: 'media',
        mediaType: mediaEntity.mediaType,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Media partner registered successfully! Welcome to Barq-e-Insaf.',
      token,
      media: mediaEntity.toResponse(),
    };
  }

  /**
   * Authenticates a Media Partner with Email and Password
   * @param {LoginMediaDTO} dto
   * @returns {Promise<{ media: Object, token: string, message: string }>}
   */
  async loginMedia(dto) {
    // 1. Validate DTO
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    // 2. Query Media by email from media table
    const result = await db.query(
      'SELECT * FROM media WHERE email = $1',
      [dto.email]
    );

    if (result.rows.length === 0) {
      // Check if email belongs to another role
      const userCheck = await db.query('SELECT role FROM users WHERE email = $1', [dto.email]);
      if (userCheck.rows.length > 0) {
        const actualRole = userCheck.rows[0].role;
        const roleNames = { lawyer: 'Lawyer', citizen: 'Citizen', admin: 'Admin', ngo: 'NGO', media: 'Media' };
        const displayName = roleNames[actualRole] || actualRole;
        const error = new Error(`This email belongs to a ${displayName} account. Please switch to the ${displayName} Portal to log in.`);
        error.statusCode = 403;
        throw error;
      }

      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const mediaRow = result.rows[0];

    // 3. Verify password exists
    if (!mediaRow.password) {
      const error = new Error('This account does not have a password configured.');
      error.statusCode = 401;
      throw error;
    }

    // 4. Verify password with bcrypt
    const isMatch = await bcrypt.compare(dto.password, mediaRow.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 5. Instantiate Domain Entity
    const mediaEntity = new Media(mediaRow);

    // 6. Generate JWT Access Token
    const token = jwt.sign(
      {
        id: mediaEntity.id,
        userId: mediaRow.user_id,
        email: mediaEntity.email,
        role: 'media',
        mediaType: mediaEntity.mediaType,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Login successful! Welcome to the Media Partner Dashboard.',
      token,
      media: mediaEntity.toResponse(),
    };
  }

  /**
   * Retrieves single Media by ID
   * @param {number} id
   */
  async getMediaById(id) {
    const result = await db.query('SELECT * FROM media WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Media partner organization not found');
      error.statusCode = 404;
      throw error;
    }
    return new Media(result.rows[0]).toResponse();
  }

  /**
   * Retrieves all verified/active Media partners
   */
  async getAllMedia(filter = {}) {
    let sql = `
      SELECT 
        id,
        full_name,
        channel_name,
        resource_person,
        email,
        phone,
        district,
        media_type,
        registration_number,
        is_verified,
        status,
        role,
        created_at
      FROM media 
      WHERE status = 'Active' OR status IS NULL
    `;
    const params = [];

    if (filter.district) {
      params.push(filter.district);
      sql += ` AND district ILIKE $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC;';

    const result = await db.query(sql, params);
    return result.rows.map((row) => ({
      id: row.id,
      name: row.channel_name || row.full_name,
      fullName: row.full_name,
      channelName: row.channel_name,
      resourcePerson: row.resource_person,
      email: row.email,
      phone: row.phone,
      district: row.district,
      type: row.media_type || 'News Channel',
      mediaType: row.media_type,
      registrationNumber: row.registration_number,
      isVerified: Boolean(row.is_verified),
      status: row.status,
      role: row.role || 'media',
      initials: (row.channel_name || row.full_name || 'MD')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
        .toUpperCase(),
      createdAt: row.created_at,
    }));
  }
}

module.exports = new MediaServiceImpl();
