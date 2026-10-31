/**
 * Celebra AI - Strict TypeScript Domain Models
 * Tagline: "Every celebration deserves a perfect plan."
 */

export type EventCategory =
  | 'wedding'
  | 'birthday'
  | 'community'
  | 'anniversary'
  | 'housewarming'
  | 'other';

export type BudgetFlexibility = 'strict' | 'moderate' | 'flexible';

export interface EventPreferences {
  themeStyle: string;
  foodPreferences: string;
  culturalPreferences: string;
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  specialRequirements: string;
}

export type ExpenseCategory =
  | 'venue'
  | 'catering'
  | 'decoration'
  | 'photography'
  | 'entertainment'
  | 'invitations'
  | 'clothing_makeup'
  | 'transportation'
  | 'gifts'
  | 'miscellaneous';

export interface ExpenseItem {
  id: string;
  eventId: string;
  category: ExpenseCategory;
  title: string;
  estimatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  status: 'planned' | 'paid' | 'pending';
  notes?: string;
  vendorId?: string;
  createdAt?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskMilestone =
  | '30_days_before'
  | '15_days_before'
  | '7_days_before'
  | '3_days_before'
  | '1_day_before'
  | 'event_day';

export interface TimelineTask {
  id: string;
  eventId: string;
  title: string;
  description: string;
  deadline: string; // ISO date string or relative text
  milestone: TaskMilestone;
  priority: TaskPriority;
  status: 'pending' | 'in_progress' | 'completed';
  category: ExpenseCategory | 'general';
  isCustom?: boolean;
}

export type VendorStatus =
  | 'not_contacted'
  | 'contacted'
  | 'quote_received'
  | 'shortlisted'
  | 'booked'
  | 'cancelled';

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: ExpenseCategory | string;
  contactPerson: string;
  phone: string;
  email: string;
  quotedPrice: number;
  negotiatedPrice?: number;
  status: VendorStatus;
  notes?: string;
  paymentStatus: 'unpaid' | 'advance_paid' | 'fully_paid';
  advancePaid?: number;
  rating?: number;
}

export interface BudgetDistributionItem {
  category: ExpenseCategory;
  categoryLabel: string;
  suggestedAmount: number;
  percentage: number;
  rationale: string;
}

export interface AiEventPlan {
  overview: {
    approach: string;
    concept: string;
    mainPriorities: string[];
  };
  themeAndDecor: {
    theme: string;
    decorationIdeas: string[];
    colorPalette: string[];
    stageVenueConcepts: string;
  };
  catering: {
    menuHighlights: string[];
    foodCategories: string[];
    vegNonVegAlternatives: string;
    estimatedCost: number;
    suggestions: string;
  };
  entertainment: {
    options: string[];
    activities: string[];
    guestEngagementIdeas: string[];
  };
  logistics: {
    seatingArrangements: string;
    guestManagement: string;
    transportation: string;
    accessibility: string;
  };
  budgetDistribution: BudgetDistributionItem[];
  personalizedRecommendations: {
    uniqueIdeas: string[];
    affordableAlternatives: string[];
    culturalSuggestions: string[];
  };
  disclaimer: string;
  generatedAt: string;
}

export interface CelebrationEvent {
  id: string;
  name: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  location: string;
  guestCount: number;
  totalBudget: number;
  budgetFlexibility: BudgetFlexibility;
  spendingPriorities: string[];
  preferences: EventPreferences;
  aiPlan?: AiEventPlan;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetOptimizationResult {
  currentBudget: number;
  targetSavings: number;
  projectedNewTotal: number;
  reallocations: Array<{
    category: ExpenseCategory;
    categoryLabel: string;
    originalAmount: number;
    revisedAmount: number;
    savingAmount: number;
    savingsExplanation: string;
  }>;
  preservedPriorities: string[];
  tradeOffSummary: string;
  actionSteps: string[];
}

export interface EmergencyScenario {
  id: string;
  type:
    | 'vendor_cancellation'
    | 'budget_reduction'
    | 'guest_increase'
    | 'bad_weather'
    | 'venue_unavailability'
    | 'last_minute_schedule'
    | 'custom';
  title: string;
  description: string;
  affectedCategory?: ExpenseCategory;
}

export interface EmergencyResolution {
  scenarioTitle: string;
  severity: 'low' | 'moderate' | 'critical';
  summary: string;
  affectedTasks: string[];
  alternatives: string[];
  estimatedBudgetImpact: number;
  newActionTasks: Array<{
    title: string;
    description: string;
    priority: TaskPriority;
    deadlineText: string;
    category: ExpenseCategory | 'general';
  }>;
  expertExplanation: string;
}

export interface SavedInspiration {
  id: string;
  eventId: string;
  title: string;
  category: string;
  description: string;
  culturalContext: string;
  tags: string[];
  savedAt: string;
}

export interface ChatMessage {
  id: string;
  eventId: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

export interface EngineStatus {
  activeEngine: 'gemini' | 'local_fallback';
  modelName: string;
  isFallback: boolean;
  details: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  engineStatus?: EngineStatus;
}
