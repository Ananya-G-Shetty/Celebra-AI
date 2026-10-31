'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CelebrationEvent } from '@/types';

interface EventContextType {
  events: CelebrationEvent[];
  activeEvent: CelebrationEvent | null;
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  refreshEvents: () => Promise<void>;
  deleteEventById: (id: string) => Promise<boolean>;
  apiKey: string;
  setApiKey: (key: string) => void;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType>({
  events: [],
  activeEvent: null,
  activeEventId: '',
  setActiveEventId: () => {},
  refreshEvents: async () => {},
  deleteEventById: async () => false,
  apiKey: '',
  setApiKey: () => {},
  isLoading: true,
});

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CelebrationEvent[]>([]);
  const [activeEventId, setActiveEventIdState] = useState<string>('');
  const [apiKey, setApiKeyState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load API Key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('celebra_gemini_key') || '';
      setApiKeyState(storedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('celebra_gemini_key', key);
      } else {
        localStorage.removeItem('celebra_gemini_key');
      }
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success && data.data) {
        setEvents(data.data);
        // If current activeEventId is not set or not in list, default to first event
        const currentStored = typeof window !== 'undefined' ? localStorage.getItem('celebra_active_event_id') : '';
        if (currentStored && data.data.some((e: CelebrationEvent) => e.id === currentStored)) {
          setActiveEventIdState(currentStored);
        } else if (data.data.length > 0) {
          setActiveEventIdState(data.data[0].id);
        } else {
          setActiveEventIdState('');
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEventById = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const remaining = events.filter((e) => e.id !== id);
        setEvents(remaining);
        if (activeEventId === id) {
          const nextId = remaining.length > 0 ? remaining[0].id : '';
          setActiveEventIdState(nextId);
          if (typeof window !== 'undefined') {
            if (nextId) localStorage.setItem('celebra_active_event_id', nextId);
            else localStorage.removeItem('celebra_active_event_id');
          }
        }
        await fetchEvents();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete event:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const setActiveEventId = (id: string) => {
    setActiveEventIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('celebra_active_event_id', id);
    }
  };

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeEventId,
        setActiveEventId,
        refreshEvents: fetchEvents,
        deleteEventById,
        apiKey,
        setApiKey,
        isLoading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  return useContext(EventContext);
}
