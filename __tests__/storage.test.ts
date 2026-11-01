import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  saveAiPlanToEvent,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  getInspirations,
  saveInspiration,
  deleteInspiration,
  getChatHistory,
  addChatMessage,
  clearChatHistory,
  resetToSeedData,
} from '@/lib/storage';
import { CelebrationEvent, ExpenseItem, TimelineTask, Vendor, SavedInspiration, ChatMessage } from '@/types';

describe('In-Memory Storage & Persistence Engine (lib/storage.ts)', () => {
  beforeEach(() => {
    resetToSeedData();
  });

  describe('Celebration Event CRUD', () => {
    test('fetches seeded events', () => {
      const events = getEvents();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThanOrEqual(1);
    });

    test('finds event by ID and returns null for unknown ID', () => {
      const events = getEvents();
      const first = events[0];
      expect(getEventById(first.id)).toEqual(first);
      expect(getEventById('non-existent-id-9999')).toBeNull();
    });

    test('creates a new celebration event and retrieves it', () => {
      const newEvent: CelebrationEvent = {
        id: `test-create-${Date.now()}`,
        name: 'Unit Test Sangeet Night',
        category: 'wedding',
        date: '2026-11-25',
        location: 'Mysore, Karnataka',
        guestCount: 150,
        totalBudget: 600000,
        budgetFlexibility: 'strict',
        spendingPriorities: ['catering', 'entertainment'],
        preferences: {
          themeStyle: 'Festive Lights & Marigold',
          foodPreferences: 'Mysore Special Sweets & Dosa',
          culturalPreferences: 'Kannada Sangeet',
          indoorOutdoor: 'indoor',
          specialRequirements: 'Live acoustic flute band',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const created = createEvent(newEvent);
      expect(created.id).toBe(newEvent.id);

      const retrieved = getEventById(newEvent.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Unit Test Sangeet Night');
    });

    test('updates existing celebration event details and updatedAt timestamp', () => {
      const events = getEvents();
      const target = events[0];

      const updated = updateEvent(target.id, {
        name: 'Updated Celebration Name',
        totalBudget: 2000000,
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Celebration Name');
      expect(updated?.totalBudget).toBe(2000000);
      expect(updated?.updatedAt).toBeDefined();
    });

    test('saves AI generated plan to event', () => {
      const events = getEvents();
      const target = events[0];

      const mockPlan: any = {
        overview: { approach: 'Holistic approach', concept: 'Royal theme', mainPriorities: ['Punctuality'] },
        themeAndDecor: { theme: 'Floral Heritage', decorationIdeas: [], colorPalette: [], stageVenueConcepts: '' },
      };

      const saved = saveAiPlanToEvent(target.id, mockPlan);
      expect(saved?.aiPlan).toEqual(mockPlan);
    });

    test('deletes event and all associated expenses, tasks, and vendors in cascade', () => {
      const testEventId = `cascade-del-${Date.now()}`;
      createEvent({
        id: testEventId,
        name: 'Cascade Event',
        category: 'other',
        date: '2026-12-01',
        location: 'Bangalore',
        guestCount: 50,
        totalBudget: 100000,
        budgetFlexibility: 'moderate',
        spendingPriorities: [],
        preferences: { themeStyle: '', foodPreferences: '', culturalPreferences: '', indoorOutdoor: 'indoor', specialRequirements: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      addExpense({
        id: 'exp-cascade',
        eventId: testEventId,
        category: 'venue',
        title: 'Hall Deposit',
        estimatedAmount: 50000,
        actualAmount: 50000,
        paidAmount: 50000,
        status: 'paid',
        createdAt: new Date().toISOString(),
      });

      addTask({
        id: 'task-cascade',
        eventId: testEventId,
        title: 'Call decorator',
        description: '',
        deadline: '1 day before',
        milestone: '1_day_before',
        priority: 'high',
        status: 'pending',
        category: 'decoration',
      });

      expect(getEventById(testEventId)).not.toBeNull();
      expect(getExpenses(testEventId).length).toBe(1);
      expect(getTasks(testEventId).length).toBe(1);

      const deleted = deleteEvent(testEventId);
      expect(deleted).toBe(true);

      expect(getEventById(testEventId)).toBeNull();
      expect(getExpenses(testEventId).length).toBe(0);
      expect(getTasks(testEventId).length).toBe(0);
    });
  });

  describe('Expense CRUD', () => {
    test('adds, updates, and deletes an expense', () => {
      const event = getEvents()[0];
      const newExp: ExpenseItem = {
        id: `exp-test-${Date.now()}`,
        eventId: event.id,
        category: 'photography',
        title: 'Candid Cinema Package',
        estimatedAmount: 120000,
        actualAmount: 110000,
        paidAmount: 50000,
        status: 'paid',
        createdAt: new Date().toISOString(),
      };

      addExpense(newExp);
      const expensesAfterAdd = getExpenses(event.id);
      expect(expensesAfterAdd.some((e) => e.id === newExp.id)).toBe(true);

      const updated = updateExpense(newExp.id, { actualAmount: 115000, status: 'paid' });
      expect(updated?.actualAmount).toBe(115000);
      expect(updated?.status).toBe('paid');

      const deleted = deleteExpense(newExp.id);
      expect(deleted).toBe(true);
      expect(getExpenses(event.id).some((e) => e.id === newExp.id)).toBe(false);
    });
  });

  describe('Timeline Task CRUD', () => {
    test('adds, updates, and deletes timeline tasks', () => {
      const event = getEvents()[0];
      const newTask: TimelineTask = {
        id: `task-test-${Date.now()}`,
        eventId: event.id,
        title: 'Sample Food Tasting',
        description: 'Taste dishes with catering supervisor',
        deadline: '15 days before',
        milestone: '15_days_before',
        priority: 'high',
        status: 'pending',
        category: 'catering',
      };

      addTask(newTask);
      expect(getTasks(event.id).some((t) => t.id === newTask.id)).toBe(true);

      const updated = updateTask(newTask.id, { status: 'completed' });
      expect(updated?.status).toBe('completed');

      const deleted = deleteTask(newTask.id);
      expect(deleted).toBe(true);
      expect(getTasks(event.id).some((t) => t.id === newTask.id)).toBe(false);
    });
  });

  describe('Vendor & Assistant History CRUD', () => {
    test('adds and retrieves vendors', () => {
      const event = getEvents()[0];
      const newVendor: Vendor = {
        id: `ven-test-${Date.now()}`,
        eventId: event.id,
        name: 'Bangalore Nadaswaram Troupe',
        category: 'entertainment',
        contactPerson: 'Ramesh Master',
        phone: '+91 98765 43210',
        email: 'ramesh@nadaswaram.com',
        quotedPrice: 45000,
        negotiatedPrice: 40000,
        status: 'booked',
        paymentStatus: 'advance_paid',
        advancePaid: 15000,
      };

      addVendor(newVendor);
      expect(getVendors(event.id).some((v) => v.id === newVendor.id)).toBe(true);

      deleteVendor(newVendor.id);
      expect(getVendors(event.id).some((v) => v.id === newVendor.id)).toBe(false);
    });

    test('adds chat messages and clears history', () => {
      const event = getEvents()[0];
      const msg: ChatMessage = {
        id: `chat-test-${Date.now()}`,
        eventId: event.id,
        sender: 'user',
        text: 'How many flower garlands do we need?',
        timestamp: new Date().toISOString(),
      };

      addChatMessage(msg);
      expect(getChatHistory(event.id).some((c) => c.id === msg.id)).toBe(true);

      clearChatHistory(event.id);
      expect(getChatHistory(event.id).length).toBe(0);
    });
  });
});

