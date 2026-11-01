import {
  getEngineStatus,
  generateEventPlan,
  optimizeBudget,
  resolveEmergencyScenario,
  chatWithEventAssistant,
  getVendorVettingGuide,
} from '@/lib/gemini';
import { CelebrationEvent, ExpenseItem, TimelineTask } from '@/types';

describe('Gemini Engine & Built-in Indian Cultural Intelligence (lib/gemini.ts)', () => {
  const mockEvent: CelebrationEvent = {
    id: 'gemini-ev-01',
    name: "Aarav's 1st Birthday & Naming Ceremony",
    category: 'birthday',
    date: '2026-11-30',
    location: 'Indiranagar Club, Bangalore',
    guestCount: 120,
    totalBudget: 400000,
    budgetFlexibility: 'moderate',
    spendingPriorities: ['catering', 'decoration', 'entertainment'],
    preferences: {
      themeStyle: 'Traditional Pastel & Marigold',
      foodPreferences: 'South & North Indian Vegetarian Buffet',
      culturalPreferences: 'Karnataka Namakarana Puja & Evening Party',
      indoorOutdoor: 'indoor',
      specialRequirements: 'Kids play zone with ball pit',
    },
    createdAt: '2026-10-01',
    updatedAt: '2026-10-01',
  };

  test('getEngineStatus returns local fallback when no API key is provided', () => {
    const status = getEngineStatus('');
    expect(status.isFallback).toBe(true);
    expect(status.activeEngine).toBe('local_fallback');
    expect(status.modelName).toContain('Cultural Intelligence');
  });

  test('getEngineStatus reports gemini engine when key is supplied', () => {
    const status = getEngineStatus('test-dummy-api-key');
    expect(status.isFallback).toBe(false);
    expect(status.activeEngine).toBe('gemini');
  });

  test('generateEventPlan produces a complete 7-dimensional celebration blueprint in fallback mode', async () => {
    const { plan, engineStatus } = await generateEventPlan(mockEvent);

    expect(engineStatus).toBeDefined();
    expect(plan.overview).toBeDefined();
    expect(plan.overview.approach).toContain("Aarav's 1st Birthday");
    expect(plan.themeAndDecor).toBeDefined();
    expect(plan.themeAndDecor.colorPalette.length).toBeGreaterThan(0);
    expect(plan.catering).toBeDefined();
    expect(plan.catering.menuHighlights.length).toBeGreaterThanOrEqual(3);
    expect(plan.entertainment).toBeDefined();
    expect(plan.logistics).toBeDefined();
    expect(plan.budgetDistribution).toBeDefined();
    expect(plan.budgetDistribution.length).toBeGreaterThanOrEqual(5);

    // Sum of budget distribution should match or approximate total budget
    const totalAllocated = plan.budgetDistribution.reduce((acc, d) => acc + d.suggestedAmount, 0);
    expect(totalAllocated).toBeGreaterThan(0);
    expect(totalAllocated).toBeLessThanOrEqual(mockEvent.totalBudget * 1.05);
  });

  test('optimizeBudget generates realistic savings plan respecting budget bounds', async () => {
    const expenses: ExpenseItem[] = [
      {
        id: 'exp-opt-1',
        eventId: mockEvent.id,
        category: 'venue',
        title: 'Club Banquet Hall',
        estimatedAmount: 150000,
        actualAmount: 150000,
        paidAmount: 50000,
        status: 'paid',
        createdAt: '2026-10-01',
      },
      {
        id: 'exp-opt-2',
        eventId: mockEvent.id,
        category: 'catering',
        title: 'Lunch Buffet',
        estimatedAmount: 120000,
        actualAmount: 120000,
        paidAmount: 0,
        status: 'planned',
        createdAt: '2026-10-01',
      },
    ];

    const { result, engineStatus } = await optimizeBudget(mockEvent, expenses, 50000);

    expect(engineStatus).toBeDefined();
    expect(result.targetSavings).toBe(50000);
    expect(result.projectedNewTotal).toBeLessThanOrEqual(mockEvent.totalBudget);
    expect(Array.isArray(result.reallocations)).toBe(true);
    expect(result.tradeOffSummary).toBeTruthy();
  });

  test('resolveEmergencyScenario generates triage checklist and actionable timeline additions', async () => {
    const tasks: TimelineTask[] = [];
    const { resolution, engineStatus } = await resolveEmergencyScenario(
      mockEvent,
      'Caterer team delayed due to festival traffic jam',
      'Delivery van stuck in festival traffic 2 hours before reception',
      tasks
    );

    expect(engineStatus).toBeDefined();
    expect(resolution.severity).toBeDefined();
    expect(resolution.summary).toBeTruthy();
    expect(resolution.newActionTasks.length).toBeGreaterThan(0);
  });

  test('chatWithEventAssistant provides grounded celebration consultation', async () => {
    const { reply, suggestedQuestions } = await chatWithEventAssistant(
      mockEvent,
      [],
      'What should we serve for the evening high tea?'
    );

    expect(reply).toBeTruthy();
    expect(Array.isArray(suggestedQuestions)).toBe(true);
    expect(suggestedQuestions.length).toBeGreaterThan(0);
  });

  test('getVendorVettingGuide provides structured vetting criteria and red flags', async () => {
    const { guide } = await getVendorVettingGuide(mockEvent, 'photography');

    expect(guide.vendorCategory).toBe('photography');
    expect(guide.keySelectionCriteria.length).toBeGreaterThan(0);
    expect(guide.mustAskQuestions.length).toBeGreaterThan(0);
    expect(guide.redFlagsToWatch.length).toBeGreaterThan(0);
    expect(guide.estimatedPriceRange).toBeTruthy();
  });
});
