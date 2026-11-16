/**
 * Citizen Service Interface
 * Defines the business operations available for Citizens
 */
class CitizenService {
  async registerCitizen(registerCitizenDTO) {
    throw new Error('registerCitizen() method not implemented');
  }

  async loginCitizen(loginCitizenDTO) {
    throw new Error('loginCitizen() method not implemented');
  }

  async getCitizenById(id) {
    throw new Error('getCitizenById() method not implemented');
  }

  async updateCitizenProfile(id, profileData) {
    throw new Error('updateCitizenProfile() method not implemented');
  }

  async getCitizenCases(id) {
    throw new Error('getCitizenCases() method not implemented');
  }

  async createCitizenCase(id, caseData) {
    throw new Error('createCitizenCase() method not implemented');
  }

  async updateCitizenCase(id, caseId, caseData) {
    throw new Error('updateCitizenCase() method not implemented');
  }

  async getCitizenConsultations(id) {
    throw new Error('getCitizenConsultations() method not implemented');
  }

  async createCitizenConsultation(id, consultationData) {
    throw new Error('createCitizenConsultation() method not implemented');
  }

  async getCitizenVault(id) {
    throw new Error('getCitizenVault() method not implemented');
  }

  async addCitizenVaultItem(id, itemData) {
    throw new Error('addCitizenVaultItem() method not implemented');
  }

  async deleteCitizenVaultItem(id, itemId) {
    throw new Error('deleteCitizenVaultItem() method not implemented');
  }

  async getAllNgos(filter) {
    throw new Error('getAllNgos() method not implemented');
  }

  async getAllMedia(filter) {
    throw new Error('getAllMedia() method not implemented');
  }
}

module.exports = CitizenService;
