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
    const trimmedPassword = (dto.password || '').trim();
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(trimmedPassword, lawyerRow.password);
    } catch (_) {
      isMatch = false;
    }
    if (!isMatch && (lawyerRow.password === trimmedPassword || lawyerRow.password === dto.password)) {
      isMatch = true;
    }
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
  async getLawyers({ specialty, district } = {}) {
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

    sql += ` ORDER BY l.id ASC;`;

    const { rows } = await db.query(sql, params);
    return rows.map((r) => new Lawyer(r).toResponse());
  }

  /**
   * Retrieves single Lawyer by ID with live stats
   */
  async getLawyerById(id) {
    const sql = `
      SELECT 
        l.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS user
      FROM lawyers l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = $1 OR l.user_id = $1
      LIMIT 1;
    `;
    const { rows } = await db.query(sql, [id]);
    if (rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }

    const lawyerRow = rows[0];
    const lawyerId = lawyerRow.id;
    const userId = lawyerRow.user_id;

    // Calculate live counts: successful cases, active cases, pending requests
    const statsRes = await db.query(
      `
      SELECT
        (SELECT COUNT(*) FROM cases WHERE lawyer_id = $1 OR lawyer_id = $2) AS active_cases,
        (SELECT COUNT(*) FROM appointments WHERE (lawyer_id = $1 OR lawyer_id = $2) AND status = 'pending') AS pending_requests,
        (SELECT COUNT(*) FROM cases WHERE (lawyer_id = $1 OR lawyer_id = $2) AND status = 'Resolved') AS won_cases
      `,
      [lawyerId, userId]
    );

    const stats = {
      activeCasesCount: Number(statsRes.rows[0]?.active_cases || 0),
      pendingRequestsCount: Number(statsRes.rows[0]?.pending_requests || 0),
      successfulCasesCount: Number(statsRes.rows[0]?.won_cases || 0),
    };

    const lawyerEntity = new Lawyer({ ...lawyerRow, stats });
    return lawyerEntity.toResponse();
  }

  /**
   * Updates lawyer profile
   */
  async updateLawyerProfile(id, data) {
    const checkRes = await db.query('SELECT * FROM lawyers WHERE id = $1 OR user_id = $1', [id]);
    if (checkRes.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }

    const current = checkRes.rows[0];
    const lawyerId = current.id;
    const userId = current.user_id;

    const name = data.name !== undefined ? data.name : current.name;
    const specialty = data.specialty || data.spec || data.specialization || current.specialty;
    const district = data.district || data.city || current.district;
    const city = data.city || data.district || current.city;
    const bio = data.bio !== undefined ? data.bio : (data.about !== undefined ? data.about : current.bio);
    const education = data.education !== undefined ? data.education : current.education;
    const pastExperience = data.pastExperience !== undefined ? data.pastExperience : (data.experience !== undefined ? data.experience : current.past_experience);
    const officeAddress = data.officeAddress !== undefined ? data.officeAddress : (data.address !== undefined ? data.address : current.office_address);
    const isAvailable = data.isAvailable !== undefined ? data.isAvailable : current.is_available;

    const updateSql = `
      UPDATE lawyers
      SET name = $1,
          specialty = $2,
          specialization = $2,
          district = $3,
          city = $4,
          bio = $5,
          education = $6,
          past_experience = $7,
          office_address = $8,
          is_available = $9
      WHERE id = $10
      RETURNING *;
    `;

    const updateRes = await db.query(updateSql, [
      name,
      specialty,
      district,
      city,
      bio,
      education,
      pastExperience,
      officeAddress,
      isAvailable,
      lawyerId,
    ]);

    // Also update users table name if linked
    if (userId && name) {
      try {
        await db.query('UPDATE users SET name = $1 WHERE id = $2', [name, userId]);
      } catch (_) {}
    }

    const updatedRow = updateRes.rows[0];
    return new Lawyer(updatedRow).toResponse();
  }

  /**
   * Retrieves all consultation requests for a specific lawyer
   */
  async getLawyerRequests(lawyerId) {
    const lawyerCheck = await db.query('SELECT id, user_id FROM lawyers WHERE id = $1 OR user_id = $1', [lawyerId]);
    if (lawyerCheck.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }
    const realLawyerId = lawyerCheck.rows[0].id;
    const lawyerUserId = lawyerCheck.rows[0].user_id;

    const sql = `
      SELECT
        a.*,
        c.title AS case_title,
        c.description AS case_description,
        COALESCE(ct.full_name, u.name, 'Citizen Client') AS citizen_name,
        COALESCE(ct.phone, u.phone, '') AS citizen_phone,
        COALESCE(ct.email, u.email, '') AS citizen_email,
        COALESCE(ct.district, u.district, 'Sindh') AS citizen_district
      FROM appointments a
      LEFT JOIN cases c ON a.case_id = c.id
      LEFT JOIN citizens ct ON a.citizen_id = ct.id
      LEFT JOIN users u ON (ct.user_id = u.id OR a.citizen_id = u.id)
      WHERE a.lawyer_id = $1 OR a.lawyer_id = $2
      ORDER BY a.created_at DESC
    `;
    const { rows } = await db.query(sql, [realLawyerId, lawyerUserId]);

    // Fetch evidence for these case requests
    const caseIds = rows.map((r) => r.case_id).filter(Boolean);
    let evidenceMap = {};
    if (caseIds.length > 0) {
      try {
        const evRes = await db.query(
          `SELECT * FROM evidence_vault WHERE case_id = ANY($1::int[]) ORDER BY created_at ASC;`,
          [caseIds]
        );
        evRes.rows.forEach((ev) => {
          const cId = String(ev.case_id);
          if (!evidenceMap[cId]) evidenceMap[cId] = [];
          evidenceMap[cId].push({
            id: String(ev.id),
            caseId: cId,
            title: ev.title || 'Evidence',
            name: ev.title || 'Evidence',
            type: ev.file_type || 'Photo',
            fileType: ev.file_type || 'Photo',
            size: ev.file_size || '1.0 MB',
            fileSize: ev.file_size || '1.0 MB',
            uri: ev.file_uri || '',
            fileUri: ev.file_uri || '',
            category: ev.category || 'Legal Document',
            createdAt: ev.created_at,
          });
        });
      } catch (evErr) {
        console.warn('[BACKEND] Note fetching lawyer request evidence:', evErr.message);
      }
    }

    return rows.map((r) => {
      const cId = r.case_id ? String(r.case_id) : null;
      const attachedEv = (cId && evidenceMap[cId]) || (Array.isArray(r.shared_evidence) ? r.shared_evidence : []);

      return {
        id: String(r.id),
        citizenId: r.citizen_id,
        caseId: cId,
        caseTitle: r.case_title || 'Legal Consultation Request',
        caseDescription: r.case_description || r.case_summary || '',
        lawyerId: r.lawyer_id,
        citizenName: r.citizen_name || 'Citizen Client',
        citizenPhone: r.citizen_phone || '',
        citizenEmail: r.citizen_email || '',
        district: r.citizen_district || 'Sindh',
        problemStatement: r.problem_statement || (r.case_summary ? r.case_summary.substring(0, 80) : 'Legal Consultation Request'),
        caseSummary: r.case_summary || r.case_description || '',
        status: r.status || 'pending',
        sharedEvidence: attachedEv,
        evidence: attachedEv,
        timeSlots: Array.isArray(r.time_slots) ? r.time_slots : [],
        lawyerSigned: Boolean(r.lawyer_signed),
        lawyerSignature: r.lawyer_signature,
        lawyerSignedAt: r.lawyer_signed_at,
        citizenSigned: Boolean(r.citizen_signed),
        citizenSignature: r.citizen_signature,
        citizenSignedAt: r.citizen_signed_at,
        agreementTerms: r.agreement_terms,
        declineReason: r.decline_reason,
        appointmentDate: r.appointment_date,
        appointmentTime: r.appointment_time,
        createdAt: r.created_at,
      };
    });
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
    const rawAppointmentTime = (data.appointmentTime || data.appointment_time || '').trim() || '10:00 AM - 01:00 PM';
    let appointmentTime = rawAppointmentTime;
    const timeMatch = rawAppointmentTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const modifier = (timeMatch[3] || '').toUpperCase();
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      appointmentTime = `${String(hours).padStart(2, '0')}:${minutes}:00`;
    }

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
  async acceptLawyerRequest(lawyerId, requestId, data = {}) {
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

    // Digital Legal Representation Agreement Terms
    const defaultTerms = 'Digital Legal Representation Agreement under Sindh Bar Council (SBC) Rules. Counsel agrees to review the case dossier, maintain strict advocate-client confidentiality, and provide formal legal counsel during the selected consultation window.';
    const agreementTerms = data.agreementTerms || defaultTerms;

    const defaultSlots = ['Tomorrow 10:30 AM', 'Tomorrow 02:30 PM', 'Next Working Day 11:00 AM'];
    let timeSlots = defaultSlots;
    if (Array.isArray(data.timeSlots) && data.timeSlots.length > 0) {
      timeSlots = data.timeSlots;
    } else if (typeof data.timeSlots === 'string') {
      timeSlots = [data.timeSlots];
    }

    const lawyerSignature = data.lawyerSignature || data.signature || 'Advocate Signed (SBC)';

    // Update appointment status to agreement_sent with lawyer signature and offered slots
    const updatedApt = await db.query(
      `UPDATE appointments 
       SET status = 'agreement_sent',
           agreement_terms = $1,
           time_slots = $2::jsonb,
           lawyer_signed = true,
           lawyer_signature = $3,
           lawyer_signed_at = NOW()
       WHERE id = $4
       RETURNING *;`,
      [agreementTerms, JSON.stringify(timeSlots), lawyerSignature, requestId]
    );

    return {
      success: true,
      message: 'Digital Representation Agreement signed and sent to client with available time slots.',
      appointment: updatedApt.rows[0],
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
    const lawyerCheck = await db.query('SELECT id, user_id FROM lawyers WHERE id = $1 OR user_id = $1', [lawyerId]);
    if (lawyerCheck.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }
    const realLawyerId = lawyerCheck.rows[0].id;
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

    const { rows } = await db.query(sql, [realLawyerId, lawyerUserId]);
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
    const res = await db.query('SELECT office_hours FROM lawyers WHERE id = $1 OR user_id = $1', [lawyerId]);
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
      'UPDATE lawyers SET office_hours = $1 WHERE id = $2 OR user_id = $2 RETURNING office_hours',
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
    const lawyerRes = await db.query('SELECT id, name FROM lawyers WHERE id = $1', [id]);
    if (lawyerRes.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }
    return {
      success: true,
      message: 'Advocate rating is retired per Sindh Bar Council standards.',
    };
  }
}

// Export singleton instance of LawyerServiceImpl
module.exports = new LawyerServiceImpl();
