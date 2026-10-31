'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEvent } from './EventContext';
import ApiKeyModal from './ApiKeyModal';
import { CelebrationEvent } from '@/types';
import {
  Sparkles,
  Calendar,
  IndianRupee,
  ChevronDown,
  PlusCircle,
  Menu,
  X,
  Shield,
  LifeBuoy,
  MessageSquare,
  Clock,
  Compass,
  Users,
  PieChart,
  LayoutDashboard,
  Key,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { formatCompactINR } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { events, activeEvent, activeEventId, setActiveEventId, deleteEventById, apiKey } = useEvent();
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CelebrationEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const eventDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    }

    if (isEventDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsEventDropdownOpen(false);
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isEventDropdownOpen]);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Budget', href: '/dashboard/budget', icon: PieChart },
    { label: 'Timeline', href: '/dashboard/timeline', icon: Clock },
    { label: 'Vendors', href: '/dashboard/vendors', icon: Users },
    { label: 'Inspiration', href: '/dashboard/inspiration', icon: Compass },
    { label: 'Emergency', href: '/dashboard/emergency', icon: LifeBuoy, highlight: true },
    { label: 'Assistant', href: '/dashboard/assistant', icon: MessageSquare },
  ];

  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    setIsEventDropdownOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEventById(eventToDelete.id);
      setEventToDelete(null);
      setIsEventDropdownOpen(false);
      if (pathname.startsWith('/dashboard') && events.length <= 1) {
        router.push('/plan');
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-plum-150/80 bg-ivory-50/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-plum-800 to-burgundy-800 flex items-center justify-center text-gold-400 shadow-card group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-lg text-plum-950 tracking-tight">
                      CELEBRA
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gold-400/20 text-burgundy-900 border border-gold-400/40">
                      AI
                    </span>
                  </div>
                  <p className="text-[10px] text-plum-600 hidden sm:block tracking-wide">
                    Every celebration deserves a perfect plan.
                  </p>
                </div>
              </Link>

              {/* Event Switcher Dropdown (when events exist) */}
              {events.length > 0 && (
                <div ref={eventDropdownRef} className="relative hidden md:block">
                  <button
                    onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-plum-50 hover:bg-plum-100/70 border border-plum-200 text-xs font-medium text-plum-900 transition-colors"
                    aria-expanded={isEventDropdownOpen}
                  >
                    <div className="w-2 h-2 rounded-full bg-coral-500 animate-ping" />
                    <span className="max-w-[150px] truncate font-semibold">
                      {activeEvent?.name || 'Select Event'}
                    </span>
                    <span className="text-[11px] text-plum-600 bg-white/80 px-1.5 py-0.2 rounded border border-plum-150">
                      {activeEvent ? formatCompactINR(activeEvent.totalBudget) : ''}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-plum-500 transition-transform ${isEventDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isEventDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-plum-200 shadow-elevated py-2 z-50 animate-slide-up">
                      <div className="px-3.5 py-1.5 flex items-center justify-between text-[11px] font-semibold text-plum-400 uppercase tracking-wider">
                        <span>Your Celebrations</span>
                        <span className="text-[10px] font-normal text-plum-400">({events.length})</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-plum-50">
                        {events.map((ev) => (
                          <div
                            key={ev.id}
                            className={`group flex items-center justify-between px-3 py-2 text-xs transition-colors rounded-xl mx-1.5 ${
                              ev.id === activeEventId
                                ? 'bg-plum-50 text-plum-900 font-semibold'
                                : 'text-plum-800 hover:bg-ivory-100'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectEvent(ev.id)}
                              className="flex-1 text-left truncate pr-2 flex items-center justify-between"
                            >
                              <div className="truncate pr-2">
                                <p className="truncate font-medium">{ev.name}</p>
                                <p className="text-[10px] text-plum-500 capitalize">
                                  <span>{ev.category}</span>
                                  <span className="w-1 h-1 rounded-full bg-plum-400 inline-block mx-1.5 align-middle" />
                                  <span>{ev.guestCount} guests</span>
                                </p>
                              </div>
                              <span className="text-[11px] font-bold text-burgundy-800 flex-shrink-0">
                                {formatCompactINR(ev.totalBudget)}
                              </span>
                            </button>

                            <button
                              type="button"
                              title={`Delete ${ev.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEventToDelete(ev);
                              }}
                              className="p-1.5 text-plum-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors ml-1 opacity-70 group-hover:opacity-100"
                              aria-label={`Delete ${ev.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-plum-100 mt-1 pt-1 px-2">
                        <Link
                          href="/plan"
                          onClick={() => setIsEventDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-plum-800 hover:bg-plum-50 rounded-xl transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-plum-700" />
                          <span>Create New Event...</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-plum-800 text-white shadow-subtle'
                        : link.highlight
                        ? 'text-coral-600 hover:bg-coral-50 font-semibold'
                        : 'text-plum-800 hover:bg-plum-100/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-300' : ''}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2.5">
              {/* Gemini Engine Indicator */}
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                title="Configure Google Gemini Engine"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-plum-200 bg-white hover:bg-plum-50 text-[11px] font-medium text-plum-800 transition-colors shadow-subtle"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    apiKey ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="hidden sm:inline">
                  {apiKey ? 'Gemini 1.5' : 'Cultural AI'}
                </span>
                <Key className="w-3 h-3 text-plum-500" />
              </button>

              {/* Create Event CTA */}
              <Link
                href="/plan"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-plum-800 via-burgundy-800 to-plum-900 text-white text-xs font-semibold shadow-card hover:opacity-95 transition-opacity"
              >
                <PlusCircle className="w-3.5 h-3.5 text-gold-300" />
                <span className="hidden sm:inline">New Event</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-plum-800 hover:bg-plum-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-plum-100 bg-ivory-50 px-4 pt-3 pb-6 space-y-3 animate-slide-up">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium ${
                      isActive
                        ? 'bg-plum-800 text-white'
                        : link.highlight
                        ? 'bg-coral-50 text-coral-700 font-semibold border border-coral-200'
                        : 'bg-white border border-plum-150 text-plum-900 hover:bg-plum-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-elevated border border-plum-150 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-plum-950">Delete Celebration?</h3>
                <p className="text-xs text-plum-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-plum-700 leading-relaxed">
              Are you sure you want to delete <strong className="text-plum-950">"{eventToDelete.name}"</strong>? All associated budgets, preparation milestones, and vendor quotes will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl border border-plum-200 text-xs font-semibold text-plum-800 hover:bg-plum-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-700 text-white text-xs font-semibold shadow-card transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Celebration'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
    </>
  );
}
