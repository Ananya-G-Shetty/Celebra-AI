'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEvent } from '@/components/EventContext';
import {
  Sparkles,
  Calendar,
  IndianRupee,
  MapPin,
  Users,
  Clock,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  LifeBuoy,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Plus,
  Utensils,
  Palette,
  Music,
  Truck,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  formatINR,
  formatCompactINR,
  formatCelebrationDate,
  getDaysRemaining,
  calculateBudgetSummary,
  parseColorItem,
  getErrorMessage,
} from '@/lib/utils';
import { ExpenseItem, TimelineTask, Vendor } from '@/types';

export default function DashboardPage() {
  const { activeEvent, activeEventId, refreshEvents, deleteEventById, events, apiKey } = useEvent();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteCurrentEvent = async () => {
    if (!activeEvent) return;
    try {
      setIsDeleting(true);
      await deleteEventById(activeEvent.id);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      if (events.length <= 1) {
        router.push('/plan');
      }
    } catch (err: unknown) {
      setDashboardError(getErrorMessage(err));
      setIsDeleting(false);
    }
  };

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const fetchDashboardData = async (eventId: string) => {
    try {
      setLoadingMetrics(true);
      setDashboardError(null);
      const [expRes, taskRes, venRes] = await Promise.all([
        fetch(`/api/expenses?eventId=${eventId}`),
        fetch(`/api/tasks?eventId=${eventId}`),
        fetch(`/api/vendors?eventId=${eventId}`),
      ]);

      const [expData, taskData, venData] = await Promise.all([
        expRes.json(),
        taskRes.json(),
        venRes.json(),
      ]);

      if (expData.success) setExpenses(expData.data || []);
      if (taskData.success) setTasks(taskData.data || []);
      if (venData.success) setVendors(venData.data || []);
    } catch (err: unknown) {
      setDashboardError(getErrorMessage(err));
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (activeEventId) {
      fetchDashboardData(activeEventId);
    }
  }, [activeEventId]);

  const handleRegeneratePlan = async () => {
    if (!activeEvent) return;
    try {
      setIsRegenerating(true);
      setDashboardError(null);
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          customApiKey: apiKey,
          eventData: activeEvent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshEvents();
        await fetchDashboardData(activeEvent.id);
      }
    } catch (err: unknown) {
      setDashboardError(getErrorMessage(err));
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-plum-600 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-plum-950">No Celebration Selected</h2>
        <p className="text-sm text-plum-700">
          Create your first celebration or select a preloaded sample to view your dashboard.
        </p>
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-plum-800 text-white font-semibold text-sm shadow-card"
        >
          <span>Create an Event</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const budgetSummary = calculateBudgetSummary(activeEvent.totalBudget, expenses);
  const daysLeft = getDaysRemaining(activeEvent.date);
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const bookedVendors = vendors.filter((v) => v.status === 'booked').length;

  const plan = activeEvent.aiPlan;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in">
      {/* Top Banner / Event Title & Quick Countdown */}
      <div className="bg-gradient-to-r from-plum-900 via-burgundy-900 to-plum-950 text-white rounded-3xl p-6 sm:p-8 shadow-elevated relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-400 text-plum-950">
              {activeEvent.category}
            </span>
            <span className="text-xs text-plum-200">
              {formatCelebrationDate(activeEvent.date)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {activeEvent.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-plum-200">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              {activeEvent.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold-400" />
              {activeEvent.guestCount} Guests
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              <IndianRupee className="w-3.5 h-3.5 text-gold-400" />
              Budget: {formatINR(activeEvent.totalBudget)}
            </span>
          </div>
        </div>

        {/* Countdown Pill & Action */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[120px]">
            <p className="text-2xl sm:text-3xl font-bold font-serif text-gold-400">
              {daysLeft > 0 ? daysLeft : 0}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-plum-200 font-semibold">
              {daysLeft === 0 ? 'Today!' : daysLeft < 0 ? 'Concluded' : 'Days Remaining'}
            </p>
          </div>

          <button
            onClick={handleRegeneratePlan}
            disabled={isRegenerating}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
            title="Re-run Gemini Plan Synthesis"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh AI Plan</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
              Total Budget
            </p>
            <p className="text-xl font-bold font-serif text-plum-950">
              {formatINR(budgetSummary.totalBudget)}
            </p>
            <p className="text-[11px] text-plum-600 capitalize">
              Flexibility: {activeEvent.budgetFlexibility}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-plum-50 text-plum-800">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Spent / Committed */}
        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
              Committed / Spent
            </p>
            <p className="text-xl font-bold font-serif text-burgundy-900">
              {formatINR(budgetSummary.totalActual > 0 ? budgetSummary.totalActual : budgetSummary.totalEstimated)}
            </p>
            <p className="text-[11px] text-plum-600">
              Paid Advances: {formatINR(budgetSummary.totalPaid)}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-burgundy-50 text-burgundy-800">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        {/* Remaining Buffer */}
        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
              Remaining Buffer
            </p>
            <p
              className={`text-xl font-bold font-serif ${
                budgetSummary.remainingAmount < 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {formatINR(budgetSummary.remainingAmount)}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  budgetSummary.statusLabel === 'Safe'
                    ? 'bg-emerald-100 text-emerald-800'
                    : budgetSummary.statusLabel === 'Near Limit'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {budgetSummary.statusLabel} ({budgetSummary.utilizationPercentage}%)
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Task Progress */}
        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
              Preparation Progress
            </p>
            <p className="text-xl font-bold font-serif text-plum-950">
              {taskProgress}% Done
            </p>
            <p className="text-[11px] text-plum-600">
              {completedTasks} of {tasks.length} tasks completed
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-coral-50 text-coral-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          href="/dashboard/budget"
          className="p-3.5 rounded-2xl bg-white border border-plum-150 hover:border-plum-300 shadow-subtle flex flex-col items-center text-center group transition-all"
        >
          <PieChart className="w-5 h-5 text-plum-800 group-hover:scale-110 transition-transform mb-1.5" />
          <span className="text-xs font-semibold text-plum-950">Budget Planner</span>
          <span className="text-[10px] text-plum-500">Recharts & Optimizer</span>
        </Link>

        <Link
          href="/dashboard/timeline"
          className="p-3.5 rounded-2xl bg-white border border-plum-150 hover:border-plum-300 shadow-subtle flex flex-col items-center text-center group transition-all"
        >
          <Clock className="w-5 h-5 text-plum-800 group-hover:scale-110 transition-transform mb-1.5" />
          <span className="text-xs font-semibold text-plum-950">Timeline</span>
          <span className="text-[10px] text-plum-500">Countdown Tasks</span>
        </Link>

        <Link
          href="/dashboard/vendors"
          className="p-3.5 rounded-2xl bg-white border border-plum-150 hover:border-plum-300 shadow-subtle flex flex-col items-center text-center group transition-all"
        >
          <Users className="w-5 h-5 text-plum-800 group-hover:scale-110 transition-transform mb-1.5" />
          <span className="text-xs font-semibold text-plum-950">Vendors</span>
          <span className="text-[10px] text-plum-500">Directory & Quotes</span>
        </Link>

        <Link
          href="/dashboard/emergency"
          className="p-3.5 rounded-2xl bg-coral-50/80 border border-coral-200 hover:border-coral-400 shadow-subtle flex flex-col items-center text-center group transition-all"
        >
          <LifeBuoy className="w-5 h-5 text-coral-600 group-hover:scale-110 transition-transform mb-1.5" />
          <span className="text-xs font-bold text-coral-700">Emergency</span>
          <span className="text-[10px] text-coral-600">Simulate & Resolve</span>
        </Link>

        <Link
          href="/dashboard/inspiration"
          className="p-3.5 rounded-2xl bg-white border border-plum-150 hover:border-plum-300 shadow-subtle flex flex-col items-center text-center group transition-all"
        >
          <Sparkles className="w-5 h-5 text-gold-600 group-hover:scale-110 transition-transform mb-1.5" />
          <span className="text-xs font-semibold text-plum-950">Inspiration</span>
          <span className="text-[10px] text-plum-500">Cultural Themes</span>
        </Link>

        <Link
          href="/dashboard/assistant"
          className="p-3.5 rounded-2xl bg-white border border-plum-150 hover:border-plum-300 shadow-subtle flex flex-col items-center text-center group transition-all"
        >
          <MessageSquare className="w-5 h-5 text-plum-800 group-hover:scale-110 transition-transform mb-1.5" />
          <span className="text-xs font-semibold text-plum-950">AI Assistant</span>
          <span className="text-[10px] text-plum-500">Event Grounded Chat</span>
        </Link>
      </div>

      {/* Main AI Plan Section (Core Requirement 6) */}
      {plan ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-burgundy-800 uppercase tracking-wider">
                Gemini Master Plan
              </span>
              <h2 className="text-2xl font-serif font-bold text-plum-950">
                AI Event Blueprint & Strategy
              </h2>
            </div>
            <span className="text-xs text-plum-500">
              Generated: {new Date(plan.generatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* A. Overview & Concept */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-plum-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-plum-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>A. Planning Approach & Core Concept</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-plum-950">
              "{plan.overview?.concept}"
            </h3>
            <p className="text-sm text-plum-700 leading-relaxed">
              {plan.overview?.approach}
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-plum-900 mb-2">Main Strategic Priorities:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plan.overview?.mainPriorities?.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-ivory-100/70 border border-plum-150 text-xs font-medium text-plum-900 flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-plum-800 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* B & C: Theme and Catering */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* B. Theme and Decoration */}
            <div className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-plum-800 uppercase tracking-wider">
                  <Palette className="w-4 h-4 text-coral-600" />
                  <span>B. Theme & Decoration Concepts</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-plum-950">
                  {plan.themeAndDecor?.theme}
                </h3>
                <p className="text-xs text-plum-600 leading-relaxed">
                  {plan.themeAndDecor?.stageVenueConcepts}
                </p>

                <div>
                  <p className="text-xs font-bold text-plum-900 mb-2">Color Palette:</p>
                  <div className="flex flex-wrap gap-2.5">
                    {plan.themeAndDecor?.colorPalette?.map((col, idx) => {
                      const colorObj = parseColorItem(col);
                      return (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-plum-200 shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: colorObj.hex }}
                            title={colorObj.hex}
                          />
                          <span className="text-xs font-semibold text-plum-950">
                            {colorObj.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-plum-900 mb-1.5">Decor Elements:</p>
                  <ul className="space-y-1.5 text-xs text-plum-700">
                    {plan.themeAndDecor?.decorationIdeas?.map((idea, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 inline-block mt-1.5 flex-shrink-0" />
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* C. Catering */}
            <div className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-plum-800 uppercase tracking-wider">
                    <Utensils className="w-4 h-4 text-gold-600" />
                    <span>C. Catering & Culinary Hospitality</span>
                  </div>
                  <span className="text-xs font-bold text-burgundy-900 bg-burgundy-50 px-2.5 py-0.5 rounded-full border border-burgundy-200">
                    Est: {formatINR(plan.catering?.estimatedCost || 0)}
                  </span>
                </div>

                <p className="text-xs text-plum-700">
                  {plan.catering?.suggestions}
                </p>

                <div>
                  <p className="text-xs font-bold text-plum-900 mb-1.5">Signature Menu Highlights:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {plan.catering?.menuHighlights?.map((dish, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-ivory-100/70 border border-plum-150 text-xs text-plum-900 flex items-center gap-2"
                      >
                        <Utensils className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                        <span className="truncate">{dish}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-plum-50/70 border border-plum-150 text-xs text-plum-800">
                  <strong>Dietary Separation:</strong> {plan.catering?.vegNonVegAlternatives}
                </div>
              </div>
            </div>
          </div>

          {/* D & E: Entertainment and Logistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* D. Entertainment */}
            <div className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-plum-800 uppercase tracking-wider">
                <Music className="w-4 h-4 text-plum-700" />
                <span>D. Entertainment & Guest Engagement</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-plum-900">Music & Performance Options:</p>
                <div className="flex flex-wrap gap-2">
                  {plan.entertainment?.options?.map((opt, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium bg-plum-50 border border-plum-200 text-plum-900"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-plum-900 mb-1.5">Activities & Engagement:</p>
                <ul className="space-y-1.5 text-xs text-plum-700">
                  {plan.entertainment?.guestEngagementIdeas?.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-coral-500 inline-block mt-1.5 flex-shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* E. Logistics */}
            <div className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-plum-800 uppercase tracking-wider">
                <Truck className="w-4 h-4 text-plum-700" />
                <span>E. Logistics & Accessibility</span>
              </div>
              <div className="space-y-2.5 text-xs text-plum-700">
                <p>
                  <strong className="text-plum-900">Seating Blueprint:</strong>{' '}
                  {plan.logistics?.seatingArrangements}
                </p>
                <p>
                  <strong className="text-plum-900">Guest Hospitality:</strong>{' '}
                  {plan.logistics?.guestManagement}
                </p>
                <p>
                  <strong className="text-plum-900">Valet & Transportation:</strong>{' '}
                  {plan.logistics?.transportation}
                </p>
                <p>
                  <strong className="text-plum-900">Accessibility for Elders:</strong>{' '}
                  {plan.logistics?.accessibility}
                </p>
              </div>
            </div>
          </div>

          {/* F & G: Budget Distribution Table & Cultural Recommendations */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-plum-200 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-plum-800 uppercase tracking-wider">
                  F. Estimated Expense Distribution
                </span>
                <h3 className="text-lg font-serif font-bold text-plum-950">
                  Category-Wise Allocation Guidance
                </h3>
              </div>
              <Link
                href="/dashboard/budget"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy-800 hover:text-burgundy-950"
              >
                <span>Open Full Interactive Budget & Optimizer</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-plum-150 bg-ivory-100/50">
                    <th className="py-2.5 px-3 font-semibold text-plum-900">Category</th>
                    <th className="py-2.5 px-3 font-semibold text-plum-900">Suggested (INR)</th>
                    <th className="py-2.5 px-3 font-semibold text-plum-900">Share</th>
                    <th className="py-2.5 px-3 font-semibold text-plum-900">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-plum-100">
                  {plan.budgetDistribution?.map((dist, idx) => (
                    <tr key={idx} className="hover:bg-plum-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-plum-950">
                        {dist.categoryLabel}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-burgundy-900">
                        {formatINR(dist.suggestedAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-plum-700">{dist.percentage}%</td>
                      <td className="py-2.5 px-3 text-plum-600 max-w-xs">{dist.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Permanent Pricing Disclaimer Notice */}
            <div className="p-3.5 rounded-2xl bg-ivory-200/60 border border-plum-200 text-xs text-plum-700 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-plum-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Market Estimation Notice:</strong> {plan.disclaimer}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white border border-plum-200 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-gold-600 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-plum-950">
            No Master Plan Generated Yet
          </h3>
          <p className="text-xs text-plum-600 max-w-md mx-auto">
            Click the button below to have Gemini generate your personalized celebration blueprint.
          </p>
          <button
            onClick={handleRegeneratePlan}
            disabled={isRegenerating}
            className="px-6 py-2.5 rounded-xl bg-plum-800 text-white font-semibold text-xs shadow-card"
          >
            {isRegenerating ? 'Synthesizing...' : 'Generate Plan Now'}
          </button>
        </div>
      )}
      {/* Delete / Manage Celebration Section */}
      {activeEvent && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-coral-200/90 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-coral-50 text-coral-700 border border-coral-200">
                <AlertTriangle className="w-3.5 h-3.5 text-coral-600" />
                <span>Celebration Management</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-plum-950">
                Delete This Celebration
              </h3>
              <p className="text-xs text-plum-600 max-w-xl leading-relaxed">
                Permanently delete <strong className="text-plum-950">"{activeEvent.name}"</strong> ({formatCompactINR(activeEvent.totalBudget)}, {activeEvent.guestCount} guests). This will remove its AI master plan, budget expenses, preparation milestones, and vendor quotes.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-coral-50 hover:bg-coral-100 border border-coral-300 text-coral-700 font-semibold text-xs transition-colors self-start sm:self-auto shrink-0 shadow-subtle"
            >
              <Trash2 className="w-4 h-4 text-coral-600" />
              <span>Delete Celebration</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-elevated border border-plum-150 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-plum-950">Confirm Deletion</h3>
                <p className="text-xs text-plum-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-plum-700 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-plum-950">"{activeEvent.name}"</strong>? All associated budgets, preparation milestones, and vendor quotes will be removed.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-plum-200 text-xs font-semibold text-plum-800 hover:bg-plum-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCurrentEvent}
                className="px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-700 text-white text-xs font-semibold shadow-card transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}