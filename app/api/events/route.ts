import { NextRequest, NextResponse } from 'next/server';
import { getEvents, createEvent, resetToSeedData } from '@/lib/storage';
import { CelebrationEvent } from '@/types';

export async function GET() {
  try {
    const events = getEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if reset action requested
    if (body.action === 'reset_seed') {
      const resetData = resetToSeedData();
      return NextResponse.json({ success: true, data: resetData.events });
    }

    // Validation
    if (!body.name || !body.category || !body.date) {
      return NextResponse.json(
        { success: false, error: 'Name, category, and date are required.' },
        { status: 400 }
      );
    }

    const budget = Number(body.totalBudget);
    if (isNaN(budget) || budget < 0) {
      return NextResponse.json(
        { success: false, error: 'Total budget must be a positive number in INR.' },
        { status: 400 }
      );
    }

    const guestCount = Number(body.guestCount);
    if (isNaN(guestCount) || guestCount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Guest count must be at least 1.' },
        { status: 400 }
      );
    }

    const newEvent: CelebrationEvent = {
      id: `event-${Date.now()}`,
      name: body.name.trim(),
      category: body.category,
      date: body.date,
      location: body.location?.trim() || 'Bangalore, Karnataka',
      guestCount,
      totalBudget: budget,
      budgetFlexibility: body.budgetFlexibility || 'moderate',
      spendingPriorities: body.spendingPriorities || ['catering', 'venue'],
      preferences: {
        themeStyle: body.preferences?.themeStyle?.trim() || 'Traditional and elegant',
        foodPreferences: body.preferences?.foodPreferences?.trim() || 'Pure Vegetarian',
        culturalPreferences: body.preferences?.culturalPreferences?.trim() || 'Regional traditions',
        indoorOutdoor: body.preferences?.indoorOutdoor || 'indoor',
        specialRequirements: body.preferences?.specialRequirements?.trim() || '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = createEvent(newEvent);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
