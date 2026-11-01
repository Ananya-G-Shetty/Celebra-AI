import {
  buildEventPlanPrompt,
  buildBudgetOptimizerPrompt,
  buildEmergencyPlannerPrompt,
  buildAiAssistantPrompt,
  buildVendorQuestionsPrompt,
} from '@/lib/prompts';
import { CelebrationEvent, ExpenseItem, TimelineTask } from '@/types';

describe('Prompt Engineering System (lib/prompts.ts)', () => {
  const mockEvent: CelebrationEvent = {
    id: 'test-event-01',
    name: "Kavya & Rohan's Bangalore Wedding",
    category: 'wedding',
    date: '2026-12-20',
    location: 'Palace Grounds, Bangalore',
    guestCount: 300,
    totalBudget: 1200000,
    budgetFlexibility: 'moderate',
    spendingPriorities: ['catering', 'photography', 'venue'],
    preferences: {
      themeStyle: 'Royal Marigold Mandap',
      foodPreferences: 'Pure Vegetarian Karnataka Sadhya',
      culturalPreferences: 'Kannada Brahmin Rituals',
      indoorOutdoor: 'both',
      specialRequirements: 'Wheelchair ramp access for elders',
    },
    createdAt: '2026-10-01',
    updatedAt: '2026-10-01',
  };

  test('buildEventPlanPrompt generates grounded Indian prompt with JSON schema', () => {
    const prompt = buildEventPlanPrompt(mockEvent);

    expect(prompt).toContain("Kavya & Rohan's Bangalore Wedding");
    expect(prompt).toContain('Palace Grounds, Bangalore');
    expect(prompt).toContain('300');
    expect(prompt).toContain('Indian Rupees (INR - ₹)');
    expect(prompt).toContain('budgetDistribution');
    expect(prompt).toContain('catering');
    expect(prompt).toContain('Cultural Preferences');
    expect(prompt).toContain('themeAndDecor');
  });

  test('buildBudgetOptimizerPrompt validates target savings bound', () => {
    const expenses: ExpenseItem[] = [
      {
        id: 'exp-1',
        eventId: mockEvent.id,
        category: 'venue',
        title: 'Hall Booking',
        estimatedAmount: 400000,
        actualAmount: 400000,
        paidAmount: 100000,
        status: 'paid',
        createdAt: '2026-10-01',
      },
    ];

    const prompt = buildBudgetOptimizerPrompt(mockEvent, expenses, 150000, ['catering']);

    expect(prompt).toContain('Target Savings: ₹1,50,000');
    expect(prompt).toContain('reallocations');
    expect(prompt).toContain('projectedNewTotal');
    expect(prompt).toContain('category');
  });

  test('buildEmergencyPlannerPrompt includes scenario and active context', () => {
    const tasks: TimelineTask[] = [
      {
        id: 't-1',
        eventId: mockEvent.id,
        title: 'Outdoor Lawn Setup',
        description: 'Set up floral mandap on open lawn',
        deadline: 'Event Day',
        milestone: 'event_day',
        priority: 'high',
        status: 'pending',
        category: 'decoration',
      },
    ];

    const prompt = buildEmergencyPlannerPrompt(
      mockEvent,
      'Monsoon thunderstorm forecasted 2 hours before the ceremony',
      'Heavy rain and wind expected on open lawn',
      tasks
    );

    expect(prompt).toContain('Monsoon thunderstorm');
    expect(prompt).toContain('Outdoor Lawn Setup');
    expect(prompt).toContain('newActionTasks');
    expect(prompt).toContain('severity');
  });

  test('buildAiAssistantPrompt includes conversation history and grounded knowledge', () => {
    const history = [
      { sender: 'user', text: 'What is our catering budget?' },
      { sender: 'assistant', text: 'Your catering budget is ₹4,00,000.' },
    ];

    const prompt = buildAiAssistantPrompt(mockEvent, history, 'Can we add live dosa counters?');

    expect(prompt).toContain('Can we add live dosa counters?');
    expect(prompt).toContain('What is our catering budget?');
    expect(prompt).toContain('suggestedFollowUps');
  });

  test('buildVendorQuestionsPrompt structures vendor vetting questions and red flags', () => {
    const prompt = buildVendorQuestionsPrompt(mockEvent, 'catering');

    expect(prompt).toContain('catering');
    expect(prompt).toContain('Palace Grounds, Bangalore');
    expect(prompt).toContain('mustAskQuestions');
    expect(prompt).toContain('redFlagsToWatch');
  });
});
