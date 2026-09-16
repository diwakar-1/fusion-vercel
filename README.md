# ⚡ FUSION — Private Co-Study & High-Performance Learning Ecosystem

> A real-time full-stack web + Android application built exclusively for **Diwakar** and **Ayush** — a private productivity powerhouse for mastering DSA, Machine Learning, and Computer Science.

---

## 🌐 Live Website

**[https://fusion-vercel.vercel.app](https://fusion-vercel.vercel.app)**

---

## 📱 Android App

A fully native Android APK (`FUSION.apk`) built with **Capacitor** — syncs with the web in real-time.

- Download: `FUSION.apk` (in repo root)
- Package: `com.fusion.studyapp`
- Features: Native push notifications, real-time cloud sync, local storage persistence

---

## ✨ Features

### 🎯 Dashboard Overview
- Real-time XP, streak count, study hours, and problems solved stat cards
- Collapsible streak detail panel (compact by default)
- Core task checklist with confetti celebration on completion
- FUSE AI assistant for instant AI help
- Live Focus Timer (Pomodoro-style) with session logging
- AI-generated timetable schedule viewer

### 📚 Study Tracker
- Deep work focus timer (25/50/90 min blocks)
- Pomodoro mode with short/long break cycles
- Automatic XP award on session completion

### 🧠 DSA Engine
- Personal DSA problem tracker (LeetCode, Codeforces, HackerRank)
- Spaced repetition revision scheduler
- Add problems manually or via AI screenshot parsing

### 🤖 AIML Hub
- Phase-by-phase Machine Learning roadmap
- Links to Andrej Karpathy video lectures

### 🎬 Course Playlists
- Add YouTube playlists with real YouTube Data API v3 integration
- Mark lectures as watched, track progress
- Real-time sync between Android and Web

### 📝 Notes & Knowledge Base
- Personal study notes with markdown support
- AI-generated coding sheets by topic

### 📅 College Timetable
- Weekly timetable management
- Upload timetable photo — AI extracts schedule automatically

### 👥 Partner Room (Diwakar & Ayush Co-Study)
- Real-time partner focus state and XP display
- Partner chat (live messaging)
- Nudge/coffee/cheer reactions

### 📊 Analytics Heatmap
- GitHub-style contribution heatmap showing study activity

### 🔔 Notifications (Android)
- Native push notifications every 30 minutes for streak protection

---

## 🔄 Real-Time Sync Architecture

Web ←──── Cloud Sync API (Vercel Serverless) ────→ Android App

Every 1 second bi-directional sync covers:
- Profile (XP, streak, study minutes, level)
- Daily tasks and completion status
- DSA problems and revision status
- Course playlists (added on Android appear on Web instantly)
- API keys (Gemini & YouTube keys set on Android work on Web)
- Timetable schedule

---

## 🔐 Authentication

| User | Password | Notes |
|------|----------|-------|
| Diwakar | ML1718 | Fixed permanent password |
| Ayush | (self-set) | Creates own password on first login |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Vanilla CSS (glassmorphism, animations) |
| Mobile | Capacitor (native Android APK) |
| Backend | Node.js + Express |
| Cloud Sync | Vercel Serverless Functions |
| AI | Google Gemini API |
| Video | YouTube Data API v3 |
| Deployment | Vercel |

---

## 📁 Project Structure

```
FUSION WEB/
├── src/
│   ├── components/features/   # DashboardOverview, DsaTracker, etc.
│   ├── context/StudentOsContext.tsx  # Global state management
│   ├── services/cloudSync.ts  # Real-time cloud sync engine
│   └── styles/                # CSS tokens and global styles
├── api/sync.js                # Vercel serverless sync endpoint
├── android/                   # Capacitor Android project
├── public/icons/              # GIF animations and logos
├── FUSION.apk                 # Latest compiled Android APK
└── server.js                  # Node.js backend
```

---

## 🚀 Getting Started

```bash
npm install
npm run dev          # Start dev server at localhost:5173
npm run build        # Build for production
npx cap sync android # Sync to Android (then build in Android Studio)
```

---

*Built with love for Diwakar & Ayush on their journey to master DSA & Machine Learning*
