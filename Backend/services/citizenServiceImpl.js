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
    const userRoleCheck = await db.query('SELECT role FROM users WHERE email = $1', [dto.email]);
    if (userRoleCheck.rows.length > 0) {
      const actualRole = userRoleCheck.rows[0].role;
      const roleNames = { lawyer: 'Lawyer', citizen: 'Citizen', admin: 'Admin', ngo: 'NGO / Media' };
      const displayName = roleNames[actualRole] || actualRole;
      const error = new Error(`This email is already registered as a ${displayName}. You cannot register it as a Citizen.`);
      error.statusCode = 409;
      throw error;
    }

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
      // Check if email belongs to another portal
      const userCheck = await db.query('SELECT role FROM users WHERE email = $1', [dto.email]);
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
   * Retrieves single citizen by ID along with real-time case & vault statistics
   */
  async getCitizenById(id) {
    let result = await db.query('SELECT * FROM citizens WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      // Fallback check by user_id
      result = await db.query('SELECT * FROM citizens WHERE user_id = $1', [id]);
    }

    if (result.rows.length === 0) {
      const error = new Error('Citizen not found');
      error.statusCode = 404;
      throw error;
    }

    const row = result.rows[0];
    const citizenId = row.id;
    const userId = row.user_id;

    // Single fast real-time counts query from database
    const countSql = `
      SELECT 
        (SELECT COUNT(*) FROM cases WHERE citizen_id IN ($1, $2) AND status = 'active') as active_count,
        (SELECT COUNT(*) FROM cases WHERE citizen_id IN ($1, $2) AND status = 'pending') as pending_count,
        (SELECT COUNT(*) FROM evidence_vault WHERE citizen_id = $1) as vault_count,
        (SELECT COUNT(*) FROM appointments WHERE citizen_id = $1) as apts_count;
    `;
    const countResult = await db.query(countSql, [citizenId, userId || -1]);
    const counts = countResult.rows[0] || {};

    const stats = {
      activeCasesCount: parseInt(counts.active_count || 0),
      pendingCasesCount: parseInt(counts.pending_count || 0),
      totalVaultItems: parseInt(counts.vault_count || 0),
      consultationsCount: parseInt(counts.apts_count || 0),
    };

    return new Citizen({ ...row, stats }).toResponse();
  }

  /**
   * Updates citizen profile (Name, Phone, District, CNIC, Address, Custom Sections)
   */
  async updateCitizenProfile(id, data) {
    let check = await db.query('SELECT * FROM citizens WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT * FROM citizens WHERE user_id = $1', [id]);
    }
    if (check.rows.length === 0) {
      const error = new Error('Citizen not found');
      error.statusCode = 404;
      throw error;
    }

    const current = check.rows[0];
    const citizenId = current.id;
    const userId = current.user_id;

    const fullName = data.fullName !== undefined ? data.fullName : (data.name !== undefined ? data.name : current.full_name);
    const phone = data.phone !== undefined ? data.phone : current.phone;
    const district = data.district !== undefined ? data.district : current.district;
    const city = data.city !== undefined ? data.city : (data.district || current.city);
    const cnic = data.cnic !== undefined ? data.cnic : current.cnic;
    const address = data.address !== undefined ? data.address : current.address;
    const dp = data.dp !== undefined ? data.dp : current.dp;
    
    let customSections = current.custom_sections || [];
    if (data.customSections !== undefined) {
      customSections = data.customSections;
    } else if (data.custom_sections !== undefined) {
      customSections = data.custom_sections;
    }

    const updateSql = `
      UPDATE citizens
      SET
        full_name = $1,
        phone = $2,
        district = $3,
        city = $4,
        cnic = $5,
        address = $6,
        dp = $7,
        custom_sections = $8
      WHERE id = $9
      RETURNING *;
    `;

    const { rows } = await db.query(updateSql, [
      fullName,
      phone,
      district,
      city,
      cnic,
      address,
      dp,
      JSON.stringify(customSections),
      citizenId,
    ]);

    // Keep users table in sync if user_id exists
    if (userId) {
      try {
        await db.query(
          'UPDATE users SET name = $1, phone = $2, district = $3 WHERE id = $4',
          [fullName, phone, district, userId]
        );
      } catch (uErr) {
        console.warn('Sync to users table skipped:', uErr.message);
      }
    }

    return new Citizen(rows[0]).toResponse();
  }

  /**
   * Retrieves all active/pending/closed cases for a citizen
   */
  async getCitizenCases(citizenId) {
    let check = await db.query('SELECT id, user_id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id, user_id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;
    const realUserId = check.rows[0]?.user_id || -1;

    const sql = `
      SELECT 
        c.*,
        l.name as lawyer_name,
        l.specialty as lawyer_specialty,
        l.sbc_number as lawyer_sbc,
        l.phone as lawyer_phone,
        l.district as lawyer_district
      FROM cases c
      LEFT JOIN lawyers l ON c.lawyer_id = l.id
      WHERE c.citizen_id = $1 OR (c.citizen_id = $2 AND $2 != -1)
      ORDER BY c.created_at DESC;
    `;

    const { rows } = await db.query(sql, [realCitizenId, realUserId]);

    return rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      type: r.type || 'Legal Dispute',
      description: r.description,
      district: r.district,
      court: r.court || 'District Court',
      status: r.status || 'Active',
      hearingDate: r.hearing_date,
      notes: r.notes,
      lawyer: r.lawyer_id ? {
        id: r.lawyer_id,
        name: r.lawyer_name,
        specialty: r.lawyer_specialty,
        sbc: r.lawyer_sbc,
        phone: r.lawyer_phone,
        district: r.lawyer_district,
      } : null,
      createdAt: r.created_at,
    }));
  }

  /**
   * Creates a new case built by a citizen
   */
  async createCitizenCase(citizenId, data) {
    let check = await db.query('SELECT id, user_id, district FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id, user_id, district FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;
    const defaultDistrict = check.rows[0]?.district || 'Karachi Central';

    const title = data.title || 'Legal Dispute Case';
    const type = data.type || data.caseType || 'Property Dispute';
    const description = data.description || '';
    const district = data.district || defaultDistrict;
    const court = data.court || 'District & Sessions Court';
    const lawyerId = data.lawyerId || null;
    const mediaCoverageRequested = Boolean(data.mediaCoverageRequested || data.media_coverage_requested);
    const mediaContactAllowed = Boolean(data.mediaContactAllowed !== false && data.media_contact_allowed !== false);
    const mediaStatus = data.mediaStatus || (mediaCoverageRequested ? 'pending_review' : 'none');

    const insertSql = `
      INSERT INTO cases (
        citizen_id,
        lawyer_id,
        title,
        type,
        description,
        district,
        court,
        status,
        media_coverage_requested,
        media_contact_allowed,
        media_status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, NOW())
      RETURNING *;
    `;

    const { rows } = await db.query(insertSql, [
      realCitizenId,
      lawyerId,
      title,
      type,
      description,
      district,
      court,
      mediaCoverageRequested,
      mediaContactAllowed,
      mediaStatus,
    ]);

    return {
      message: 'Case built successfully!',
      case: rows[0],
    };
  }

  /**
   * Updates an existing case built by a citizen
   */
  async updateCitizenCase(citizenId, caseId, data) {
    let check = await db.query('SELECT id, user_id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id, user_id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;
    const realUserId = check.rows[0]?.user_id || -1;

    const title = data.title;
    const description = data.description;
    const district = data.district;
    const mediaCoverageRequested = data.mediaCoverageRequested !== undefined ? Boolean(data.mediaCoverageRequested) : undefined;
    const mediaContactAllowed = data.mediaContactAllowed !== undefined ? Boolean(data.mediaContactAllowed) : undefined;

    const updateSql = `
      UPDATE cases
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        district = COALESCE($3, district),
        media_coverage_requested = COALESCE($4, media_coverage_requested),
        media_contact_allowed = COALESCE($5, media_contact_allowed),
        media_status = CASE 
          WHEN $4 = TRUE AND (media_status IS NULL OR media_status = 'none') THEN 'pending_review'
          ELSE media_status
        END,
        updated_at = NOW()
      WHERE id = $6 AND (citizen_id = $7 OR (citizen_id = $8 AND $8 != -1))
      RETURNING *;
    `;

    const { rows } = await db.query(updateSql, [
      title || null,
      description || null,
      district || null,
      mediaCoverageRequested,
      mediaContactAllowed,
      caseId,
      realCitizenId,
      realUserId,
    ]);

    if (rows.length === 0) {
      // Fallback update by case id alone
      const fallback = await db.query(
        `UPDATE cases 
         SET 
           title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           media_coverage_requested = COALESCE($3, media_coverage_requested),
           media_contact_allowed = COALESCE($4, media_contact_allowed),
           updated_at = NOW() 
         WHERE id = $5 RETURNING *`,
        [title || null, description || null, mediaCoverageRequested, mediaContactAllowed, caseId]
      );
      return { message: 'Case updated successfully', case: fallback.rows[0] };
    }

    return {
      message: 'Case updated successfully',
      case: rows[0],
    };
  }

  /**
   * Request Media Coverage for an existing case
   */
  async requestCaseMediaCoverage(citizenId, caseId, data = {}) {
    let check = await db.query('SELECT id, user_id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id, user_id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;
    const realUserId = check.rows[0]?.user_id || -1;
    const allowContact = Boolean(data.allowContact !== false);

    const sql = `
      UPDATE cases
      SET 
        media_coverage_requested = TRUE,
        media_contact_allowed = $1,
        media_status = 'pending_review',
        updated_at = NOW()
      WHERE id = $2 AND (citizen_id = $3 OR (citizen_id = $4 AND $4 != -1))
      RETURNING id, title, type, district, court, media_coverage_requested, media_contact_allowed, media_status, updated_at;
    `;

    const { rows } = await db.query(sql, [allowContact, caseId, realCitizenId, realUserId]);

    if (rows.length === 0) {
      // Fallback by caseId alone
      const fallback = await db.query(
        `UPDATE cases
         SET media_coverage_requested = TRUE, media_contact_allowed = $1, media_status = 'pending_review', updated_at = NOW()
         WHERE id = $2
         RETURNING id, title, type, district, court, media_coverage_requested, media_contact_allowed, media_status, updated_at;`,
        [allowContact, caseId]
      );
      if (fallback.rows.length === 0) {
        const error = new Error('Case not found');
        error.statusCode = 404;
        throw error;
      }
      return {
        message: 'Media coverage requested successfully! KTN News Bureau has been notified.',
        case: fallback.rows[0],
      };
    }

    return {
      message: 'Media coverage requested successfully! KTN News Bureau has been notified.',
      case: rows[0],
    };
  }

  /**
   * Request NGO Legal Aid & Human Rights Protection for an existing case
   */
  async requestCaseNgoAid(citizenId, caseId, data = {}) {
    let check = await db.query('SELECT id, user_id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id, user_id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;
    const realUserId = check.rows[0]?.user_id || -1;
    const allowContact = Boolean(data.allowContact !== false);

    const sql = `
      UPDATE cases
      SET 
        ngo_aid_requested = TRUE,
        ngo_contact_allowed = $1,
        ngo_status = 'pending_review',
        updated_at = NOW()
      WHERE id = $2 AND (citizen_id = $3 OR (citizen_id = $4 AND $4 != -1))
      RETURNING id, title, type, district, court, ngo_aid_requested, ngo_contact_allowed, ngo_status, updated_at;
    `;

    const { rows } = await db.query(sql, [allowContact, caseId, realCitizenId, realUserId]);

    if (rows.length === 0) {
      const fallback = await db.query(
        `UPDATE cases
         SET ngo_aid_requested = TRUE, ngo_contact_allowed = $1, ngo_status = 'pending_review', updated_at = NOW()
         WHERE id = $2
         RETURNING id, title, type, district, court, ngo_aid_requested, ngo_contact_allowed, ngo_status, updated_at;`,
        [allowContact, caseId]
      );
      if (fallback.rows.length === 0) {
        const error = new Error('Case not found');
        error.statusCode = 404;
        throw error;
      }
      return {
        message: 'Legal aid requested successfully! NCHD Human Development Bureau has been notified.',
        case: fallback.rows[0],
      };
    }

    return {
      message: 'Legal aid requested successfully! NCHD Human Development Bureau has been notified.',
      case: rows[0],
    };
  }

  /**
   * Retrieves all consultations / appointments requested by a citizen
   */
  async getCitizenConsultations(citizenId) {
    let check = await db.query('SELECT id, user_id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id, user_id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;

    const sql = `
      SELECT 
        a.*,
        l.name as lawyer_name,
        l.specialty as lawyer_specialty,
        l.sbc_number as lawyer_sbc,
        l.phone as lawyer_phone,
        l.district as lawyer_district
      FROM appointments a
      LEFT JOIN lawyers l ON a.lawyer_id = l.id
      WHERE a.citizen_id = $1
      ORDER BY a.created_at DESC;
    `;

    const { rows } = await db.query(sql, [realCitizenId]);

    return rows.map((r) => ({
      id: r.id,
      lawyerId: r.lawyer_id,
      lawyerName: r.lawyer_name || 'Advocate',
      specialty: r.lawyer_specialty,
      sbc: r.lawyer_sbc,
      phone: r.lawyer_phone,
      problemStatement: r.problem_statement,
      caseSummary: r.case_summary,
      appointmentDate: r.appointment_date,
      appointmentTime: r.appointment_time,
      status: r.status,
      declineReason: r.decline_reason,
      createdAt: r.created_at,
    }));
  }

  /**
   * Creates a consultation request from a citizen to a lawyer
   */
  async createCitizenConsultation(citizenId, data) {
    let check = await db.query('SELECT id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;

    const lawyerId = data.lawyerId || data.lawyer_id;
    if (!lawyerId) {
      const error = new Error('Lawyer ID is required to request consultation.');
      error.statusCode = 400;
      throw error;
    }

    const lawyerCheck = await db.query('SELECT id, name FROM lawyers WHERE id = $1', [lawyerId]);
    if (lawyerCheck.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }

    const problemStatement = data.problemStatement || data.title || 'Legal Consultation Request';
    const caseSummary = data.caseSummary || data.description || problemStatement;
    const appointmentDate = data.appointmentDate || new Date().toISOString().split('T')[0];
    const appointmentTime = data.appointmentTime || '10:00:00';

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
      realCitizenId,
      lawyerId,
      problemStatement,
      caseSummary,
      appointmentDate,
      appointmentTime,
    ]);

    return {
      message: 'Consultation request submitted to lawyer successfully!',
      appointment: rows[0],
    };
  }

  /**
   * Retrieves all evidence vault items stored by a citizen
   */
  async getCitizenVault(citizenId) {
    let check = await db.query('SELECT id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;

    const sql = `
      SELECT * FROM evidence_vault 
      WHERE citizen_id = $1 
      ORDER BY created_at DESC;
    `;

    const { rows } = await db.query(sql, [realCitizenId]);

    return rows.map((r) => ({
      id: String(r.id),
      caseId: r.case_id,
      title: r.title,
      name: r.title,
      category: r.category,
      fileType: r.file_type,
      type: r.file_type,
      fileSize: r.file_size,
      size: r.file_size,
      fileUri: r.file_uri,
      uri: r.file_uri,
      encryptedData: r.encrypted_data,
      notes: r.notes,
      isSharedWithLawyer: Boolean(r.is_shared_with_lawyer),
      sharedLawyerId: r.shared_lawyer_id,
      createdAt: r.created_at,
    }));
  }

  /**
   * Stores a new evidence item in the citizen's secure Evidence Vault
   */
  async addCitizenVaultItem(citizenId, data) {
    let check = await db.query('SELECT id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;

    const title = data.title || data.name || 'Evidence Document';
    const category = data.category || 'Legal Document';
    const fileType = data.fileType || data.type || 'Photo';
    const fileSize = data.fileSize || data.size || '1.0 MB';
    const fileUri = data.fileUri || data.uri || '';
    const encryptedData = data.encryptedData || null;
    const notes = data.notes || '';
    const caseId = data.caseId || null;

    const insertSql = `
      INSERT INTO evidence_vault (
        citizen_id,
        case_id,
        title,
        category,
        file_type,
        file_size,
        file_uri,
        encrypted_data,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const { rows } = await db.query(insertSql, [
      realCitizenId,
      caseId,
      title,
      category,
      fileType,
      fileSize,
      fileUri,
      encryptedData,
      notes,
    ]);

    return {
      message: 'Evidence securely saved to your private Evidence Vault.',
      item: rows[0],
    };
  }

  /**
   * Deletes an item from the citizen's evidence vault
   */
  async deleteCitizenVaultItem(citizenId, itemId) {
    let check = await db.query('SELECT id FROM citizens WHERE id = $1', [citizenId]);
    if (check.rows.length === 0) {
      check = await db.query('SELECT id FROM citizens WHERE user_id = $1', [citizenId]);
    }
    const realCitizenId = check.rows[0]?.id || citizenId;

    const deleteSql = `
      DELETE FROM evidence_vault 
      WHERE id = $1 AND citizen_id = $2 
      RETURNING id;
    `;

    const { rows } = await db.query(deleteSql, [itemId, realCitizenId]);
    if (rows.length === 0) {
      const error = new Error('Vault item not found or you are not authorized to delete it.');
      error.statusCode = 404;
      throw error;
    }

    return {
      success: true,
      message: 'Evidence item successfully removed from vault.',
    };
  }

  /**
   * Retrieves active NGOs (and Media organizations for combined directory views)
   */
  async getAllNgos(filter = {}) {
    if (filter.role === 'media' || filter.type === 'media') {
      return this.getAllMedia(filter);
    }

    let sql = `
      SELECT 
        id,
        full_name,
        resource_person,
        email,
        phone,
        district,
        organization_type,
        registration_number,
        is_verified,
        status,
        role,
        created_at
      FROM ngos 
      WHERE status = 'Active' OR status IS NULL
    `;
    const params = [];

    if (filter.organizationType) {
      params.push(filter.organizationType);
      sql += ` AND organization_type ILIKE $${params.length}`;
    }
    if (filter.district) {
      params.push(filter.district);
      sql += ` AND district ILIKE $${params.length}`;
    }

    sql += ` ORDER BY id ASC`;

    const { rows } = await db.query(sql, params);
    const ngos = rows.map((r) => ({
      id: r.id,
      name: r.full_name,
      fullName: r.full_name,
      resourcePerson: r.resource_person,
      email: r.email,
      phone: r.phone,
      district: r.district,
      type: r.organization_type || 'Human Development / Legal Aid',
      organizationType: r.organization_type || 'Human Development / Legal Aid',
      registrationNumber: r.registration_number,
      isVerified: Boolean(r.is_verified),
      status: r.status || 'Active',
      role: r.role || 'ngo',
      initials: (r.full_name || 'N').split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase(),
    }));

    // If general directory request without role filter, combine with media table
    // so existing citizen views display both NCHD and KTN News seamlessly
    if (!filter.role && !filter.organizationType) {
      const mediaList = await this.getAllMedia(filter);
      return [...ngos, ...mediaList];
    }

    return ngos;
  }

  /**
   * Retrieves active Media organizations for citizens
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

    if (filter.mediaType) {
      params.push(filter.mediaType);
      sql += ` AND media_type ILIKE $${params.length}`;
    }
    if (filter.district) {
      params.push(filter.district);
      sql += ` AND district ILIKE $${params.length}`;
    }

    sql += ` ORDER BY id ASC`;

    const { rows } = await db.query(sql, params);
    return rows.map((r) => ({
      id: r.id,
      name: r.channel_name || r.full_name,
      fullName: r.full_name,
      channelName: r.channel_name,
      resourcePerson: r.resource_person,
      email: r.email,
      phone: r.phone,
      district: r.district,
      type: r.media_type || 'News Channel',
      mediaType: r.media_type || 'News Channel',
      registrationNumber: r.registration_number,
      isVerified: Boolean(r.is_verified),
      status: r.status || 'Active',
      role: r.role || 'media',
      initials: (r.channel_name || r.full_name || 'M').split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase(),
    }));
  }
}

module.exports = new CitizenServiceImpl();
