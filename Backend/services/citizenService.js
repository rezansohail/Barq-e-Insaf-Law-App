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
}

module.exports = CitizenService;
