const AdminAuthService = require('./adminAuthService');
const Admin = require('../domain/Admin');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminAuthServiceImpl extends AdminAuthService {
  /**
   * Registers a new Admin with security validation, secret key enforcement, and duplicate checks
   * @param {RegisterAdminDTO} dto
   * @returns {Promise<{ admin: Object, token: string, message: string }>}
   */
  async registerAdmin(dto) {
    // 1. Validate DTO input fields and Admin Secret Key
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = validation.errors.some((e) => e.includes('Unauthorized')) ? 403 : 400;
      error.errors = validation.errors;
      throw error;
    }

    const cleanEmail = (dto.email || '').trim().toLowerCase();

    // 2. Duplicate Checks: Email
    const existingEmail = await db.query(
      'SELECT id FROM admins WHERE LOWER(TRIM(email)) = $1',
      [cleanEmail]
    );
    if (existingEmail.rows.length > 0) {
      const error = new Error('An administrator with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // 3. Duplicate Checks: Phone
    if (dto.phone) {
      const existingPhone = await db.query(
        'SELECT id FROM admins WHERE phone = $1',
        [dto.phone]
      );
      if (existingPhone.rows.length > 0) {
        const error = new Error('An administrator with this phone number already exists.');
        error.statusCode = 409;
        throw error;
      }
    }

    // 4. Duplicate Checks: CNIC (if provided)
    if (dto.cnic) {
      const existingCnic = await db.query(
        'SELECT id FROM admins WHERE cnic = $1',
        [dto.cnic]
      );
      if (existingCnic.rows.length > 0) {
        const error = new Error('An administrator with this CNIC already exists.');
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
         VALUES ($1, $2, $3, 'admin', $4, $5)
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'admin'
         RETURNING id`,
        [dto.fullName, cleanEmail, hashedPassword, dto.phone, dto.district]
      );
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }
    } catch (userErr) {
      console.warn('Note: Could not link to users table, proceeding with admins table:', userErr.message);
    }

    // 7. Insert into admins table
    const insertQuery = `
      INSERT INTO admins (
        full_name,
        email,
        phone,
        district,
        cnic,
        password,
        role,
        is_super_admin,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'admin', $7, $8)
      RETURNING *;
    `;

    const values = [
      dto.fullName,
      cleanEmail,
      dto.phone,
      dto.district,
      dto.cnic,
      hashedPassword,
      dto.isSuperAdmin,
      userId,
    ];

    const result = await db.query(insertQuery, values);
    const createdRow = result.rows[0];

    // 8. Create Domain Entity
    const adminEntity = new Admin(createdRow);

    // 9. Generate JWT Access Token with role: 'admin'
    const token = jwt.sign(
      {
        id: adminEntity.id,
        userId: userId,
        email: adminEntity.email,
        role: 'admin',
        isSuperAdmin: adminEntity.isSuperAdmin,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Admin registered successfully! Welcome to Barq-e-Insaf Administration.',
      token,
      admin: adminEntity.toResponse(),
    };
  }

  /**
   * Authenticates an Admin with Email and Password
   * @param {LoginAdminDTO} dto
   * @returns {Promise<{ admin: Object, token: string, message: string }>}
   */
  async loginAdmin(dto) {
    // 1. Validate DTO
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    const cleanEmail = (dto.email || '').trim().toLowerCase();

    // 2. Query admin by email from admins table
    const result = await db.query(
      'SELECT * FROM admins WHERE LOWER(TRIM(email)) = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      // Check if email belongs to another portal
      const userCheck = await db.query('SELECT role FROM users WHERE LOWER(TRIM(email)) = $1', [cleanEmail]);
      if (userCheck.rows.length > 0) {
        const actualRole = userCheck.rows[0].role;
        const roleNames = { lawyer: 'Lawyer', citizen: 'Citizen', admin: 'Admin', ngo: 'NGO / Media' };
        const displayName = roleNames[actualRole] || actualRole;
        const error = new Error(`This email belongs to a ${displayName} account. Please switch to the ${displayName} Portal to log in.`);
        error.statusCode = 403;
        throw error;
      }

      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const adminRow = result.rows[0];

    // 3. Verify password exists
    if (!adminRow.password) {
      const error = new Error('This administrator account does not have a password configured.');
      error.statusCode = 401;
      throw error;
    }

    // 4. Verify password with bcrypt
    const trimmedPassword = (dto.password || '').trim();
    const isMatch = await bcrypt.compare(trimmedPassword, adminRow.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // 5. Instantiate Domain Entity
    const adminEntity = new Admin(adminRow);

    // 6. Generate JWT Access Token
    const token = jwt.sign(
      {
        id: adminEntity.id,
        userId: adminRow.user_id,
        email: adminEntity.email,
        role: 'admin',
        isSuperAdmin: adminEntity.isSuperAdmin,
      },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'barqeinsaf-secret',
      { expiresIn: '30d' }
    );

    return {
      message: 'Login successful! Welcome to the Admin Dashboard.',
      token,
      admin: adminEntity.toResponse(),
    };
  }

  /**
   * Retrieves single admin by ID
   * @param {number} id
   */
  async getAdminById(id) {
    const result = await db.query('SELECT * FROM admins WHERE id = $1 OR user_id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }
    return new Admin(result.rows[0]).toResponse();
  }
}

module.exports = new AdminAuthServiceImpl();
