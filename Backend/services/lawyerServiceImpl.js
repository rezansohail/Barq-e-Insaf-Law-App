const LawyerService = require('./lawyerService');
const Lawyer = require('../domain/Lawyer');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LawyerServiceImpl extends LawyerService {
  /**
   * Registers a new Lawyer with complete validation and business checks
   * @param {RegisterLawyerDTO} dto
   * @returns {Promise<{ lawyer: Object, token: string, message: string }>}
   */
  async registerLawyer(dto) {
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
      'SELECT id FROM lawyers WHERE email = $1',
      [dto.email]
    );
    if (existingEmail.rows.length > 0) {
      const error = new Error('A lawyer with this email address is already registered.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Business Check: Unique Sindh Bar Council (SBC) Registration Number check
    const existingSbc = await db.query(
      'SELECT id FROM lawyers WHERE sbc_number = $1 OR license_number = $1',
      [dto.sbcNumber]
    );
    if (existingSbc.rows.length > 0) {
      const error = new Error(`A lawyer with SBC Registration Number "${dto.sbcNumber}" is already registered. Each lawyer must have a unique SBC number.`);
      error.statusCode = 409;
      throw error;
    }

    // 4. Business Check: Unique CNIC check
    const existingCnic = await db.query(
      'SELECT id FROM lawyers WHERE cnic = $1',
      [dto.cnic]
    );
    if (existingCnic.rows.length > 0) {
      const error = new Error(`A lawyer with CNIC "${dto.cnic}" is already registered. Each lawyer must have a unique CNIC.`);
      error.statusCode = 409;
      throw error;
    }

    // 5. Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 6. Synchronize into users table for authentication credentials
    let userId = null;
    try {
      const userResult = await db.query(
        `INSERT INTO users (name, email, password, role, phone, district)
         VALUES ($1, $2, $3, 'lawyer', $4, $5)
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
         RETURNING id`,
        [dto.name, dto.email, hashedPassword, dto.phone, dto.district]
      );
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }
    } catch (userErr) {
      console.warn('Note: Could not link to users table, proceeding with lawyers table:', userErr.message);
    }

    // 7. Insert the Lawyer into PostgreSQL database
    const insertQuery = `
      INSERT INTO lawyers (
        name,
        phone,
        cnic,
        district,
        city,
        sbc_number,
        license_number,
        specialty,
        specialization,
        email,
        password,
        user_id,
        is_verified,
        verification_status
      )
      VALUES ($1, $2, $3, $4, $4, $5, $5, $6, $6, $7, $8, $9, FALSE, 'pending')
      RETURNING *;
    `;

    const values = [
      dto.name,
      dto.phone,
      dto.cnic,
      dto.district,
      dto.sbcNumber,
      dto.specialty,
      dto.email,
      hashedPassword,
      userId,
    ];

    const result = await db.query(insertQuery, values);
    const createdRow = result.rows[0];

    // 8. Create Domain Entity
    const lawyerEntity = new Lawyer(createdRow);

    // 9. Generate JWT Access Token for instant access/session
    const token = jwt.sign(
      {
        id: lawyerEntity.id,
        userId: userId,
        email: lawyerEntity.email,
        role: 'lawyer',
        sbcNumber: lawyerEntity.sbc_number,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Lawyer registered successfully! Account is pending verification.',
      token,
      lawyer: lawyerEntity.toResponse(),
    };
  }

  /**
   * Authenticates a Lawyer with Email and Password
   * @param {LoginLawyerDTO} dto
   * @returns {Promise<{ lawyer: Object, token: string, message: string }>}
   */
  async loginLawyer(dto) {
    // 1. Validate DTO input fields
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    // 2. Query lawyer by email from lawyers table
    const result = await db.query(
      'SELECT * FROM lawyers WHERE email = $1',
      [dto.email]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const lawyerRow = result.rows[0];

    // 3. Check password presence
    if (!lawyerRow.password) {
      const error = new Error('This lawyer account does not have a password set. Please reset your password or sign up.');
      error.statusCode = 401;
      throw error;
    }

    // 4. Verify password with bcrypt
    const isMatch = await bcrypt.compare(dto.password, lawyerRow.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 5. Instantiate Domain Entity
    const lawyerEntity = new Lawyer(lawyerRow);

    // 6. Generate JWT Session Token
    const token = jwt.sign(
      {
        id: lawyerEntity.id,
        userId: lawyerRow.user_id,
        email: lawyerEntity.email,
        role: 'lawyer',
        sbcNumber: lawyerEntity.sbc_number,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Login successful! Welcome to your Lawyer Dashboard.',
      token,
      lawyer: lawyerEntity.toResponse(),
    };
  }

  /**
   * Retrieves all verified lawyers with optional specialty/district filters
   */
  async getLawyers({ specialty, district }) {
    let sql = `
      SELECT 
        l.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
      FROM lawyers l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.is_verified = TRUE
    `;
    const params = [];

    if (specialty) {
      params.push(specialty);
      sql += ` AND (l.specialty = $${params.length} OR l.specialization = $${params.length})`;
    }
    if (district) {
      params.push(district);
      sql += ` AND (l.district = $${params.length} OR l.city = $${params.length})`;
    }

    const { rows } = await db.query(sql, params);
    return rows.map((r) => new Lawyer(r).toResponse());
  }

  /**
   * Retrieves single lawyer by ID
   */
  async getLawyerById(id) {
    const sql = `
      SELECT 
        l.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
      FROM lawyers l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `;
    const { rows } = await db.query(sql, [id]);
    if (rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }
    return new Lawyer(rows[0]).toResponse();
  }

  /**
   * Rates a lawyer and recalculates weighted average
   */
  async rateLawyer(id, rating) {
    const lawyerRes = await db.query(
      'SELECT rating, total_ratings FROM lawyers WHERE id = $1',
      [id]
    );

    if (lawyerRes.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }

    const lawyer = lawyerRes.rows[0];
    const prevRating = parseFloat(lawyer.rating || 5);
    const prevTotal = parseInt(lawyer.total_ratings || 0);

    const newTotal = prevTotal + 1;
    const newRating = Math.round((((prevRating * prevTotal) + rating) / newTotal) * 10) / 10;

    const updateRes = await db.query(
      `UPDATE lawyers 
       SET rating = $1, total_ratings = $2 
       WHERE id = $3 
       RETURNING *`,
      [newRating, newTotal, id]
    );

    return new Lawyer(updateRes.rows[0]).toResponse();
  }
}

// Export singleton instance of LawyerServiceImpl
module.exports = new LawyerServiceImpl();
