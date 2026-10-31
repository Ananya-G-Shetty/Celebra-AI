import { NextRequest, NextResponse } from 'next/server';
import { getEventById, getExpenses } from '@/lib/storage';
import { optimizeBudget } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, targetSavings, preservedCategories, userNotes, customApiKey } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required.' },
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

    const savings = Number(targetSavings);
    if (isNaN(savings) || savings <= 0) {
      return NextResponse.json(
        { success: false, error: 'Target savings must be a positive number in INR.' },
        { status: 400 }
      );
    }

    if (savings >= event.totalBudget) {
      return NextResponse.json(
        {
          success: false,
          error: `Target savings (₹${savings.toLocaleString('en-IN')}) cannot be greater than or equal to total budget (₹${event.totalBudget.toLocaleString('en-IN')}).`,
        },
        { status: 400 }
      );
    }

    const expenses = getExpenses(eventId);
    const { result, engineStatus } = await optimizeBudget(
      event,
      expenses,
      savings,
      preservedCategories || [],
      userNotes || '',
      customApiKey
    );

    // Deterministic validation: Ensure revised projected total does not exceed budget limit
    const calculatedNewCeiling = Math.max(0, event.totalBudget - savings);
    result.projectedNewTotal = Math.min(result.projectedNewTotal, calculatedNewCeiling);

    return NextResponse.json({
      success: true,
      data: result,
      engineStatus,
    });
  } catch (err: any) {
    console.error('Error optimizing budget:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to optimize budget' },
      { status: 500 }
    );
  }
}
