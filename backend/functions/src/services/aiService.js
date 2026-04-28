require('dotenv').config();

/**
 * Migrated to Groq AI (llama3-70b-8192) for high-performance complaint structuring.
 * Uses native fetch to keep dependencies minimal.
 */
async function structureComplaintData(text) {
  const fallback = {
    summary: text,
    category: "General",
    severity: "LOW",
    key_issue: text
  };

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    console.log("[AI] Groq fallback triggered (Missing API Key)");
    return fallback;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: "You are a strict JSON generator. Output ONLY valid JSON. No explanations."
          },
          {
            role: "user",
            content: `Convert this complaint into JSON with EXACT fields: { summary, category, severity, key_issue }. 
            category must be one of [Infrastructure, Safety, Health, Corruption, General]. 
            severity must be one of [LOW, MEDIUM, HIGH, CRITICAL]. 
            Text: ${text}`
          }
        ]
      })
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // Clean up content if AI wrapped it in markdown code blocks
    if (content.startsWith("```")) {
      content = content.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
    }

    const structuredData = JSON.parse(content);

    // Validate fields and enums
    const allowedCategories = ["Infrastructure", "Safety", "Health", "Corruption", "General"];
    const allowedSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    if (
      !structuredData.summary ||
      !allowedCategories.includes(structuredData.category) ||
      !allowedSeverities.includes(structuredData.severity) ||
      !structuredData.key_issue
    ) {
      console.log("[AI] Groq fallback triggered (Invalid Schema)");
      return fallback;
    }

    console.log("[AI] Groq AI used for structuring");
    return structuredData;

  } catch (error) {
    console.error("[AI] Groq fallback triggered (Error):", error.message);
    return fallback;
  }
}

module.exports = {
  structureComplaintData
};
