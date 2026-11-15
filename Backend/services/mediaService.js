/**
 * Media Partner Service Interface
 * Defines core authentication and business operations for Media entities
 */
class MediaService {
  async registerMedia(registerMediaDTO) {
    throw new Error('registerMedia() method not implemented');
  }

  async loginMedia(loginMediaDTO) {
    throw new Error('loginMedia() method not implemented');
  }

  async getMediaById(id) {
    throw new Error('getMediaById() method not implemented');
  }

  async getAllMedia(filter) {
    throw new Error('getAllMedia() method not implemented');
  }

  async getSindhHeatmapAnalytics() {
    throw new Error('getSindhHeatmapAnalytics() method not implemented');
  }

  async getPublicCourtDocket(filter) {
    throw new Error('getPublicCourtDocket() method not implemented');
  }

  async getCitizenMediaLeads(filter) {
    throw new Error('getCitizenMediaLeads() method not implemented');
  }

  async updateCaseMediaStatus(caseId, status, notes) {
    throw new Error('updateCaseMediaStatus() method not implemented');
  }

  async createMediaStory(mediaId, createStoryDTO) {
    throw new Error('createMediaStory() method not implemented');
  }

  async getMediaStories(filter) {
    throw new Error('getMediaStories() method not implemented');
  }

  async getMediaStoryById(storyId) {
    throw new Error('getMediaStoryById() method not implemented');
  }

  async exportPressReport(options) {
    throw new Error('exportPressReport() method not implemented');
  }
}

module.exports = MediaService;
