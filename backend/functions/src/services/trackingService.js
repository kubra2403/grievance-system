const { db } = require('../utils/firebase');

async function getAllComplaints() {
  const snapshot = await db.collection('complaints')
    .orderBy('created_at', 'desc')
    .get();

  return snapshot.docs.map(doc => doc.data());
}

async function getComplaintById(id) {
  const doc = await db.collection('complaints').doc(id).get();
  
  if (!doc.exists) {
    const error = new Error('Complaint not found');
    error.status = 404;
    throw error;
  }

  return doc.data();
}

async function getComplaintLogs(id) {
  // First ensure complaint exists
  const complaintDoc = await db.collection('complaints').doc(id).get();
  if (!complaintDoc.exists) {
    const error = new Error('Complaint not found');
    error.status = 404;
    throw error;
  }

  const logsSnapshot = await db.collection('logs')
    .where('complaint_id', '==', id)
    .get();

  const logs = logsSnapshot.docs.map(doc => doc.data());
  // Sort in memory to avoid needing a second Firestore Composite Index
  logs.sort((a, b) => {
    const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
    const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
    return timeA - timeB;
  });

  return logs;
}

module.exports = {
  getAllComplaints,
  getComplaintById,
  getComplaintLogs
};
