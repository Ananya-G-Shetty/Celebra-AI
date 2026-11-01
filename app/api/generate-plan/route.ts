import { NextRequest, NextResponse } from 'next/server';
import {
  getEventById,
  getEvents,
  createEvent,
  saveAiPlanToEvent,
  getExpenses,
  addExpense,
  getTasks,
  addTask,
} from '@/lib/storage';
import { generateEventPlan } from '@/lib/gemini';
import { CelebrationEvent, ExpenseItem, TimelineTask } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, customApiKey, eventData } = body;

    let event: CelebrationEvent | null = eventId ? getEventById(eventId) : null;

    // Resilient fallback: If not found in store by ID, but profile data was passed from client
    if (!event && eventData) {
      const restoredEvent: CelebrationEvent = {
        ...eventData,
        id: eventId || eventData.id || `event-${Date.now()}`,
        name: eventData.name || 'Celebration',
        category: eventData.category || 'other',
        date: eventData.date || new Date().toISOString().split('T')[0],
        location: eventData.location?.trim() || 'Bangalore, Karnataka',
        guestCount: Number(eventData.guestCount) || 100,
        totalBudget: Number(eventData.totalBudget) || 500000,
        budgetFlexibility: eventData.budgetFlexibility || 'moderate',
        spendingPriorities: eventData.spendingPriorities || ['catering', 'venue'],
        preferences: {
          themeStyle: eventData.preferences?.themeStyle || '',
          foodPreferences: eventData.preferences?.foodPreferences || '',
          culturalPreferences: eventData.preferences?.culturalPreferences || '',
          indoorOutdoor: eventData.preferences?.indoorOutdoor || 'indoor',
          specialRequirements: eventData.preferences?.specialRequirements || '',
        },
        createdAt: eventData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      event = createEvent(restoredEvent);
    }

    // Secondary fallback: check all events in case of ID formatting mismatch
    if (!event && eventId) {
      const all = getEvents();
      event = all.find((e) => e.id === eventId) || null;
    }

    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event with ID "${eventId || 'unspecified'}" not found.` },
        { status: 404 }
      );
    }

    const targetEventId = event.id;

    // Call Gemini to generate the structured plan
    const { plan, engineStatus } = await generateEventPlan(event, customApiKey);

    // Save plan to event
    saveAiPlanToEvent(targetEventId, plan);

    // If no expenses exist yet for this event, bootstrap from AI budget distribution
    const existingExpenses = getExpenses(targetEventId);
    if (existingExpenses.length === 0 && plan.budgetDistribution?.length) {
      plan.budgetDistribution.forEach((dist, idx) => {
        const item: ExpenseItem = {
          id: `exp-${Date.now()}-${idx}`,
          eventId: targetEventId,
          category: dist.category,
          title: `${dist.categoryLabel} Allocation`,
          estimatedAmount: dist.suggestedAmount,
          actualAmount: 0,
          paidAmount: 0,
          status: 'planned',
          notes: dist.rationale,
          createdAt: new Date().toISOString(),
        };
        addExpense(item);
      });
    }

    // If no tasks exist, bootstrap initial timeline tasks
    const existingTasks = getTasks(targetEventId);
    if (existingTasks.length === 0) {
      const initialTasks: Array<Omit<TimelineTask, 'id' | 'eventId'>> = [
        {
          title: 'Finalize Guest List & Invitations',
          description: `Consolidate RSVP counts targeting ${event.guestCount} guests.`,
          deadline: '30 days before',
          milestone: '30_days_before',
          priority: 'high',
          status: 'pending',
          category: 'invitations',
        },
        {
          title: 'Confirm Catering Menu & Tasting Session',
          description: `Sample signature dishes: ${plan.catering?.menuHighlights?.slice(0, 3).join(', ') || 'Selected menu'}.`,
          deadline: '15 days before',
          milestone: '15_days_before',
          priority: 'high',
          status: 'pending',
          category: 'catering',
        },
        {
          title: 'Inspect Decor & Stage Layout Mockup',
          description: `Review theme: "${plan.themeAndDecor?.theme || 'Floral Stage'}".`,
          deadline: '7 days before',
          milestone: '7_days_before',
          priority: 'medium',
          status: 'pending',
          category: 'decoration',
        },
        {
          title: 'Vendor Final Confirmation & Schedule Walkthrough',
          description: 'Recheck arrival times, power backup, and team contacts.',
          deadline: '1 day before',
          milestone: '1_day_before',
          priority: 'high',
          status: 'pending',
          category: 'general',
        },
        {
          title: 'Execute Event Day Hospitality & Stage Program',
          description: 'Greet guests, oversee catering rounds, and coordinate stage ceremony.',
          deadline: 'Event Day',
          milestone: 'event_day',
          priority: 'high',
          status: 'pending',
          category: 'general',
        },
      ];

      initialTasks.forEach((t, i) => {
        addTask({
          ...t,
          id: `task-gen-${Date.now()}-${i}`,
          eventId: targetEventId,
        });
      });
    }

    return NextResponse.json({
      success: true,
      data: plan,
      engineStatus,
    });
  } catch (err: any) {
    console.error('Error generating event plan:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate event plan' },
      { status: 500 }
    );
  }
}
