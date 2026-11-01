import { NextRequest, NextResponse } from 'next/server';
import { getEventById, getChatHistory, addChatMessage, clearChatHistory } from '@/lib/storage';
import { chatWithEventAssistant } from '@/lib/gemini';
import { getErrorMessage } from '@/lib/utils';
import { ChatMessage } from '@/types';

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

    const history = getChatHistory(eventId);
    return NextResponse.json({ success: true, data: history });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, message, customApiKey } = body;

    if (!eventId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'eventId and message are required.' },
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

    // Save user message to history
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-u`,
      eventId,
      sender: 'user',
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    const history = getChatHistory(eventId);

    // Call Gemini Assistant
    const { reply, suggestedQuestions, engineStatus } = await chatWithEventAssistant(
      event,
      history.map((h) => ({ sender: h.sender, text: h.text })),
      message.trim(),
      customApiKey
    );

    // Save assistant message to history
    const assistantMsg: ChatMessage = {
      id: `chat-${Date.now()}-a`,
      eventId,
      sender: 'assistant',
      text: reply,
      timestamp: new Date().toISOString(),
      suggestedQuestions,
    };
    addChatMessage(assistantMsg);

    return NextResponse.json({
      success: true,
      data: assistantMsg,
      engineStatus,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to communicate with assistant' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'eventId is required to clear history.' },
        { status: 400 }
      );
    }

    const cleared = clearChatHistory(eventId);
    return NextResponse.json({ success: cleared });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) || 'Failed to clear chat history' },
      { status: 500 }
    );
  }
}
