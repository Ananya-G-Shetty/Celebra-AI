import { NextRequest, NextResponse } from 'next/server';
import { getEventById, getTasks, addTask } from '@/lib/storage';
import { resolveEmergencyScenario } from '@/lib/gemini';
import { getErrorMessage } from '@/lib/utils';
import { TimelineTask } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, scenarioTitle, scenarioDescription, customApiKey, applyActionTasks } = body;

    if (!eventId || !scenarioTitle) {
      return NextResponse.json(
        { success: false, error: 'eventId and scenarioTitle are required.' },
        { status: 400 }
      );
    }

    const event = getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found.' },
        { status: 404 }
      );
    }

    const tasks = getTasks(eventId);
    const { resolution, engineStatus } = await resolveEmergencyScenario(
      event,
      scenarioTitle,
      scenarioDescription || scenarioTitle,
      tasks,
      customApiKey
    );

    // If user explicitly confirmed applying the urgent tasks into their timeline
    if (applyActionTasks && resolution.newActionTasks?.length) {
      resolution.newActionTasks.forEach((newTask, idx) => {
        const createdTask: TimelineTask = {
          id: `task-emergency-${Date.now()}-${idx}`,
          eventId,
          title: `[EMERGENCY] ${newTask.title}`,
          description: newTask.description,
          deadline: newTask.deadlineText || 'Urgent',
          milestone: '1_day_before',
          priority: newTask.priority || 'high',
          status: 'pending',
          category: newTask.category || 'general',
          isCustom: true,
        };
        addTask(createdTask);
      });
    }

    return NextResponse.json({
      success: true,
      data: resolution,
      engineStatus,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to analyze emergency scenario' },
      { status: 500 }
    );
  }
}
