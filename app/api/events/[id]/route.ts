import { NextRequest, NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/storage';
import { getErrorMessage } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = getEventById(params.id);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: event });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = updateEvent(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Event not found or failed to update' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteEvent(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete event' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: 'Event and all associated records deleted successfully.' });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
