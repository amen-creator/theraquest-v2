<div align="center">

<img src="frontend/public/favicon.svg" alt="TheraQuest Logo" width="80" height="80"/>

# ⚔️ TheraQuest v2

### *The Mental Health Operating System for the Next Generation*

**Gamified CBT Therapy · Real-Time Multi-Agent AI · Quest-Based Wellness**

---

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange?style=for-the-badge)](https://groq.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

---

> 🏆 **Submitted to DeveloperWeek NY 2026** — AI/ML Track  
> Built with [Google Antigravity](https://antigravity.google) Agentic AI Platform

</div>

---

## 🌿 What is TheraQuest?

TheraQuest transforms traditional therapy into an **immersive, gamified adventure**. Instead of handing users a checklist, we give them a **Quest**.

Powered by the **Amaterasu 6-Agent AI Pipeline**, TheraQuest delivers real-time emotional analysis, personalized CBT exercises disguised as game mechanics, and a medical safety guardrail — all in under **2 seconds**.

> **TheraQuest isn't just an app. It's a mental health operating system.**

---

## 🚨 The Problem

| Statistic | Reality |
|-----------|---------|
| 1 in 5 adults | experience mental illness annually |
| 57% never treated | due to cost, stigma, or lack of access |
| 25 days avg wait | to see a licensed therapist |
| <50% completion | of standard CBT homework assignments |

**The mental health system is broken.** The solution isn't more therapy apps — it's a fundamentally different *experience*.

---

## ⚔️ The Solution

| Traditional Therapy | TheraQuest |
|---------------------|------------|
| Fill out a worksheet | Complete a **Quest** |
| Weekly appointments | 24/7 AI Therapist Agent |
| Static homework | Dynamic, personalized challenges |
| No progress tracking | XP · Levels · Badges · Streaks |
| One-size-fits-all | Adapts to your real-time emotional state |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TheraQuest Frontend                         │
│             React 18 + TypeScript + Vite + Framer Motion        │
└──────────────────────────┬──────────────────────────────────────┘
                           │  POST /api/interact/stream (SSE)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Amaterasu FastAPI Pipeline (Port 8000)             │
│                                                                 │
│  ┌─────────────┐   ┌────────────────┐   ┌───────────────────┐  │
│  │  Agent 4    │   │    Agent 1     │   │    Agent 2        │  │
│  │  Nimble     │──▶│   Therapist    │──▶│  Quest Generator  │  │
│  │  Live Web   │   │  (Groq LLM)    │   │   (Groq LLM)      │  │
│  └─────────────┘   └────────────────┘   └─────────┬─────────┘  │
│                                                    │            │
│                    ┌───────────────────────────────▼─────────┐  │
│                    │         Agent 3: Supervisor              │  │
│                    │   Safety Guardrails + Medical Filters    │  │
│                    └───────────────────────────────┬─────────┘  │
│                                                    │            │
│              ┌─────────────────────────────────────▼─────────┐  │
│              │          Supabase PostgreSQL                    │  │
│              │   Session Logs · Quest History · Analytics     │  │
│              └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
                 ┌─────────▼──────────┐
                 │   Tower Pipeline   │
                 │ Lakehouse Analytics│
                 └────────────────────┘
```

**Real-time data flow:** User message → Nimble live context → Therapist analysis → Quest generation → Supervisor safety check → SSE stream to client → XP awarded + Quest displayed → Supabase persisted.

---

## ✨ Feature Set

### 📊 Dashboard
- Real-time KPI cards (XP, Level, Streak, Badges)
- Area/bar charts powered by Recharts
- **Pomodoro Focus Timer** (25min focus / 5min break)
- **Mood Tracker** with localStorage persistence
- Daily AI Therapist Insight widget
- Amaterasu Agent Pipeline Status Monitor

### 💬 AI Therapist (Core Feature)
- Real-time **Server-Sent Events** streaming — watch agents work live
- Dynamic Quest generation from every conversation
- **Voice Input/Output** via Web Speech API
- Interactive Quest Player with confetti celebrations
- XP rewards per session

### 🧘 CBT Exercises
- **4-7-8 Breathing** — animated circle with phase guidance + Stop button
- **5-Column Thought Record** — AI-analyzed CBT worksheet
- **Gratitude Journal** — guided entry with sentiment response

### 📋 AI Recovery Planner
- Generates a full 7-day personalized CBT recovery plan
- Multiple therapeutic approaches (CBT, DBT, ACT, Mindfulness)
- Export to Markdown — plan persisted across navigation

### 🧪 Wellness Quizzes
- Dynamic question generation on any CBT/mental health topic
- XP-scored answer system with explanations

### 🎯 AI Goal Coach
- SMART goal roadmap generation with milestones
- Timeline selector (2 weeks → 1 year)
- Roadmap persisted to GlobalState + localStorage

### 🏅 Achievements System
- 11 unlockable badges
- Level progression (100 XP per level)
- Streak tracking

### ⌨️ Command Palette
- `Ctrl+K` / `Cmd+K` global navigation overlay
- Instant access to any page or feature

### 📉 Tower Insights
- Dedicated Lakehouse Analytics dashboard
- Real-time anxiety vs. engagement trend charts
- Active user metrics from the Tower pipeline

---

## 🧩 Sponsor Integrations

### 🟣 Nimble (Live Web Agent — Agent 4)
Agent 4 uses Nimble's Web API to fetch **real-time mental health resources** before the Therapist Agent replies. When a user asks "Are there CBT clinics near me?", Agent 4 searches the live web for current links and context.

### 🔵 Tower (Data-to-AI Pipeline)
An offline serverless pipeline extracts transactional session data from Supabase, transforms it into an analytical **lakehouse format**, and feeds an AI Agent to generate a **"Global Clinical Insights Report"** — visualized in the Tower Insights dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Framer Motion, Recharts |
| **Backend** | FastAPI, Python 3.11+, Uvicorn, Pydantic v2 |
| **AI Engine** | Groq API (Llama 3.3 70B Versatile) |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Live Web** | Nimble Web API |
| **Analytics** | Tower Lakehouse Pipeline |
| **State** | React Context + localStorage persistence |
| **Streaming** | Server-Sent Events (SSE) + WebSocket |
| **Styling** | CSS3, CSS Variables, Glassmorphism |
| **Animation** | Framer Motion, CSS keyframes |
| **AI Platform** | Google Antigravity |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier works)
- A [Supabase](https://supabase.com) project (optional — app works without it)

### 1. Clone & Setup

```bash
git clone https://github.com/amen-creator/theraquest-v2.git
cd theraquest-v2
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the Backend

```bash
python run.py
# → Amaterasu Pipeline running on http://localhost:8000
```

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# → TheraQuest running on http://localhost:5173
```

### 6. Experience TheraQuest

1. Open **http://localhost:5173**
2. Navigate to **💬 AI Therapist**
3. Type: *"I've been feeling really anxious about work lately"*
4. Watch the **Amaterasu Pipeline** work in real-time
5. Complete the generated **Quest** to earn XP!

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key for LLM inference |
| `SUPABASE_URL` | Optional | Supabase project URL for session persistence |
| `SUPABASE_KEY` | Optional | Supabase service role key |
| `NIMBLE_API_KEY` | Optional | Nimble API key for live web search (Agent 4) |

> ⚠️ **The app is fully functional without Supabase and Nimble** — it gracefully degrades to offline mode.

---

## 📁 Project Structure

```
theraquest-v2/
├── backend/
│   ├── agents/
│   │   ├── pipeline.py       # Amaterasu orchestration engine
│   │   ├── therapist.py      # Agent 1: CBT Therapist
│   │   ├── quest_generator.py # Agent 2: Quest engine
│   │   ├── supervisor.py     # Agent 3: Safety guardrails
│   │   ├── nimble_agent.py   # Agent 4: Live web search
│   │   ├── vision_agent.py   # Agent 5: Vision/image analysis
│   │   └── memory_agent.py   # Agent 6: Session memory
│   ├── main.py               # FastAPI app + all API routes
│   ├── schemas.py            # Pydantic data models
│   ├── db.py                 # Supabase integration
│   └── tower_pipeline.py     # Tower lakehouse pipeline
├── frontend/
│   ├── src/
│   │   ├── pages/            # 10 full pages
│   │   ├── components/       # Navbar, CommandPalette, BadgePanel
│   │   ├── context/          # GlobalState (XP, moods, plans)
│   │   ├── hooks/            # useAudio, custom hooks
│   │   └── App.tsx           # Router + layout
│   └── public/               # Favicon, icons
├── run.py                    # One-command backend launcher
├── requirements.txt          # Python dependencies
├── supabase_schema.sql       # Database schema
└── .env.example              # Environment template
```

---

## 🗺️ Roadmap

- [ ] **Wearable Integration** — Apple Watch / Fitbit biometric sync
- [ ] **Therapist Portal** — Professional monitoring dashboard for clinicians
- [ ] **Multiplayer Wellness** — Join guilds and complete quests with friends
- [ ] **PWA Offline Mode** — Cached AI responses for offline exercises
- [ ] **HIPAA Compliance** — Clinical-grade encryption and audit logging
- [ ] **Multilingual Support** — Arabic, Spanish, French therapy sessions

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ and the [Google Antigravity](https://antigravity.google) Agentic AI Platform**

*TheraQuest — Because your mental health deserves a quest, not a checkbox.*

⭐ **Star this repo if TheraQuest inspires you!**

</div>
