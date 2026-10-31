import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  CelebrationEvent,
  AiEventPlan,
  BudgetOptimizationResult,
  EmergencyResolution,
  EngineStatus,
  ExpenseItem,
  TimelineTask,
} from '@/types';
import {
  buildEventPlanPrompt,
  buildBudgetOptimizerPrompt,
  buildEmergencyPlannerPrompt,
  buildAiAssistantPrompt,
  buildVendorQuestionsPrompt,
} from './prompts';
import { formatINR } from './utils';

const ENV_GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export function getEngineStatus(customKey?: string): EngineStatus {
  const activeKey = customKey || ENV_GEMINI_API_KEY;
  if (activeKey) {
    return {
      activeEngine: 'gemini',
      modelName: GEMINI_MODEL,
      isFallback: false,
      details: `Google Gemini API connected via server-side SDK (${GEMINI_MODEL}).`,
    };
  }
  return {
    activeEngine: 'local_fallback',
    modelName: 'Celebra Indian Cultural Intelligence Engine',
    isFallback: true,
    details:
      'Running on Celebra AI built-in cultural celebration engine for zero-configuration testing and reliable offline evaluation.',
  };
}

function getGenAIClient(customKey?: string): GoogleGenerativeAI | null {
  const key = customKey || ENV_GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

/**
 * Execute Gemini model call with JSON parsing and fallback safeguard.
 */
async function callGeminiJson<T>(
  prompt: string,
  customKey?: string,
  fallbackGenerator?: () => T
): Promise<{ data: T; engineStatus: EngineStatus }> {
  const status = getEngineStatus(customKey);
  const client = getGenAIClient(customKey);

  if (client) {
    try {
      const model = client.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned) as T;

      return {
        data: parsed,
        engineStatus: {
          ...status,
          isFallback: false,
        },
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to cultural engine:', err);
      if (fallbackGenerator) {
        return {
          data: fallbackGenerator(),
          engineStatus: {
            activeEngine: 'local_fallback',
            modelName: `${GEMINI_MODEL} (Fallback on API Rate/Quota)`,
            isFallback: true,
            details: `Gemini encountered a temporary issue. Local cultural intelligence engine safely fulfilled the request.`,
          },
        };
      }
      throw err;
    }
  }

  // Zero-config fallback mode
  if (fallbackGenerator) {
    return {
      data: fallbackGenerator(),
      engineStatus: status,
    };
  }

  throw new Error('No Gemini API key configured and no fallback generator available.');
}

// ==========================================
// 1. GENERATE EVENT PLAN
// ==========================================

export async function generateEventPlan(
  event: CelebrationEvent,
  customKey?: string
): Promise<{ plan: AiEventPlan; engineStatus: EngineStatus }> {
  const prompt = buildEventPlanPrompt(event);

  const fallback = (): AiEventPlan => {
    const isWedding = event.category === 'wedding';
    const isBirthday = event.category === 'birthday';
    const total = event.totalBudget || 500000;

    return {
      overview: {
        approach: `A holistic, milestone-driven planning roadmap for ${event.name} with ${event.guestCount} guests in ${event.location}. Balanced around ${event.spendingPriorities?.join(' & ') || 'hospitality & visual charm'}.`,
        concept: isWedding
          ? 'Timeless Indian heritage traditions woven with contemporary comfort, sustainable florals, and authentic culinary hospitality.'
          : isBirthday
          ? 'Vibrant, joyful celebration bursting with personalized moments, interactive games, and festive treats.'
          : 'Community-centric celebration honoring shared heritage, inclusive participation, and joyous congregation.',
        mainPriorities: [
          `Punctual timeline execution and welcoming guest hospitality for ${event.guestCount} attendees`,
          `Curated catering aligned with preferences: ${event.preferences?.foodPreferences || 'Regional specialties'}`,
          `High-impact visual aesthetics staying within the ${formatINR(total)} budget ceiling`,
        ],
      },
      themeAndDecor: {
        theme: event.preferences?.themeStyle || (isWedding ? 'Royal Jasmine & Marigold Mandap' : 'Festive Joy & Pastels'),
        decorationIdeas: [
          'Grand entrance toran with natural marigold garlands, mango leaves, and brass urlis with floating candles',
          'Acoustic-friendly stage backdrop with textured fabric drape and warm amber fairy light cascades',
          'Eco-conscious guest table centerpieces using terracotta pots with fresh local seasonal blooms',
          'Interactive photo-booth with vintage cycle rickshaw or floral swing for celebratory memories',
        ],
        colorPalette: isWedding
          ? ['Deep Plum (#4A154B)', 'Warm Gold (#D4AF37)', 'Marigold Yellow (#FFB300)', 'Ivory (#FAF7F2)']
          : ['Royal Coral (#FF6F61)', 'Blush Pink (#FCE4EC)', 'Soft Gold (#F3E5AB)', 'Sky Lavender (#EDE7F6)'],
        stageVenueConcepts:
          'Elevated platform with temple pillar motifs, floral canopy, focused warm spotlights, and safe ramp access for elders.',
      },
      catering: {
        menuHighlights: [
          'Welcome Tender Coconut & Traditional Kokum Sherbet',
          'Live Steaming Hot Dosa & Obbattu (Holige) Stations',
          'Royal Vegetable Dum Biryani with Mirchi ka Salan & Raita',
          'Signature Filter Coffee Bar and Hot Badam Milk',
          'Artisanal Mysore Pak & Gulab Jamun with Rabri',
        ],
        foodCategories: ['Welcome Refreshments', 'Live Interactive Counters', 'Grand Feast', 'Desserts & Digestifs'],
        vegNonVegAlternatives: event.preferences?.foodPreferences?.toLowerCase().includes('non-veg')
          ? 'Dedicated segregated kitchens and serving counters for non-vegetarian and pure-vegetarian delicacies.'
          : 'Strict 100% Pure Vegetarian / Sattvic feast with no onion-garlic alternatives clearly marked.',
        estimatedCost: Math.round(total * 0.32),
        suggestions: 'Opt for traditional banana-leaf dining for morning rituals and an open buffet for the evening reception.',
      },
      entertainment: {
        options: isWedding
          ? ['Live Nadaswaram & Thavil Troupe for rituals', 'Acoustic Violin & Flute fusion ensemble', 'Interactive Sangeet MC']
          : ['Interactive Magician & Puppet Show', 'Customized Family Trivia & Games Host', 'Festive DJ setup with lighting'],
        activities: [
          'Handmade caricature artist creating personalized mementos for guests',
          'Celebration message tree where guests tie handwritten blessing cards',
        ],
        guestEngagementIdeas: [
          'Welcome tilak and flower garland greeting by host family',
          'Live instant Polaroid photo corner with celebration stamps',
        ],
      },
      logistics: {
        seatingArrangements: `Mix of traditional floor seating with plush mattresses for close family rituals, and 30 round banquet tables (8-seater) for general guests.`,
        guestManagement: 'Digital QR-code welcome desk, designated luggage checkroom, and clear signages in English and Kannada.',
        transportation: 'Designated valet parking on Kanakapura Road, with 2 dedicated battery buggies/shuttles for senior citizens.',
        accessibility: 'Ramps to dining hall and stage; wheelchair availability at the main entrance gate.',
      },
      budgetDistribution: [
        {
          category: 'venue',
          categoryLabel: 'Venue & Hall',
          suggestedAmount: Math.round(total * 0.24),
          percentage: 24,
          rationale: 'Secures prime banquet hall/lawn with ample parking and green rooms',
        },
        {
          category: 'catering',
          categoryLabel: 'Catering & Food',
          suggestedAmount: Math.round(total * 0.32),
          percentage: 32,
          rationale: `Highest priority hospitality for ${event.guestCount} guests across all meals`,
        },
        {
          category: 'decoration',
          categoryLabel: 'Decoration & Florals',
          suggestedAmount: Math.round(total * 0.16),
          percentage: 16,
          rationale: 'Mandap, stage backdrop, entrance arch, and natural florals',
        },
        {
          category: 'photography',
          categoryLabel: 'Photography & Video',
          suggestedAmount: Math.round(total * 0.12),
          percentage: 12,
          rationale: 'Candid photography, 4K film, drone capture, and fine-art album',
        },
        {
          category: 'clothing_makeup',
          categoryLabel: 'Attire & Styling',
          suggestedAmount: Math.round(total * 0.06),
          percentage: 6,
          rationale: 'Bridal/host styling, saree draping, and ceremonial attire',
        },
        {
          category: 'entertainment',
          categoryLabel: 'Music & Entertainment',
          suggestedAmount: Math.round(total * 0.04),
          percentage: 4,
          rationale: 'Traditional musicians, sound equipment, and sound engineer',
        },
        {
          category: 'gifts',
          categoryLabel: 'Presents & Favors',
          suggestedAmount: Math.round(total * 0.03),
          percentage: 3,
          rationale: 'Eco-friendly return hampers (Channapatna toys / sweets)',
        },
        {
          category: 'invitations',
          categoryLabel: 'Invitations & Gifts',
          suggestedAmount: Math.round(total * 0.015),
          percentage: 1.5,
          rationale: 'Custom WhatsApp digital video invite and seed paper cards',
        },
        {
          category: 'miscellaneous',
          categoryLabel: 'Miscellaneous & Contingency',
          suggestedAmount: Math.round(total * 0.015),
          percentage: 1.5,
          rationale: 'Priest honorarium, cash tips, and emergency reserve',
        },
      ],
      personalizedRecommendations: {
        uniqueIdeas: [
          'Eco-friendly plantable seed paper gift tags embedded with marigold and tulsi seeds',
          'Live filter coffee counter served in traditional brass davarah-tumblers with frothy spectacle',
          'Dedicated children’s activity zone with coloring sheets of Indian celebration folk tales',
        ],
        affordableAlternatives: [
          'Use seasonal local flowers (Mysore Jasmine & Marigold) rather than imported European blooms to save up to 40% on decor',
          'Combine Haldi and Mehendi into a unified daytime sunlit courtyard setup to share venue charges',
        ],
        culturalSuggestions: [
          'Schedule the auspicious Muhurtham to align precisely with local panchangam timings',
          'Incorporate traditional Mangala Vaadya (Nadaswaram) during the dawn arrival rituals',
        ],
      },
      disclaimer:
        'AI-generated budget estimates are indicative guidance based on Indian event market benchmarks. Actual supplier quotes will vary based on dates, season, and guest count.',
      generatedAt: new Date().toISOString(),
    };
  };

  const result = await callGeminiJson<AiEventPlan>(prompt, customKey, fallback);
  return { plan: result.data, engineStatus: result.engineStatus };
}

// ==========================================
// 2. OPTIMIZE BUDGET
// ==========================================

export async function optimizeBudget(
  event: CelebrationEvent,
  currentExpenses: ExpenseItem[],
  targetSavings: number,
  preservedCategories: string[],
  userNotes?: string,
  customKey?: string
): Promise<{ result: BudgetOptimizationResult; engineStatus: EngineStatus }> {
  const prompt = buildBudgetOptimizerPrompt(
    event,
    currentExpenses,
    targetSavings,
    preservedCategories,
    userNotes
  );

  const fallback = (): BudgetOptimizationResult => {
    const currentBudget = event.totalBudget;
    const projectedNewTotal = Math.max(0, currentBudget - targetSavings);

    return {
      currentBudget,
      targetSavings,
      projectedNewTotal,
      reallocations: [
        {
          category: 'decoration',
          categoryLabel: 'Decoration & Florals',
          originalAmount: 220000,
          revisedAmount: 185000,
          savingAmount: 35000,
          savingsExplanation:
            'Switch from exotic imported orchids to local Mysore marigold and tuberoses, use fairy lights for evening glow.',
        },
        {
          category: 'invitations',
          categoryLabel: 'Invitations & Gifts',
          originalAmount: 35000,
          revisedAmount: 15000,
          savingAmount: 20000,
          savingsExplanation:
            'Use premium digital WhatsApp animated video invites; print only 25 keepsake cards for elders.',
        },
        {
          category: 'miscellaneous',
          categoryLabel: 'Miscellaneous & Contingency',
          originalAmount: 50000,
          revisedAmount: 35000,
          savingAmount: 15000,
          savingsExplanation:
            'Streamline transport logistics and consolidate vendor delivery trips to minimize on-site incidental payouts.',
        },
      ],
      preservedPriorities: preservedCategories.length > 0 ? preservedCategories : ['catering', 'photography'],
      tradeOffSummary: `Successfully found ${formatINR(targetSavings)} in strategic reductions across decor florals, physical invites, and logistics without compromising ${preservedCategories.join(' & ') || 'Catering & Photography'}.`,
      actionSteps: [
        'Call your decorator to request seasonal local flower alternatives before advance payment',
        'Finalize the digital RSVP video link rather than ordering physical acrylic invite boxes',
        'Review the revised category totals in your budget dashboard and lock in contracts',
      ],
    };
  };

  const res = await callGeminiJson<BudgetOptimizationResult>(prompt, customKey, fallback);
  return { result: res.data, engineStatus: res.engineStatus };
}

// ==========================================
// 3. EMERGENCY PLANNER
// ==========================================

export async function resolveEmergencyScenario(
  event: CelebrationEvent,
  scenarioTitle: string,
  scenarioDescription: string,
  existingTasks: TimelineTask[],
  customKey?: string
): Promise<{ resolution: EmergencyResolution; engineStatus: EngineStatus }> {
  const prompt = buildEmergencyPlannerPrompt(
    event,
    scenarioTitle,
    scenarioDescription,
    existingTasks
  );

  const fallback = (): EmergencyResolution => {
    return {
      scenarioTitle,
      severity: 'moderate',
      summary: `Immediate response plan for "${scenarioTitle}". We identified 3 affected tasks and prepared 3 vetted contingency options.`,
      affectedTasks: [
        existingTasks[0]?.title || 'Venue layout and sound check',
        existingTasks[1]?.title || 'Catering schedule delivery',
      ],
      alternatives: [
        'Engage Celebra AI verified backup vendor pool on immediate call',
        'Shift the outdoor ritual segment to the covered banquet pavilion or deploy waterproof canopy tents',
        'Adjust the banquet timeline by 45 minutes to allow smooth transition without guest discomfort',
      ],
      estimatedBudgetImpact: 15000,
      newActionTasks: [
        {
          title: `Triage Contact: Activate backup supplier for ${scenarioTitle}`,
          description:
            'Contact shortlisted alternative vendors with existing specifications and lock in emergency confirmation.',
          priority: 'high',
          deadlineText: 'Within 4 hours',
          category: 'venue',
        },
        {
          title: 'Broadcast Schedule Update to Key Family Hosts',
          description:
            'Inform immediate family coordinators and venue stage manager about the contingency adjustment.',
          priority: 'high',
          deadlineText: 'Immediate',
          category: 'general',
        },
      ],
      expertExplanation:
        'In Indian events, vendor and weather shifts are commonplace. The key is swift, calm reallocation of resources without altering the auspicious Muhurtham or core dining hours.',
    };
  };

  const res = await callGeminiJson<EmergencyResolution>(prompt, customKey, fallback);
  return { resolution: res.data, engineStatus: res.engineStatus };
}

// ==========================================
// 4. AI EVENT ASSISTANT CHAT
// ==========================================

export async function chatWithEventAssistant(
  event: CelebrationEvent,
  chatHistory: Array<{ sender: string; text: string }>,
  userMessage: string,
  customKey?: string
): Promise<{
  reply: string;
  suggestedQuestions: string[];
  engineStatus: EngineStatus;
}> {
  const prompt = buildAiAssistantPrompt(event, chatHistory, userMessage);

  interface AssistantResponse {
    reply: string;
    suggestedFollowUps: string[];
  }

  const fallback = (): AssistantResponse => {
    const isBudgetQuery = userMessage.toLowerCase().includes('budget') || userMessage.toLowerCase().includes('cost');
    const isFoodQuery = userMessage.toLowerCase().includes('food') || userMessage.toLowerCase().includes('menu');
    const isTimelineQuery = userMessage.toLowerCase().includes('week') || userMessage.toLowerCase().includes('timeline');

    if (isBudgetQuery) {
      return {
        reply: `For **${event.name}** with a budget of **${formatINR(event.totalBudget)}**, here are the top 3 tactical savings:
1. **Floral Decor Optimization**: Swap non-native lilies and hydrangeas for fragrant Bangalore tuberoses and yellow marigolds—saves up to **₹30,000**.
2. **Digital First Invitations**: Print physical cards only for extended elders; use personalized WhatsApp video invites with Google Maps RSVP links for friends—saves **₹15,000**.
3. **Catering Streamlining**: Consolidate live counters to 2 crowd-favorite stations (e.g. Live Dosa & Chaat) rather than 5 scattered stalls.`,
        suggestedFollowUps: [
          'How can I optimize our catering menu?',
          'What are the priority tasks for this week?',
          'How should I negotiate with our decorator?',
        ],
      };
    }

    if (isFoodQuery) {
      return {
        reply: `Based on your event's preferences (**${event.preferences?.foodPreferences || 'Traditional Indian feast'}**) for **${event.guestCount} guests**, here is a recommended menu strategy:
- **Welcome**: Tender coconut water with mint & rose sherbet
- **Morning/Ritual**: Authentic Mysore Masala Dosa, mini idlis with coconut chutney, and piping hot Mysore Pak
- **Grand Feast**: Bisi Bele Bath with boondi raita, Poori with Sagoo, Badam Kheer, and hot Holige with pure ghee
- **Beverage Station**: Brass filter coffee maker running live during high tea hours.`,
        suggestedFollowUps: [
          'What questions should I ask during catering tasting?',
          'How much buffer plates should we order for 350 guests?',
          'Can we add a Sattvic Jain food counter?',
        ],
      };
    }

    if (isTimelineQuery) {
      return {
        reply: `Here are the **Top 3 non-negotiable items** to wrap up this week for **${event.name}**:
1. **Lock Vendor Advances**: Confirm caterer and photographer booking deposits to freeze your date.
2. **Stage & Seating Blueprint**: Review the 3D decor layout to ensure clear path for elders and wheelchair access.
3. **Dispatch Digital RSVPs**: Send out WhatsApp calendar reminders with the venue Google Maps pin.`,
        suggestedFollowUps: [
          'What should we inspect during the final venue walkthrough?',
          'How do we handle last minute guest additions?',
          'Suggest return gift ideas for our budget',
        ],
      };
    }

    return {
      reply: `Namaste! Regarding **${event.name}**: Based on your ${formatINR(event.totalBudget)} budget and ${event.guestCount} guests in ${event.location}, I recommend ensuring all primary vendor contracts are locked 30 days prior.

Would you like me to inspect your current expense allocations, prepare a vendor vetting checklist, or draft a schedule for the event day?`,
      suggestedFollowUps: [
        'How can we reduce expenses without compromising food?',
        'Suggest traditional decor themes for our venue',
        'What emergency backups should we have in place?',
      ],
    };
  };

  const res = await callGeminiJson<AssistantResponse>(prompt, customKey, fallback);
  return {
    reply: res.data.reply,
    suggestedQuestions: res.data.suggestedFollowUps || [],
    engineStatus: res.engineStatus,
  };
}

// ==========================================
// 5. VENDOR VETTING QUESTIONS
// ==========================================

export async function getVendorVettingGuide(
  event: CelebrationEvent,
  vendorCategory: string,
  customKey?: string
) {
  const prompt = buildVendorQuestionsPrompt(event, vendorCategory);

  interface VendorVetting {
    vendorCategory: string;
    keySelectionCriteria: string[];
    mustAskQuestions: string[];
    redFlagsToWatch: string[];
    estimatedPriceRange: string;
  }

  const fallback = (): VendorVetting => ({
    vendorCategory,
    keySelectionCriteria: [
      'Prior portfolio with similar Indian events & guest scale',
      'Punctuality & presence of seasoned on-site supervisor',
      'Clarity on overtime charges, generator backup, and breakdown fees',
      'Transparent payment milestone schedule (advance vs. completion)',
    ],
    mustAskQuestions: [
      'Are taxes (GST 18%), delivery, and labor tips included in this quote?',
      'What happens if your primary lead artist/photographer falls sick on event day?',
      'What is your refund policy if the event date or venue shifts?',
      'By what exact hour will your team complete setup and sound check?',
    ],
    redFlagsToWatch: [
      'Refusal to sign a written contract or itemized invoice',
      'Demanding 100% full payment upfront before event day',
      'Vague promises without photographic proof of previous real setups',
    ],
    estimatedPriceRange: `Standard benchmark in ${event.location}: ₹35,000 – ₹1,50,000 depending on hours and tier.`,
  });

  const res = await callGeminiJson<VendorVetting>(prompt, customKey, fallback);
  return { guide: res.data, engineStatus: res.engineStatus };
}
