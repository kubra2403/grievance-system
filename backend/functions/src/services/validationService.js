const { v4: uuidv4 } = require('uuid');
const { db, admin } = require('../utils/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const { generateHash } = require('../utils/hash');

async function validateComplaint({ complaint_id, user_id, vote, proof_url }) {
  // Use Firestore transaction to ensure atomic reads and writes
  return await db.runTransaction(async (transaction) => {
    // 1. Fetch complaint
    const complaintRef = db.collection('complaints').doc(complaint_id);
    const complaintDoc = await transaction.get(complaintRef);

    if (!complaintDoc.exists) {
      const error = new Error('Complaint not found');
      error.status = 404;
      throw error;
    }

    // 2. Prevent duplicate votes
    const validationsQuery = db.collection('validations')
      .where('complaint_id', '==', complaint_id)
      .where('user_id', '==', user_id);
    const existingValidations = await transaction.get(validationsQuery);

    if (!existingValidations.empty) {
      const error = new Error('User already voted');
      error.status = 400;
      throw error;
    }

    // 3. Compute trust score
    const allValidationsQuery = db.collection('validations').where('complaint_id', '==', complaint_id);
    const allValidationsSnapshot = await transaction.get(allValidationsQuery);

    let confirmations = 0;
    let rejections = 0;

    allValidationsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.vote === 'confirm') confirmations++;
      if (data.vote === 'reject') rejections++;
    });

    // Add current vote to score
    if (vote === 'confirm') confirmations++;
    if (vote === 'reject') rejections++;

    const newTrustScore = confirmations - rejections;

    // 4. Log chain
    const logsQuery = db.collection('logs')
      .where('complaint_id', '==', complaint_id)
      .orderBy('timestamp', 'desc')
      .limit(1);
    const latestLogSnapshot = await transaction.get(logsQuery);

    let prev_hash = "GENESIS";
    if (!latestLogSnapshot.empty) {
      prev_hash = latestLogSnapshot.docs[0].data().hash;
    }

    const action = `Validation Added: ${vote}`;
    const localTimeISO = new Date().toISOString();
    // Hash includes prev_hash, action, and local time
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

    // 5. Create validation object
    const validation_id = uuidv4();
    const validationData = {
      id: validation_id,
      complaint_id,
      user_id,
      vote,
      proof_url: proof_url || null,
      timestamp: FieldValue.serverTimestamp()
    };

    // 6. Execute all writes
    const newValidationRef = db.collection('validations').doc(validation_id);
    const newLogRef = db.collection('logs').doc();

    transaction.set(newValidationRef, validationData);
    transaction.set(newLogRef, logEntry);
    transaction.update(complaintRef, { trust_score: newTrustScore });

    return { trust_score: newTrustScore };
  });
}

module.exports = {
  validateComplaint
};
