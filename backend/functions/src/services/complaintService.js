const { v4: uuidv4 } = require('uuid');
const { db, admin } = require('../utils/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const { generateHash } = require('../utils/hash');
const aiService = require('./aiService');

/**
 * Creates a new complaint and logs the action
 */
async function createComplaint({ user_id, text, location }) {
  const complaint_id = uuidv4();
  const timestamp = FieldValue.serverTimestamp();
  const localTimeISO = new Date().toISOString(); // Used for synchronous hash and response
  
  // Process text through AI
  const structuredData = await aiService.structureComplaintData(text);

  const complaintData = {
    id: complaint_id,
    user_id,
    transcript: text, // keep original text
    summary: structuredData.summary,
    category: structuredData.category,
    severity: structuredData.severity,
    key_issue: structuredData.key_issue,
    location: location || null,
    status: 'SUBMITTED',
    trust_score: 0,
    created_at: timestamp
  };

  // Generate audit log entry
  const action = 'Complaint Created';
  const prev_hash = 'GENESIS';
  
  // Generating hash using action and local ISO string timestamp
  const hashInput = `${action}-${localTimeISO}`;
  const hash = generateHash(hashInput);

  const logEntry = {
    complaint_id,
    action,
    prev_hash,
    hash,
    timestamp
  };

  // Use a batch write so both writes succeed or fail together
  const batch = db.batch();

  const complaintRef = db.collection('complaints').doc(complaint_id);
  batch.set(complaintRef, complaintData);

  const logRef = db.collection('logs').doc();
  batch.set(logRef, logEntry);

  try {
    await batch.commit();
    console.log("Complaint stored:", complaint_id);
    console.log("Log entry created for complaint:", complaint_id);
  } catch (error) {
    console.error("Batch commit failed:", error);
    throw error;
  }

  return {
    complaint_id,
    status: complaintData.status,
    created_at: localTimeISO
  };
}

module.exports = {
  createComplaint
};
