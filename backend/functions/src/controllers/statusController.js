const statusService = require('../services/statusService');

const ALLOWED_STATES = ['SUBMITTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED'];

async function updateComplaintStatus(req, res) {
  try {
    const { id } = req.params;
    const { new_status } = req.body;

    if (!new_status || !ALLOWED_STATES.includes(new_status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or missing new_status. Allowed: ' + ALLOWED_STATES.join(', ') 
      });
    }

    const updatedComplaint = await statusService.updateComplaintStatus(id, new_status);
    
    return res.status(200).json({
      success: true,
      data: updatedComplaint
    });
  } catch (error) {
    console.error('Error in updateComplaintStatus:', error);
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Internal server error while updating status' });
  }
}

module.exports = {
  updateComplaintStatus
};
