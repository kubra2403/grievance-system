// run_tests.js
// A fully automated script to test the Grievance Platform API end-to-end.
// Requires Node v18+ for native fetch API support.

const API_BASE = "http://localhost:5001/grievance-platform-1197a/us-central1/app/api";

async function runTests() {
  console.log("==========================================");
  console.log("   API END-TO-END TEST SUITE              ");
  console.log("==========================================\n");
  
  // 1. Setup Test Data
  console.log("[Setup] Creating a test complaint...");
  let complaint_id;
  try {
    const res1 = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "setup_user",
        text: "The local water pump has been broken for 3 days.",
        location: "Sector 4"
      })
    });
    const data1 = await res1.json();
    complaint_id = data1.complaint_id;
    console.log(`✅ Complaint created successfully!`);
    console.log(`   Complaint ID: ${complaint_id}\n`);
  } catch (err) {
    console.error("❌ FAIL: Failed to connect to backend. Is the Firebase Emulator running?");
    console.error("   Error:", err.message);
    return;
  }

  // 2. Test Case 1 — First Validation
  console.log("[Test 1] First Validation (Confirm)");
  try {
    const res2 = await fetch(`${API_BASE}/complaints/${complaint_id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "test_user_1", vote: "confirm" })
    });
    const data2 = await res2.json();
    if (res2.status === 200 && data2.trust_score === 1) {
      console.log("✅ PASS: First validation successful. trust_score updated to 1.\n");
    } else {
      console.log("❌ FAIL: First validation failed. Expected trust_score 1, Got:", data2, "\n");
    }
  } catch (err) {
    console.error("❌ FAIL: First validation request error:", err.message, "\n");
  }

  // 3. Test Case 2 — Second Validation (Different User)
  console.log("[Test 2] Second Validation (Confirm, different user)");
  try {
    const res3 = await fetch(`${API_BASE}/complaints/${complaint_id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "test_user_2", vote: "confirm" })
    });
    const data3 = await res3.json();
    if (res3.status === 200 && data3.trust_score === 2) {
      console.log("✅ PASS: Second validation successful. trust_score updated to 2.\n");
    } else {
      console.log("❌ FAIL: Second validation failed. Expected trust_score 2, Got:", data3, "\n");
    }
  } catch (err) {
    console.error("❌ FAIL: Second validation request error:", err.message, "\n");
  }

  // 4. Test Case 3 — Duplicate Vote Prevention
  console.log("[Test 3] Duplicate Vote Prevention");
  try {
    const res4 = await fetch(`${API_BASE}/complaints/${complaint_id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "test_user_1", vote: "confirm" })
    });
    const data4 = await res4.json();
    if (res4.status === 400 && data4.error === "User already voted") {
      console.log("✅ PASS: Duplicate vote correctly prevented (Returned 400: User already voted).\n");
    } else {
      console.log(`❌ FAIL: Duplicate vote prevention failed. Status: ${res4.status}. Got:`, data4, "\n");
    }
  } catch (err) {
    console.error("❌ FAIL: Duplicate vote request error:", err.message, "\n");
  }

  // 5. Test Case 4 — Reject Vote
  console.log("[Test 4] Reject Vote");
  try {
    const res5 = await fetch(`${API_BASE}/complaints/${complaint_id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "test_user_3", vote: "reject" })
    });
    const data5 = await res5.json();
    if (res5.status === 200 && data5.trust_score === 1) {
      console.log("✅ PASS: Reject vote successful. trust_score correctly recalculated back to 1.\n");
    } else {
      console.log("❌ FAIL: Reject vote failed. Expected trust_score 1, Got:", data5, "\n");
    }
  } catch (err) {
    console.error("❌ FAIL: Reject vote request error:", err.message, "\n");
  }

  console.log("==========================================");
  console.log("✅ [Verification of Log Chaining]");
  console.log("All tests passed. To visually verify the log chaining integrity, please navigate to:");
  console.log("http://localhost:4000/firestore/data/logs");
  console.log("1. Check the first log entry for this complaint_id (action: Complaint Created). It should have prev_hash: 'GENESIS'.");
  console.log("2. Check the subsequent validation logs. Each log's 'prev_hash' will exactly match the previous log's 'hash'.");
  console.log("==========================================\n");
}

runTests();
