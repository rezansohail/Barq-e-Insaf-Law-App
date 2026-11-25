const RegisterNgoDTO = require('../dto/RegisterNgoDTO');
const LoginNgoDTO = require('../dto/LoginNgoDTO');
const CreateNgoStoryDTO = require('../dto/CreateNgoStoryDTO');
const ngoService = require('../services/ngoServiceImpl');
const { triggerTranslate } = require('../utils/triggerTranslate');

/**
 * Controller strictly for NGO (NCHD) Endpoints
 * Bridges HTTP layer with NGO Business Logic Service layer
 */

// POST /api/ngo/register
const registerNgo = async (req, res) => {
  try {
    const dto = new RegisterNgoDTO(req.body);
    const result = await ngoService.registerNgo(dto);
    // Auto-trigger translation for new NGO account
    triggerTranslate(req.body);
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

// POST /api/ngo/login
const loginNgo = async (req, res) => {
  try {
    const dto = new LoginNgoDTO(req.body);
    const result = await ngoService.loginNgo(dto);
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

// GET /api/ngo/me
const getNgoMe = async (req, res) => {
  try {
    const ngo = await ngoService.getNgoById(req.user.id);
    return res.status(200).json({
      success: true,
      ngo,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/ngo or GET /api/ngos
const getAllNgos = async (req, res) => {
  try {
    const ngos = await ngoService.getAllNgos(req.query);
    return res.status(200).json(ngos);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/ngo/analytics/heatmap
const getSindhHeatmap = async (req, res) => {
  try {
    const range = req.query.range || 'This Month';
    const analytics = await ngoService.getSindhHeatmapAnalytics(range);
    return res.status(200).json(analytics);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/ngo/docket
const getPublicDocket = async (req, res) => {
  try {
    const docket = await ngoService.getPublicDocket(req.query);
    return res.status(200).json(docket);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/ngo/leads or GET /api/ngo/aid-requests
const getAidRequests = async (req, res) => {
  try {
    const aidRequests = await ngoService.getAidRequests(req.query);
    return res.status(200).json({
      success: true,
      count: aidRequests.length,
      aidRequests,
      leads: aidRequests,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/ngo/cases/:caseId/offer-assistance
const offerAssistance = async (req, res) => {
  try {
    const ngoId = req.user ? req.user.id : (req.body.ngoId || 3);
    const result = await ngoService.offerAssistance(req.params.caseId, req.body, ngoId);
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

// PUT /api/ngo/cases/:caseId/status
const updateCaseAidStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const result = await ngoService.updateCaseAidStatus(req.params.caseId, status, notes);
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

// POST /api/ngo/stories
const createNgoStory = async (req, res) => {
  try {
    const ngoId = req.user ? req.user.id : (req.body.ngoId || 3);
    const dto = new CreateNgoStoryDTO(req.body);
    const result = await ngoService.createNgoStory(ngoId, dto);
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

// GET /api/ngo/stories
const getNgoStories = async (req, res) => {
  try {
    const stories = await ngoService.getNgoStories(req.query);
    return res.status(200).json(stories);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/ngo/stories/:id
const getNgoStoryById = async (req, res) => {
  try {
    const story = await ngoService.getNgoStoryById(req.params.id);
    return res.status(200).json(story);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/ngo/reports/export
const exportInstitutionalReport = async (req, res) => {
  try {
    const result = await ngoService.exportInstitutionalReport(req.body);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/ngo/reports/download/:filename
const downloadInstitutionalReport = async (req, res) => {
  try {
    const { filename } = req.params;
    const { buffer, contentType, filename: outFilename } = await ngoService.downloadReportFile(filename);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${outFilename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to download report',
    });
  }
};

module.exports = {
  registerNgo,
  loginNgo,
  getNgoMe,
  getAllNgos,
  getSindhHeatmap,
  getPublicDocket,
  getAidRequests,
  offerAssistance,
  updateCaseAidStatus,
  createNgoStory,
  getNgoStories,
  getNgoStoryById,
  exportInstitutionalReport,
  downloadInstitutionalReport,
};
