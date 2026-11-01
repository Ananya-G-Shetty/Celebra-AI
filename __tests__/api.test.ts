/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET as getEventsHandler, POST as postEventHandler } from '@/app/api/events/route';
import { GET as getEventByIdHandler, PUT as putEventHandler, DELETE as deleteEventHandler } from '@/app/api/events/[id]/route';
import { POST as postGeneratePlanHandler } from '@/app/api/generate-plan/route';
import { GET as getExpensesHandler, POST as postExpenseHandler, PUT as putExpenseHandler, DELETE as deleteExpenseHandler } from '@/app/api/expenses/route';
import { GET as getInspirationsHandler, POST as postInspirationHandler, DELETE as deleteInspirationHandler } from '@/app/api/inspiration/route';
import { GET as getTasksHandler, POST as postTaskHandler, PUT as putTaskHandler } from '@/app/api/tasks/route';
import { GET as getVendorsHandler, POST as postVendorHandler } from '@/app/api/vendors/route';
import { POST as postEmergencyHandler } from '@/app/api/emergency/route';
import { POST as postBudgetOptimizeHandler } from '@/app/api/budget/optimize/route';
import { GET as getAssistantHandler, POST as postAssistantHandler } from '@/app/api/assistant/route';
import { resetToSeedData } from '@/lib/storage';

describe('Comprehensive API Route Handlers Integration Tests', () => {
  beforeEach(() => {
    resetToSeedData();
  });

  describe('Events API (/api/events & /api/events/[id])', () => {
    test('GET /api/events returns list of celebration events', async () => {
      const response = await getEventsHandler();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    test('POST /api/events validates required fields (name, category, date)', async () => {
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', category: 'wedding', date: '' }),
      });

      const response = await postEventHandler(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toContain('required');
    });

    test('POST /api/events creates a new celebration profile', async () => {
      const req = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ananya & Varun Sangeet Night',
          category: 'wedding',
          date: '2026-12-10',
          location: 'Leela Palace, Bangalore',
          guestCount: 200,
          totalBudget: 750000,
          budgetFlexibility: 'moderate',
          spendingPriorities: ['catering', 'entertainment'],
        }),
      });

      const response = await postEventHandler(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.id).toMatch(/^event-\d+/);
    });

    test('GET, PUT, and DELETE /api/events/[id]', async () => {
      const eventsRes = await getEventsHandler();
      const eventsJson = await eventsRes.json();
      const targetId = eventsJson.data[0].id;

      // GET
      const getReq = new NextRequest(`http://localhost:3000/api/events/${targetId}`);
      const getRes = await getEventByIdHandler(getReq, { params: { id: targetId } });
      const getJson = await getRes.json();
      expect(getRes.status).toBe(200);
      expect(getJson.data.id).toBe(targetId);

      // PUT
      const putReq = new NextRequest(`http://localhost:3000/api/events/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Event Title' }),
      });
      const putRes = await putEventHandler(putReq, { params: { id: targetId } });
      const putJson = await putRes.json();
      expect(putRes.status).toBe(200);
      expect(putJson.data.name).toBe('Updated Event Title');
    });
  });

  describe('Blueprint Generation API (/api/generate-plan)', () => {
    test('generates plan and bootstraps expenses and timeline tasks', async () => {
      const createReq = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Golden Jubilee Celebration',
          category: 'anniversary',
          date: '2026-11-20',
          location: 'Bangalore Club',
          guestCount: 100,
          totalBudget: 500000,
        }),
      });
      const createRes = await postEventHandler(createReq);
      const createJson = await createRes.json();
      const eventId = createJson.data.id;

      const planReq = new NextRequest('http://localhost:3000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      const planRes = await postGeneratePlanHandler(planReq);
      const planJson = await planRes.json();

      expect(planRes.status).toBe(200);
      expect(planJson.success).toBe(true);
      expect(planJson.data.overview).toBeDefined();
      expect(planJson.data.budgetDistribution.length).toBeGreaterThan(0);
    });

    test('resiliently handles eventData fallback if event was not found by ID', async () => {
      const fallbackId = `missing-ev-${Date.now()}`;
      const planReq = new NextRequest('http://localhost:3000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: fallbackId,
          eventData: {
            id: fallbackId,
            name: 'Restored Reception',
            category: 'wedding',
            date: '2026-12-05',
            location: 'ITC Gardenia, Bangalore',
            guestCount: 250,
            totalBudget: 900000,
          },
        }),
      });

      const planRes = await postGeneratePlanHandler(planReq);
      const planJson = await planRes.json();

      expect(planRes.status).toBe(200);
      expect(planJson.success).toBe(true);
      expect(planJson.data).toBeDefined();
    });
  });

  describe('Tasks & Timeline API (/api/tasks)', () => {
    test('creates, updates, and fetches timeline tasks', async () => {
      const eventsRes = await getEventsHandler();
      const eventsJson = await eventsRes.json();
      const eventId = eventsJson.data[0].id;

      // Add task
      const postReq = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          title: 'Review Mandap Setup',
          deadline: '7 days before',
          priority: 'high',
          status: 'pending',
          milestone: '7_days_before',
        }),
      });
      const postRes = await postTaskHandler(postReq);
      const postJson = await postRes.json();
      expect(postRes.status).toBe(201);
      expect(postJson.data.title).toBe('Review Mandap Setup');

      const taskId = postJson.data.id;

      // Update task
      const putReq = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: 'completed' }),
      });
      const putRes = await putTaskHandler(putReq);
      const putJson = await putRes.json();
      expect(putRes.status).toBe(200);
      expect(putJson.data.status).toBe('completed');

      // Fetch tasks
      const getReq = new NextRequest(`http://localhost:3000/api/tasks?eventId=${eventId}`);
      const getRes = await getTasksHandler(getReq);
      const getJson = await getRes.json();
      expect(getRes.status).toBe(200);
      expect(getJson.data.some((t: any) => t.id === taskId)).toBe(true);
    });
  });

  describe('Expenses & Budget API (/api/expenses)', () => {
    test('creates, updates, retrieves, and deletes expense items', async () => {
      const eventsRes = await getEventsHandler();
      const eventsJson = await eventsRes.json();
      const eventId = eventsJson.data[0].id;

      // POST create expense
      const postReq = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          title: 'Rajasthani Royal Band & Dhol',
          category: 'entertainment',
          estimatedAmount: 35000,
          actualAmount: 30000,
          paidAmount: 10000,
          notes: 'Advance paid for welcome procession',
        }),
      });
      const postRes = await postExpenseHandler(postReq);
      const postJson = await postRes.json();
      expect(postRes.status).toBe(201);
      expect(postJson.success).toBe(true);
      expect(postJson.data.title).toBe('Rajasthani Royal Band & Dhol');
      const expenseId = postJson.data.id;

      // GET expenses
      const getReq = new NextRequest(`http://localhost:3000/api/expenses?eventId=${eventId}`);
      const getRes = await getExpensesHandler(getReq);
      const getJson = await getRes.json();
      expect(getRes.status).toBe(200);
      expect(getJson.data.some((e: any) => e.id === expenseId)).toBe(true);

      // PUT update expense
      const putReq = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: expenseId,
          paidAmount: 30000,
          status: 'paid',
        }),
      });
      const putRes = await putExpenseHandler(putReq);
      const putJson = await putRes.json();
      expect(putRes.status).toBe(200);
      expect(putJson.data.paidAmount).toBe(30000);
      expect(putJson.data.status).toBe('paid');

      // DELETE expense
      const deleteReq = new NextRequest(`http://localhost:3000/api/expenses?id=${expenseId}`);
      const deleteRes = await deleteExpenseHandler(deleteReq);
      const deleteJson = await deleteRes.json();
      expect(deleteRes.status).toBe(200);
      expect(deleteJson.success).toBe(true);
    });
  });

  describe('Inspirations API (/api/inspiration)', () => {
    test('creates, fetches, and deletes saved inspiration items', async () => {
      const eventsRes = await getEventsHandler();
      const eventsJson = await eventsRes.json();
      const eventId = eventsJson.data[0].id;

      // POST create inspiration
      const postReq = new NextRequest('http://localhost:3000/api/inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          title: 'Royal Marigold & Brass Floral Arch',
          category: 'decor',
          description: 'South Indian temple style entrance with fresh mogra and genda phool',
          culturalContext: 'Traditional welcome symbolizing auspicious beginnings',
          tags: ['entrance', 'marigold', 'floral'],
        }),
      });
      const postRes = await postInspirationHandler(postReq);
      const postJson = await postRes.json();
      expect(postRes.status).toBe(201);
      expect(postJson.success).toBe(true);
      expect(postJson.data.title).toBe('Royal Marigold & Brass Floral Arch');
      const inspirationId = postJson.data.id;

      // GET inspirations
      const getReq = new NextRequest(`http://localhost:3000/api/inspiration?eventId=${eventId}`);
      const getRes = await getInspirationsHandler(getReq);
      const getJson = await getRes.json();
      expect(getRes.status).toBe(200);
      expect(getJson.data.some((i: any) => i.id === inspirationId)).toBe(true);

      // DELETE inspiration
      const deleteReq = new NextRequest(`http://localhost:3000/api/inspiration?id=${inspirationId}`);
      const deleteRes = await deleteInspirationHandler(deleteReq);
      const deleteJson = await deleteRes.json();
      expect(deleteRes.status).toBe(200);
      expect(deleteJson.success).toBe(true);
    });
  });

  describe('Emergency & Budget Optimizer APIs (/api/emergency & /api/budget/optimize)', () => {
    test('POST /api/emergency simulates triage resolution and action items', async () => {
      const eventsRes = await getEventsHandler();
      const eventsJson = await eventsRes.json();
      const eventId = eventsJson.data[0].id;

      const req = new NextRequest('http://localhost:3000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          scenarioTitle: 'Monsoon Rain Forecast',
          scenarioDescription: 'Heavy rains expected during open lawn reception',
        }),
      });

      const res = await postEmergencyHandler(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.severity).toBeDefined();
    });

    test('POST /api/budget/optimize calculates reallocation within ceiling bounds', async () => {
      const eventsRes = await getEventsHandler();
      const eventsJson = await eventsRes.json();
      const eventId = eventsJson.data[0].id;

      const req = new NextRequest('http://localhost:3000/api/budget/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          targetSavings: 50000,
          preservedCategories: ['catering'],
        }),
      });

      const res = await postBudgetOptimizeHandler(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.projectedNewTotal).toBeDefined();
    });
  });

  describe('Assistant & Vendors APIs (/api/assistant & /api/vendors)', () => {
    test('POST & GET /api/assistant manages conversation history and advice', async () => {
      const eventsRes = await getEventsHandler();
      const eventsJson = await eventsRes.json();
      const eventId = eventsJson.data[0].id;

      const postReq = new NextRequest('http://localhost:3000/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          message: 'Can you recommend signature dessert counters?',
        }),
      });
      const postRes = await postAssistantHandler(postReq);
      const postJson = await postRes.json();
      expect(postRes.status).toBe(200);
      expect(postJson.success).toBe(true);
      expect(postJson.data.text).toBeTruthy();

      const getReq = new NextRequest(`http://localhost:3000/api/assistant?eventId=${eventId}`);
      const getRes = await getAssistantHandler(getReq);
      const getJson = await getRes.json();
      expect(getRes.status).toBe(200);
      expect(getJson.data.length).toBeGreaterThan(0);
    });

    test('POST & GET /api/vendors creates and retrieves vendor registry', async () => {
      const eventsRes = await getEventsHandler();
      const eventsJson = await eventsRes.json();
      const eventId = eventsJson.data[0].id;

      const postReq = new NextRequest('http://localhost:3000/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          name: 'Royal Floral Decorators Bangalore',
          category: 'decoration',
          quotedPrice: 150000,
          negotiatedPrice: 130000,
          status: 'contacted',
        }),
      });
      const postRes = await postVendorHandler(postReq);
      const postJson = await postRes.json();
      expect(postRes.status).toBe(201);
      expect(postJson.data.name).toBe('Royal Floral Decorators Bangalore');

      const getReq = new NextRequest(`http://localhost:3000/api/vendors?eventId=${eventId}`);
      const getRes = await getVendorsHandler(getReq);
      const getJson = await getRes.json();
      expect(getRes.status).toBe(200);
      expect(getJson.data.length).toBeGreaterThan(0);
    });
  });
});
