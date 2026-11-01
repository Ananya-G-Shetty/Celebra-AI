import { NextRequest, NextResponse } from 'next/server';
import { getVendors, addVendor, updateVendor, deleteVendor, getEventById } from '@/lib/storage';
import { getVendorVettingGuide } from '@/lib/gemini';
import { getErrorMessage } from '@/lib/utils';
import { Vendor } from '@/types';

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

    const vendors = getVendors(eventId);
    return NextResponse.json({ success: true, data: vendors });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if AI vetting guide requested
    if (body.action === 'vetting_guide') {
      const { eventId, vendorCategory, customApiKey } = body;
      const event = getEventById(eventId);
      if (!event) {
        return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
      }
      const { guide, engineStatus } = await getVendorVettingGuide(event, vendorCategory, customApiKey);
      return NextResponse.json({ success: true, data: guide, engineStatus });
    }

    // Standard add vendor
    if (!body.eventId || !body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: 'eventId, name, and category are required.' },
        { status: 400 }
      );
    }

    const quoted = Number(body.quotedPrice) || 0;
    const negotiated = body.negotiatedPrice ? Number(body.negotiatedPrice) : undefined;
    const advance = Number(body.advancePaid) || 0;

    const newVendor: Vendor = {
      id: `ven-${Date.now()}`,
      eventId: body.eventId,
      name: body.name.trim(),
      category: body.category,
      contactPerson: body.contactPerson?.trim() || '',
      phone: body.phone?.trim() || '',
      email: body.email?.trim() || '',
      quotedPrice: Math.max(0, quoted),
      negotiatedPrice: negotiated !== undefined ? Math.max(0, negotiated) : undefined,
      status: body.status || 'not_contacted',
      notes: body.notes?.trim() || '',
      paymentStatus: body.paymentStatus || (advance > 0 ? 'advance_paid' : 'unpaid'),
      advancePaid: Math.max(0, advance),
      rating: body.rating ? Number(body.rating) : 5,
    };

    const saved = addVendor(newVendor);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to add vendor' },
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
        { success: false, error: 'Vendor id is required for updating.' },
        { status: 400 }
      );
    }

    if (updates.quotedPrice !== undefined) {
      updates.quotedPrice = Math.max(0, Number(updates.quotedPrice) || 0);
    }
    if (updates.negotiatedPrice !== undefined) {
      updates.negotiatedPrice = Math.max(0, Number(updates.negotiatedPrice) || 0);
    }
    if (updates.advancePaid !== undefined) {
      updates.advancePaid = Math.max(0, Number(updates.advancePaid) || 0);
    }

    const updated = updateVendor(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to update vendor' },
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
        { success: false, error: 'Vendor id query param is required.' },
        { status: 400 }
      );
    }

    const deleted = deleteVendor(id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}
