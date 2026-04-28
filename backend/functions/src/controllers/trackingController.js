const trackingService = require('../services/trackingService');

async function getAllComplaints(req, res) {
  try {
    const complaints = await trackingService.getAllComplaints();
    return res.status(200).json({ success: true, data: { complaints } });
  } catch (error) {
    console.error('Error in getAllComplaints:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while fetching complaints', details: error.message });
  }
}

async function getComplaintById(req, res) {
  try {
    const { id } = req.params;
    const complaint = await trackingService.getComplaintById(id);
    return res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    console.error('Error in getComplaintById:', error);
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Internal server error while fetching complaint', details: error.message });
  }
}

async function getComplaintLogs(req, res) {
  try {
    const { id } = req.params;
    const logs = await trackingService.getComplaintLogs(id);
    return res.status(200).json({ success: true, data: { logs } });
  } catch (error) {
    console.error('Error in getComplaintLogs:', error);
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Internal server error while fetching logs', details: error.message });
  }
}

module.exports = {
  getAllComplaints,
  getComplaintById,
  getComplaintLogs
};
