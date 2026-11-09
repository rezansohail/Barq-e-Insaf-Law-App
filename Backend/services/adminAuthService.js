/**
 * Admin Service Interface
 * Defines core authentication and profile operations for Admins
 */
class AdminAuthService {
  async registerAdmin(registerAdminDTO) {
    throw new Error('registerAdmin() method not implemented');
  }

  async loginAdmin(loginAdminDTO) {
    throw new Error('loginAdmin() method not implemented');
  }

  async getAdminById(id) {
    throw new Error('getAdminById() method not implemented');
  }
}

module.exports = AdminAuthService;
