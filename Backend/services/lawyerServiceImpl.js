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
    const userRoleCheck = await db.query('SELECT role FROM users WHERE email = $1', [dto.email]);
    if (userRoleCheck.rows.length > 0) {
      const actualRole = userRoleCheck.rows[0].role;
      const roleNames = { lawyer: 'Lawyer', citizen: 'Citizen', admin: 'Admin', ngo: 'NGO / Media' };
      const displayName = roleNames[actualRole] || actualRole;
      const error = new Error(`This email is already registered as a ${displayName}. You cannot register it as a Lawyer.`);
      error.statusCode = 409;
      throw error;
    }

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
        verification_status,
        status
      )
      VALUES ($1, $2, $3, $4, $4, $5, $5, $6, $6, $7, $8, $9, TRUE, 'approved', 'active')
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
    const lawyerRow = result.rows[0];

    // 8. Instantiate Domain Entity
    const lawyerEntity = new Lawyer(lawyerRow);

    // 9. Generate JWT Session Token
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
      message: 'Lawyer registered successfully! Welcome to Barq-e-Insaf.',
      token,
      lawyer: lawyerEntity.toResponse(),
    };
  }

  /**
   * Logs in a Lawyer using email and password
   * @param {LoginLawyerDTO} dto
   * @returns {Promise<{ lawyer: Object, token: string, message: string }>}
   */
  async loginLawyer(dto) {
    // 1. Validate DTO input
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    // 1b. Cross-Role Isolation Check: Prevent Citizens, Admins, NGOs from logging in through Lawyer portal
    const userRoleCheck = await db.query('SELECT role FROM users WHERE email = $1', [dto.email]);
    if (userRoleCheck.rows.length > 0) {
      const actualRole = userRoleCheck.rows[0].role;
      if (actualRole && actualRole !== 'lawyer') {
        const roleNames = { citizen: 'Citizen', admin: 'Admin', ngo: 'NGO / Media' };
        const displayName = roleNames[actualRole] || actualRole;
        const error = new Error(`This email belongs to a ${displayName} account. Please switch to the ${displayName} Portal to log in.`);
        error.statusCode = 403;
        throw error;
      }
    }

    // 2. Fetch lawyer by email
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
      WHERE 1=1
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
   * Retrieves single lawyer by ID with real-time stats
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

    const lawyerRow = rows[0];
    const lawyerUserId = lawyerRow.user_id;

    // Calculate real-time stats from Neon database
    const [resActive, resResolved, resPending] = await Promise.all([
      db.query("SELECT COUNT(*) FROM cases WHERE (lawyer_id = $1 OR lawyer_id = $2) AND status = 'active'", [id, lawyerUserId || -1]),
      db.query("SELECT COUNT(*) FROM cases WHERE (lawyer_id = $1 OR lawyer_id = $2) AND (status = 'resolved' OR status = 'closed')", [id, lawyerUserId || -1]),
      db.query("SELECT COUNT(*) FROM appointments WHERE lawyer_id = $1 AND status = 'pending'", [id]),
    ]);

    const stats = {
      successfulCasesCount: parseInt(resResolved.rows[0]?.count || 0),
      activeCasesCount: parseInt(resActive.rows[0]?.count || 0),
      pendingRequestsCount: parseInt(resPending.rows[0]?.count || 0),
      clientRating: Number(lawyerRow.rating || 5.0),
    };

    return new Lawyer({ ...lawyerRow, stats }).toResponse();
  }

  /**
   * Updates lawyer profile by ID
   */
  async updateLawyerProfile(id, data) {
    const check = await db.query('SELECT * FROM lawyers WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }
    const current = check.rows[0];

    const name = data.name !== undefined ? data.name : current.name;
    const phone = data.phone !== undefined ? data.phone : current.phone;
    const specialty = data.specialty !== undefined ? data.specialty : (data.specialization !== undefined ? data.specialization : current.specialty);
    const district = data.district !== undefined ? data.district : current.district;
    const city = data.city !== undefined ? data.city : (data.district || current.city);
    const experienceYears = data.experienceYears !== undefined ? data.experienceYears : (data.experience_years !== undefined ? data.experience_years : current.experience_years);
    const bio = data.bio !== undefined ? data.bio : (data.about !== undefined ? data.about : current.bio);
    const education = data.education !== undefined ? data.education : current.education;
    const pastExperience = data.pastExperience !== undefined ? data.pastExperience : (data.past_experience !== undefined ? data.past_experience : current.past_experience);
    const officeAddress = data.officeAddress !== undefined ? data.officeAddress : (data.address !== undefined ? data.address : (data.office_address !== undefined ? data.office_address : current.office_address));
    const isAvailable = data.isAvailable !== undefined ? data.isAvailable : (data.is_available !== undefined ? data.is_available : current.is_available);

    const updateSql = `
      UPDATE lawyers
      SET
        name = $1,
        phone = $2,
        specialty = $3,
        specialization = $3,
        district = $4,
        city = $5,
        experience_years = $6,
        bio = $7,
        education = $8,
        past_experience = $9,
        office_address = $10,
        is_available = $11
      WHERE id = $12
      RETURNING *;
    `;

    await db.query(updateSql, [
      name,
      phone,
      specialty,
      district,
      city,
      experienceYears,
      bio,
      education,
      pastExperience,
      officeAddress,
      isAvailable,
      id,
    ]);

    // Also sync to users table if linked
    if (current.user_id) {
      try {
        await db.query('UPDATE users SET name = $1, phone = $2, district = $3 WHERE id = $4', [
          name, phone, district, current.user_id
        ]);
      } catch (err) {
        console.warn('Sync to users table skipped:', err.message);
      }
    }

    return this.getLawyerById(id);
  }

  /**
   * Retrieves consultation requests for a specific lawyer
   */
  async getLawyerRequests(lawyerId, query = {}) {
    const lawyerCheck = await db.query('SELECT id FROM lawyers WHERE id = $1', [lawyerId]);
    if (lawyerCheck.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }

    let sql = `
      SELECT
        a.id,
        a.citizen_id,
        a.lawyer_id,
        a.problem_statement,
        a.case_summary,
        a.status,
        a.decline_reason,
        a.appointment_date,
        a.appointment_time,
        a.created_at,
        COALESCE(c.full_name, u.name, 'Citizen') AS citizen_name,
        COALESCE(c.phone, u.phone, '') AS citizen_phone,
        COALESCE(c.email, u.email, '') AS citizen_email,
        COALESCE(c.district, u.district, '') AS citizen_district
      FROM appointments a
      LEFT JOIN citizens c ON a.citizen_id = c.id
      LEFT JOIN users u ON (c.user_id = u.id OR a.citizen_id = u.id)
      WHERE a.lawyer_id = $1
    `;
    const params = [lawyerId];

    if (query.status) {
      params.push(query.status);
      sql += ` AND a.status = $${params.length}`;
    }

    sql += ` ORDER BY a.created_at DESC`;

    const { rows } = await db.query(sql, params);
    return rows.map((r) => ({
      id: r.id,
      citizenId: r.citizen_id,
      lawyerId: r.lawyer_id,
      citizenName: r.citizen_name,
      citizenPhone: r.citizen_phone,
      citizenEmail: r.citizen_email,
      district: r.citizen_district,
      problemStatement: r.problem_statement || (r.case_summary ? r.case_summary.substring(0, 60) : 'Legal Consultation Request'),
      caseSummary: r.case_summary,
      status: r.status,
      declineReason: r.decline_reason,
      appointmentDate: r.appointment_date,
      appointmentTime: r.appointment_time,
      createdAt: r.created_at,
    }));
  }

  /**
   * Creates a consultation request from a citizen for a lawyer
   */
  async createLawyerRequest(lawyerId, data) {
    const lawyerCheck = await db.query('SELECT id, name FROM lawyers WHERE id = $1', [lawyerId]);
    if (lawyerCheck.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }

    const citizenId = data.citizenId || data.citizen_id || null;
    const problemStatement = data.problemStatement || data.problem_statement || data.title || 'Legal Consultation Request';
    const caseSummary = data.caseSummary || data.case_summary || data.description || problemStatement;
    const appointmentDate = data.appointmentDate || data.appointment_date || new Date().toISOString().split('T')[0];
    const appointmentTime = data.appointmentTime || data.appointment_time || '10:00:00';

    const insertSql = `
      INSERT INTO appointments (
        citizen_id,
        lawyer_id,
        problem_statement,
        case_summary,
        appointment_date,
        appointment_time,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *;
    `;

    const { rows } = await db.query(insertSql, [
      citizenId,
      lawyerId,
      problemStatement,
      caseSummary,
      appointmentDate,
      appointmentTime,
    ]);

    return {
      message: 'Consultation request submitted successfully.',
      request: rows[0],
    };
  }

  /**
   * Accepts a consultation request and creates an active case
   */
  async acceptLawyerRequest(lawyerId, requestId) {
    const aptRes = await db.query(
      'SELECT * FROM appointments WHERE id = $1 AND lawyer_id = $2',
      [requestId, lawyerId]
    );

    if (aptRes.rows.length === 0) {
      const error = new Error('Consultation request not found for this lawyer');
      error.statusCode = 404;
      throw error;
    }

    const apt = aptRes.rows[0];

    // Update appointment status to accepted
    const updatedApt = await db.query(
      "UPDATE appointments SET status = 'accepted' WHERE id = $1 RETURNING *",
      [requestId]
    );

    // Create a new active case for this lawyer and citizen
    const caseTitle = apt.problem_statement || 'Legal Consultation Case';
    const caseDescription = apt.case_summary || apt.problem_statement || 'Case initiated from consultation request.';

    // Fetch lawyer district, specialty, and user_id (for cases FK)
    const lawyerRes = await db.query('SELECT district, specialty, user_id FROM lawyers WHERE id = $1', [lawyerId]);
    const lawyerInfo = lawyerRes.rows[0] || {};
    const lawyerUserId = lawyerInfo.user_id || null;

    // Resolve citizen's user_id (since cases table FK references users table)
    let citizenUserId = null;
    if (apt.citizen_id) {
      const citizenRes = await db.query('SELECT user_id FROM citizens WHERE id = $1', [apt.citizen_id]);
      if (citizenRes.rows.length > 0 && citizenRes.rows[0].user_id) {
        citizenUserId = citizenRes.rows[0].user_id;
      }
    }

    const caseRes = await db.query(
      `INSERT INTO cases (
        citizen_id,
        lawyer_id,
        title,
        type,
        description,
        district,
        court,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING *;`,
      [
        citizenUserId,
        lawyerUserId,
        caseTitle,
        lawyerInfo.specialty || 'General Dispute',
        caseDescription,
        lawyerInfo.district || 'Karachi',
        'District Court',
      ]
    );

    return {
      success: true,
      message: 'Consultation request accepted successfully. Active case created.',
      appointment: updatedApt.rows[0],
      case: caseRes.rows[0],
    };
  }

  /**
   * Declines a consultation request with a mandatory reason
   */
  async declineLawyerRequest(lawyerId, requestId, declineReason) {
    if (!declineReason || !declineReason.trim()) {
      const error = new Error('A reason is required to decline a consultation request.');
      error.statusCode = 400;
      throw error;
    }

    const aptRes = await db.query(
      'SELECT * FROM appointments WHERE id = $1 AND lawyer_id = $2',
      [requestId, lawyerId]
    );

    if (aptRes.rows.length === 0) {
      const error = new Error('Consultation request not found for this lawyer');
      error.statusCode = 404;
      throw error;
    }

    const updatedApt = await db.query(
      "UPDATE appointments SET status = 'declined', decline_reason = $1 WHERE id = $2 RETURNING *",
      [declineReason.trim(), requestId]
    );

    return {
      success: true,
      message: 'Consultation request declined.',
      appointment: updatedApt.rows[0],
    };
  }

  /**
   * Retrieves all cases assigned to a lawyer
   */
  async getLawyerCases(lawyerId) {
    const lawyerCheck = await db.query('SELECT id, user_id FROM lawyers WHERE id = $1', [lawyerId]);
    if (lawyerCheck.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }
    const lawyerUserId = lawyerCheck.rows[0].user_id;

    const sql = `
      SELECT
        c.id,
        c.citizen_id,
        c.lawyer_id,
        c.title,
        c.type,
        c.description,
        c.district,
        c.court,
        c.status,
        c.hearing_date,
        c.notes,
        c.created_at,
        COALESCE(ct.full_name, u.name, 'Client') AS client_name,
        COALESCE(ct.phone, u.phone, '') AS client_phone,
        COALESCE(ct.email, u.email, '') AS client_email
      FROM cases c
      LEFT JOIN users u ON c.citizen_id = u.id
      LEFT JOIN citizens ct ON (ct.user_id = c.citizen_id OR ct.id = c.citizen_id)
      WHERE c.lawyer_id = $1 OR (c.lawyer_id = $2 AND $2 IS NOT NULL)
      ORDER BY c.created_at DESC
    `;

    const { rows } = await db.query(sql, [lawyerId, lawyerUserId]);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      description: r.description,
      district: r.district,
      court: r.court,
      status: r.status,
      hearingDate: r.hearing_date,
      notes: r.notes,
      clientName: r.client_name,
      clientPhone: r.client_phone,
      clientEmail: r.client_email,
      createdAt: r.created_at,
    }));
  }

  /**
   * Retrieves lawyer schedule / office hours
   */
  async getLawyerSchedule(lawyerId) {
    const res = await db.query('SELECT office_hours FROM lawyers WHERE id = $1', [lawyerId]);
    if (res.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }
    return res.rows[0].office_hours || [];
  }

  /**
   * Updates lawyer schedule / office hours
   */
  async updateLawyerSchedule(lawyerId, scheduleData) {
    const slots = Array.isArray(scheduleData)
      ? scheduleData
      : (scheduleData.office_hours || scheduleData.officeHours || scheduleData.slots || []);

    const res = await db.query(
      'UPDATE lawyers SET office_hours = $1 WHERE id = $2 RETURNING office_hours',
      [JSON.stringify(slots), lawyerId]
    );

    if (res.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      message: 'Schedule updated successfully',
      officeHours: res.rows[0].office_hours,
    };
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
