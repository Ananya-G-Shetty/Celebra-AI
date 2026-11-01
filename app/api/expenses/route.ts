import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '@/lib/storage';
import { getErrorMessage } from '@/lib/utils';
import { ExpenseItem } from '@/types';

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

    const expenses = getExpenses(eventId);
    return NextResponse.json({ success: true, data: expenses });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.eventId || !body.title || !body.category) {
      return NextResponse.json(
        { success: false, error: 'eventId, title, and category are required.' },
        { status: 400 }
      );
    }

    const estimatedAmount = Number(body.estimatedAmount) || 0;
    const actualAmount = Number(body.actualAmount) || 0;
    const paidAmount = Number(body.paidAmount) || 0;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      eventId: body.eventId,
      category: body.category,
      title: body.title.trim(),
      estimatedAmount: Math.max(0, estimatedAmount),
      actualAmount: Math.max(0, actualAmount),
      paidAmount: Math.max(0, paidAmount),
      status: body.status || (paidAmount > 0 ? (paidAmount >= actualAmount && actualAmount > 0 ? 'paid' : 'pending') : 'planned'),
      notes: body.notes?.trim() || '',
      vendorId: body.vendorId || undefined,
      createdAt: new Date().toISOString(),
    };

    const saved = addExpense(newExpense);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to add expense' },
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
        { success: false, error: 'Expense id is required for updating.' },
        { status: 400 }
      );
    }

    if (updates.estimatedAmount !== undefined) {
      updates.estimatedAmount = Math.max(0, Number(updates.estimatedAmount) || 0);
    }
    if (updates.actualAmount !== undefined) {
      updates.actualAmount = Math.max(0, Number(updates.actualAmount) || 0);
    }
    if (updates.paidAmount !== undefined) {
      updates.paidAmount = Math.max(0, Number(updates.paidAmount) || 0);
    }

    const updated = updateExpense(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Expense not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to update expense' },
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
        { success: false, error: 'Expense id query param is required.' },
        { status: 400 }
      );
    }

    const deleted = deleteExpense(id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
