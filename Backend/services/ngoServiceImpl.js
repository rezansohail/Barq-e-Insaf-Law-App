const NgoService = require('./ngoService');
const Ngo = require('../domain/Ngo');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class NgoServiceImpl extends NgoService {
  /**
   * Registers a new NGO / Media entity with validation and duplicate checks
   * @param {RegisterNgoDTO} dto
   * @returns {Promise<{ ngo: Object, token: string, message: string }>}
   */
  async registerNgo(dto) {
    // 1. Validate DTO input fields
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    // 2. Duplicate Checks: Email
    const existingEmail = await db.query(
      'SELECT id FROM ngos WHERE email = $1',
      [dto.email]
    );
    if (existingEmail.rows.length > 0) {
      const error = new Error('An organization with this email address is already registered.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Duplicate Checks: Phone
    if (dto.phone) {
      const existingPhone = await db.query(
        'SELECT id FROM ngos WHERE phone = $1',
        [dto.phone]
      );
      if (existingPhone.rows.length > 0) {
        const error = new Error('An organization with this phone number is already registered.');
        error.statusCode = 409;
        throw error;
      }
    }

    // 4. Duplicate Checks: CNIC (if provided)
    if (dto.cnic) {
      const existingCnic = await db.query(
        'SELECT id FROM ngos WHERE cnic = $1',
        [dto.cnic]
      );
      if (existingCnic.rows.length > 0) {
        const error = new Error('An organization representative with this CNIC is already registered.');
        error.statusCode = 409;
        throw error;
      }
    }

    // 5. Securely Hash Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 6. Synchronize into users table
    let userId = null;
    try {
      const userResult = await db.query(
        `INSERT INTO users (name, email, password, role, phone, district)
         VALUES ($1, $2, $3, 'ngo', $4, $5)
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'ngo'
         RETURNING id`,
        [dto.fullName, dto.email, hashedPassword, dto.phone, dto.district]
      );
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }
    } catch (userErr) {
      console.warn('Note: Could not link to users table, proceeding with ngos table:', userErr.message);
    }

    // 7. Insert into ngos table
    const insertQuery = `
      INSERT INTO ngos (
        full_name,
        email,
        phone,
        district,
        cnic,
        password,
        organization_type,
        registration_number,
        role,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ngo', $9)
      RETURNING *;
    `;

    const values = [
      dto.fullName,
      dto.email,
      dto.phone,
      dto.district,
      dto.cnic,
      hashedPassword,
      dto.organizationType,
      dto.registrationNumber,
      userId,
    ];

    const result = await db.query(insertQuery, values);
    const createdRow = result.rows[0];

    // 8. Create Domain Entity
    const ngoEntity = new Ngo(createdRow);

    // 9. Generate JWT Access Token with role: 'ngo'
    const token = jwt.sign(
      {
        id: ngoEntity.id,
        userId: userId,
        email: ngoEntity.email,
        role: 'ngo',
        organizationType: ngoEntity.organizationType,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'NGO / Media registered successfully! Welcome to Barq-e-Insaf.',
      token,
      ngo: ngoEntity.toResponse(),
    };
  }

  /**
   * Authenticates an NGO / Media user with Email and Password
   * @param {LoginNgoDTO} dto
   * @returns {Promise<{ ngo: Object, token: string, message: string }>}
   */
  async loginNgo(dto) {
    // 1. Validate DTO
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    // 2. Query NGO by email from ngos table
    const result = await db.query(
      'SELECT * FROM ngos WHERE email = $1',
      [dto.email]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const ngoRow = result.rows[0];

    // 3. Verify password exists
    if (!ngoRow.password) {
      const error = new Error('This account does not have a password configured.');
      error.statusCode = 401;
      throw error;
    }

    // 4. Verify password with bcrypt
    const isMatch = await bcrypt.compare(dto.password, ngoRow.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 5. Instantiate Domain Entity
    const ngoEntity = new Ngo(ngoRow);

    // 6. Generate JWT Access Token
    const token = jwt.sign(
      {
        id: ngoEntity.id,
        userId: ngoRow.user_id,
        email: ngoEntity.email,
        role: 'ngo',
        organizationType: ngoEntity.organizationType,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Login successful! Welcome to the NGO / Media Dashboard.',
      token,
      ngo: ngoEntity.toResponse(),
    };
  }

  /**
   * Retrieves single NGO by ID
   * @param {number} id
   */
  async getNgoById(id) {
    const result = await db.query('SELECT * FROM ngos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('NGO / Media organization not found');
      error.statusCode = 404;
      throw error;
    }
    return new Ngo(result.rows[0]).toResponse();
  }
}

module.exports = new NgoServiceImpl();
