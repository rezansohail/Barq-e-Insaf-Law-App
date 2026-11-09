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
    throw new Error('getLawyerById() method not implemented');
  }

  async rateLawyer(id, rating) {
    throw new Error('rateLawyer() method not implemented');
  }
}

module.exports = LawyerService;
