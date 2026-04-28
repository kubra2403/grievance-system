const { db } = require('../utils/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const { generateHash } = require('../utils/hash');

const ALLOWED_TRANSITIONS = {
  'SUBMITTED': 'VERIFIED',
  'VERIFIED': 'IN_PROGRESS',
  'IN_PROGRESS': 'RESOLVED'
};

async function updateComplaintStatus(complaint_id, new_status) {
  const complaintRef = db.collection('complaints').doc(complaint_id);

  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(complaintRef);
    if (!doc.exists) {
      const error = new Error('Complaint not found');
      error.status = 404;
      throw error;
    }

    const data = doc.data();
    const current_status = data.status || 'SUBMITTED';

    // Verify valid transition
    if (ALLOWED_TRANSITIONS[current_status] !== new_status) {
      const error = new Error(`Invalid status transition from ${current_status} to ${new_status}`);
      error.status = 400;
      throw error;
    }

    // Fetch the latest log to chain the hash correctly
    const logsSnapshot = await transaction.get(
      db.collection('logs')
        .where('complaint_id', '==', complaint_id)
        // Unfortunately, without a composite index, orderBy is risky inside a transaction.
        // We will fetch all and sort in memory exactly as we did in trackingService
    );
    
    let latestLog = null;
    if (!logsSnapshot.empty) {
      const logs = logsSnapshot.docs.map(d => d.data());
      logs.sort((a, b) => {
        const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
        return timeB - timeA; // Descending
      });
      latestLog = logs[0];
    }

    if (!latestLog) {
      const error = new Error('Integrity Error: No genesis log found for complaint');
      error.status = 500;
      throw error;
    }

    const prev_hash = latestLog.hash;
    const action = `Status Updated: ${new_status}`;
    const localTimeISO = new Date().toISOString();
    
    const hashInput = `${prev_hash}-${action}-${localTimeISO}`;
    const hash = generateHash(hashInput);

    const timestamp = FieldValue.serverTimestamp();

    const logEntry = {
      complaint_id,
      action,
      prev_hash,
      hash,
      timestamp
    };

    // Update the status on the complaint
    transaction.update(complaintRef, { status: new_status });

    // Insert the new audit log
    const logRef = db.collection('logs').doc();
    transaction.set(logRef, logEntry);

    console.log(`[DEMO] Status of ${complaint_id} updated: ${current_status} -> ${new_status}`);

    return { ...data, status: new_status };
  });
}

module.exports = {
  updateComplaintStatus
};
