const complaintService = require('../services/complaintService');

/**
 * Controller to handle POST /complaints
 */
async function createComplaint(req, res) {
  try {
    console.log("[DEMO] Incoming complaint request from user:", req.body.user_id);

    const { user_id, text, location } = req.body;

    // Validate inputs
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ success: false, message: 'user_id is required and must be a string' });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'text is required and must be a string' });
    }

    // Call service to process business logic
    const result = await complaintService.createComplaint({ user_id, text, location });

    console.log("[DEMO] Successfully created complaint:", result.complaint_id);

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in createComplaint:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while creating complaint', details: error.message });
  }
}

module.exports = {
  createComplaint
};
