# TheraQuest — Devpost Hackathon Submission
## DeveloperWeek NY 2026 | AI/ML Category

---

## 🌿 Project Description

**TheraQuest** transforms traditional therapy and rehabilitation into an immersive, gamified experience that makes mental wellness *feel like an adventure*. When life gets overwhelming, we don't hand you a checklist — we give you a **Quest**.

Powered by three autonomous AI agents orchestrated through a proprietary **Amaterasu Data Pipeline**, TheraQuest conducts real-time emotional analysis, generates personalized Cognitive Behavioral Therapy (CBT) exercises disguised as interactive game mechanics, and validates every response through a medical safety guardrail system — all in under 2 seconds.

TheraQuest isn't just an app. It's a mental health operating system built for the next generation of therapeutic care.

---

## 🧠 The Problem

**1 in 5 adults** experience mental illness each year. Yet:
- **57% never receive treatment** due to cost, stigma, or lack of access.
- The average wait for a therapist is **25 days**.
- Standard CBT homework completion rates are **below 50%** — patients simply disengage.

The mental health system is broken. The solution isn't more therapy apps. It's a **fundamentally different experience**.

---

## ⚔️ The Solution: TheraQuest

TheraQuest solves the engagement problem by making therapy *intrinsically motivating*:

| Traditional Therapy | TheraQuest |
|---------------------|------------|
| Fill out a worksheet | Complete a Quest |
| Weekly appointment | Always-available AI Agent |
| Static homework | Dynamic, personalized challenges |
| No progress tracking | XP, Levels, Badges, Streaks |
| One-size-fits-all | Adapts in real-time to your emotional state |

---

## 🏗️ Tech Stack

### Core Infrastructure
- **Google Antigravity** — Agentic AI core for orchestrating the Multi-Agent System (MAS)
- **Amaterasu Data Pipeline** — Custom FastAPI event-driven pipeline for real-time agent coordination with sub-2-second latency
- **Supabase** — PostgreSQL database with Row Level Security for encrypted session storage, quest progression logs, and vector embedding support
- **Tower** *(Sponsor Integration)* — Serverless data-to-AI pipeline extracting Supabase analytics into a lakehouse format for global clinical reporting.
- **Nimbleway** *(Sponsor Integration)* — Live Web API integration powering "Agent 4: Live Resource Agent" to scrape real-time mental health news and local resources.

### AI & Intelligence
- **Groq API** — Ultra-fast LLM inference (Llama 3.3 70B Versatile) for all three agents
- **Pydantic V2** — Strict JSON schema enforcement for inter-agent communication
- **Structured JSON Mode** — Guarantees validated, parseable agent outputs

### Frontend
- **React 18 + TypeScript + Vite** — Blazing-fast, type-safe UI
- **Framer Motion** — Cinematic animations and micro-interactions
- **Recharts** — Real-time biometric data visualization
- **React Router DOM** — Multi-page navigation architecture

### Architecture
```
[User] → [React Frontend (Vite)]
           → POST /api/interact/stream (SSE)
             → [Amaterasu FastAPI Pipeline]
               → [Agent 4: Nimble Live Web] (Scrapes live context if needed)
               → [Agent 1: Therapist] (Groq Llama 3.3)
               → [Agent 2: Quest Generator] (Groq Llama 3.3)
               → [Agent 3: Supervisor] (Groq Llama 3.3 + Safety Guardrails)
               → [Supabase PostgreSQL] (Persist & Log)
             ← Server-Sent Events (Real-time streaming updates)
           ← Live Dashboard Update

[Tower Offline Pipeline] 
  → Extracts Supabase Data → Lakehouse Transformation → AI Insights Report
```

---

## 🚀 What Makes It Unique & Sponsor Integrations

1. **Nimble Challenge Integration (Agent 4: Live Web):** While most therapy apps are closed ecosystems, TheraQuest employs a 4th "Live Resource Agent" that uses Nimble API to scrape the live web. If a user asks "Are there any CBT clinics near me?" or "What's the latest research on ADHD?", the agent fetches real-time links and context from the web before the Therapist Agent replies.

2. **Tower Challenge Integration (Data-to-AI):** We built an offline serverless pipeline that extracts transactional data (anxiety scores, engagement rates) from Supabase, transforms it into an analytical lakehouse format, and launches an AI Agent to interpret the trends and generate a "Global Clinical Insights Report".

3. **True Multi-Agent System (MAS)**: Three fully autonomous AI agents — Therapist, Quest Generator, and Supervisor — each with distinct roles, communicating through structured Pydantic schemas. Not a chatbot. An agentic pipeline.

4. **Real-time Safety Guardrails**: The Supervisor Agent validates EVERY response before it reaches the user, blocking medically harmful advice, AI hallucinations, or distress escalation triggers automatically.

5. **Gamified CBT**: The first platform to transform evidence-based CBT techniques into gamified "Quests" with XP rewards, level progression, achievement badges, daily streaks, and interactive quest players with confetti celebrations.

6. **Server-Sent Events (SSE) Streaming**: Users watch the AI agents work in real-time — seeing "Agent 4 is searching Nimble..." → "Agent 1 is analyzing..." → "Agent 2 is gamifying..." — making the technology *tangible* and *transparent*.

---

## 🎮 Feature Set

| Section | Features |
|---------|----------|
| 📊 Dashboard | KPI cards, Area charts, Pomodoro Timer, Mood Tracker, Agent Status |
| 💬 AI Therapist | Real-time MAS pipeline, Voice Input/Output (Web Speech API), Interactive Quests |
| 🧘 Exercises | Animated 4-7-8 Breathing, 5-Column Thought Record, Gratitude Journal |
| 📋 Recovery Planner | 7-Day AI Recovery Plan, Export to Markdown |
| 🧪 Wellness Quizzes | Dynamic CBT Knowledge Tests, XP Scoring |
| 🎯 Goal Coach | SMART Goal Roadmaps, Timeline selector, Export |
| 🏅 Achievements | 11 unlockable badges, XP milestones, Level progression |
| 🌐 Navigation | `Cmd+K` Global Command Palette for seamless access |
| 📉 Tower Insights | Dedicated Lakehouse Analytics Dashboard with Recharts |

---

## 📸 Demo Instructions

1. Clone the repository
2. Run `pip install -r requirements.txt` in the root
3. Copy `.env.example` to `.env` and add your Groq API key
4. Start backend: `python projects/theraquest_v2/run.py`
5. Start frontend: `cd projects/theraquest_v2/frontend && npm install && npm run dev`
6. Open `http://localhost:5173`
7. Navigate to **AI Therapist** and type: *"I've been feeling really anxious about work lately"*
8. Watch the **Amaterasu Pipeline** process your message in real-time
9. Complete the generated Quest to earn XP!

---

## 🗺️ Future Roadmap

- **Wearable Integration** — Real-time biometric data from Apple Watch / Fitbit
- **Therapist Dashboard** — Professional monitoring portal for licensed clinicians
- **Multiplayer Wellness** — Join wellness guilds and complete quests with friends
- **Offline Mode** — PWA with cached AI responses for offline CBT exercises
- **HIPAA Compliance** — End-to-end encryption and compliance certification for clinical deployment

---

*Built with ❤️ and the Google Antigravity Agentic AI platform.*
