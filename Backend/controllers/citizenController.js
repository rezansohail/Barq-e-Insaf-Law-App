const RegisterCitizenDTO = require('../dto/RegisterCitizenDTO');
const LoginCitizenDTO = require('../dto/LoginCitizenDTO');
const citizenService = require('../services/citizenServiceImpl');

/**
 * Controller for Citizen Endpoints
 * Bridges HTTP layer with Business Logic Service layer
 */

// POST /api/citizens/register
const registerCitizen = async (req, res) => {
  try {
    const dto = new RegisterCitizenDTO(req.body);
    const result = await citizenService.registerCitizen(dto);
    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
};

// POST /api/citizens/login
const loginCitizen = async (req, res) => {
  try {
    const dto = new LoginCitizenDTO(req.body);
    const result = await citizenService.loginCitizen(dto);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
  }
};

// GET /api/citizens/me
const getMe = async (req, res) => {
  try {
    const citizen = await citizenService.getCitizenById(req.user.id);
    return res.status(200).json({
      success: true,
      citizen,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/citizens/:id
const getCitizenById = async (req, res) => {
  try {
    const citizen = await citizenService.getCitizenById(req.params.id);
    return res.status(200).json(citizen);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/citizens/:id or PUT /api/citizens/:id/profile
const updateCitizenProfile = async (req, res) => {
  try {
    const updated = await citizenService.updateCitizenProfile(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Citizen profile updated successfully.',
      citizen: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/citizens/:id/cases
const getCitizenCases = async (req, res) => {
  try {
    const cases = await citizenService.getCitizenCases(req.params.id);
    return res.status(200).json(cases);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/citizens/:id/cases
const createCitizenCase = async (req, res) => {
  try {
    const result = await citizenService.createCitizenCase(req.params.id, req.body);
    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/citizens/:id/cases/:caseId
const updateCitizenCase = async (req, res) => {
  try {
    const result = await citizenService.updateCitizenCase(req.params.id, req.params.caseId, req.body);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/citizens/:id/consultations
const getCitizenConsultations = async (req, res) => {
  try {
    const consultations = await citizenService.getCitizenConsultations(req.params.id);
    return res.status(200).json(consultations);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/citizens/:id/consultations
const createCitizenConsultation = async (req, res) => {
  try {
    const result = await citizenService.createCitizenConsultation(req.params.id, req.body);
    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/citizens/:id/vault
const getCitizenVault = async (req, res) => {
  try {
    const vaultItems = await citizenService.getCitizenVault(req.params.id);
    return res.status(200).json(vaultItems);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/citizens/:id/vault
const addCitizenVaultItem = async (req, res) => {
  try {
    const result = await citizenService.addCitizenVaultItem(req.params.id, req.body);
    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/citizens/:id/vault/:itemId
const deleteCitizenVaultItem = async (req, res) => {
  try {
    const result = await citizenService.deleteCitizenVaultItem(req.params.id, req.params.itemId);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/citizens/ngos or GET /api/ngos
const getAllNgos = async (req, res) => {
  try {
    const ngos = await citizenService.getAllNgos(req.query);
    return res.status(200).json(ngos);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/citizens/media or GET /api/media
const getAllMedia = async (req, res) => {
  try {
    const media = await citizenService.getAllMedia(req.query);
    return res.status(200).json(media);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  getMe,
  getCitizenById,
  updateCitizenProfile,
  getCitizenCases,
  createCitizenCase,
  updateCitizenCase,
  getCitizenConsultations,
  createCitizenConsultation,
  getCitizenVault,
  addCitizenVaultItem,
  deleteCitizenVaultItem,
  getAllNgos,
  getAllMedia,
};
