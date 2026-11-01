'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEvent } from '@/components/EventContext';
import {
  MessageSquare,
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Clock,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { formatINR } from '@/lib/utils';

export default function AssistantPage() {
  const { activeEvent, activeEventId, apiKey } = useEvent();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultSuggestedQuestions = [
    'How can we reduce expenses without compromising food or photos?',
    'What are the non-negotiable tasks to wrap up this week?',
    'Suggest a traditional Karnataka Sadhya menu for our guest count.',
    'What questions should we ask our decorator before paying advance?',
    'How should we manage elder accessibility and valet parking?',
  ];

  const fetchHistory = useCallback(async () => {
    if (!activeEventId) return;
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/assistant?eventId=${activeEventId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }, [activeEventId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-plum-700">Please select or create an event first.</p>
      </div>
    );
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      eventId: activeEvent.id,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          message: text.trim(),
          customApiKey: apiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear entire conversation history for this celebration?')) return;
    try {
      await fetch(`/api/assistant?eventId=${activeEvent.id}`, { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-fade-in flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-plum-150 pb-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-serif font-bold text-plum-950">
              Celebra AI Event Copilot
            </h1>
          </div>
          <p className="text-xs text-plum-600 mt-0.5">
            Active Context: <strong>{activeEvent.name}</strong> | {formatINR(activeEvent.totalBudget)} • {activeEvent.guestCount} Guests | {activeEvent.location}
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="text-xs text-plum-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-plum-800 to-burgundy-800 flex items-center justify-center text-gold-400 mx-auto shadow-card">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-plum-950">
              Namaste! How can I assist your planning today?
            </h3>
            <p className="text-xs text-plum-600 leading-relaxed">
              I have complete real-time awareness of {activeEvent.name}. Ask me about budgeting trade-offs, Indian catering menus, vendor vetting questions, or timing schedules!
            </p>

            <div className="pt-4 space-y-2 text-left">
              <p className="text-[11px] font-bold text-plum-900 uppercase tracking-wider text-center">
                Suggested Questions to Try:
              </p>
              <div className="space-y-1.5">
                {defaultSuggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-plum-150 hover:border-plum-300 hover:bg-plum-50 text-xs text-plum-800 font-medium transition-colors flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-plum-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-plum-800 to-burgundy-800 flex items-center justify-center text-gold-400 flex-shrink-0 shadow-subtle mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 shadow-subtle ${
                  isUser
                    ? 'bg-plum-800 text-white rounded-tr-none'
                    : 'bg-white border border-plum-150 text-plum-950 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {/* Follow-up suggestion pills */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pt-2 border-t border-plum-100 mt-2 space-y-1.5">
                    <p className="text-[10px] font-bold text-plum-500 uppercase tracking-wider">
                      Related Follow-Ups:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((fq, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(fq)}
                          className="px-2.5 py-1 rounded-lg bg-plum-50 hover:bg-plum-100 text-plum-900 text-[11px] font-medium border border-plum-200 transition-colors text-left"
                        >
                          {fq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] text-right mt-1 ${
                    isUser ? 'text-plum-300' : 'text-plum-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-ivory-200 flex items-center justify-center text-plum-800 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-plum-800 flex items-center justify-center text-gold-400 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-white border border-plum-150 text-xs text-plum-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-spin" />
              <span>Celebra AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex-shrink-0 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Ask Celebra AI about ${activeEvent.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            className="flex-1 px-4 py-3 rounded-2xl border border-plum-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-plum-700 shadow-subtle"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-plum-800 to-burgundy-800 text-white font-semibold text-xs shadow-card hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5 text-gold-300" />
          </button>
        </form>
      </div>
    </div>
  );
}
