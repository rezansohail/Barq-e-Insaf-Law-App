/**
 * NGO Service Interface
 * Defines core authentication and business operations for NGO entities
 */
class NgoService {
  async registerNgo(registerNgoDTO) {
    throw new Error('registerNgo() method not implemented');
  }

  async loginNgo(loginNgoDTO) {
    throw new Error('loginNgo() method not implemented');
  }

  async getNgoById(id) {
    throw new Error('getNgoById() method not implemented');
  }

  async getAllNgos(filter) {
    throw new Error('getAllNgos() method not implemented');
  }

  async getSindhHeatmapAnalytics(range) {
    throw new Error('getSindhHeatmapAnalytics() method not implemented');
  }

  async getPublicDocket(filter) {
    throw new Error('getPublicDocket() method not implemented');
  }

  async getAidRequests(filter) {
    throw new Error('getAidRequests() method not implemented');
  }

  async offerAssistance(caseId, data, ngoId) {
    throw new Error('offerAssistance() method not implemented');
  }

  async updateCaseAidStatus(caseId, status, notes) {
    throw new Error('updateCaseAidStatus() method not implemented');
  }

  async createNgoStory(ngoId, createStoryDTO) {
    throw new Error('createNgoStory() method not implemented');
  }

  async getNgoStories(filter) {
    throw new Error('getNgoStories() method not implemented');
  }

  async getNgoStoryById(storyId) {
    throw new Error('getNgoStoryById() method not implemented');
  }

  async exportInstitutionalReport(options) {
    throw new Error('exportInstitutionalReport() method not implemented');
  }
}

module.exports = NgoService;
