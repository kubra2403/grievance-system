const API_BASE = "http://localhost:5001/grievance-platform-1197a/us-central1/app/api";

async function runValidationSuite() {
  console.log("==========================================");
  console.log("   FULL SYSTEM VALIDATION SUITE           ");
  console.log("==========================================\n");

  const results = [];
  let complaintId;

  const logResult = (name, status, details = "") => {
    results.push({ name, status, details });
    console.log(`[${status}] ${name}${details ? " - " + details : ""}`);
  };

  try {
    // PRECHECK
    console.log("--- [PRECHECK] ---");
    const precheckRes = await fetch("http://localhost:5001/grievance-platform-1197a/us-central1/app/");
    const precheckText = await precheckRes.text();
    if (precheckText.includes("Backend Running")) {
      logResult("Backend Connection", "PASS");
    } else {
      logResult("Backend Connection", "FAIL", "Expected 'Backend Running'");
    }

    // TEST 1: Complaint Creation + AI
    console.log("\n--- [TEST 1: Complaint Creation + AI] ---");
    const res1 = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: "test_user_1", 
        text: "The water pipe on 5th street burst 3 days ago and nobody fixed it" 
      })
    });
    const data1 = await res1.json();
    if (data1.success) {
      complaintId = data1.data.complaint_id;
      // Fetch the created complaint to verify AI fields
      const res1Get = await fetch(`${API_BASE}/complaints/${complaintId}`);
      const data1Get = await res1Get.json();
      const complaint = data1Get.data;

      const isFallback = (complaint.category === "General" && complaint.severity === "LOW" && complaint.summary === complaint.transcript);
      
      if (isFallback) {
        logResult("AI Structuring", "FAIL", "AI fields are fallback values (check OpenAI key)");
      } else {
        logResult("AI Structuring", "PASS", `Category: ${complaint.category}, Severity: ${complaint.severity}`);
      }
    } else {
      logResult("Complaint Creation", "FAIL", data1.message);
    }

    // TEST 2: Community Validation
    console.log("\n--- [TEST 2: Community Validation] ---");
    // 2A: First
    const res2a = await fetch(`${API_BASE}/complaints/${complaintId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "user_A", vote: "confirm" })
    });
    const data2a = await res2a.json();
    if (data2a.success && data2a.data.trust_score === 1) {
      logResult("First Validation", "PASS");
    } else {
      logResult("First Validation", "FAIL", `Expected score 1, got ${data2a.data ? data2a.data.trust_score : 'error'}`);
    }

    // 2B: Second
    const res2b = await fetch(`${API_BASE}/complaints/${complaintId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "user_B", vote: "confirm" })
    });
    const data2b = await res2b.json();
    if (data2b.success && data2b.data.trust_score === 2) {
      logResult("Second Validation", "PASS");
    } else {
      logResult("Second Validation", "FAIL");
    }

    // 2C: Duplicate
    const res2c = await fetch(`${API_BASE}/complaints/${complaintId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "user_A", vote: "confirm" })
    });
    if (res2c.status === 400) {
      logResult("Duplicate Prevention", "PASS");
    } else {
      logResult("Duplicate Prevention", "FAIL", `Expected 400, got ${res2c.status}`);
    }

    // 2D: Reject
    const res2d = await fetch(`${API_BASE}/complaints/${complaintId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "user_C", vote: "reject" })
    });
    const data2d = await res2d.json();
    if (data2d.success && data2d.data.trust_score === 1) {
      logResult("Reject Vote Calculation", "PASS");
    } else {
      logResult("Reject Vote Calculation", "FAIL", `Expected 1, got ${data2d.data.trust_score}`);
    }

    // TEST 3: Status Workflow
    console.log("\n--- [TEST 3: Status Workflow] ---");
    const statuses = ["VERIFIED", "IN_PROGRESS", "RESOLVED"];
    let statusPass = true;
    for (const s of statuses) {
      const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_status: s })
      });
      const data = await res.json();
      if (!data.success) {
        statusPass = false;
        console.log(`   ❌ Failed transition to ${s}: ${data.message}`);
      }
    }
    logResult("Status Workflow", statusPass ? "PASS" : "FAIL");

    // Invalid transition (Backwards)
    const res3Inv = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_status: "SUBMITTED" })
    });
    if (res3Inv.status === 400) {
      logResult("Invalid Transition Rejection", "PASS");
    } else {
      logResult("Invalid Transition Rejection", "FAIL");
    }

    // TEST 4: Public Tracking
    console.log("\n--- [TEST 4: Public Tracking] ---");
    const res4List = await fetch(`${API_BASE}/complaints`);
    const data4List = await res4List.json();
    if (data4List.success && data4List.data.complaints.length > 0) {
      logResult("GET All Complaints", "PASS");
    } else {
      logResult("GET All Complaints", "FAIL");
    }

    const res4Single = await fetch(`${API_BASE}/complaints/${complaintId}`);
    const data4Single = await res4Single.json();
    const finalComp = data4Single.data;
    if (finalComp.status === "RESOLVED" && finalComp.trust_score === 1) {
      logResult("Data Integrity (Status/Score)", "PASS");
    } else {
      logResult("Data Integrity (Status/Score)", "FAIL", `Status: ${finalComp.status}, Score: ${finalComp.trust_score}`);
    }

    // TEST 5: Log Chain Integrity
    console.log("\n--- [TEST 5: Log Chain Integrity] ---");
    const res5 = await fetch(`${API_BASE}/complaints/${complaintId}/logs`);
    const data5 = await res5.json();
    const logs = data5.data.logs;
    let chainPass = true;
    for (let i = 1; i < logs.length; i++) {
      if (logs[i].prev_hash !== logs[i-1].hash) {
        chainPass = false;
        console.log(`   ❌ Broken chain at index ${i}`);
      }
    }
    logResult("Log Chain Integrity", chainPass ? "PASS" : "FAIL");

    // TEST 6: Response Structure
    console.log("\n--- [TEST 6: Response Structure] ---");
    // We already checked this implicitly, but checking one more
    if (data5.hasOwnProperty('success')) {
      logResult("Response Structure Consistency", "PASS");
    } else {
      logResult("Response Structure Consistency", "FAIL");
    }

    console.log("\n==========================================");
    console.log("   FINAL RESULTS SUMMARY                  ");
    console.log("==========================================");
    results.forEach(r => {
      console.log(`${r.status === "PASS" ? "✅" : "❌"} ${r.name}`);
    });
    console.log("==========================================");

  } catch (err) {
    console.error("\n❌ SUITE CRASHED:", err.message);
  }
}

runValidationSuite();
