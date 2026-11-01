import { NextRequest, NextResponse } from 'next/server';
import { getTasks, addTask, updateTask, deleteTask } from '@/lib/storage';
import { getErrorMessage } from '@/lib/utils';
import { TimelineTask } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'eventId query parameter is required.' },
        { status: 400 }
      );
    }

    const tasks = getTasks(eventId);
    return NextResponse.json({ success: true, data: tasks });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.eventId || !body.title) {
      return NextResponse.json(
        { success: false, error: 'eventId and title are required.' },
        { status: 400 }
      );
    }

    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      eventId: body.eventId,
      title: body.title.trim(),
      description: body.description?.trim() || '',
      deadline: body.deadline || 'Upcoming',
      milestone: body.milestone || '30_days_before',
      priority: body.priority || 'medium',
      status: body.status || 'pending',
      category: body.category || 'general',
      isCustom: true,
    };

    const saved = addTask(newTask);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to add task' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task id is required for updating.' },
        { status: 400 }
      );
    }

    const updated = updateTask(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Task not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task id query param is required.' },
        { status: 400 }
      );
    }

    const deleted = deleteTask(id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
