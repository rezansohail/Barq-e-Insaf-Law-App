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

  async updateLawyerProfile(id, profileData) {
    throw new Error('updateLawyerProfile() method not implemented');
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
