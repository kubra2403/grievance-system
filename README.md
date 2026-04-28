# Trust-Mediated Grievance Platform (Backend)

A production-ready, modular backend for a community-driven grievance reporting system. Built for speed, transparency, and trust, it enables vulnerable communities to report issues that are automatically structured by AI and verified by the community.

## 🚀 Key Features

- **AI-Powered Structuring**: Uses **Groq Llama 3.3** to automatically categorize, summarize, and assess the severity of raw complaint text.
- **Community Validation**: A double-blind voting system that calculates a real-time `trust_score` for every complaint.
- **Cryptographic Audit Logging**: Every action (submission, validation, status change) is recorded in a tamper-evident hash chain, ensuring absolute transparency.
- **Status Workflow**: A rigid state machine (`SUBMITTED` → `VERIFIED` → `IN_PROGRESS` → `RESOLVED`) to track the lifecycle of every grievance.
- **Public Tracking APIs**: Endpoints to track complaint history and verify the integrity of the audit logs.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Cloud**: Firebase Cloud Functions & Firestore
- **AI**: Groq Cloud API (Llama 3.3 70B)
- **Security**: SHA-256 Hashing for Audit Logs

## 📂 Project Structure

```text
backend/
├── functions/
│   ├── src/
│   │   ├── controllers/    # Request handling & JSON responses
│   │   ├── services/       # Core business logic & AI integration
│   │   ├── routes/         # API endpoint definitions
│   │   └── utils/          # Firebase & Hashing helpers
│   ├── app.js              # Express app configuration
│   └── index.js            # Firebase Function entry point
├── firebase.json           # Firebase Emulator config
└── .firebaserc             # Firebase Project linking
```

## 🛠️ Local Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/kubra2403/grievance-system.git
   cd grievance-system/backend/functions
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in `backend/functions/` with:
   ```env
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run with Firebase Emulator**:
   ```bash
   npm run serve
   ```

## 🧪 Testing

The backend includes a comprehensive validation suite. Run it to verify the entire flow:
```bash
node validation_suite.js
```

---
**Developed for the Trust-Mediated Grievance System Hackathon.**
