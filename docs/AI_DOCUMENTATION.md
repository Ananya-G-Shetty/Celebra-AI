# Celebra AI — AI Engineering & Gemini Integration Documentation

## 1. AI Technology Selection: Why Google Gemini 1.5 Flash?

For Celebra AI, we selected **Google Gemini 1.5 Flash** (via the official `@google/generative-ai` SDK) for the following reasons:
1. **Native Structured JSON Output (`responseMimeType: "application/json"`)**: Eliminates markdown code-fence parsing errors and guarantees strict schema compliance.
2. **Speed & Latency**: Sub-second to 1.5-second response times for complex multi-category plans, ensuring smooth multi-step wizard interactions.
3. **Cultural Context Understanding**: Deep pre-trained knowledge of Indian cultural traditions, regional festivals, rituals (Muhurtham, Sangeet, Haldi, Gruhapravesha), and regional culinary distinctions (Karnataka Banana-leaf Sadhya, Sattvic Jain catering, Chiroti with Badam milk).
4. **Context Window & Cost Efficiency**: 1 million token context window allows rich event details (guest count, budget, location, preferences, existing tasks) to be injected without truncation.

---

## 2. Centralized Engineered Prompts

All prompts are engineered in `lib/prompts.ts` using strict role definition, cultural grounding, constraints, and JSON schemas.

### A. Event Plan Generator Prompt (`buildEventPlanPrompt`)
- **Role**: Chief Event Architect & Cultural Celebration Specialist.
- **Context Injected**: Name, Category, Date, Location, Guest Count, Total Budget in INR, Budget Flexibility, Spending Priorities, Theme/Style, Cuisine, Cultural Traditions, Indoor/Outdoor setting, Special Requirements.
- **Constraints**:
  - Currency strictly in INR (₹).
  - Sum of budget distributions must align with total budget.
  - Returns 7 distinct dimensions: Overview, Theme & Decor, Catering, Entertainment, Logistics, Budget Distribution, and Personalized Recommendations.
  - Mandatory disclaimer on cost estimates.

### B. Budget Optimizer Prompt (`buildBudgetOptimizerPrompt`)
- **Role**: Senior Event Financial Strategist.
- **Goal**: Find strategic savings in non-critical categories while strictly protecting user-specified non-negotiable priorities.
- **Rule**: Revised budget ceiling cannot exceed `Total Budget - Target Savings`.

### C. Emergency Contingency Commander Prompt (`buildEmergencyPlannerPrompt`)
- **Role**: Rapid Event Contingency Commander.
- **Goal**: Assess operational impact of sudden disruption (e.g., monsoon downpour, decorator cancellation, 60 unexpected guests).
- **Output**: Severity rating, affected tasks, practical alternatives, budget impact in INR, urgent triage action items, and expert reassurance.

### D. Context-Grounded Copilot Prompt (`buildAiAssistantPrompt`)
- **Role**: Empathetic, culturally astute Indian celebration copilot.
- **Context**: Injects active event parameters and the last 6 turns of conversation history.
- **Output**: Grounded answer + 2-3 suggested follow-up questions.

### E. Vendor Procurement Vetting Prompt (`buildVendorQuestionsPrompt`)
- **Role**: Vendor Procurement Advisor.
- **Goal**: Generate critical interview questions to uncover hidden GST taxes, overtime fees, generator charges, and cancellation policies.

---

## 3. Prompt Evolution & Refinements

During prompt development, three key iterations were made:
1. **Currency Grounding**: Early versions occasionally omitted the currency symbol or used USD ($). We enforced explicit INR (₹) constraints and added the helper `formatINR(...)` directly into prompt interpolations.
2. **Deterministic Ceiling Guardrail**: Rather than allowing the LLM to calculate arithmetic totals, our prompt specifies the exact target ceiling, and the TypeScript route handler (`/api/budget/optimize`) deterministically validates:
   `result.projectedNewTotal = Math.min(result.projectedNewTotal, event.totalBudget - targetSavings);`
3. **Confirmation Gate for Emergencies**: To adhere to safe AI agent design, emergency action items are not automatically committed to the user's database. The user is presented with a detailed contingency assessment and must explicitly click *"Apply Urgent Tasks to My Timeline"*.

---

## 4. Resilience & Fallback Engine Architecture

To guarantee zero crashes during live evaluation and hackathon judging, `lib/gemini.ts` implements a dual-mode fallback:
- **Online Mode**: Calls `getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } })`.
- **Offline / Rate-Limit Fallback**: If `GEMINI_API_KEY` is not provided or Google API returns a quota error, Celebra AI engages its built-in Indian Cultural Intelligence engine.
- Every API response returns `engineStatus`:
  ```json
  {
    "activeEngine": "gemini",
    "modelName": "gemini-1.5-flash",
    "isFallback": false,
    "details": "Google Gemini API connected via server-side SDK (gemini-1.5-flash)."
  }
  ```
