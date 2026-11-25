const RegisterMediaDTO = require('../dto/RegisterMediaDTO');
const LoginMediaDTO = require('../dto/LoginMediaDTO');
const CreateMediaStoryDTO = require('../dto/CreateMediaStoryDTO');
const mediaService = require('../services/mediaServiceImpl');
const { triggerTranslate } = require('../utils/triggerTranslate');

/**
 * Controller for Media Partner Endpoints
 * Bridges HTTP layer with Business Logic Service layer
 */

// POST /api/media/register
const registerMedia = async (req, res) => {
  try {
    const dto = new RegisterMediaDTO(req.body);
    const result = await mediaService.registerMedia(dto);
    // Auto-trigger translation for new Media account
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

// POST /api/media/login
const loginMedia = async (req, res) => {
  try {
    const dto = new LoginMediaDTO(req.body);
    const result = await mediaService.loginMedia(dto);
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

// GET /api/media/me
const getMediaMe = async (req, res) => {
  try {
    const media = await mediaService.getMediaById(req.user.id);
    return res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/media
const getAllMedia = async (req, res) => {
  try {
    const mediaList = await mediaService.getAllMedia(req.query);
    return res.status(200).json(mediaList);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/media/analytics/heatmap
const getSindhHeatmap = async (req, res) => {
  try {
    const range = req.query.range || 'This Month';
    const analytics = await mediaService.getSindhHeatmapAnalytics(range);
    return res.status(200).json(analytics);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/media/docket
const getPublicCourtDocket = async (req, res) => {
  try {
    const docket = await mediaService.getPublicCourtDocket(req.query);
    return res.status(200).json(docket);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/media/leads
const getCitizenMediaLeads = async (req, res) => {
  try {
    const leads = await mediaService.getCitizenMediaLeads(req.query);
    return res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/media/cases/:caseId/status
const updateCaseMediaStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const result = await mediaService.updateCaseMediaStatus(req.params.caseId, status, notes);
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

// POST /api/media/stories
const createMediaStory = async (req, res) => {
  try {
    const mediaId = req.user ? req.user.id : (req.body.mediaId || null);
    const dto = new CreateMediaStoryDTO(req.body);
    const result = await mediaService.createMediaStory(mediaId, dto);
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

// GET /api/media/stories
const getMediaStories = async (req, res) => {
  try {
    const stories = await mediaService.getMediaStories(req.query);
    return res.status(200).json(stories);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/media/stories/:id
const getMediaStoryById = async (req, res) => {
  try {
    const story = await mediaService.getMediaStoryById(req.params.id);
    return res.status(200).json(story);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/media/reports/export
const exportPressReport = async (req, res) => {
  try {
    const result = await mediaService.exportPressReport(req.body);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/media/reports/download/:filename
const downloadPressReport = async (req, res) => {
  try {
    const { filename } = req.params;
    const { buffer, contentType, filename: outFilename } = await mediaService.downloadReportFile(filename);

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
  registerMedia,
  loginMedia,
  getMediaMe,
  getAllMedia,
  getSindhHeatmap,
  getPublicCourtDocket,
  getCitizenMediaLeads,
  updateCaseMediaStatus,
  createMediaStory,
  getMediaStories,
  getMediaStoryById,
  exportPressReport,
  downloadPressReport,
};
