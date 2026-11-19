const db = require('../config/db');

class AdminService {
  /**
   * Helper to write an audit log
   */
  async logAudit({ adminId = null, adminName = 'System', action, entityType, entityId = null, entityName = null, description, severity = 'info', ipAddress = null, details = {} }) {
    try {
      const sql = `
        INSERT INTO admin_audit_logs (
          admin_id, admin_name, action, entity_type, entity_id, entity_name, description, severity, ip_address, details
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const values = [
        adminId,
        adminName,
        action,
        entityType,
        entityId,
        entityName,
        description,
        severity,
        ipAddress,
        JSON.stringify(details),
      ];
      const { rows } = await db.query(sql, values);
      return rows[0];
    } catch (err) {
      console.error('Failed to write audit log:', err.message);
      return null;
    }
  }

  /**
   * Helper to write an admin notification
   */
  async createNotification({ title, message, type = 'system_alert', entityType = null, entityId = null }) {
    try {
      const sql = `
        INSERT INTO admin_notifications (title, message, type, entity_type, entity_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const { rows } = await db.query(sql, [title, message, type, entityType, entityId]);
      return rows[0];
    } catch (err) {
      console.error('Failed to create admin notification:', err.message);
      return null;
    }
  }

  /**
   * 1. GET ECOSYSTEM STATS
   */
  async getEcosystemStats() {
    const [citizensRes, lawyersRes, casesRes, activeCasesRes, disposedCasesRes, ngosRes, mediaRes, unreadNotifRes, recentLogsRes] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS count FROM citizens'),
      db.query('SELECT COUNT(*)::int AS count FROM lawyers'),
      db.query('SELECT COUNT(*)::int AS count FROM cases'),
      db.query("SELECT COUNT(*)::int AS count FROM cases WHERE LOWER(status) NOT IN ('disposed', 'resolved', 'closed', 'rejected')"),
      db.query("SELECT COUNT(*)::int AS count FROM cases WHERE LOWER(status) IN ('disposed', 'resolved', 'closed')"),
      db.query('SELECT COUNT(*)::int AS count FROM ngos'),
      db.query('SELECT COUNT(*)::int AS count FROM media'),
      db.query('SELECT COUNT(*)::int AS count FROM admin_notifications WHERE is_read = FALSE'),
      db.query('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 6'),
    ]);

    const totalCitizens = citizensRes.rows[0].count;
    const totalLawyers = lawyersRes.rows[0].count;
    const totalCases = casesRes.rows[0].count;
    const activeCases = activeCasesRes.rows[0].count;
    const disposedCases = disposedCasesRes.rows[0].count;
    const totalNgos = ngosRes.rows[0].count;
    const totalMedia = mediaRes.rows[0].count;
    const totalOrganizations = totalNgos + totalMedia;

    return {
      citizens: {
        total: totalCitizens,
        label: 'Total Citizens Registered',
        subtitle: 'Sindh Jurisdictions',
      },
      lawyers: {
        total: totalLawyers,
        label: 'Total Lawyers Registered',
        subtitle: 'Sindh Bar Council',
      },
      cases: {
        total: totalCases,
        active: activeCases,
        disposed: disposedCases,
        label: 'Total Cases Registered',
        subtitle: `${activeCases} Active · ${disposedCases} Disposed`,
      },
      organizations: {
        total: totalOrganizations,
        ngos: totalNgos,
        media: totalMedia,
        label: 'Total NGOs & Media',
        subtitle: 'Accredited Portals',
      },
      unreadNotificationsCount: unreadNotifRes.rows[0].count,
      recentAuditLogs: recentLogsRes.rows,
    };
  }

  /**
   * 2. CITIZEN MANAGEMENT
   */
  async getCitizens({ search, status, district, page = 1, limit = 20 }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const conditions = ["LOWER(COALESCE(c.status, 'active')) != 'deleted'"];
    const values = [];

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(c.full_name) LIKE $${values.length} OR LOWER(c.email) LIKE $${values.length} OR c.phone LIKE $${values.length} OR c.cnic LIKE $${values.length})`);
    }

    if (status && status !== 'all') {
      values.push(status.trim().toLowerCase());
      conditions.push(`LOWER(COALESCE(c.status, 'active')) = $${values.length}`);
    }

    if (district && district !== 'all') {
      values.push(district.trim().toLowerCase());
      conditions.push(`LOWER(COALESCE(c.district, '')) = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS count FROM citizens c ${whereClause}`;
    const countRes = await db.query(countSql, values);
    const total = countRes.rows[0].count;

    values.push(parseInt(limit, 10));
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const dataSql = `
      SELECT 
        c.id,
        c.full_name,
        c.email,
        c.phone,
        c.district,
        c.city,
        c.cnic,
        c.address,
        COALESCE(c.status, 'active') AS status,
        c.created_at,
        (SELECT COUNT(*)::int FROM cases WHERE citizen_id = c.id OR citizen_id = c.user_id) AS cases_count,
        (SELECT COUNT(*)::int FROM evidence_vault WHERE citizen_id = c.id) AS vault_files_count
      FROM citizens c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const { rows } = await db.query(dataSql, values);

    return {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      citizens: rows,
    };
  }

  async getCitizenById(id) {
    const citizenSql = `
      SELECT 
        c.id,
        c.full_name,
        c.email,
        c.phone,
        c.district,
        c.city,
        c.cnic,
        c.address,
        COALESCE(c.status, 'active') AS status,
        c.created_at,
        c.user_id
      FROM citizens c
      WHERE c.id = $1;
    `;
    const { rows } = await db.query(citizenSql, [id]);
    if (rows.length === 0) {
      const error = new Error('Citizen record not found.');
      error.statusCode = 404;
      throw error;
    }
    const citizen = rows[0];

    const [casesRes, evidenceRes] = await Promise.all([
      db.query(
        `SELECT id, title, type, district, court, status, hearing_date, is_flagged, created_at 
         FROM cases 
         WHERE citizen_id = $1 OR citizen_id = $2 
         ORDER BY created_at DESC`,
        [citizen.id, citizen.user_id]
      ),
      db.query(
        `SELECT id, title, file_type, category, created_at 
         FROM evidence_vault 
         WHERE citizen_id = $1 
         ORDER BY created_at DESC`,
        [citizen.id]
      ),
    ]);

    citizen.cases = casesRes.rows;
    citizen.evidenceVault = evidenceRes.rows;
    return citizen;
  }

  async updateCitizenStatus(id, { status, reason, adminId, adminName = 'Admin' }) {
    const validStatuses = ['active', 'suspended', 'restricted', 'inactive'];
    const normalizedStatus = (status || '').toLowerCase().trim();
    if (!validStatuses.includes(normalizedStatus)) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const citizenRes = await db.query('SELECT id, full_name, user_id, email, status FROM citizens WHERE id = $1', [id]);
    if (citizenRes.rows.length === 0) {
      const error = new Error('Citizen record not found.');
      error.statusCode = 404;
      throw error;
    }
    const citizen = citizenRes.rows[0];
    const previousStatus = citizen.status || 'active';

    // Update in citizens table
    await db.query('UPDATE citizens SET status = $1 WHERE id = $2', [normalizedStatus, id]);

    // Update corresponding user record if linked
    if (citizen.user_id) {
      await db.query('UPDATE users SET status = $1 WHERE id = $2', [normalizedStatus, citizen.user_id]);
    } else if (citizen.email) {
      await db.query('UPDATE users SET status = $1 WHERE LOWER(email) = LOWER($2)', [normalizedStatus, citizen.email]);
    }

    // Write audit log
    const action = normalizedStatus === 'suspended' ? 'SUSPEND_CITIZEN' : normalizedStatus === 'restricted' ? 'RESTRICT_CITIZEN' : 'ACTIVATE_CITIZEN';
    const severity = normalizedStatus === 'suspended' ? 'warning' : 'info';
    const description = reason 
      ? `Citizen '${citizen.full_name}' status changed from ${previousStatus} to ${normalizedStatus}. Reason: ${reason}`
      : `Citizen '${citizen.full_name}' status changed from ${previousStatus} to ${normalizedStatus}.`;

    await this.logAudit({
      adminId,
      adminName,
      action,
      entityType: 'citizen',
      entityId: id,
      entityName: citizen.full_name,
      description,
      severity,
      details: { previousStatus, newStatus: normalizedStatus, reason },
    });

    // Create notification if suspended or restricted
    if (normalizedStatus === 'suspended' || normalizedStatus === 'restricted') {
      await this.createNotification({
        title: `Citizen Account ${normalizedStatus.toUpperCase()}`,
        message: `Citizen ${citizen.full_name} (${citizen.email}) was ${normalizedStatus} by ${adminName}.`,
        type: 'account_status',
        entityType: 'citizen',
        entityId: id,
      });
    }

    return {
      id: citizen.id,
      fullName: citizen.full_name,
      previousStatus,
      status: normalizedStatus,
      message: `Citizen account status successfully updated to '${normalizedStatus}'.`,
    };
  }

  async deleteCitizen(id, { reason, adminId, adminName = 'Admin' }) {
    const citizenRes = await db.query('SELECT id, full_name, email, user_id FROM citizens WHERE id = $1', [id]);
    if (citizenRes.rows.length === 0) {
      const error = new Error('Citizen record not found.');
      error.statusCode = 404;
      throw error;
    }
    const citizen = citizenRes.rows[0];

    // Permanently remove from database
    await db.query('DELETE FROM citizens WHERE id = $1', [id]);
    if (citizen.user_id) {
      await db.query('DELETE FROM users WHERE id = $1', [citizen.user_id]);
    }

    await this.logAudit({
      adminId,
      adminName,
      action: 'DELETE_CITIZEN',
      entityType: 'citizen',
      entityId: id,
      entityName: citizen.full_name,
      description: `Citizen '${citizen.full_name}' account removed/deactivated by ${adminName}. ${reason ? 'Reason: ' + reason : ''}`,
      severity: 'critical',
      details: { reason },
    });

    return { message: `Citizen account '${citizen.full_name}' was successfully removed.` };
  }

  /**
   * 3. LAWYER MANAGEMENT
   */
  async getLawyers({ search, status, specialty, district, page = 1, limit = 20 }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const conditions = [];
    const values = [];

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(l.name) LIKE $${values.length} OR LOWER(l.email) LIKE $${values.length} OR l.phone LIKE $${values.length} OR LOWER(COALESCE(l.sbc_number, '')) LIKE $${values.length} OR LOWER(COALESCE(l.license_number, '')) LIKE $${values.length})`);
    }

    if (status && status !== 'all') {
      values.push(status.trim().toLowerCase());
      conditions.push(`LOWER(COALESCE(l.status, 'active')) = $${values.length}`);
    }

    if (specialty && specialty !== 'all') {
      values.push(`%${specialty.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(COALESCE(l.specialty, '')) LIKE $${values.length} OR LOWER(COALESCE(l.specialization, '')) LIKE $${values.length})`);
    }

    if (district && district !== 'all') {
      values.push(district.trim().toLowerCase());
      conditions.push(`LOWER(COALESCE(l.district, '')) = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS count FROM lawyers l ${whereClause}`;
    const countRes = await db.query(countSql, values);
    const total = countRes.rows[0].count;

    values.push(parseInt(limit, 10));
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const dataSql = `
      SELECT 
        l.id,
        l.name,
        l.email,
        l.phone,
        COALESCE(l.sbc_number, l.license_number) AS sbc_number,
        COALESCE(l.specialty, l.specialization, 'General Practice') AS specialty,
        l.district,
        l.city,
        l.experience_years,
        l.rating,
        l.total_ratings,
        COALESCE(l.status, 'active') AS status,
        l.is_verified,
        l.is_available,
        l.created_at,
        (SELECT COUNT(*)::int FROM cases WHERE lawyer_id = l.id) AS cases_count
      FROM lawyers l
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const { rows } = await db.query(dataSql, values);

    return {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      lawyers: rows,
    };
  }

  async getLawyerById(id) {
    const lawyerSql = `
      SELECT 
        l.id,
        l.name,
        l.email,
        l.phone,
        COALESCE(l.sbc_number, l.license_number) AS sbc_number,
        COALESCE(l.specialty, l.specialization) AS specialty,
        l.district,
        l.city,
        l.experience_years,
        l.rating,
        l.total_ratings,
        l.bio,
        l.education,
        l.past_experience,
        l.office_address,
        COALESCE(l.status, 'active') AS status,
        l.is_verified,
        l.is_available,
        l.office_hours,
        l.created_at,
        l.user_id
      FROM lawyers l
      WHERE l.id = $1;
    `;
    const { rows } = await db.query(lawyerSql, [id]);
    if (rows.length === 0) {
      const error = new Error('Lawyer record not found.');
      error.statusCode = 404;
      throw error;
    }
    const lawyer = rows[0];

    const casesRes = await db.query(
      `SELECT id, title, type, district, court, status, hearing_date, created_at 
       FROM cases 
       WHERE lawyer_id = $1 
       ORDER BY created_at DESC`,
      [lawyer.id]
    );
    lawyer.cases = casesRes.rows;

    return lawyer;
  }

  async updateLawyerStatus(id, { status, reason, adminId, adminName = 'Admin' }) {
    const validStatuses = ['active', 'suspended', 'restricted', 'inactive'];
    const normalizedStatus = (status || '').toLowerCase().trim();
    if (!validStatuses.includes(normalizedStatus)) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const lawyerRes = await db.query('SELECT id, name, user_id, email, status FROM lawyers WHERE id = $1', [id]);
    if (lawyerRes.rows.length === 0) {
      const error = new Error('Lawyer record not found.');
      error.statusCode = 404;
      throw error;
    }
    const lawyer = lawyerRes.rows[0];
    const previousStatus = lawyer.status || 'active';

    await db.query('UPDATE lawyers SET status = $1 WHERE id = $2', [normalizedStatus, id]);

    if (lawyer.user_id) {
      await db.query('UPDATE users SET status = $1 WHERE id = $2', [normalizedStatus, lawyer.user_id]);
    } else if (lawyer.email) {
      await db.query('UPDATE users SET status = $1 WHERE LOWER(email) = LOWER($2)', [normalizedStatus, lawyer.email]);
    }

    const action = normalizedStatus === 'suspended' ? 'SUSPEND_LAWYER' : normalizedStatus === 'restricted' ? 'RESTRICT_LAWYER' : 'ACTIVATE_LAWYER';
    const severity = normalizedStatus === 'suspended' ? 'warning' : 'info';
    const description = reason 
      ? `Advocate '${lawyer.name}' status changed from ${previousStatus} to ${normalizedStatus}. Reason: ${reason}`
      : `Advocate '${lawyer.name}' status changed from ${previousStatus} to ${normalizedStatus}.`;

    await this.logAudit({
      adminId,
      adminName,
      action,
      entityType: 'lawyer',
      entityId: id,
      entityName: lawyer.name,
      description,
      severity,
      details: { previousStatus, newStatus: normalizedStatus, reason },
    });

    if (normalizedStatus === 'suspended' || normalizedStatus === 'restricted') {
      await this.createNotification({
        title: `Lawyer Account ${normalizedStatus.toUpperCase()}`,
        message: `Advocate ${lawyer.name} (${lawyer.email}) was ${normalizedStatus} by ${adminName}.`,
        type: 'account_status',
        entityType: 'lawyer',
        entityId: id,
      });
    }

    return {
      id: lawyer.id,
      name: lawyer.name,
      previousStatus,
      status: normalizedStatus,
      message: `Advocate status successfully updated to '${normalizedStatus}'.`,
    };
  }

  async deleteLawyer(id, { reason, adminId, adminName = 'Admin' }) {
    const lawyerRes = await db.query('SELECT id, name, user_id FROM lawyers WHERE id = $1', [id]);
    if (lawyerRes.rows.length === 0) {
      const error = new Error('Lawyer record not found.');
      error.statusCode = 404;
      throw error;
    }
    const lawyer = lawyerRes.rows[0];

    await db.query('DELETE FROM lawyers WHERE id = $1', [id]);
    if (lawyer.user_id) {
      await db.query('DELETE FROM users WHERE id = $1', [lawyer.user_id]);
    }

    await this.logAudit({
      adminId,
      adminName,
      action: 'DELETE_LAWYER',
      entityType: 'lawyer',
      entityId: id,
      entityName: lawyer.name,
      description: `Advocate '${lawyer.name}' removed from Sindh Bar Council roster by ${adminName}. ${reason ? 'Reason: ' + reason : ''}`,
      severity: 'critical',
      details: { reason },
    });

    return { message: `Advocate '${lawyer.name}' was successfully removed.` };
  }

  /**
   * 4. NGO MANAGEMENT
   */
  async getNgos({ search, status, district, page = 1, limit = 20 }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const conditions = [];
    const values = [];

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(n.full_name) LIKE $${values.length} OR LOWER(n.email) LIKE $${values.length} OR n.phone LIKE $${values.length} OR LOWER(COALESCE(n.registration_number, '')) LIKE $${values.length})`);
    }

    if (status && status !== 'all') {
      values.push(status.trim().toLowerCase());
      conditions.push(`LOWER(COALESCE(n.status, 'active')) = $${values.length}`);
    }

    if (district && district !== 'all') {
      values.push(district.trim().toLowerCase());
      conditions.push(`LOWER(COALESCE(n.district, '')) = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS count FROM ngos n ${whereClause}`;
    const countRes = await db.query(countSql, values);
    const total = countRes.rows[0].count;

    values.push(parseInt(limit, 10));
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const dataSql = `
      SELECT 
        n.id,
        n.full_name,
        n.email,
        n.phone,
        n.district,
        n.organization_type,
        n.registration_number,
        n.resource_person,
        COALESCE(n.status, 'Active') AS status,
        n.is_verified,
        n.created_at,
        (SELECT COUNT(*)::int FROM cases WHERE ngo_assistance_offered = TRUE) AS cases_assisted_count
      FROM ngos n
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const { rows } = await db.query(dataSql, values);

    return {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      ngos: rows,
    };
  }

  async getNgoById(id) {
    const sql = `
      SELECT 
        n.id,
        n.full_name,
        n.email,
        n.phone,
        n.district,
        n.organization_type,
        n.registration_number,
        n.resource_person,
        COALESCE(n.status, 'Active') AS status,
        n.is_verified,
        n.created_at
      FROM ngos n
      WHERE n.id = $1;
    `;
    const { rows } = await db.query(sql, [id]);
    if (rows.length === 0) {
      const error = new Error('NGO record not found.');
      error.statusCode = 404;
      throw error;
    }
    const ngo = rows[0];

    const storiesRes = await db.query(
      'SELECT id, title, category, created_at FROM ngo_stories WHERE ngo_id = $1 ORDER BY created_at DESC',
      [ngo.id]
    );
    ngo.stories = storiesRes.rows;
    return ngo;
  }

  async updateNgoStatus(id, { status, reason, adminId, adminName = 'Admin' }) {
    const validStatuses = ['Active', 'Suspended', 'Inactive'];
    const matchingStatus = validStatuses.find((s) => s.toLowerCase() === (status || '').toLowerCase().trim());
    if (!matchingStatus) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const ngoRes = await db.query('SELECT id, full_name, user_id, email, status FROM ngos WHERE id = $1', [id]);
    if (ngoRes.rows.length === 0) {
      const error = new Error('NGO record not found.');
      error.statusCode = 404;
      throw error;
    }
    const ngo = ngoRes.rows[0];
    const previousStatus = ngo.status || 'Active';

    await db.query('UPDATE ngos SET status = $1 WHERE id = $2', [matchingStatus, id]);

    if (ngo.user_id) {
      await db.query('UPDATE users SET status = $1 WHERE id = $2', [matchingStatus.toLowerCase(), ngo.user_id]);
    } else if (ngo.email) {
      await db.query('UPDATE users SET status = $1 WHERE LOWER(email) = LOWER($2)', [matchingStatus.toLowerCase(), ngo.email]);
    }

    const action = matchingStatus === 'Suspended' ? 'SUSPEND_NGO' : 'ACTIVATE_NGO';
    const severity = matchingStatus === 'Suspended' ? 'warning' : 'info';
    const description = reason 
      ? `NGO '${ngo.full_name}' status changed from ${previousStatus} to ${matchingStatus}. Reason: ${reason}`
      : `NGO '${ngo.full_name}' status changed from ${previousStatus} to ${matchingStatus}.`;

    await this.logAudit({
      adminId,
      adminName,
      action,
      entityType: 'ngo',
      entityId: id,
      entityName: ngo.full_name,
      description,
      severity,
      details: { previousStatus, newStatus: matchingStatus, reason },
    });

    if (matchingStatus === 'Suspended') {
      await this.createNotification({
        title: 'NGO Partner Suspended',
        message: `NGO partner ${ngo.full_name} was suspended by ${adminName}.`,
        type: 'account_status',
        entityType: 'ngo',
        entityId: id,
      });
    }

    return {
      id: ngo.id,
      fullName: ngo.full_name,
      previousStatus,
      status: matchingStatus,
      message: `NGO status successfully updated to '${matchingStatus}'.`,
    };
  }

  async deleteNgo(id, { reason, adminId, adminName = 'Admin' }) {
    const ngoRes = await db.query('SELECT id, full_name, user_id FROM ngos WHERE id = $1', [id]);
    if (ngoRes.rows.length === 0) {
      const error = new Error('NGO record not found.');
      error.statusCode = 404;
      throw error;
    }
    const ngo = ngoRes.rows[0];

    await db.query('DELETE FROM ngos WHERE id = $1', [id]);
    if (ngo.user_id) {
      await db.query('DELETE FROM users WHERE id = $1', [ngo.user_id]);
    }

    await this.logAudit({
      adminId,
      adminName,
      action: 'DELETE_NGO',
      entityType: 'ngo',
      entityId: id,
      entityName: ngo.full_name,
      description: `NGO '${ngo.full_name}' accreditation revoked by ${adminName}. ${reason ? 'Reason: ' + reason : ''}`,
      severity: 'critical',
      details: { reason },
    });

    return { message: `NGO '${ngo.full_name}' was successfully removed.` };
  }

  /**
   * 5. MEDIA MANAGEMENT
   */
  async getMedia({ search, status, district, page = 1, limit = 20 }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const conditions = [];
    const values = [];

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(m.full_name) LIKE $${values.length} OR LOWER(COALESCE(m.channel_name, '')) LIKE $${values.length} OR LOWER(m.email) LIKE $${values.length} OR m.phone LIKE $${values.length})`);
    }

    if (status && status !== 'all') {
      values.push(status.trim().toLowerCase());
      conditions.push(`LOWER(COALESCE(m.status, 'active')) = $${values.length}`);
    }

    if (district && district !== 'all') {
      values.push(district.trim().toLowerCase());
      conditions.push(`LOWER(COALESCE(m.district, '')) = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS count FROM media m ${whereClause}`;
    const countRes = await db.query(countSql, values);
    const total = countRes.rows[0].count;

    values.push(parseInt(limit, 10));
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const dataSql = `
      SELECT 
        m.id,
        m.full_name,
        m.channel_name,
        m.resource_person,
        m.email,
        m.phone,
        m.district,
        m.media_type,
        m.registration_number,
        COALESCE(m.status, 'Active') AS status,
        m.is_verified,
        m.created_at,
        (SELECT COUNT(*)::int FROM media_stories WHERE media_id = m.id) AS stories_published_count
      FROM media m
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const { rows } = await db.query(dataSql, values);

    return {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      media: rows,
    };
  }

  async getMediaById(id) {
    const sql = `
      SELECT 
        m.id,
        m.full_name,
        m.channel_name,
        m.resource_person,
        m.email,
        m.phone,
        m.district,
        m.media_type,
        m.registration_number,
        COALESCE(m.status, 'Active') AS status,
        m.is_verified,
        m.created_at
      FROM media m
      WHERE m.id = $1;
    `;
    const { rows } = await db.query(sql, [id]);
    if (rows.length === 0) {
      const error = new Error('Media record not found.');
      error.statusCode = 404;
      throw error;
    }
    const media = rows[0];

    const storiesRes = await db.query(
      'SELECT id, title, category, created_at FROM media_stories WHERE media_id = $1 ORDER BY created_at DESC',
      [media.id]
    );
    media.stories = storiesRes.rows;
    return media;
  }

  async updateMediaStatus(id, { status, reason, adminId, adminName = 'Admin' }) {
    const validStatuses = ['Active', 'Suspended', 'Inactive'];
    const matchingStatus = validStatuses.find((s) => s.toLowerCase() === (status || '').toLowerCase().trim());
    if (!matchingStatus) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const mediaRes = await db.query('SELECT id, full_name, user_id, email, status FROM media WHERE id = $1', [id]);
    if (mediaRes.rows.length === 0) {
      const error = new Error('Media outlet not found.');
      error.statusCode = 404;
      throw error;
    }
    const media = mediaRes.rows[0];
    const previousStatus = media.status || 'Active';

    await db.query('UPDATE media SET status = $1 WHERE id = $2', [matchingStatus, id]);

    if (media.user_id) {
      await db.query('UPDATE users SET status = $1 WHERE id = $2', [matchingStatus.toLowerCase(), media.user_id]);
    } else if (media.email) {
      await db.query('UPDATE users SET status = $1 WHERE LOWER(email) = LOWER($2)', [matchingStatus.toLowerCase(), media.email]);
    }

    const action = matchingStatus === 'Suspended' ? 'SUSPEND_MEDIA' : 'ACTIVATE_MEDIA';
    const severity = matchingStatus === 'Suspended' ? 'warning' : 'info';
    const description = reason 
      ? `Media outlet '${media.full_name}' status changed from ${previousStatus} to ${matchingStatus}. Reason: ${reason}`
      : `Media outlet '${media.full_name}' status changed from ${previousStatus} to ${matchingStatus}.`;

    await this.logAudit({
      adminId,
      adminName,
      action,
      entityType: 'media',
      entityId: id,
      entityName: media.full_name,
      description,
      severity,
      details: { previousStatus, newStatus: matchingStatus, reason },
    });

    if (matchingStatus === 'Suspended') {
      await this.createNotification({
        title: 'Media Channel Suspended',
        message: `Media channel ${media.full_name} was suspended by ${adminName}.`,
        type: 'account_status',
        entityType: 'media',
        entityId: id,
      });
    }

    return {
      id: media.id,
      fullName: media.full_name,
      previousStatus,
      status: matchingStatus,
      message: `Media outlet status successfully updated to '${matchingStatus}'.`,
    };
  }

  async deleteMedia(id, { reason, adminId, adminName = 'Admin' }) {
    const mediaRes = await db.query('SELECT id, full_name, user_id FROM media WHERE id = $1', [id]);
    if (mediaRes.rows.length === 0) {
      const error = new Error('Media outlet not found.');
      error.statusCode = 404;
      throw error;
    }
    const media = mediaRes.rows[0];

    await db.query('DELETE FROM media WHERE id = $1', [id]);
    if (media.user_id) {
      await db.query('DELETE FROM users WHERE id = $1', [media.user_id]);
    }

    await this.logAudit({
      adminId,
      adminName,
      action: 'DELETE_MEDIA',
      entityType: 'media',
      entityId: id,
      entityName: media.full_name,
      description: `Media outlet '${media.full_name}' desk revoked by ${adminName}. ${reason ? 'Reason: ' + reason : ''}`,
      severity: 'critical',
      details: { reason },
    });

    return { message: `Media outlet '${media.full_name}' was successfully removed.` };
  }

  /**
   * 6. AUDIT LOGS
   */
  async getAuditLogs({ page = 1, limit = 20, entityType, action, search }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const conditions = [];
    const values = [];

    if (entityType && entityType !== 'all') {
      values.push(entityType.trim().toLowerCase());
      conditions.push(`LOWER(entity_type) = $${values.length}`);
    }

    if (action && action !== 'all') {
      values.push(action.trim().toUpperCase());
      conditions.push(`UPPER(action) = $${values.length}`);
    }

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(description) LIKE $${values.length} OR LOWER(COALESCE(entity_name, '')) LIKE $${values.length} OR LOWER(COALESCE(admin_name, '')) LIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS count FROM admin_audit_logs ${whereClause}`;
    const countRes = await db.query(countSql, values);
    const total = countRes.rows[0].count;

    values.push(parseInt(limit, 10));
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const dataSql = `
      SELECT 
        id,
        admin_id,
        admin_name,
        action,
        entity_type,
        entity_id,
        entity_name,
        description,
        severity,
        ip_address,
        details,
        created_at
      FROM admin_audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const { rows } = await db.query(dataSql, values);

    return {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      logs: rows,
    };
  }

  /**
   * 7. NOTIFICATIONS
   */
  async getNotifications({ unreadOnly = false, page = 1, limit = 20 }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const conditions = [];
    const values = [];

    if (unreadOnly === true || unreadOnly === 'true') {
      conditions.push('is_read = FALSE');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS count FROM admin_notifications ${whereClause}`;
    const unreadCountSql = `SELECT COUNT(*)::int AS count FROM admin_notifications WHERE is_read = FALSE`;

    const [countRes, unreadRes] = await Promise.all([
      db.query(countSql, values),
      db.query(unreadCountSql),
    ]);

    const total = countRes.rows[0].count;
    const unreadCount = unreadRes.rows[0].count;

    values.push(parseInt(limit, 10));
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const dataSql = `
      SELECT 
        id,
        title,
        message,
        type,
        entity_type,
        entity_id,
        is_read,
        created_at
      FROM admin_notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam};
    `;

    const { rows } = await db.query(dataSql, values);

    return {
      total,
      unreadCount,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      notifications: rows,
    };
  }

  async markNotificationRead(id) {
    const { rows } = await db.query(
      'UPDATE admin_notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    if (rows.length === 0) {
      const error = new Error('Notification not found.');
      error.statusCode = 404;
      throw error;
    }
    return rows[0];
  }

  async markAllNotificationsRead() {
    await db.query('UPDATE admin_notifications SET is_read = TRUE WHERE is_read = FALSE');
    return { message: 'All notifications marked as read.' };
  }
}

module.exports = new AdminService();
