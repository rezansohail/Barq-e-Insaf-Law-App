/**
 * Lawyer Service Interface
 * Defines the business operations available for Lawyers
 */
class LawyerService {
  async registerLawyer(registerLawyerDTO) {
    throw new Error('registerLawyer() method not implemented');
  }

  async loginLawyer(loginLawyerDTO) {
    throw new Error('loginLawyer() method not implemented');
  }

  async getLawyers(filters) {
    throw new Error('getLawyers() method not implemented');
  }

  async getLawyerById(id) {
    const db = require('../config/db');
    const Lawyer = require('../domain/Lawyer');
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

  async updateLawyerProfile(id, profileData) {
    const db = require('../config/db');
    const Lawyer = require('../domain/Lawyer');
    const checkRes = await db.query('SELECT * FROM lawyers WHERE id = $1 OR user_id = $1', [id]);
    if (checkRes.rows.length === 0) {
      const error = new Error('Lawyer not found');
      error.statusCode = 404;
      throw error;
    }
    const current = checkRes.rows[0];
    const lawyerId = current.id;
    const name = profileData.name !== undefined ? profileData.name : current.name;
    const specialty = profileData.specialty || profileData.spec || profileData.specialization || current.specialty;
    const district = profileData.district || profileData.city || current.district;
    const updateRes = await db.query(
      'UPDATE lawyers SET name = $1, specialty = $2, specialization = $2, district = $3 WHERE id = $4 RETURNING *',
      [name, specialty, district, lawyerId]
    );
    return new Lawyer(updateRes.rows[0]).toResponse();
  }

  async getLawyerRequests(id, query) {
    throw new Error('getLawyerRequests() method not implemented');
  }

  async createLawyerRequest(id, requestData) {
    throw new Error('createLawyerRequest() method not implemented');
  }

  async acceptLawyerRequest(id, requestId) {
    throw new Error('acceptLawyerRequest() method not implemented');
  }

  async declineLawyerRequest(id, requestId, declineReason) {
    throw new Error('declineLawyerRequest() method not implemented');
  }

  async getLawyerCases(id) {
    throw new Error('getLawyerCases() method not implemented');
  }

  async getLawyerSchedule(id) {
    throw new Error('getLawyerSchedule() method not implemented');
  }

  async updateLawyerSchedule(id, scheduleData) {
    throw new Error('updateLawyerSchedule() method not implemented');
  }

  async rateLawyer(id, rating) {
    throw new Error('rateLawyer() method not implemented');
  }
}

module.exports = LawyerService;
