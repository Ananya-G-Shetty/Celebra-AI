'use client';

import React, { useState } from 'react';
import { useEvent } from '@/components/EventContext';
import {
  LifeBuoy,
  AlertTriangle,
  Sparkles,
  CloudRain,
  UserX,
  TrendingDown,
  Users,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { EmergencyResolution } from '@/types';
import { formatINR } from '@/lib/utils';

export default function EmergencyPage() {
  const { activeEvent, apiKey } = useEvent();

  const [selectedScenario, setSelectedScenario] = useState<string>('bad_weather');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolution, setResolution] = useState<EmergencyResolution | null>(null);
  const [appliedSuccessfully, setAppliedSuccessfully] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      id: 'bad_weather',
      title: 'Sudden Monsoon Rainfall on Outdoor Lawn',
      desc: 'Heavy evening downpour predicted on the open-air lawn where 350 guests are expected for the reception ceremony.',
      icon: CloudRain,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'vendor_cancellation',
      title: 'Lead Mandap Decorator Dropped Out',
      desc: 'The booked decorator notified us of equipment truck breakdown 48 hours before the Muhurtham stage setup.',
      icon: UserX,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'guest_increase',
      title: 'Unexpected 60+ Extended Family Guest Influx',
      desc: 'Extended relatives arriving with families, exceeding our caterer contract guarantee by 60 banana-leaf covers.',
      icon: Users,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'budget_reduction',
      title: 'Emergency ₹75,000 Budget Cut Needed',
      desc: 'Sudden unexpected personal expense requires trimming ₹75,000 from current uncommitted event allocations.',
      icon: TrendingDown,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'venue_unavailability',
      title: 'Banquet Hall AC / Power Generator Failure',
      desc: 'Venue management notified us that their primary DG generator failed and cannot support heavy stage spotlights.',
      icon: Building2,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      id: 'last_minute_schedule',
      title: 'Auspicious Muhurtham Shifted Earlier by 2 Hours',
      desc: 'Family astrologer advised shifting the sacred ceremony from 9:30 AM to 7:15 AM due to planetary transit.',
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-plum-700">Please select or create an event first.</p>
      </div>
    );
  }

  const handleSimulateEmergency = async () => {
    try {
      setIsResolving(true);
      setErrorMsg(null);
      setAppliedSuccessfully(false);

      let title = '';
      let description = '';

      if (selectedScenario === 'custom') {
        if (!customTitle.trim()) {
          setErrorMsg('Please enter a scenario title.');
          setIsResolving(false);
          return;
        }
        title = customTitle.trim();
        description = customDesc.trim() || customTitle;
      } else {
        const found = presets.find((p) => p.id === selectedScenario);
        title = found?.title || 'Event Emergency';
        description = found?.desc || '';
      }

      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          scenarioTitle: title,
          scenarioDescription: description,
          customApiKey: apiKey,
          applyActionTasks: false,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to simulate contingency');
      }

      setResolution(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong during contingency analysis');
    } finally {
      setIsResolving(false);
    }
  };

  const handleApplyToTimeline = async () => {
    if (!resolution) return;
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          scenarioTitle: resolution.scenarioTitle,
          scenarioDescription: resolution.summary,
          customApiKey: apiKey,
          applyActionTasks: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedSuccessfully(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-coral-100 text-coral-800 uppercase tracking-wider mb-2">
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Flagship Differentiating Capability</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950">
          Smart Emergency & Contingency Planner
        </h1>
        <p className="text-xs text-plum-600 mt-1 max-w-2xl leading-relaxed">
          Real celebrations in India face sudden monsoons, unexpected guest surges, and vendor hiccups. 
          Gemini evaluates the operational blast radius, calculates budget impact in INR (₹), and builds instant triage action items without silently overwriting your master plan.
        </p>
      </div>

      {/* Preset Scenarios Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-plum-950 uppercase tracking-wider">
          Select an Unexpected Event Disruption:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedScenario === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedScenario(p.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-coral-500 bg-coral-50/50 ring-2 ring-coral-400 shadow-card'
                    : 'border-plum-150 bg-white hover:border-plum-300 shadow-subtle'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl border ${p.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-xs text-plum-950 leading-snug">
                    {p.title}
                  </h3>
                </div>
                <p className="text-[11px] text-plum-600 line-clamp-2 leading-relaxed">{p.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Scenario Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSelectedScenario('custom')}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              selectedScenario === 'custom'
                ? 'bg-plum-800 text-white'
                : 'bg-white border-plum-200 text-plum-800 hover:bg-ivory-100'
            }`}
          >
            + Describe a Custom Unexpected Problem
          </button>
        </div>

        {selectedScenario === 'custom' && (
          <div className="p-5 rounded-2xl bg-white border border-plum-200 shadow-card space-y-3 mt-3 animate-fade-in text-xs">
            <div>
              <label className="block font-bold text-plum-950 uppercase tracking-wider mb-1">
                Incident Title
              </label>
              <input
                type="text"
                placeholder="e.g. Flight delay for immediate family or Sound permit issue"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-plum-950 uppercase tracking-wider mb-1">
                Situation Details
              </label>
              <textarea
                rows={2}
                placeholder="Explain what happened, which vendors or guests are affected..."
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-plum-200 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Trigger Button */}
      <div>
        <button
          type="button"
          disabled={isResolving}
          onClick={handleSimulateEmergency}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-coral-600 via-burgundy-700 to-plum-900 text-white text-xs font-bold shadow-card hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isResolving ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-gold-400" />
              <span>Analyzing Operational Impact with Gemini...</span>
            </>
          ) : (
            <>
              <LifeBuoy className="w-4 h-4 text-gold-300" />
              <span>Analyze Contingency Strategy & Triage Plan</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Resolution Output (Requirement 12) */}
      {resolution && (
        <div className="bg-white border border-plum-200 rounded-3xl p-6 sm:p-8 shadow-card space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-plum-150 pb-4">
            <div>
              <span className="text-[10px] font-bold text-coral-600 uppercase tracking-wider">
                Emergency Contingency Analysis
              </span>
              <h2 className="text-xl font-serif font-bold text-plum-950">
                {resolution.scenarioTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  resolution.severity === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : resolution.severity === 'moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                Severity: {resolution.severity}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-plum-100 text-plum-900">
                Budget Impact: {formatINR(resolution.estimatedBudgetImpact)}
              </span>
            </div>
          </div>

          {/* 1. Executive Assessment */}
          <div className="p-4 rounded-2xl bg-ivory-100/70 border border-plum-150 space-y-1">
            <h4 className="text-xs font-bold text-plum-950 uppercase tracking-wider">
              1. Situation Summary
            </h4>
            <p className="text-xs text-plum-800 leading-relaxed font-medium">
              {resolution.summary}
            </p>
          </div>

          {/* 2. Affected Tasks */}
          <div>
            <h4 className="text-xs font-bold text-plum-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>2. Immediately Affected Tasks / Milestones</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {resolution.affectedTasks?.map((taskName, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 font-medium"
                >
                  ⚠ {taskName}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Vetted Practical Alternatives */}
          <div>
            <h4 className="text-xs font-bold text-plum-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3. Battle-Tested Tactical Alternatives</span>
            </h4>
            <div className="space-y-2">
              {resolution.alternatives?.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-plum-200 shadow-subtle text-xs text-plum-900 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-plum-800 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{alt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Triage Checklist Tasks Generated */}
          <div>
            <h4 className="text-xs font-bold text-plum-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-plum-800" />
              <span>4. Urgent Contingency Action Checklist</span>
            </h4>
            <div className="space-y-2">
              {resolution.newActionTasks?.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-plum-50/70 border border-plum-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-xs font-bold text-plum-950">{action.title}</p>
                    <p className="text-[11px] text-plum-600 mt-0.5">{action.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase bg-rose-100 text-rose-800">
                      {action.priority} Priority
                    </span>
                    <span className="text-plum-600 font-semibold">{action.deadlineText}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Expert Indian Event Planner Advice */}
          <div className="p-4 rounded-2xl bg-plum-100/60 border border-plum-200 text-xs text-plum-900 space-y-1">
            <p className="font-bold">Senior Event Planner Insight:</p>
            <p className="leading-relaxed text-plum-800">{resolution.expertExplanation}</p>
          </div>

          {/* User Confirmation Before Applying (Requirement 12 Guardrail) */}
          <div className="p-5 rounded-2xl bg-ivory-100 border border-plum-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-plum-950">
                Confirm Contingency Application:
              </p>
              <p className="text-[11px] text-plum-600">
                Celebra AI will safely insert these urgent triage tasks into your master timeline without overwriting completed items.
              </p>
            </div>

            {appliedSuccessfully ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Urgent Tasks Added to Timeline!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApplyToTimeline}
                className="px-5 py-2.5 rounded-xl bg-plum-800 hover:bg-plum-900 text-white font-bold text-xs shadow-card transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-gold-400" />
                <span>Apply Urgent Tasks to My Timeline</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
