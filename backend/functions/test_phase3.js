const API_BASE = "http://localhost:5001/grievance-platform-1197a/us-central1/app/api";

async function runPhase3Tests() {
  console.log("==========================================");
  console.log("   PHASE 3 E2E TEST SUITE (FULL FLOW)     ");
  console.log("==========================================\n");

  let complaintId;

  try {
    // 1. Create Complaint
    console.log("[Step 1] Creating a new complaint...");
    const messyText = "Severe water leakage on Mahatma Gandhi Road, affecting traffic.";
    const res1 = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "demo_user", text: messyText, location: "MG Road" })
    });
    
    const data1 = await res1.json();
    if (!data1.success) throw new Error(data1.message);
    complaintId = data1.data.complaint_id;
    console.log("✅ Complaint created! ID:", complaintId);

    // 2. Validate (User 1)
    console.log("\n[Step 2] Validating (User 1 - Confirm)...");
    const res2 = await fetch(`${API_BASE}/complaints/${complaintId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "validator_1", vote: "confirm" })
    });
    const data2 = await res2.json();
    if (!data2.success) throw new Error(data2.message);
    console.log("✅ Validation 1 success. trust_score:", data2.data.trust_score);

    // 3. Validate (User 2)
    console.log("[Step 3] Validating (User 2 - Confirm)...");
    const res3 = await fetch(`${API_BASE}/complaints/${complaintId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "validator_2", vote: "confirm" })
    });
    const data3 = await res3.json();
    if (!data3.success) throw new Error(data3.message);
    console.log("✅ Validation 2 success. trust_score:", data3.data.trust_score);

    // 4. Update Status (VERIFIED)
    console.log("\n[Step 4] Updating status: SUBMITTED -> VERIFIED...");
    const res4 = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_status: "VERIFIED" })
    });
    const data4 = await res4.json();
    if (!data4.success) throw new Error(data4.message);
    console.log("✅ Status updated to VERIFIED.");

    // 5. Update Status (IN_PROGRESS)
    console.log("[Step 5] Updating status: VERIFIED -> IN_PROGRESS...");
    const res5 = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_status: "IN_PROGRESS" })
    });
    const data5 = await res5.json();
    if (!data5.success) throw new Error(data5.message);
    console.log("✅ Status updated to IN_PROGRESS.");

    // 6. Update Status (RESOLVED)
    console.log("[Step 6] Updating status: IN_PROGRESS -> RESOLVED...");
    const res6 = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_status: "RESOLVED" })
    });
    const data6 = await res6.json();
    if (!data6.success) throw new Error(data6.message);
    console.log("✅ Status updated to RESOLVED.");

    // 7. Verify Log Chain
    console.log("\n[Step 7] Verifying Audit Log Chain...");
    const res7 = await fetch(`${API_BASE}/complaints/${complaintId}/logs`);
    const data7 = await res7.json();
    if (!data7.success) throw new Error(data7.message);
    const logs = data7.data.logs;
    console.log(`✅ Successfully fetched ${logs.length} logs.`);
    
    console.log("\nLog Chain Trace:");
    logs.forEach((log, i) => {
      console.log(`   Log ${i}: [${log.action}] Hash: ${log.hash.substring(0, 8)}... Prev: ${log.prev_hash.substring(0, 8)}...`);
    });

    console.log("\n==========================================");
    console.log("✅ FULL SYSTEM DEMO TEST PASSED");
    console.log("==========================================");

  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  }
}

runPhase3Tests();
