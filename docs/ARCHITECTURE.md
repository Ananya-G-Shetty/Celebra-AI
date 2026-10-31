# Celebra AI — System Architecture & Technical Design

## 1. High-Level Architecture

Celebra AI follows a clean, decoupled Next.js 14 App Router architecture that separates user interface rendering, deterministic business arithmetic, server-side persistence, and generative intelligence.

```mermaid
graph TD
    User([User Browser]) --> ClientApp[Next.js Client Components]
    ClientApp --> EventCtx[EventContext State Provider]
    ClientApp --> Recharts[Recharts Interactive Visualizations]
    ClientApp --> Confetti[Canvas Confetti Effects]
    
    ClientApp --> APIClient[HTTP Fetch API Requests]
    APIClient --> RouteHandlers[Next.js Server Route Handlers /app/api/*]
    
    RouteHandlers --> StorageEngine[Persistence Engine lib/storage.ts]
    RouteHandlers --> GeminiEngine[Gemini AI Engine lib/gemini.ts]
    
    StorageEngine --> DBFile[(Local JSON Database data/events.json)]
    StorageEngine --> SeedFile[(Seed Data data/default-events.json)]
    
    GeminiEngine --> OfficialSDK[@google/generative-ai SDK]
    OfficialSDK --> GoogleAPI[Google Gemini 1.5 Flash Cloud]
    GeminiEngine --> FallbackEngine[Local Cultural Intelligence Fallback]
```

---

## 2. Layered Component Architecture

### A. Presentation Layer (`/app` & `/components`)
- **App Router Pages**:
  - `/page.tsx`: Landing page, trust pillars, feature showcase, and preloaded sample cards.
  - `/plan/page.tsx`: 4-step wizard with category grids, INR budget sliders, cultural preference inputs, and animated generation feedback.
  - `/dashboard/page.tsx`: Master celebration overview with 7 AI sections (Concept, Decor, Catering, Entertainment, Logistics, Expense Distribution, Cultural Recommendations).
  - `/dashboard/budget/page.tsx`: Interactive budget manager with Recharts Donut & Bar charts and the AI Budget Optimizer modal.
  - `/dashboard/timeline/page.tsx`: Countdown timeline organized into 6 chronological milestone phases with priority and status filters.
  - `/dashboard/vendors/page.tsx`: Vendor directory, quotation comparisons, advance payment tracking, and AI vetting guides.
  - `/dashboard/emergency/page.tsx`: Flagship scenario simulator for vendor dropouts, monsoon rain, guest spikes, and budget cuts.
  - `/dashboard/assistant/page.tsx`: Context-grounded AI copilot with conversation history and suggested follow-up pills.
  - `/dashboard/inspiration/page.tsx`: Regional celebration ideas gallery with 1-click moodboard bookmarking.
- **Shared Components**:
  - `Navbar.tsx`: Responsive header with celebration switcher dropdown and Gemini status pill.
  - `Footer.tsx`: Brand identity, PromptWars Challenge 5 attribution, and INR disclaimer.
  - `ApiKeyModal.tsx`: In-browser Gemini API Key configuration modal.
  - `EventContext.tsx`: Universal React Context provider managing the active celebration ID, event list, and API key.

### B. Route Handler / Backend Layer (`/app/api`)
- `/api/events`: GET event list, POST create event, POST reset seed data.
- `/api/events/[id]`: GET single event, PUT update event, DELETE event with cascading deletes.
- `/api/generate-plan`: POST invokes Gemini to synthesize structured `AiEventPlan` and bootstrap initial budget items and tasks.
- `/api/budget/optimize`: POST runs AI budget trade-off analysis with deterministic savings bounds.
- `/api/emergency`: POST executes contingency triage analysis with optional task insertion.
- `/api/tasks`: GET, POST, PUT, DELETE for timeline preparation tasks.
- `/api/expenses`: GET, POST, PUT, DELETE for budget line items.
- `/api/vendors`: GET, POST, PUT, DELETE for suppliers, plus POST `action=vetting_guide`.
- `/api/inspiration`: GET, POST, DELETE for saved celebration ideas.
- `/api/assistant`: GET chat history, POST send message, DELETE clear conversation.

### C. Generative AI Engine (`/lib/gemini.ts` & `/lib/prompts.ts`)
- Configured with official `@google/generative-ai` SDK using `gemini-1.5-flash`.
- Uses `generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }`.
- Robust fallback engine ensures zero crashes if an API key is omitted or during quota limits.
- Returns transparent `engineStatus: { activeEngine, modelName, isFallback, details }`.

### D. Persistence Layer (`/lib/storage.ts` & `/data`)
- Server-side JSON persistence in `data/events.json`.
- Automatically initializes from `data/default-events.json` on first launch.
- Provides atomic read/write methods for events, expenses, tasks, vendors, inspirations, and chat history.

---

## 3. Separation of Concerns: Deterministic Code vs. GenAI

| Feature Domain | Generative AI (Gemini 1.5) | Deterministic Code (TypeScript) |
| :--- | :--- | :--- |
| **Budget & Spend** | Suggests strategic category trade-offs and savings rationale | Calculates exact sums, actuals, paid advances, remaining buffer, and utilization % |
| **Budget Optimizer** | Identifies non-essential areas to reduce while protecting priorities | Strictly enforces that revised budget does not exceed the target ceiling |
| **Timeline** | Suggests milestone task descriptions tailored to celebration theme | Computes exact days remaining, milestone phases, and deadline calendar dates |
| **Vendor Management** | Formulates critical vetting questions to uncover hidden taxes | Tracks quote differences, negotiated savings, and advance payment balances |
| **Emergency Planner** | Evaluates situational severity, operational blast radius, and alternatives | Handles task insertion into persistent storage upon explicit user confirmation |
| **Event Plan** | Synthesizes creative concepts, color palettes, and menu pairings | Validates JSON schema structure and bounds |

---

## 4. Security & Data Isolation
- **Server-Side API Key Storage**: The `GEMINI_API_KEY` is accessed solely inside server Route Handlers and never rendered in client bundles.
- **Client Key Option**: In-browser API key input via `ApiKeyModal` stores the key in browser `localStorage` and transmits it via POST request payload directly to backend handlers.
- **Input Sanitization**: All incoming request payloads are strictly typed, checked for positive numbers, and HTML-escaped.
