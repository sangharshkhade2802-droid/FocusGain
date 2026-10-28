# FocusGain Web — Enterprise Focus, Study-Enhancement & AI-Driven Learning Platform

FocusGain Web is a full-stack, enterprise-grade cognitive performance and study platform designed to combat modern attention fragmentation. It pairs a **Next.js 14 (App Router)** web application with a **Supabase PostgreSQL & Realtime** backend, a **Manifest V3 Chrome Extension**, and a **Google Gemini AI** cognitive diagnostic engine.

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Web Core** | Next.js 14+ (TypeScript, React 18, App Router, Server & Client Components) |
| **Styling & UI** | Tailwind CSS, Shadcn UI primitives, Lucide Icons, Framer Motion, Canvas-Confetti |
| **Database & Auth** | Supabase (PostgreSQL, Row-Level Security, Supabase Auth with Email/OAuth) |
| **Real-Time Layer** | Supabase Realtime (WebSockets channels & presence for multiplayer study rooms) |
| **AI Intelligence** | Google Gemini API (`@google/generative-ai`, strict JSON schema structured outputs) |
| **Browser Extension**| Manifest V3 (`declarativeNetRequest` study whitelist & DOM MutationObserver feed filter) |
| **Telemetry** | Recharts (Responsive bar charts, donut attention allocations, weekly velocity area charts) |
| **Audio Engine** | Procedural Web Audio API synthesizer (Rain, White Noise, Alpha 10Hz Binaural Beats, Lo-Fi) |

---

## 📁 Project Directory Structure

```
focusgain-web/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx             # Supabase Auth login & instant demo access
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Dashboard navigation, streak & extension status
│   │   ├── page.tsx                   # Main focus station dashboard index
│   │   ├── timer/page.tsx             # Pomodoro, Stopwatch, Strict Mode & Audio Mixer
│   │   ├── tasks/page.tsx             # AI Task scoring (1-10) & 20-MCQ quiz modal
│   │   ├── rooms/page.tsx             # Live Supabase Realtime multiplayer rooms
│   │   ├── analytics/page.tsx         # Recharts daily/weekly telemetry & category donut
│   │   └── planner/page.tsx           # Weekly interactive schedule grid planner
│   ├── api/
│   │   └── ai/
│   │       ├── score-tasks/route.ts   # Gemini cognitive value evaluation (1-10)
│   │       ├── generate-quiz/route.ts # Gemini automated 20-MCQ test generator
│   │       └── analyze-quiz/route.ts  # Diagnostic mapping of weak/strong areas & recommendations
│   ├── layout.tsx                     # Global HTML root layout & dark theme styling
│   ├── globals.css                    # Tailwind CSS, custom scrollbars, and neon glows
│   └── page.tsx                       # High-converting enterprise landing page
├── components/
│   ├── timer/
│   │   ├── TimerCard.tsx              # SVG circular progress ring timer & sound chime
│   │   └── AmbientAudio.tsx           # Multi-track Web Audio procedural sound synthesizer
│   ├── ai/
│   │   ├── TaskManager.tsx            # AI task submission, scoring filter, replacement handler
│   │   └── QuizRunner.tsx             # Multi-step 20-MCQ test runner & diagnostic report view
│   ├── rooms/
│   │   └── RoomGrid.tsx               # Realtime study rooms, presence list & quiet chat/reactions
│   └── ui/
│       ├── button.tsx                 # Shadcn-style button component
│       ├── card.tsx                   # Shadcn-style glassmorphic card component
│       └── badge.tsx                  # Shadcn-style status badge component
├── extension/
│   ├── manifest.json                  # Manifest V3 configuration with declarativeNetRequest
│   ├── background.js                  # DeclarativeNetRequest dynamic rules engine for whitelist
│   ├── content.js                     # Targeted DOM filter for Instagram, YouTube, Facebook, Snapchat
│   ├── blocked.html                   # Study Mode redirection & focus reinforcement page
│   ├── icons/                         # Extension icons (16, 48, 128px)
│   └── popup/
│       ├── popup.html                 # Extension toolbar status UI
│       ├── popup.css                  # Dark theme popup styling
│       └── popup.js                   # Whitelist management & toggle controller
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Supabase client with safe demo mode fallback
│   │   └── server.ts                  # Server-side Supabase SSR client
│   ├── gemini/
│   │   └── client.ts                  # Google Gemini SDK instance
│   └── utils.ts                       # Classnames merger (clsx, twMerge) & time formatting
├── supabase/
│   └── schema.sql                     # Full PostgreSQL schema, RLS policies, trigger & seed data
├── .env.example                       # Environment configuration guide
├── package.json
└── tsconfig.json
```

---

## 🚀 Quickstart Guide

### 1. Install & Build
```bash
# Navigate to the project root
cd focusgain-web

# Install dependencies
npm install

# Build production bundle
npm run build

# Start Next.js development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🗄️ Database Setup (Supabase SQL)

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy and run the entire SQL migration located at `supabase/schema.sql`.

The schema automatically sets up:
- `profiles` with auto-creation trigger on user signup (`handle_new_user`)
- `focus_sessions` (tracks completed Pomodoro, Stopwatch, or Scheduled sprints)
- `scheduled_blocks` (stores user calendar schedule blocks)
- `study_rooms` & `room_participants` (realtime co-working rooms with presence)
- `tasks` (scored 1-10 with cognitive status)
- `quizzes` (stores questions JSON, test score, weak/strong areas, and AI recommendations)
- Row-Level Security (RLS) policies on all tables
- Realtime publication activation:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.study_rooms;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
  ```

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your API keys:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
```

> **Zero-Crash Resilience**: If keys are not yet provided during evaluation, FocusGain operates seamlessly in **Resilient Demo Mode** — local data persistence, realistic procedural ambient sound, and high-quality heuristic AI evaluation fallbacks ensure 100% of the UI and workflows are testable out of the box!

---

## 🧩 Installing the Chrome Extension (`/extension`)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** (top right switch).
3. Click **Load unpacked**.
4. Select the `extension` folder inside this project directory (`focusgain-web/extension`).
5. Pin **FocusGain** to your toolbar.

### What the extension does:
1. **Targeted Feed Filter (`content.js`)**:
   - Injects instant CSS and DOM mutation observers on **YouTube**, **Instagram**, **Facebook**, and **Snapchat Web**.
   - Hides `#shorts-container`, `ytd-reel-shelf-renderer`, `a[href*="/shorts"]`, `a[href*="/reels/"]`, and algorithmic exploration feeds.
   - Automatically redirects direct short URLs to regular video players or direct messages (`/direct/inbox/`), preserving core communications and search.
2. **DeclarativeNetRequest Study Whitelist (`background.js`)**:
   - Uses Manifest V3 `chrome.declarativeNetRequest.updateDynamicRules` to enforce strict whitelist filtering during active study blocks.
   - Non-whitelisted domains are intercepted and routed to `blocked.html` to keep users locked in flow.

---

## 🧠 Module Overview & Capabilities

### Module A: Browser Extension Feed Shield (`/extension`)
- Non-invasive DOM cleansing for YouTube Shorts, Instagram Reels, Facebook Reels, Snapchat Spotlight.
- Dynamic DeclarativeNetRequest whitelist controller with custom domain management in the popup.

### Module B: Focus Station & Chrono Planning (`/app/(dashboard)/timer` & `/planner`)
- **Interactive SVG Progress Ring**: Visual countdown with smooth CSS transition arcs and finish chime.
- **Three Core Modes**: Pomodoro (25/5 customizable), Open Stopwatch with lap splits, and Strict Mode with tab-switch warnings.
- **Procedural Ambient Mixer**: Native Web Audio generation (Rain, White Noise, Alpha 10Hz Binaural Beats, Lo-Fi Chill Chords) with individual channel volume sliders.
- **Weekly Schedule Planner**: Interactive 7-day grid to pre-schedule focus blocks with instant "Start Sprint" shortcut.

### Module C: Realtime Multiplayer Rooms & Telemetry (`/app/(dashboard)/rooms` & `/analytics`)
- **Supabase Realtime Study Rooms**: Synchronized co-working rooms displaying peer status (`focusing`, `break`, `idle`) and focus streaks.
- **Silent Chat & Emoji Reactions**: Real-time websocket broadcasts (`👏`, `🔥`, `🚀`, `💡`, `☕`).
- **Recharts Analytics Dashboard**: Daily focus minutes vs target, attention allocation donut chart, and weekly velocity area charts.

### Module D: AI Learning & Task Evaluation (`/app/(dashboard)/tasks` & `/api/ai/...`)
- **Task Evaluation (`/api/ai/score-tasks`)**: Evaluates up to 10 tasks on a 1-10 cognitive scale using Gemini. Rejects low-value busywork (< 5) and offers actionable high-leverage replacements.
- **Automated 20-MCQ Diagnostic (`/api/ai/generate-quiz`)**: Instantly generates a 20-question multiple-choice retention exam when a task is completed.
- **Diagnostic Mapping (`/api/ai/analyze-quiz`)**: Pinpoints exact strong vs weak subtopics and curates technical documentation, academic papers, and video masterclasses.
