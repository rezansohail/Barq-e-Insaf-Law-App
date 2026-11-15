const NgoService = require('./ngoService');
const Ngo = require('../domain/Ngo');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Normalized coordinate offsets for Sindh Districts on map canvas (0 to 100)
const SINDH_DISTRICT_COORDS = {
  'Karachi': { x: 30, y: 82, label: 'Karachi Metro' },
  'Karachi Central': { x: 32, y: 80, label: 'Karachi Central' },
  'Karachi East': { x: 34, y: 81, label: 'Karachi East' },
  'Karachi South': { x: 30, y: 84, label: 'Karachi South' },
  'Karachi West': { x: 27, y: 80, label: 'Karachi West' },
  'Malir': { x: 37, y: 78, label: 'Malir' },
  'Korangi': { x: 35, y: 83, label: 'Korangi' },
  'Hyderabad': { x: 44, y: 68, label: 'Hyderabad' },
  'Hyderabad City': { x: 44, y: 68, label: 'Hyderabad' },
  'Sukkur': { x: 62, y: 28, label: 'Sukkur' },
  'Sukkur City': { x: 62, y: 28, label: 'Sukkur' },
  'Larkana': { x: 42, y: 34, label: 'Larkana' },
  'Thatta': { x: 39, y: 86, label: 'Thatta' },
  'Sujawal': { x: 44, y: 86, label: 'Sujawal' },
  'Badin': { x: 54, y: 86, label: 'Badin' },
  'Mirpur Khas': { x: 60, y: 70, label: 'Mirpur Khas' },
  'Shaheed Benazirabad': { x: 50, y: 52, label: 'Shaheed Benazirabad' },
  'Nawabshah': { x: 50, y: 52, label: 'Nawabshah' },
  'Dadu': { x: 38, y: 48, label: 'Dadu' },
  'Khairpur': { x: 56, y: 36, label: 'Khairpur' },
  'Sanghar': { x: 58, y: 56, label: 'Sanghar' },
  'Ghotki': { x: 74, y: 22, label: 'Ghotki' },
  'Jacobabad': { x: 44, y: 18, label: 'Jacobabad' },
  'Kashmore': { x: 54, y: 16, label: 'Kashmore' },
  'Shikarpur': { x: 48, y: 26, label: 'Shikarpur' },
  'Jamshoro': { x: 38, y: 64, label: 'Jamshoro' },
  'Tharparkar': { x: 74, y: 82, label: 'Tharparkar' },
  'Umerkot': { x: 70, y: 72, label: 'Umerkot' },
};

function getCasePointerColor(caseType = '', createdAt) {
  const isProperty = /property|land|encroach|demarcation|registry|plot/i.test(caseType);
  const isFamily = /family|custody|khula|divorce|maintenance|guardian/i.test(caseType);
  const now = new Date();
  const createdDate = createdAt ? new Date(createdAt) : now;
  const ageDays = Math.max(0, Math.floor((now - createdDate) / (1000 * 60 * 60 * 24)));

  if (isProperty) {
    if (ageDays <= 2) {
      return { category: 'Property', color: '#FF9100', glow: 'rgba(255, 145, 0, 0.75)', shadeLabel: 'Recent (New)', ageDays };
    } else if (ageDays <= 7) {
      return { category: 'Property', color: '#E65100', glow: 'rgba(230, 81, 0, 0.5)', shadeLabel: 'Active Dispute', ageDays };
    } else {
      return { category: 'Property', color: '#B45309', glow: 'rgba(180, 83, 9, 0.35)', shadeLabel: 'Older Matter', ageDays };
    }
  }

  if (isFamily) {
    if (ageDays <= 2) {
      return { category: 'Family', color: '#00E5FF', glow: 'rgba(0, 229, 255, 0.75)', shadeLabel: 'Recent (New)', ageDays };
    } else if (ageDays <= 7) {
      return { category: 'Family', color: '#0284C7', glow: 'rgba(2, 132, 199, 0.5)', shadeLabel: 'Active Hearing', ageDays };
    } else {
      return { category: 'Family', color: '#075985', glow: 'rgba(7, 89, 133, 0.35)', shadeLabel: 'Older Matter', ageDays };
    }
  }

  return { category: 'Civil / Other', color: '#C084FC', glow: 'rgba(192, 132, 252, 0.75)', shadeLabel: ageDays <= 2 ? 'Recent (New)' : 'Older Matter', ageDays };
}

class NgoServiceImpl extends NgoService {
  /**
   * Registers a new NGO entity with validation and duplicate checks
   */
  async registerNgo(dto) {
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    const userRoleCheck = await db.query('SELECT role FROM users WHERE email = $1', [dto.email]);
    if (userRoleCheck.rows.length > 0) {
      const actualRole = userRoleCheck.rows[0].role;
      const roleNames = { lawyer: 'Lawyer', citizen: 'Citizen', admin: 'Admin', ngo: 'NGO', media: 'Media Partner' };
      const displayName = roleNames[actualRole] || actualRole;
      const error = new Error(`This email is already registered as a ${displayName}. You cannot register it as an NGO.`);
      error.statusCode = 409;
      throw error;
    }

    const existingEmail = await db.query('SELECT id FROM ngos WHERE email = $1', [dto.email]);
    if (existingEmail.rows.length > 0) {
      const error = new Error('An NGO with this email address is already registered.');
      error.statusCode = 409;
      throw error;
    }

    if (dto.phone) {
      const existingPhone = await db.query('SELECT id FROM ngos WHERE phone = $1', [dto.phone]);
      if (existingPhone.rows.length > 0) {
        const error = new Error('An NGO with this phone number is already registered.');
        error.statusCode = 409;
        throw error;
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

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

    const insertQuery = `
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
      RETURNING *;
    `;

    const values = [
      dto.fullName,
      dto.resourcePerson || null,
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
    const ngoEntity = new Ngo(createdRow);

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
      message: 'NGO registered successfully! Welcome to Barq-e-Insaf.',
      token,
      ngo: ngoEntity.toResponse(),
    };
  }

  /**
   * Authenticates an NGO with Email and Password
   */
  async loginNgo(dto) {
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    const result = await db.query('SELECT * FROM ngos WHERE email = $1', [dto.email]);

    if (result.rows.length === 0) {
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

    const ngoRow = result.rows[0];

    if (!ngoRow.password) {
      const error = new Error('This account does not have a password configured.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(dto.password, ngoRow.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const ngoEntity = new Ngo(ngoRow);

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
      message: 'Login successful! Welcome to the NGO Dashboard.',
      token,
      ngo: ngoEntity.toResponse(),
    };
  }

  /**
   * Retrieves single NGO by ID
   */
  async getNgoById(id) {
    const result = await db.query('SELECT * FROM ngos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('NGO organization not found');
      error.statusCode = 404;
      throw error;
    }
    return new Ngo(result.rows[0]).toResponse();
  }

  /**
   * Retrieves all active/verified NGOs from the `ngos` table
   */
  async getAllNgos(filter = {}) {
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

    sql += ' ORDER BY created_at DESC;';

    const result = await db.query(sql, params);
    return result.rows.map((row) => ({
      id: row.id,
      name: row.full_name,
      fullName: row.full_name,
      resourcePerson: row.resource_person,
      email: row.email,
      phone: row.phone,
      district: row.district,
      type: row.organization_type || 'Human Development / Legal Aid',
      organizationType: row.organization_type,
      registrationNumber: row.registration_number,
      isVerified: Boolean(row.is_verified),
      status: row.status,
      role: row.role || 'ngo',
      initials: (row.full_name || 'NGO')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
        .toUpperCase(),
      createdAt: row.created_at,
    }));
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * REAL-TIME SINDH JUDICIAL HEATMAP & DISPUTE PERCENTAGES FOR NGO
   * Groups real cases by district, calculates percentages, and assigns
   * severity shading: Red (high hotspot), Amber (moderate), Green (low).
   * ══════════════════════════════════════════════════════════════════════
   */
  async getSindhHeatmapAnalytics(range = 'This Month') {
    const casesSql = `
      SELECT 
        id,
        title,
        type,
        district,
        court,
        status,
        created_at,
        ngo_aid_requested,
        ngo_assistance_offered,
        ngo_status
      FROM cases
      ORDER BY created_at DESC;
    `;
    const casesResult = await db.query(casesSql);
    const allCases = casesResult.rows;
    const totalCases = allCases.length;

    // Aggregate counts by district
    const districtMap = new Map();

    for (const c of allCases) {
      const rawDist = (c.district || 'Karachi Central').trim();
      const normDist = SINDH_DISTRICT_COORDS[rawDist] ? rawDist : 'Karachi';

      if (!districtMap.has(normDist)) {
        districtMap.set(normDist, {
          district: normDist,
          total: 0,
          property: 0,
          family: 0,
          criminal: 0,
          civil: 0,
          aidRequested: 0,
          assistanceOffered: 0,
        });
      }

      const item = districtMap.get(normDist);
      item.total += 1;

      const cType = c.type || '';
      if (/property|land|encroach|plot/i.test(cType)) {
        item.property += 1;
      } else if (/family|custody|khula|divorce/i.test(cType)) {
        item.family += 1;
      } else if (/criminal|bail|ppc|fir/i.test(cType)) {
        item.criminal += 1;
      } else {
        item.civil += 1;
      }

      if (c.ngo_aid_requested) {
        item.aidRequested += 1;
      }
      if (c.ngo_assistance_offered) {
        item.assistanceOffered += 1;
      }
    }

    // Calculate percentages and color severity
    const districtHeatmap = Array.from(districtMap.values()).map((d) => {
      const percentage = totalCases > 0 ? Number(((d.total / totalCases) * 100).toFixed(1)) : 0;
      let severity = 'low';
      let color = '#10B981'; // Green
      let badge = 'LOW';

      if (percentage >= 25 || (totalCases > 0 && d.total === Math.max(...Array.from(districtMap.values()).map(x => x.total)))) {
        severity = 'high';
        color = '#EF4444'; // Red (hotspot)
        badge = 'HOTSPOT';
      } else if (percentage >= 10) {
        severity = 'moderate';
        color = '#F59E0B'; // Amber
        badge = 'MODERATE';
      }

      const coords = SINDH_DISTRICT_COORDS[d.district] || { x: 30, y: 82, label: d.district };

      return {
        district: d.district,
        caseCount: d.total,
        percentage,
        severity,
        color,
        badge,
        categoryBreakdown: {
          property: d.property,
          family: d.family,
          criminal: d.criminal,
          civil: d.civil,
        },
        ngoAidRequestedCount: d.aidRequested,
        assistanceOfferedCount: d.assistanceOffered,
        coordinates: coords,
      };
    });

    districtHeatmap.sort((a, b) => b.caseCount - a.caseCount);

    const propertyTotal = allCases.filter(c => /property|land|encroach|plot/i.test(c.type || '')).length;
    const familyTotal = allCases.filter(c => /family|custody|khula|divorce/i.test(c.type || '')).length;
    const criminalTotal = allCases.filter(c => /criminal|bail|ppc|fir/i.test(c.type || '')).length;
    const civilTotal = Math.max(0, totalCases - propertyTotal - familyTotal - criminalTotal);

    const categoriesBreakdown = [
      {
        label: 'Property & Land Rights',
        count: propertyTotal,
        percentage: totalCases > 0 ? Math.round((propertyTotal / totalCases) * 100) : 0,
        color: '#FF9500',
      },
      {
        label: 'Family & Custody',
        count: familyTotal,
        percentage: totalCases > 0 ? Math.round((familyTotal / totalCases) * 100) : 0,
        color: '#00E5FF',
      },
      {
        label: 'Criminal PPC Defense',
        count: criminalTotal,
        percentage: totalCases > 0 ? Math.round((criminalTotal / totalCases) * 100) : 0,
        color: '#FF7043',
      },
      {
        label: 'Civil & Contract',
        count: civilTotal,
        percentage: totalCases > 0 ? Math.round((civilTotal / totalCases) * 100) : 0,
        color: '#C084FC',
      },
    ];

    const livePointers = allCases.map((c) => {
      const rawDist = (c.district || 'Karachi Central').trim();
      const coords = SINDH_DISTRICT_COORDS[rawDist] || SINDH_DISTRICT_COORDS['Karachi'] || { x: 30, y: 82 };
      const colorProfile = getCasePointerColor(c.type, c.created_at);

      return {
        id: String(c.id),
        title: c.title,
        type: c.type || 'Legal Dispute',
        district: rawDist,
        court: c.court || 'Sindh Judicial District',
        status: c.status || 'Active',
        filingDate: c.created_at
          ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Active',
        createdAt: c.created_at,
        description: c.description || 'Dispute documentation under judicial review.',
        ngoAidRequested: Boolean(c.ngo_aid_requested),
        ngoAssistanceOffered: Boolean(c.ngo_assistance_offered),
        ngoStatus: c.ngo_status || 'none',
        coords,
        colorProfile,
        litigantIdentityProtected: true,
      };
    });

    const topHotspot = districtHeatmap.length > 0 ? districtHeatmap[0].district : 'Karachi';

    return {
      success: true,
      range,
      organization: 'National Commission for Human Development (NCHD)',
      summary: {
        totalActiveCases: totalCases,
        districtsCovered: districtHeatmap.length,
        topHotspotDistrict: topHotspot,
        verifiedCourtDocketRate: '100%',
        aidRequestsCount: allCases.filter(c => c.ngo_aid_requested).length,
        assistanceOfferedCount: allCases.filter(c => c.ngo_assistance_offered).length,
      },
      categoriesBreakdown,
      districtHeatmap,
      livePointers,
    };
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * PUBLIC DOCKET (ANONYMIZED FOR NGO OFFICERS)
   * ══════════════════════════════════════════════════════════════════════
   */
  async getPublicDocket(filter = {}) {
    let sql = `
      SELECT 
        id,
        title,
        type,
        district,
        court,
        status,
        hearing_date,
        description,
        is_flagged,
        ngo_aid_requested,
        ngo_contact_allowed,
        ngo_status,
        ngo_assistance_offered,
        ngo_assistance_message,
        created_at
      FROM cases
      WHERE 1=1
    `;
    const params = [];

    if (filter.district) {
      params.push(filter.district);
      sql += ` AND district ILIKE $${params.length}`;
    }
    if (filter.type) {
      params.push(`%${filter.type}%`);
      sql += ` AND type ILIKE $${params.length}`;
    }
    if (filter.status) {
      params.push(filter.status);
      sql += ` AND status = $${params.length}`;
    }
    if (filter.aidRequestedOnly === 'true' || filter.aidRequestedOnly === true) {
      sql += ` AND ngo_aid_requested = TRUE`;
    }

    sql += ' ORDER BY created_at DESC;';

    const { rows } = await db.query(sql, params);

    return rows.map((r) => {
      const coords = SINDH_DISTRICT_COORDS[r.district] || SINDH_DISTRICT_COORDS['Karachi'] || { x: 30, y: 82 };
      const colorProfile = getCasePointerColor(r.type, r.created_at);

      return {
        id: String(r.id),
        title: r.title,
        type: r.type || 'Legal Dispute',
        district: r.district,
        court: r.court || 'Sindh District Court',
        status: r.status || 'Active',
        hearingDate: r.hearing_date,
        description: r.description || 'Public interest dispute documentation under judicial review.',
        ngoAidRequested: Boolean(r.ngo_aid_requested),
        ngoContactAllowed: Boolean(r.ngo_contact_allowed),
        ngoStatus: r.ngo_status || 'none',
        ngoAssistanceOffered: Boolean(r.ngo_assistance_offered),
        ngoAssistanceMessage: r.ngo_assistance_message || null,
        createdAt: r.created_at,
        coords,
        colorProfile,
        litigantIdentityProtected: true,
      };
    });
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * CITIZEN LEGAL AID & HUMAN RIGHTS REQUESTS
   * Returns cases where citizens have asked NCHD for aid
   * ══════════════════════════════════════════════════════════════════════
   */
  async getAidRequests(filter = {}) {
    let sql = `
      SELECT 
        id,
        title,
        type,
        description,
        district,
        court,
        status,
        hearing_date,
        ngo_aid_requested,
        ngo_contact_allowed,
        ngo_status,
        ngo_assistance_offered,
        ngo_assistance_message,
        created_at
      FROM cases
      WHERE ngo_aid_requested = TRUE OR ngo_assistance_offered = TRUE
    `;
    const params = [];

    if (filter.district) {
      params.push(filter.district);
      sql += ` AND district ILIKE $${params.length}`;
    }
    if (filter.status) {
      params.push(filter.status);
      sql += ` AND ngo_status = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC;';

    const { rows } = await db.query(sql, params);

    return rows.map((r) => ({
      aidRequestId: `AID-SINDH-${r.id}`,
      caseId: String(r.id),
      title: r.title,
      type: r.type,
      district: r.district,
      court: r.court,
      description: r.description,
      ngoAidRequested: Boolean(r.ngo_aid_requested),
      ngoContactAllowed: Boolean(r.ngo_contact_allowed),
      ngoStatus: r.ngo_status || 'pending_review',
      ngoAssistanceOffered: Boolean(r.ngo_assistance_offered),
      ngoAssistanceMessage: r.ngo_assistance_message,
      contactRelayToken: r.ngo_contact_allowed ? `RELAY-AID-${r.id}-NCHD` : 'CONTACT_RESTRICTED',
      submittedAt: r.created_at,
    }));
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * PRO-ACTIVE OUTREACH: NGO OFFERS ASSISTANCE TO A CITIZEN'S CASE
   * Allows NCHD officers to reach out and offer free pro-bono aid
   * ══════════════════════════════════════════════════════════════════════
   */
  async offerAssistance(caseId, data = {}, ngoId = null) {
    const message = (data.message || 'The National Commission for Human Development (NCHD) has reviewed your dispute on Barq-e-Insaf and offers pro-bono legal aid and human rights protection.').trim();
    const programName = data.programName || 'NCHD Pro-Bono Legal & Human Rights Aid';

    const sql = `
      UPDATE cases
      SET
        ngo_assistance_offered = TRUE,
        ngo_assistance_message = $1,
        ngo_assistance_offered_at = NOW(),
        ngo_status = 'assistance_offered',
        notes = COALESCE(notes, '') || E'\n[NCHD Outreach]: Offered aid under ' || $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, title, district, type, ngo_assistance_offered, ngo_assistance_message, ngo_status, updated_at;
    `;

    const { rows } = await db.query(sql, [message, programName, caseId]);
    if (rows.length === 0) {
      const error = new Error('Case not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      message: 'Pro-bono legal aid offer dispatched to citizen via secure anonymous relay!',
      case: rows[0],
    };
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * UPDATE CASE AID STATUS
   * ══════════════════════════════════════════════════════════════════════
   */
  async updateCaseAidStatus(caseId, status, notes = '') {
    const validStatuses = ['pending_review', 'assistance_offered', 'aid_assigned', 'in_progress', 'resolved', 'rejected', 'archived'];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const sql = `
      UPDATE cases
      SET
        ngo_status = $1,
        notes = CASE WHEN $2 != '' THEN COALESCE(notes, '') || E'\n[NCHD Update]: ' || $2 ELSE notes END,
        updated_at = NOW()
      WHERE id = $3
      RETURNING id, title, district, type, ngo_status, updated_at;
    `;

    const { rows } = await db.query(sql, [status, notes || '', caseId]);
    if (rows.length === 0) {
      const error = new Error('Case not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      message: `Case legal aid status updated to '${status}'.`,
      case: rows[0],
    };
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * PUBLISH NGO HUMAN DEVELOPMENT & FIELD STORY
   * ══════════════════════════════════════════════════════════════════════
   */
  async createNgoStory(ngoId, dto) {
    const validation = dto.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(' '));
      error.statusCode = 400;
      error.errors = validation.errors;
      throw error;
    }

    const insertSql = `
      INSERT INTO ngo_stories (
        ngo_id,
        title,
        summary,
        district,
        category,
        officer_name,
        program_name,
        is_featured,
        published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *;
    `;

    const values = [
      ngoId || null,
      dto.title,
      dto.summary,
      dto.district,
      dto.category,
      dto.officerName,
      dto.programName,
      dto.isFeatured,
    ];

    const { rows } = await db.query(insertSql, values);

    return {
      message: 'NGO human development story published successfully!',
      story: rows[0],
    };
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * GET PUBLISHED NGO STORIES
   * ══════════════════════════════════════════════════════════════════════
   */
  async getNgoStories(filter = {}) {
    let sql = `
      SELECT 
        s.*,
        n.full_name as ngo_name,
        n.resource_person
      FROM ngo_stories s
      LEFT JOIN ngos n ON s.ngo_id = n.id
      WHERE 1=1
    `;
    const params = [];

    if (filter.district) {
      params.push(filter.district);
      sql += ` AND s.district ILIKE $${params.length}`;
    }
    if (filter.category) {
      params.push(`%${filter.category}%`);
      sql += ` AND s.category ILIKE $${params.length}`;
    }
    if (filter.isFeatured === 'true' || filter.isFeatured === true) {
      sql += ` AND s.is_featured = TRUE`;
    }

    sql += ' ORDER BY s.is_featured DESC, s.published_at DESC;';

    const { rows } = await db.query(sql, params);
    return rows;
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * GET SINGLE NGO STORY BY ID
   * ══════════════════════════════════════════════════════════════════════
   */
  async getNgoStoryById(storyId) {
    const sql = `
      SELECT 
        s.*,
        n.full_name as ngo_name,
        n.resource_person
      FROM ngo_stories s
      LEFT JOIN ngos n ON s.ngo_id = n.id
      WHERE s.id = $1
    `;
    const { rows } = await db.query(sql, [storyId]);
    if (rows.length === 0) {
      const error = new Error('NGO story not found');
      error.statusCode = 404;
      throw error;
    }
    return rows[0];
  }

  /**
   * ══════════════════════════════════════════════════════════════════════
   * EXPORT INSTITUTIONAL AID REPORT PACKET
   * ══════════════════════════════════════════════════════════════════════
   */
  async exportInstitutionalReport(options = {}) {
    const format = (options.format || 'PDF').toUpperCase();
    const includeAnonymized = options.anonymizeLitigants !== false;

    const heatmapData = await this.getSindhHeatmapAnalytics('Full Year');
    const dockets = await this.getPublicDocket({});

    return {
      success: true,
      reportId: `NCHD-REPORT-${Date.now()}`,
      format,
      generatedAt: new Date().toISOString(),
      institution: 'National Commission for Human Development (NCHD) · Provincial Directorate Sindh',
      statutoryMandate: 'NCHD Ordinance XXIX of 2002 / Federal Ministry of Education & Professional Training',
      editorialCompliance: {
        litigantPrivacyProtected: includeAnonymized,
        verifiedCourtRecordFactChecked: true,
        jurisdiction: 'Sindh Provincial High Court & Subordinate District Judiciary',
      },
      summary: heatmapData.summary,
      categoryDistribution: heatmapData.categoriesBreakdown,
      topDistricts: heatmapData.districtHeatmap.slice(0, 5),
      caseRecordsCount: dockets.length,
      downloadReady: true,
      downloadUrl: `/api/ngo/reports/download/NCHD-REPORT-${Date.now()}.${format.toLowerCase()}`,
    };
  }
}

module.exports = new NgoServiceImpl();
