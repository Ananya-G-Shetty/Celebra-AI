# Celebra AI — Testing & Quality Assurance Verification

## 1. Feature Verification Matrix

| Feature | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Landing Page** | Navigate to `/` | Displays Hero, trust metrics, 4 categories, 6 feature cards, preloaded sample events, and working CTAs. | **PASSED** |
| **Event Wizard** | Step 1 (Basics) | Validates non-empty event name, date, location, and guest count > 0. | **PASSED** |
| **Event Wizard** | Step 2 (Budget) | Enforces positive budget in INR; formats in Indian number format (₹). | **PASSED** |
| **Event Wizard** | Step 3 (Preferences) | Accepts cultural traditions, cuisine choices, indoor/outdoor preferences. | **PASSED** |
| **Event Wizard** | Step 4 (AI Plan) | Calls `/api/generate-plan`, generates structured plan, triggers confetti, redirects to `/dashboard`. | **PASSED** |
| **Dashboard** | Metrics Banner | Correctly displays Total Budget, Spent, Remaining Buffer, and Days Left. | **PASSED** |
| **AI Plan Sections** | 7-Dimensional Plan | Renders Concept, Decor, Catering, Entertainment, Logistics, Expense Distribution, and Cultural Advice. | **PASSED** |
| **Budget Manager** | Recharts Visuals | Renders Donut Pie chart and Estimated vs. Actual Bar chart with INR tooltips. | **PASSED** |
| **Budget Manager** | CRUD Operations | Adds, edits, and deletes expense items with immediate summary updates. | **PASSED** |
| **AI Budget Optimizer** | Target Savings Bound | User specifies target savings; Gemini returns reallocations without exceeding the ceiling. | **PASSED** |
| **Timeline Generator** | 6 Milestones | Tasks organized across 30, 15, 7, 3, 1 day, and Event Day with status toggles. | **PASSED** |
| **Vendor Organizer** | Quotations & Quotes | Tracks quoted vs negotiated price, advance payments, and generates AI vetting questions. | **PASSED** |
| **Emergency Planner** | Scenario Simulation | Evaluates monsoon rain, decorator cancellation, guest spikes; generates triage checklist. | **PASSED** |
| **Emergency Confirmation** | User Guardrail | Action tasks are inserted into timeline only upon explicit user confirmation. | **PASSED** |
| **Inspiration Gallery** | Cultural Themes | Displays regional themes; saves and removes items from celebration moodboard. | **PASSED** |
| **AI Assistant** | Context Awareness | Grounded in active event's budget, guests, location, and cuisine; returns follow-up pills. | **PASSED** |
| **Data Persistence** | Page Refresh | All changes persist across browser refreshes and server restarts via `data/events.json`. | **PASSED** |

---

## 2. Robustness & Error Handling Tests

### A. Missing API Key Test
- **Scenario**: App executed with no `GEMINI_API_KEY` configured.
- **Expected Result**: Seamlessly engages Local Indian Cultural Intelligence engine without crashing or throwing unhandled promise rejections.
- **Outcome**: Passed with full disclosure badge displayed in header.

### B. Negative Budget & Invalid Inputs
- **Scenario**: Entering negative budget (-50000) or zero guests in the onboarding wizard.
- **Expected Result**: User-friendly red error badge appears; step transition is blocked.
- **Outcome**: Passed.

### C. Budget Ceiling Overrun Guardrail
- **Scenario**: AI Optimizer asked to save ₹1,00,000 on a ₹10,00,000 budget.
- **Expected Result**: Route handler validates `projectedNewTotal <= 9,00,000`.
- **Outcome**: Passed.

---

## 3. Responsive UI Verification
- Tested across Mobile (375px), Tablet (768px), and Desktop (1280px+).
- Navbar collapses into accessible mobile drawer on smaller viewports.
- Recharts responsive containers auto-scale without horizontal scrolling.
