const CitizenService = require('./citizenService');
const Citizen = require('../domain/Citizen');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class CitizenServiceImpl extends CitizenService {
  /**
   * Registers a new Citizen with validation and duplicate checks
   * @param {RegisterCitizenDTO} dto
   * @returns {Promise<{ citizen: Object, token: string, message: string }>}
   */
  async registerCitizen(dto) {
    // 1. Validate DTO input fields
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    // 2. Business Check: Unique Email check
    const existingEmail = await db.query(
      'SELECT id FROM citizens WHERE email = $1',
      [dto.email]
    );
    if (existingEmail.rows.length > 0) {
      const error = new Error('A citizen with this email address is already registered.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Business Check: Unique Phone check
    const existingPhone = await db.query(
      'SELECT id FROM citizens WHERE phone = $1',
      [dto.phone]
    );
    if (existingPhone.rows.length > 0) {
      const error = new Error('A citizen with this phone number is already registered.');
      error.statusCode = 409;
      throw error;
    }

    // 4. Securely Hash Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 5. Synchronize into users table
    let userId = null;
    try {
      const userResult = await db.query(
        `INSERT INTO users (name, email, password, role, phone, district)
         VALUES ($1, $2, $3, 'citizen', $4, $5)
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
         RETURNING id`,
        [dto.fullName, dto.email, hashedPassword, dto.phone, dto.district]
      );
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }
    } catch (userErr) {
      console.warn('Note: Could not link to users table, proceeding with citizens table:', userErr.message);
    }

    // 6. Insert into citizens table
    const insertQuery = `
      INSERT INTO citizens (
        full_name,
        email,
        phone,
        district,
        city,
        password,
        user_id
      )
      VALUES ($1, $2, $3, $4, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      dto.fullName,
      dto.email,
      dto.phone,
      dto.district,
      hashedPassword,
      userId,
    ];

    const result = await db.query(insertQuery, values);
    const createdRow = result.rows[0];

    // 7. Create Domain Entity
    const citizenEntity = new Citizen(createdRow);

    // 8. Generate JWT Access Token
    const token = jwt.sign(
      {
        id: citizenEntity.id,
        userId: userId,
        email: citizenEntity.email,
        role: 'citizen',
        district: citizenEntity.district,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Citizen registered successfully! Welcome to Barq-e-Insaf.',
      token,
      citizen: citizenEntity.toResponse(),
    };
  }

  /**
   * Authenticates a Citizen with Email and Password
   * @param {LoginCitizenDTO} dto
   * @returns {Promise<{ citizen: Object, token: string, message: string }>}
   */
  async loginCitizen(dto) {
    // 1. Validate DTO
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    // 2. Query citizen by email from citizens table
    const result = await db.query(
      'SELECT * FROM citizens WHERE email = $1',
      [dto.email]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const citizenRow = result.rows[0];

    // 3. Check password presence
    if (!citizenRow.password) {
      const error = new Error('This account does not have a password set. Please sign up or reset your password.');
      error.statusCode = 401;
      throw error;
    }

    // 4. Verify password with bcrypt
    const isMatch = await bcrypt.compare(dto.password, citizenRow.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 5. Instantiate Domain Entity
    const citizenEntity = new Citizen(citizenRow);

    // 6. Generate JWT Session Token
    const token = jwt.sign(
      {
        id: citizenEntity.id,
        userId: citizenRow.user_id,
        email: citizenEntity.email,
        role: 'citizen',
        district: citizenEntity.district,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Login successful! Welcome to your Citizen Dashboard.',
      token,
      citizen: citizenEntity.toResponse(),
    };
  }

  /**
   * Retrieves single citizen by ID
   */
  async getCitizenById(id) {
    const result = await db.query('SELECT * FROM citizens WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Citizen not found');
      error.statusCode = 404;
      throw error;
    }
    return new Citizen(result.rows[0]).toResponse();
  }
}

module.exports = new CitizenServiceImpl();
