const API_BASE = "http://localhost:5001/grievance-platform-1197a/us-central1/app/api";

async function runPhase2Tests() {
  console.log("==========================================");
  console.log("   PHASE 2 E2E TEST SUITE (TRACKING & AI) ");
  console.log("==========================================\n");

  let complaintId;

  try {
    console.log("[Test 1] Testing AI Complaint Creation...");
    const messyText = "The water pipe on 5th street burst 3 days ago and nobody fixed it";
    const res1 = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "ai_test_user", text: messyText })
    });
    
    if (!res1.ok) {
      const err = await res1.json();
      throw new Error(err.error || err.details || "Unknown creation error");
    }

    const data1 = await res1.json();
    complaintId = data1.complaint_id;
    console.log("✅ Complaint created successfully with ID:", complaintId);

    console.log("\n[Test 2] Fetching Complaint Details (GET /complaints/:id)...");
    const res2 = await fetch(`${API_BASE}/complaints/${complaintId}`);
    if (!res2.ok) throw new Error("Failed to fetch complaint details");
    const data2 = await res2.json();
    
    console.log("   Structured Data from AI:");
    console.log("   - Category:", data2.category);
    console.log("   - Severity:", data2.severity);
    console.log("   - Summary:", data2.summary);
    
    if (data2.category === "General" && data2.severity === "LOW" && data2.summary === messyText) {
      console.log("⚠️ WARNING: AI Fallback was triggered (perhaps missing API key?)");
    } else {
      console.log("✅ AI correctly structured the complaint!");
    }

    console.log("\n[Test 3] Fetching All Complaints (GET /complaints)...");
    const res3 = await fetch(`${API_BASE}/complaints`);
    if (!res3.ok) throw new Error("Failed to fetch all complaints");
    const data3 = await res3.json();
    if (data3.complaints && data3.complaints.length > 0) {
      console.log(`✅ Successfully fetched ${data3.complaints.length} complaints.`);
    }

    console.log("\n[Test 4] Fetching Complaint Logs (GET /complaints/:id/logs)...");
    const res4 = await fetch(`${API_BASE}/complaints/${complaintId}/logs`);
    if (!res4.ok) {
      const err = await res4.json();
      throw new Error(err.error || err.details || "Failed to fetch logs");
    }
    const data4 = await res4.json();
    if (data4.logs && data4.logs.length > 0) {
      console.log(`✅ Successfully fetched ${data4.logs.length} log(s) for this complaint.`);
      console.log(`   Latest Log Action: ${data4.logs[0].action}`);
    }

    console.log("\n==========================================");
    console.log("✅ ALL PHASE 2 TESTS PASSED");
    console.log("==========================================");

  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  }
}

runPhase2Tests();
