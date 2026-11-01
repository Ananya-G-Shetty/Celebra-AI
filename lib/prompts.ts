import { CelebrationEvent, ExpenseItem, TimelineTask } from '@/types';
import { formatINR } from './utils';

/**
 * Celebra AI - Centralized Prompt Engineering System
 * Structured JSON Prompts for Google Gemini with Indian Cultural Intelligence
 */

export function buildEventPlanPrompt(event: CelebrationEvent): string {
  return `You are Celebra AI's Chief Event Architect and Cultural Celebration Specialist.
Generate a comprehensive, culturally rich, realistic, and structured event plan for the following celebration in India:

EVENT DETAILS:
- Event Name: "${event.name}"
- Category: ${event.category}
- Celebration Date: ${event.date}
- Location: ${event.location}
- Expected Guests: ${event.guestCount}
- Total Budget: ${formatINR(event.totalBudget)} (${event.totalBudget} INR)
- Budget Flexibility: ${event.budgetFlexibility}
- Spending Priorities: ${event.spendingPriorities?.join(', ') || 'Balanced across all categories'}
- Theme & Style: "${event.preferences?.themeStyle || 'Elegant and culturally authentic'}"
- Food Preferences: "${event.preferences?.foodPreferences || 'Traditional Indian feast'}"
- Cultural Preferences: "${event.preferences?.culturalPreferences || 'Authentic regional traditions'}"
- Setting: ${event.preferences?.indoorOutdoor || 'both'}
- Special Requirements: "${event.preferences?.specialRequirements || 'None specified'}"

CRITICAL INSTRUCTIONS:
1. All currency figures MUST be in Indian Rupees (INR - ₹).
2. The sum of suggested amounts in budgetDistribution should be close to or equal to ${event.totalBudget} INR.
3. Cater specifically to the location (${event.location}) and cultural traditions mentioned.
4. Clearly state in the disclaimer that costs are realistic planning estimates based on Indian event market averages, not verified vendor quotations.
5. You MUST return ONLY a valid JSON object matching the exact schema below. Do NOT output markdown code fences, do NOT include commentary outside the JSON.

SCHEMA:
{
  "overview": {
    "approach": "Detailed strategic planning summary tailored to guest count and budget",
    "concept": "The creative soul and vision of this celebration",
    "mainPriorities": ["Priority 1", "Priority 2", "Priority 3"]
  },
  "themeAndDecor": {
    "theme": "Theme title",
    "decorationIdeas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4"],
    "colorPalette": ["Color 1 with hex or name", "Color 2", "Color 3", "Color 4"],
    "stageVenueConcepts": "Description of main stage, mandap/backdrop, photo booth, and entrance arch"
  },
  "catering": {
    "menuHighlights": ["Dish 1", "Dish 2", "Dish 3", "Dish 4", "Dish 5"],
    "foodCategories": ["Welcome Drinks", "Live Counters", "Main Thali/Buffet", "Desserts & Paan"],
    "vegNonVegAlternatives": "Clear breakdown of vegetarian, Jain, or non-vegetarian provisions",
    "estimatedCost": 450000,
    "suggestions": "Service style (e.g. Traditional Banana Leaf Sadhya vs. Luxury Buffet) and timing tips"
  },
  "entertainment": {
    "options": ["Option 1", "Option 2", "Option 3"],
    "activities": ["Activity 1", "Activity 2"],
    "guestEngagementIdeas": ["Engagement idea 1", "Engagement idea 2"]
  },
  "logistics": {
    "seatingArrangements": "Seating style and layout for ${event.guestCount} guests",
    "guestManagement": "Welcome protocol, gift collection counter, RSVP tracking",
    "transportation": "Parking valet, shuttle coordination, senior citizen drop-off",
    "accessibility": "Wheelchair friendliness, shaded resting spots, dietary labeling"
  },
  "budgetDistribution": [
    {
      "category": "venue",
      "categoryLabel": "Venue & Hall",
      "suggestedAmount": 350000,
      "percentage": 23,
      "rationale": "Why this allocation suits this guest count and location"
    },
    {
      "category": "catering",
      "categoryLabel": "Catering & Food",
      "suggestedAmount": 450000,
      "percentage": 30,
      "rationale": "High priority hospitality for ${event.guestCount} guests"
    },
    {
      "category": "decoration",
      "categoryLabel": "Decoration & Florals",
      "suggestedAmount": 220000,
      "percentage": 15,
      "rationale": "Mandap/stage, natural flowers, entrance and lighting"
    },
    {
      "category": "photography",
      "categoryLabel": "Photography & Video",
      "suggestedAmount": 180000,
      "percentage": 12,
      "rationale": "Candid captures, 4K film and album"
    },
    {
      "category": "entertainment",
      "categoryLabel": "Music & Entertainment",
      "suggestedAmount": 75000,
      "percentage": 5,
      "rationale": "Live artists, sound setup, sound engineering"
    },
    {
      "category": "clothing_makeup",
      "categoryLabel": "Attire & Styling",
      "suggestedAmount": 100000,
      "percentage": 7,
      "rationale": "Bridal/Host makeup and special celebration attire"
    },
    {
      "category": "invitations",
      "categoryLabel": "Invitations & Gifts",
      "suggestedAmount": 35000,
      "percentage": 2,
      "rationale": "Digital RSVP invites and return hampers"
    },
    {
      "category": "transportation",
      "categoryLabel": "Travel & Logistics",
      "suggestedAmount": 30000,
      "percentage": 2,
      "rationale": "Logistics and guest shuttles"
    },
    {
      "category": "miscellaneous",
      "categoryLabel": "Miscellaneous & Contingency",
      "suggestedAmount": 60000,
      "percentage": 4,
      "rationale": "Emergency reserve, tips and temple honors"
    }
  ],
  "personalizedRecommendations": {
    "uniqueIdeas": ["Custom touch 1", "Custom touch 2", "Custom touch 3"],
    "affordableAlternatives": ["Saving hack 1", "Saving hack 2"],
    "culturalSuggestions": ["Regional ritual 1", "Auspicious touch 2"]
  },
  "disclaimer": "AI-generated budget estimates are indicative guidance based on Indian metropolitan event market benchmarks. Actual supplier quotes will vary based on seasonal demand, dates, and finalized guest counts."
}`;
}

export function buildBudgetOptimizerPrompt(
  event: CelebrationEvent,
  currentExpenses: ExpenseItem[] = [],
  targetSavings: number = 0,
  preservedCategories: string[] = [],
  userNotes?: string
): string {
  const currentTotal = event.totalBudget || 0;
  const targetNewTotal = Math.max(0, currentTotal - targetSavings);
  const safePreserved = Array.isArray(preservedCategories) ? preservedCategories : [];
  const safeExpenses = Array.isArray(currentExpenses) ? currentExpenses : [];

  return `You are Celebra AI's Senior Event Financial Strategist.
The user wants to optimize their event budget by finding savings while protecting their non-negotiable priorities.

EVENT: "${event.name}" (${event.category})
Total Initial Budget: ${formatINR(currentTotal)} (${currentTotal} INR)
Target Savings: ${formatINR(targetSavings)} (${targetSavings} INR)
New Target Budget Ceiling: ${formatINR(targetNewTotal)} (${targetNewTotal} INR)
Guest Count: ${event.guestCount}
User Protected Priorities (DO NOT CUT THESE OR CUT ONLY MINIMALLY): ${safePreserved.join(', ') || 'Catering and Photography'}
User Special Request: "${userNotes || 'Preserve quality while reducing non-essential expenses'}"

EXISTING EXPENSE ALLOCATIONS:
${safeExpenses.map((e) => `- ${e.title} (${e.category}): ${formatINR(e.actualAmount > 0 ? e.actualAmount : e.estimatedAmount)}`).join('\n')}

MANDATORY RULES:
1. The revised budget MUST NOT exceed ${targetNewTotal} INR.
2. The user's preserved priorities (${safePreserved.join(', ') || 'None'}) must remain untouched or receive zero reduction unless physically impossible.
3. Identify smart, practical trade-offs in other categories (e.g. seasonal local flowers instead of imported blooms, digital invites instead of heavy physical boxes, off-peak day slots).
4. Return ONLY a valid JSON object matching the schema below.

SCHEMA:
{
  "currentBudget": ${currentTotal},
  "targetSavings": ${targetSavings},
  "projectedNewTotal": ${targetNewTotal},
  "reallocations": [
    {
      "category": "decoration",
      "categoryLabel": "Decoration & Florals",
      "originalAmount": 220000,
      "revisedAmount": 190000,
      "savingAmount": 30000,
      "savingsExplanation": "Switch from imported orchids to local Mysore marigold and tuberoses, use fairy light canopies"
    }
  ],
  "preservedPriorities": ["${preservedCategories.join('", "')}"],
  "tradeOffSummary": "Concise summary explaining how ₹${targetSavings.toLocaleString('en-IN')} was saved without hurting priorities.",
  "actionSteps": ["Action step 1", "Action step 2", "Action step 3"]
}`;
}

export function buildEmergencyPlannerPrompt(
  event: CelebrationEvent,
  scenarioTitle: string,
  scenarioDescription: string = '',
  existingTasks: TimelineTask[] = []
): string {
  const safeTasks = Array.isArray(existingTasks) ? existingTasks : [];

  return `You are Celebra AI's Rapid Event Contingency Commander.
An unexpected disruption has occurred for the following celebration:

EVENT: "${event.name}" (${event.category})
Event Date: ${event.date}
Location: ${event.location}
Guest Count: ${event.guestCount}
Current Budget: ${formatINR(event.totalBudget)}

EMERGENCY INCIDENT:
Title: "${scenarioTitle}"
Description: "${scenarioDescription || scenarioTitle}"

CURRENT TIMELINE TASKS:
${safeTasks.slice(0, 10).map((t) => `- [${t.status}] ${t.title} (${t.priority} priority, deadline: ${t.deadline})`).join('\n') || '- No timeline tasks scheduled yet'}

YOUR TASK:
1. Assess the operational & financial severity (low, moderate, critical).
2. Identify which tasks or milestones are immediately affected.
3. Suggest 3-4 battle-tested, practical alternatives that work in Indian city/community contexts.
4. Estimate the realistic budget impact (extra cost or savings).
5. Generate an urgent triage checklist of new action tasks with priority and deadlines.
6. Provide a reassuring, expert explanation of recommended steps.
7. Return ONLY a valid JSON object matching the schema below.

SCHEMA:
{
  "scenarioTitle": "${scenarioTitle}",
  "severity": "moderate",
  "summary": "Brief executive assessment of the situation",
  "affectedTasks": ["Task name 1", "Task name 2"],
  "alternatives": ["Alternative solution 1", "Alternative solution 2", "Alternative solution 3"],
  "estimatedBudgetImpact": 15000,
  "newActionTasks": [
    {
      "title": "Urgent task title",
      "description": "Specific tactical action",
      "priority": "high",
      "deadlineText": "Within 24 hours",
      "category": "venue"
    }
  ],
  "expertExplanation": "Strategic advice from an experienced Indian wedding/event planner on managing this with zero panic."
}`;
}

export function buildAiAssistantPrompt(
  event: CelebrationEvent,
  chatHistory: Array<{ sender: string; text: string }>,
  userMessage: string
): string {
  return `You are Celebra AI, a warm, knowledgeable, culturally astute Indian celebration planning copilot.
You have full real-time context of the user's active event:

ACTIVE EVENT CONTEXT:
- Name: "${event.name}"
- Category: ${event.category}
- Date: ${event.date}
- Location: ${event.location}
- Guests: ${event.guestCount}
- Total Budget: ${formatINR(event.totalBudget)}
- Preferences: Theme: "${event.preferences?.themeStyle || 'N/A'}", Cuisine: "${event.preferences?.foodPreferences || 'N/A'}", Cultural: "${event.preferences?.culturalPreferences || 'N/A'}"

CONVERSATION HISTORY:
${chatHistory.slice(-6).map((c) => `${c.sender.toUpperCase()}: ${c.text}`).join('\n')}

USER QUESTION:
"${userMessage}"

GUIDELINES:
1. Be concise, practical, and empathetic. Celebrate traditions while giving modern, realistic advice.
2. If discussing money, always use Indian Rupees (INR - ₹) and reference the user's actual budget of ${formatINR(event.totalBudget)}.
3. Ground your advice in Indian vendor customs, seasonal timings, and regional traditions where relevant.
4. Conclude with 2-3 short, relevant follow-up questions the user might want to ask next.

Return ONLY a valid JSON object matching this schema:
{
  "reply": "Your markdown-formatted, helpful answer.",
  "suggestedFollowUps": ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
}`;
}

export function buildVendorQuestionsPrompt(
  event: CelebrationEvent,
  vendorCategory: string
): string {
  return `You are Celebra AI's Vendor Procurement Advisor.
Generate an essential vetting guide for a client in India looking to hire a "${vendorCategory}" for:
- Event: "${event.name}" (${event.category})
- Guest Count: ${event.guestCount}
- Location: ${event.location}

Return ONLY a valid JSON object matching this schema:
{
  "vendorCategory": "${vendorCategory}",
  "keySelectionCriteria": ["Criteria 1", "Criteria 2", "Criteria 3", "Criteria 4"],
  "mustAskQuestions": [
    "Question 1 (e.g., hidden costs/taxes)",
    "Question 2 (e.g., backup equipment/staff)",
    "Question 3 (e.g., cancellation & advance refund terms)",
    "Question 4 (e.g., delivery timeline)"
  ],
  "redFlagsToWatch": ["Red flag 1", "Red flag 2", "Red flag 3"],
  "estimatedPriceRange": "Typical market benchmark in ${event.location} for this scope"
}`;
}
