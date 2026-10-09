# Smart Campus Agent 🎓

> **Voice-first AI campus agent for Sapthagiri NPS University (SNPU), Bengaluru.**
> Find faculty live on campus via Wi-Fi radar, check attendance against VTU thresholds, look up university buses, download study notes, and schedule smart reminders in **6 languages** (English, Kannada, Hindi, Telugu, Tamil, Malayalam). Built with **Google Gemini** and **Next.js**.

---

## 🌟 Demo Architecture & Data Storage Notice

> **Demo OTP is simulated and data is stored on the device for the demo. Production uses an SMS provider for OTP and a cloud database (e.g. Firestore) so accounts sync across devices.**

- **College Database**: All university records (students, faculty, rooms, Wi-Fi access points, events, holidays, notes, attendance, bus routes) are stored in clean, versioned JSON seed files in `/src/data`.
- **Zero Firebase / 100% Free Stack**: No paid Firebase services or billing locks are required.
- **Account State**: User accounts, language preferences, UI settings, and personal reminders are persisted in `localStorage` keyed by verified mobile number (`+91`), wrapped in safe error handling and memory fallbacks.
- **Role Enforcement**: User roles (**Student**, **Faculty**, **Parent**, or **Guest**) are determined strictly from college records in the seed dataset and are never self-selected.

---

## 🚀 Key Features

### 1. 🎙️ Voice-First Multilingual AI Campus Assistant
- Real-time voice interaction via Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).
- Supports **6 Indian languages**:
  - **English** (`en-IN`)
  - **Kannada (ಕನ್ನಡ)** (`kn-IN`)
  - **Hindi (हिन्दी)** (`hi-IN`)
  - **Telugu (తెలుగు)** (`te-IN`)
  - **Tamil (தமிழ்)** (`ta-IN`)
  - **Malayalam (മലയാളം)** (`ml-IN`)
- Powered by **Google Gemini 1.5 Flash** serverless API (`/api/chat`) with intelligent local fallback matching campus data.

### 2. 📡 Live Campus Faculty Radar & Location Simulator
- Real-time faculty locator simulating Wi-Fi Access Point (AP) pings and indoor triangulation across campus blocks:
  - **Aryabhata Block** (CSE, ISE)
  - **Visvesvaraya Block** (AIML)
  - **Ramanujan Block** (ECE)
  - **Central Library & Admin Block**
- Real-time status badges: `In Cabin`, `In Class`, `In Meeting`, `In Research Lab`.
- In-app event emitter (`CampusEventEmitter`) enabling interactive simulated movement and instant status overrides.

### 3. 🔐 "Demo OTP" Quick Login
- Enter any +91 mobile number (10-digit Indian phone validation).
- Tapping **Send OTP** generates a 6-digit code presented in a highlighted **Demo OTP** box with single-click auto-fill.
- Resend countdown timer (30s) and wrong-code error validation.
- **One-Click Seed Personas**:
  - 🎓 **Rahul Sharma** (Student - CSE 6th Sem, `+91 98451 23456`)
  - 👩‍🏫 **Dr. Geetha R.** (Faculty - HOD CSE, `+91 98860 12345`)
  - 👨‍👩‍👦 **Ramesh Kumar** (Parent of Rahul, `+91 94481 98765`)
  - 🏢 **Prof. Priya Sundaram** (Faculty - Dean Student Affairs, `+91 97412 34567`)
  - 👤 **Campus Visitor** (Guest, `+91 91234 56789`)

### 4. 📊 Role-Based Personalized Portals
- **Student Portal**: Enrolled courses, faculty mentor contact, bus route number, and attendance warning alerts.
- **Faculty Portal**: Today's teaching schedule, permanent cabin location, and office hours.
- **Parent Portal**: Ward academic standing, CGPA, faculty mentor helpline, and bus tracker.
- **Guest Portal**: Campus navigation, admission details, and facilities guide.

### 5. 🚌 Campus Data Hub
- **Events & Fests**: Flagship `SAPHACK 2026` 36-hr hackathon (₹1.5 Lakhs prizes), Robotics Workshop, `Sankalpa 2026` fest.
- **University Buses**: 4 city routes (Peenya, Yelahanka, Majestic/Malleshwaram, Rajajinagar) with morning stops and 04:45 PM Gate 1 departures.
- **Study Notes**: Course notes for Machine Learning, Next.js Full Stack, and Agile Scrum.
- **Attendance Monitor**: Course-wise percentage calculation with 75% VTU threshold warnings.
- **Karnataka Holidays**: Academic calendar holiday tracking.

### 6. ⏰ Smart Personal Reminders
- Schedule personal reminders via voice commands or the agenda panel.
- Persisted locally per phone number with in-app toast alerts.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Serverless Functions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (`@google/generative-ai`) via `/api/chat`
- **Voice**: Web Speech Recognition & Web Speech Synthesis API
- **Icons**: Lucide React
- **Hosting**: Vercel

---

## 📁 Project Structure

```
smart-campus-agent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # Gemini serverless chat endpoint
│   │   │   ├── otp/route.ts       # Demo OTP generation & verification
│   │   │   └── twilio/route.ts    # Production Twilio SMS/Voice endpoint
│   │   ├── globals.css            # Styles & radar animations
│   │   ├── layout.tsx             # Root layout & metadata
│   │   └── page.tsx               # Main campus dashboard
│   ├── components/
│   │   ├── Header.tsx             # Navbar & language switcher
│   │   ├── LoginModal.tsx         # Demo OTP login dialog
│   │   ├── VoiceAssistant.tsx     # Voice AI interface with audio waveforms
│   │   ├── FacultyRadar.tsx       # Live faculty locator & simulator
│   │   ├── RoleDashboard.tsx      # Role-specific portal views
│   │   ├── CampusHub.tsx          # Events, Buses, Notes, Attendance tabs
│   │   └── RemindersPanel.tsx     # Agenda & reminder manager
│   ├── data/                      # College Seed Database (Free JSON)
│   │   ├── students.json
│   │   ├── faculty.json
│   │   ├── rooms.json
│   │   ├── wifi_access_points.json
│   │   ├── events.json
│   │   ├── holidays.json
│   │   ├── notes.json
│   │   ├── attendance.json
│   │   └── buses.json
│   ├── lib/
│   │   ├── events.ts              # In-app event bus & location simulator
│   │   ├── gemini.ts              # Gemini prompt & smart local fallback
│   │   ├── localStorageUtil.ts    # Phone-keyed localStorage store
│   │   └── translations.ts        # 6-language dictionary
│   └── types/
│       └── index.ts               # Core TypeScript models
├── vercel.json
├── package.json
└── README.md
```

---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/mayankbaid030-sys/smart-campus-agent.git
cd smart-campus-agent
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables (optional)
Create a `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no Gemini API key is provided, the application runs on the built-in campus rule-based engine).*

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🚢 Deploying on Vercel

1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Under **Environment Variables**, add `GEMINI_API_KEY` (and optional Twilio keys).
4. Click **Deploy**.

---

## 📜 License
MIT License. Sapthagiri NPS University Campus Agent.
