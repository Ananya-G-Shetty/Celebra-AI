import { NextRequest, NextResponse } from 'next/server';
import { getInspirations, saveInspiration, deleteInspiration } from '@/lib/storage';
import { SavedInspiration } from '@/types';

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

    const inspirations = getInspirations(eventId);
    return NextResponse.json({ success: true, data: inspirations });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch inspirations' },
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

    const item: SavedInspiration = {
      id: `insp-${Date.now()}`,
      eventId: body.eventId,
      title: body.title.trim(),
      category: body.category || 'Theme',
      description: body.description?.trim() || '',
      culturalContext: body.culturalContext?.trim() || '',
      tags: body.tags || ['Inspiration'],
      savedAt: new Date().toISOString(),
    };

    const saved = saveInspiration(item);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save inspiration' },
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
        { success: false, error: 'Inspiration id query param is required.' },
        { status: 400 }
      );
    }

    const deleted = deleteInspiration(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete inspiration' },
      { status: 500 }
    );
  }
}
