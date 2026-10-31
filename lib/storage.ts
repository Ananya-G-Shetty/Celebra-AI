import fs from 'fs';
import path from 'path';
import {
  CelebrationEvent,
  ExpenseItem,
  TimelineTask,
  Vendor,
  SavedInspiration,
  ChatMessage,
  AiEventPlan,
} from '@/types';

interface DatabaseSchema {
  events: CelebrationEvent[];
  expenses: ExpenseItem[];
  tasks: TimelineTask[];
  vendors: Vendor[];
  inspirations: SavedInspiration[];
  chatHistory: ChatMessage[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'events.json');
const DEFAULT_SEED_FILE = path.join(DATA_DIR, 'default-events.json');

/**
 * Ensures data directory and persistence file exist.
 * If file does not exist, copies from default-events.json seed.
 */
function ensureDataFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      if (fs.existsSync(DEFAULT_SEED_FILE)) {
        const seedData = fs.readFileSync(DEFAULT_SEED_FILE, 'utf-8');
        fs.writeFileSync(DATA_FILE, seedData, 'utf-8');
        return JSON.parse(seedData);
      }
      const initial: DatabaseSchema = {
        events: [],
        expenses: [],
        tasks: [],
        vendors: [],
        inspirations: [],
        chatHistory: [],
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }

    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading persistence store:', err);
    return {
      events: [],
      expenses: [],
      tasks: [],
      vendors: [],
      inspirations: [],
      chatHistory: [],
    };
  }
}

function writeDataFile(data: DatabaseSchema): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to persistence store:', err);
    return false;
  }
}

// ==========================================
// EVENT CRUD
// ==========================================

export function getEvents(): CelebrationEvent[] {
  const data = ensureDataFile();
  return data.events || [];
}

export function getEventById(id: string): CelebrationEvent | null {
  const data = ensureDataFile();
  return (data.events || []).find((e) => e.id === id) || null;
}

export function createEvent(event: CelebrationEvent): CelebrationEvent {
  const data = ensureDataFile();
  data.events = data.events || [];
  data.events.push(event);
  writeDataFile(data);
  return event;
}

export function updateEvent(
  id: string,
  updates: Partial<CelebrationEvent>
): CelebrationEvent | null {
  const data = ensureDataFile();
  const index = (data.events || []).findIndex((e) => e.id === id);
  if (index === -1) return null;

  data.events[index] = {
    ...data.events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDataFile(data);
  return data.events[index];
}

export function saveAiPlanToEvent(id: string, plan: AiEventPlan): CelebrationEvent | null {
  return updateEvent(id, { aiPlan: plan });
}

export function deleteEvent(id: string): boolean {
  const data = ensureDataFile();
  data.events = (data.events || []).filter((e) => e.id !== id);
  data.expenses = (data.expenses || []).filter((e) => e.eventId !== id);
  data.tasks = (data.tasks || []).filter((t) => t.eventId !== id);
  data.vendors = (data.vendors || []).filter((v) => v.eventId !== id);
  data.inspirations = (data.inspirations || []).filter((i) => i.eventId !== id);
  data.chatHistory = (data.chatHistory || []).filter((c) => c.eventId !== id);
  return writeDataFile(data);
}

// ==========================================
// EXPENSE CRUD
// ==========================================

export function getExpenses(eventId: string): ExpenseItem[] {
  const data = ensureDataFile();
  return (data.expenses || []).filter((e) => e.eventId === eventId);
}

export function addExpense(expense: ExpenseItem): ExpenseItem {
  const data = ensureDataFile();
  data.expenses = data.expenses || [];
  data.expenses.push(expense);
  writeDataFile(data);
  return expense;
}

export function updateExpense(id: string, updates: Partial<ExpenseItem>): ExpenseItem | null {
  const data = ensureDataFile();
  const index = (data.expenses || []).findIndex((e) => e.id === id);
  if (index === -1) return null;

  data.expenses[index] = {
    ...data.expenses[index],
    ...updates,
  };
  writeDataFile(data);
  return data.expenses[index];
}

export function deleteExpense(id: string): boolean {
  const data = ensureDataFile();
  data.expenses = (data.expenses || []).filter((e) => e.id !== id);
  return writeDataFile(data);
}

// ==========================================
// TIMELINE TASKS CRUD
// ==========================================

export function getTasks(eventId: string): TimelineTask[] {
  const data = ensureDataFile();
  return (data.tasks || []).filter((t) => t.eventId === eventId);
}

export function addTask(task: TimelineTask): TimelineTask {
  const data = ensureDataFile();
  data.tasks = data.tasks || [];
  data.tasks.push(task);
  writeDataFile(data);
  return task;
}

export function updateTask(id: string, updates: Partial<TimelineTask>): TimelineTask | null {
  const data = ensureDataFile();
  const index = (data.tasks || []).findIndex((t) => t.id === id);
  if (index === -1) return null;

  data.tasks[index] = {
    ...data.tasks[index],
    ...updates,
  };
  writeDataFile(data);
  return data.tasks[index];
}

export function deleteTask(id: string): boolean {
  const data = ensureDataFile();
  data.tasks = (data.tasks || []).filter((t) => t.id !== id);
  return writeDataFile(data);
}

// ==========================================
// VENDORS CRUD
// ==========================================

export function getVendors(eventId: string): Vendor[] {
  const data = ensureDataFile();
  return (data.vendors || []).filter((v) => v.eventId === eventId);
}

export function addVendor(vendor: Vendor): Vendor {
  const data = ensureDataFile();
  data.vendors = data.vendors || [];
  data.vendors.push(vendor);
  writeDataFile(data);
  return vendor;
}

export function updateVendor(id: string, updates: Partial<Vendor>): Vendor | null {
  const data = ensureDataFile();
  const index = (data.vendors || []).findIndex((v) => v.id === id);
  if (index === -1) return null;

  data.vendors[index] = {
    ...data.vendors[index],
    ...updates,
  };
  writeDataFile(data);
  return data.vendors[index];
}

export function deleteVendor(id: string): boolean {
  const data = ensureDataFile();
  data.vendors = (data.vendors || []).filter((v) => v.id !== id);
  return writeDataFile(data);
}

// ==========================================
// INSPIRATION
// ==========================================

export function getInspirations(eventId: string): SavedInspiration[] {
  const data = ensureDataFile();
  return (data.inspirations || []).filter((i) => i.eventId === eventId);
}

export function saveInspiration(item: SavedInspiration): SavedInspiration {
  const data = ensureDataFile();
  data.inspirations = data.inspirations || [];
  data.inspirations.push(item);
  writeDataFile(data);
  return item;
}

export function deleteInspiration(id: string): boolean {
  const data = ensureDataFile();
  data.inspirations = (data.inspirations || []).filter((i) => i.id !== id);
  return writeDataFile(data);
}

// ==========================================
// AI CHAT HISTORY
// ==========================================

export function getChatHistory(eventId: string): ChatMessage[] {
  const data = ensureDataFile();
  return (data.chatHistory || []).filter((c) => c.eventId === eventId);
}

export function addChatMessage(msg: ChatMessage): ChatMessage {
  const data = ensureDataFile();
  data.chatHistory = data.chatHistory || [];
  data.chatHistory.push(msg);
  writeDataFile(data);
  return msg;
}

export function clearChatHistory(eventId: string): boolean {
  const data = ensureDataFile();
  data.chatHistory = (data.chatHistory || []).filter((c) => c.eventId !== eventId);
  return writeDataFile(data);
}

// ==========================================
// RESET TO SEED DATA
// ==========================================

export function resetToSeedData(): DatabaseSchema {
  if (fs.existsSync(DEFAULT_SEED_FILE)) {
    const seed = fs.readFileSync(DEFAULT_SEED_FILE, 'utf-8');
    fs.writeFileSync(DATA_FILE, seed, 'utf-8');
    return JSON.parse(seed);
  }
  return ensureDataFile();
}
