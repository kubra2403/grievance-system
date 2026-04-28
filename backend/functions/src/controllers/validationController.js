const validationService = require('../services/validationService');

async function validateComplaint(req, res) {
  try {
    const { id } = req.params;
    const { user_id, vote, proof_url } = req.body;

    console.log(`[DEMO] Validation request: User ${user_id} voted ${vote} on complaint ${id}`);
    
    // Validate inputs
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ success: false, message: 'user_id is required and must be a string' });
    }

    if (vote !== 'confirm' && vote !== 'reject') {
      return res.status(400).json({ success: false, message: 'vote must be "confirm" or "reject"' });
    }

    // Call service logic
    const result = await validationService.validateComplaint({
      complaint_id: id,
      user_id,
      vote,
      proof_url
    });

    console.log(`[DEMO] Validation successful. New trust_score: ${result.trust_score}`);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in validateComplaint:', error);
    
    // Return appropriate HTTP status code based on error
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: 'Internal server error while validating complaint', details: error.message });
  }
}

module.exports = {
  validateComplaint
};
