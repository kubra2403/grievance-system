const { admin, db } = require('./src/utils/firebase');
async function test() {
  try {
    console.log("Attempting Firestore write...");
    const res = await db.collection('test').doc('test').set({ a: 1 });
    console.log("Success:", res);
  } catch (err) {
    console.error("Firestore Error:", err);
  }
}
test();
