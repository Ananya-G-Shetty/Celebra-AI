# Celebra AI — "Every celebration deserves a perfect plan."

> **Celebra AI** is a production-quality, GenAI-powered celebration and event planning platform designed for Indian weddings, birthdays, community utsavs, and family milestones. It unites Google Gemini 1.5 structured JSON intelligence with deterministic financial arithmetic, cultural nuances, adaptive countdown milestones, vendor organization, and rapid emergency contingency workflows.

---

## 🌟 Executive Summary & Problem Statement

Event planning in India—whether an auspicious South Indian wedding Muhurtham, a child's milestone birthday, or a vibrant community Diwali festival—is notoriously stressful. Planners juggle scattered spreadsheets, unvetted vendors, unexpected monsoon rain, shifting guest counts, and budget overruns.

Most existing "AI event tools" are generic Western chatbots that output unstructured text paragraphs with hallucinated math and zero follow-through.

**Celebra AI solves this through 4 core architectural pillars**:
1. **Genuine Structured GenAI**: Uses Google Gemini to generate 7-dimensional structured JSON event plans, not unstructured essays.
2. **Deterministic Financial Math**: 100% pure TypeScript handles all arithmetic in **Indian Rupees (INR - ₹)**. Gemini never guesses financial addition; it provides optimization strategy while code guarantees exact balances.
3. **Deep Cultural Intelligence**: Native understanding of Indian celebration customs (e.g., Banana-leaf Sadhya, Sangeet/Mehendi timelines, Sattvic dietary separation, Channapatna return gifts, auspicious Muhurtham schedules).
4. **Proactive Emergency Contingency Planner**: Our flagship differentiator simulates real disruptions (vendor cancellation, sudden monsoon rain, 60+ unexpected guests, budget cuts) and generates actionable triage checklists with user confirmation.

---

## 🚀 Key Modules & Capabilities

| Module | Purpose & Implementation |
| :--- | :--- |
| **4-Step Onboarding Wizard** | Step 1 (Basics & Category), Step 2 (Budget in INR & Flexibility), Step 3 (Cultural Preferences & Setting), Step 4 (Review & Gemini Generation with festive confetti). |
| **Main Event Dashboard** | Master celebration overview, 7 AI sections (Concept, Decor & Florals, Catering, Entertainment, Logistics, Expense Distribution, Cultural Recommendations). |
| **Smart Budget Manager** | Recharts Donut & Bar charts, 9 Indian expense categories, payment tracking, and **AI Budget Optimizer** ("Save ₹30,000 without compromising catering"). |
| **Countdown Timeline** | Milestones across 30, 15, 7, 3, 1 day, and Event Day. Status toggles, priority filters, and adaptive scheduling. |
| **Vendor Organizer** | Quotation comparison, contact directory, advance payment tracking, and **AI Vetting Guide** uncovering hidden GST and overtime fees. |
| **Emergency Planner** | Scenario simulator for vendor dropouts, rain, guest spikes, and budget drops. Calculates severity, budget impact, and triage tasks with user confirmation. |
| **Cultural Inspiration** | Curated regional ideas (temple mandaps, live Obbattu tawas, seed paper invites) with 1-click moodboard saving. |
| **Context-Grounded Copilot** | Conversational assistant that retains live event state (guests, budget, cuisine, location) and suggests relevant follow-up questions. |

---

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 14 (App Router), React 18, TypeScript (Strict).
- **Styling & UI**: Tailwind CSS, warm ivory (`#FAF7F2`), deep plum (`#4A154B`), burgundy (`#722F37`), soft coral (`#FF6F61`), and warm gold (`#D4AF37`).
- **Icons**: Lucide React.
- **Charts & Visualizations**: Recharts (Pie & Bar charts).
- **Celebration Effects**: Canvas Confetti.
- **Generative AI Engine**: Google Gemini API via official `@google/generative-ai` SDK (`gemini-1.5-flash`), with dual-mode Local Cultural Intelligence fallback.
- **Data Persistence**: Server-backed JSON store in `data/events.json` with RESTful Next.js Route Handlers.
- **Primary Currency**: INR (₹) with Indian number formatting (Lakhs and Crores).

---

## 📂 Project Directory Structure

```
Challenge 5/
├── app/
│   ├── api/
│   │   ├── assistant/route.ts       # Context-grounded AI copilot
│   │   ├── budget/optimize/route.ts # AI budget trade-off calculator
│   │   ├── emergency/route.ts       # Emergency contingency analyzer
│   │   ├── events/route.ts          # Event CRUD & seed reset
│   │   ├── events/[id]/route.ts     # Single event management
│   │   ├── expenses/route.ts        # Expense tracker CRUD
│   │   ├── generate-plan/route.ts   # Structured Gemini event plan generator
│   │   ├── inspiration/route.ts     # Saved inspiration moodboard
│   │   ├── tasks/route.ts           # Countdown tasks & toggle status
│   │   └── vendors/route.ts         # Vendor quotes & AI vetting questions
│   ├── dashboard/
│   │   ├── page.tsx                 # Master celebration dashboard
│   │   ├── assistant/page.tsx       # Conversational AI copilot
│   │   ├── budget/page.tsx          # Interactive budget & Recharts
│   │   ├── emergency/page.tsx       # Emergency contingency simulator
│   │   ├── inspiration/page.tsx     # Cultural celebration gallery
│   │   ├── timeline/page.tsx        # Milestone countdown checklists
│   │   └── vendors/page.tsx         # Supplier directory & vetting guide
│   ├── plan/
│   │   └── page.tsx                 # 4-step onboarding wizard
│   ├── globals.css                  # Custom design tokens & ivory theme
│   ├── layout.tsx                   # EventContext, Navbar & Footer
│   └── page.tsx                     # Landing page & celebration showcase
├── components/
│   ├── ApiKeyModal.tsx              # In-browser Gemini engine configuration
│   ├── EventContext.tsx             # Universal event state provider
│   ├── Footer.tsx                   # Brand footer & challenge badge
│   └── Navbar.tsx                   # Event switcher dropdown & navigation
├── data/
│   ├── default-events.json          # Seed celebrations (Wedding, Birthday, Utsav)
│   └── events.json                  # Runtime persistence store
├── docs/
│   ├── ARCHITECTURE.md              # System design & data flow
│   ├── AI_DOCUMENTATION.md          # Prompts, schemas & LLM bounds
│   ├── TESTING.md                   # Feature testing checklist
│   └── DEMO_SCRIPT.md               # 3-5 minute video evaluation script
├── lib/
│   ├── gemini.ts                    # Google GenAI SDK client & fallback
│   ├── prompts.ts                   # Centralized prompt templates
│   ├── storage.ts                   # Server-side persistence engine
│   └── utils.ts                     # Deterministic INR math & helpers
├── types/
│   └── index.ts                     # Strict TypeScript domain models
├── tailwind.config.ts               # Ivory, plum, burgundy palette
├── tsconfig.json
└── package.json
```

---

## 🏆 Evaluation Alignment

- **Genuine AI Integration**: Google Gemini generates structured JSON across 6 backend route handlers.
- **Deterministic Bounds**: Budget calculations and revised budget limits are strictly enforced in TypeScript pure functions.
- **Cultural Nuances**: Authentic regional traditions, Sattvic menus, temple decor, and auspicious timelines.
- **Flagship Emergency Planner**: Prepares users for real disruptions with instant contingency action items.
- **Zero-Failure Resilience**: Seamless fallback mode ensures judges can evaluate all modules even without API keys.

Designed & Built with ❤️ by **Ananya Shetty** for Google Build with AI PromptWars Challenge 5.
