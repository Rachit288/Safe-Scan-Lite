# Safe-Scan-Lite: QR Code Security Scanner

**Hackathon Project** - Cybersecurity & Privacy Domain

## 🎯 Problem Statement
QR codes pose a security risk known as "Quishing" (QR Phishing), where malicious codes redirect users to unsafe sites. Non-technical users often cannot distinguish between safe and malicious QR codes.

## 💡 Solution
A user-friendly security tool that scans QR codes, analyzes embedded URLs, and explains potential risks in simple terms.

---

## ✨ Features

### 1. QR Code Scanning
- Web camera integration using `html5-qrcode`
- Real-time QR code detection and decoding
- Supports standard QR codes with URLs

### 2. Attack Vector Detection (6 Types)

| Attack Vector | Description | Risk Points |
|---------------|-------------|-------------|
| **UNENCRYPTED_CONNECTION** | HTTP instead of HTTPS | +2 |
| **IP_ADDRESS_HOSTING** | Raw IP address instead of domain | +3 |
| **SUSPICIOUS_TLD** | Risky extensions (.xyz, .top, .club, etc.) | +2 |
| **TYPOSQUATTING** | Mimics popular brands (g00gle.com, micros0ft.com) | +3 |
| **SUSPICIOUS_KEYWORDS** | Contains words like login, verify, secure | +1 |
| **URL_OBFUSCATION** | Unusually long URLs (>75 chars) | +1 |

### 3. Risk Scoring System
- **SAFE** (0-3 points): ✅ No obvious threats
- **CAUTION** (4-6 points): ⚠️ Potentially suspicious  
- **HIGH_RISK** (7+ points): 🚨 Likely malicious

### 4. User-Friendly Explanations
- Plain language (no technical jargon)
- Emoji-enhanced messages for clarity
- Specific reasons why a URL is flagged

---

## 🛠️ Tech Stack

**Frontend:**
- React + TypeScript
- Vite (build tool)
- html5-qrcode (QR scanning)
- Axios (API calls)

**Backend:**
- FastAPI (Python)
- Heuristic-based analysis (no ML required)
- RESTful API

---

## 🚀 Setup & Run

### Prerequisites
- Node.js (v16+)
- Python 3.9+

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 📡 API Documentation

### POST `/scan`

**Request:**
```json
{
  "url": "http://g00gle.com"
}
```

**Response:**
```json
{
  "original_url": "http://g00gle.com",
  "final_url": "http://g00gle.com",
  "risk_level": "HIGH_RISK",
  "risk_score": 8,
  "attack_vectors": [
    "UNENCRYPTED_CONNECTION",
    "SUSPICIOUS_TLD",
    "TYPOSQUATTING"
  ],
  "messages": [
    "⚠️ Connection is not secure (HTTP). Attackers can intercept your data.",
    "⚠️ Domain uses '.com' extension, frequently used for scams.",
    "🚨 Domain mimics 'Google' - likely a phishing attempt!"
  ]
}
```

### Interactive API Docs
Visit `http://localhost:8000/docs` for Swagger UI

---

## 🧪 Demo Test Cases

Use these URLs to demonstrate the scanner:

| Test Case | URL | Expected Result |
|-----------|-----|----------------|
| Safe | `https://google.com` | SAFE - No threats |
| Typosquatting | `http://g00gle.com` | HIGH_RISK - Mimics Google |
| Suspicious TLD | `http://example.xyz` | CAUTION - Risky extension |
| Keywords | `https://secure-login-verify.com/account` | CAUTION - Suspicious words |
| IP Address | `http://192.168.1.1` | HIGH_RISK - IP hosting |

---

## 📂 Project Structure

```
Safe-Scan-Lite/
├── frontend/               # React application
│   ├── src/
│   │   ├── App.tsx        # Main QR scanner UI
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # FastAPI backend
│   ├── main.py           # API + attack detection logic
│   ├── requirements.txt  # Python dependencies
│   └── test_backend.py   # Test script
│
└── README.md
```

---

## 🎬 How It Works

1. **User scans QR code** using phone camera or uploads image
2. **Frontend extracts URL** from QR code using html5-qrcode
3. **Backend analyzes URL** with 6 attack vector checks
4. **Risk score calculated** based on detected threats
5. **Results displayed** with clear explanations and color coding

---

## 🔒 Attack Vector Determination

### 1. Unencrypted Connection
- **Detection:** Check if URL uses HTTP instead of HTTPS
- **Risk:** Data can be intercepted in transit
- **Example:** `http://example.com`

### 2. IP Address Hosting
- **Detection:** Regex match for IPv4 address pattern
- **Risk:** Temporary phishing sites often use IPs
- **Example:** `http://192.168.1.1`

### 3. Suspicious TLDs
- **Detection:** Domain ends with high-risk extensions
- **Risk:** These TLDs are cheap and popular for scams
- **Example:** `.xyz`, `.top`, `.club`, `.zip`

### 4. Typosquatting
- **Detection:** Character substitution matching (0→o, 1→i, etc.)
- **Risk:** Users might not notice the typo
- **Example:** `g00gle.com`, `micros0ft.com`, `paypa1.com`

### 5. Suspicious Keywords
- **Detection:** URL contains phishing-related words
- **Risk:** Legitimate sites rarely use these in URLs
- **Example:** `login`, `verify`, `secure`, `suspended`

### 6. URL Obfuscation
- **Detection:** URL length > 75 characters
- **Risk:** Hides malicious content in parameters
- **Example:** Very long URLs with encoded parameters

---

## 🏆 Hackathon Deliverables

- ✅ **Functional web tool** - QR scanner with risk analysis
- ✅ **Risk detection logic** - Heuristic-based with 6 attack vectors
- ✅ **Attack vector determination** - Clearly identified and explained
- ✅ **Source code repository** - GitHub with documentation
- ✅ **Demo ready** - Test cases and working prototype

---

## 🚀 Future Enhancements

- [ ] Google Safe Browsing API integration
- [ ] Machine learning model for improved accuracy
- [ ] WiFi QR code security checks
- [ ] Browser extension version
- [ ] Mobile app (React Native)

---

## 📄 License

MIT License - Free to use for hackathons and educational purposes

---

## 👥 Team

Created for Cybersecurity & Privacy Hackathon Domain

---

## 🙏 Acknowledgments

- Research based on latest quishing attack studies (2024-2025)
- Inspired by real-world security needs
- Built with modern web technologies
