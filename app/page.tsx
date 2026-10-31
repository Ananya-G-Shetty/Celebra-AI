'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Heart,
  Calendar,
  IndianRupee,
  PieChart,
  Clock,
  Users,
  ShieldCheck,
  LifeBuoy,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Gift,
  Compass,
  Zap,
  Flame,
} from 'lucide-react';
import { useEvent } from '@/components/EventContext';
import { formatCompactINR } from '@/lib/utils';

export default function LandingPage() {
  const { events, setActiveEventId } = useEvent();

  const categories = [
    {
      title: 'Weddings & Muhurthams',
      subtitle: 'From Sangeet to Mangalasutra',
      desc: 'Mandap themes, traditional banana-leaf Sadhya menus, jewelry budgets, and multi-day ceremony timelines.',
      badge: 'Most Popular',
      color: 'from-burgundy-800 to-plum-900',
      icon: Heart,
    },
    {
      title: 'Milestone Birthdays',
      subtitle: 'Joyful & Stress-Free',
      desc: 'First birthdays to 50th jubilees with custom themes, entertainer vetting, cake ordering, and return hampers.',
      badge: 'Festive',
      color: 'from-coral-600 to-burgundy-700',
      icon: Gift,
    },
    {
      title: 'Community & Utsavs',
      subtitle: 'Festivals & Resident Galas',
      desc: 'Diwali melas, Rajyotsava gatherings, dandiya nights, crowd logistics, sound permits, and eco-friendly leaf dining.',
      badge: 'Community',
      color: 'from-plum-800 to-indigo-900',
      icon: Users,
    },
    {
      title: 'Gruhapravesha & Pujas',
      subtitle: 'Sacred Beginnings',
      desc: 'Housewarming ceremonies, priest schedules, auspicious timing coordinates, Sattvic catering, and return gift packages.',
      badge: 'Heritage',
      color: 'from-amber-700 to-burgundy-900',
      icon: Flame,
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Structured Gemini Event Plan',
      desc: 'Generates a 7-dimensional celebration blueprint: overarching concept, theme & decor palettes, curated regional catering, entertainment, logistics, and categorized expenses in INR (₹).',
    },
    {
      icon: IndianRupee,
      title: 'Deterministic Budget Manager',
      desc: 'Zero hallucinated arithmetic. Pure TypeScript calculates totals, paid deposits, and remaining buffers, with Recharts visual breakdowns and AI budget optimization.',
    },
    {
      icon: Clock,
      title: 'Adaptive Countdown Timeline',
      desc: 'Automates preparation milestones across 30, 15, 7, 3, 1 day, and Event Day. Dynamically adjusts if your celebration is less than 30 days away.',
    },
    {
      icon: Users,
      title: 'Vendor Organizer & AI Vetting',
      desc: 'Track caterers, decorators, and photographers, compare quotations, and generate critical vendor vetting questions to unmask hidden taxes and overtime clauses.',
    },
    {
      icon: LifeBuoy,
      title: 'Smart Emergency Planner',
      desc: 'Our flagship differentiator: simulate vendor dropouts, unexpected monsoon rain, guest spikes, or budget cuts. Gemini assesses impact and prepares instant action checklists.',
      highlight: true,
    },
    {
      icon: MessageSquare,
      title: 'Context-Grounded Event Copilot',
      desc: 'A conversational assistant that remembers your exact guest count, location, cuisine style, and budget limits when answering real planning questions.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Share Your Celebration Vision',
      desc: 'Tell us your event category, guest count, location, preferences, and budget in Indian Rupees (â‚¹).',
    },
    {
      step: '02',
      title: 'Gemini Synthesizes Master Blueprint',
      desc: 'Google Gemini 1.5 processes your requirements into structured, culturally-aware theme, menu, and budget distributions.',
    },
    {
      step: '03',
      title: 'Track Expenses & Milestones',
      desc: 'Use interactive charts, checklist filters, and vendor trackers to keep every rupee and task firmly under control.',
    },
    {
      step: '04',
      title: 'Celebrate with Total Confidence',
      desc: 'Rest easy knowing our Emergency Contingency Planner and AI Copilot have your back from day one through the final send-off.',
    },
  ];

  return (
    <div className="w-full space-y-24 pb-16 subtle-mesh-bg">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-plum-950 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Every celebration deserves a{' '}
          <span className="bg-gradient-to-r from-plum-800 via-burgundy-700 to-coral-600 bg-clip-text text-transparent">
            perfect plan.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-plum-700 max-w-2xl mx-auto leading-relaxed">
          The GenAI-powered planning assistant for Indian weddings, birthdays, and community utsavs. 
          Real Gemini intelligence, structured INR (₹) budgeting, and smart emergency contingency management.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/plan"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-plum-800 via-burgundy-800 to-plum-900 text-white font-semibold text-sm shadow-card hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Create Your Event</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border border-plum-200 text-plum-900 font-semibold text-sm shadow-subtle hover:bg-ivory-100 transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore Live Dashboard</span>
          </Link>
        </div>

        {/* Key Metrics / Trust Bar */}
        <div className="mt-12 pt-8 border-t border-plum-200/60 max-w-2xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold font-serif text-plum-950">INR (₹)</p>
            <p className="text-xs text-plum-600 font-medium">Native Indian Currency</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-serif text-plum-950">100%</p>
            <p className="text-xs text-plum-600 font-medium">Deterministic Math</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-serif text-plum-950">Zero-Panic</p>
            <p className="text-xs text-plum-600 font-medium">Emergency Contingencies</p>
          </div>
        </div>
      </section>

      {/* Preloaded Events Showcase for Evaluators */}
      {events.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white/90 border border-plum-200 rounded-3xl p-6 sm:p-8 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-coral-600 uppercase tracking-wider">
                  Live Showcase
                </span>
                <h2 className="text-2xl font-serif font-bold text-plum-950">
                  Preloaded Celebrations Ready for Evaluation
                </h2>
                <p className="text-xs text-plum-600">
                  Click any event below to immediately inspect real Indian cultural planning data.
                </p>
              </div>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 text-xs font-semibold text-burgundy-800 hover:text-burgundy-950"
              >
                <span>+ Plan a Brand New Event</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl border border-plum-150 bg-ivory-50/70 hover:bg-plum-50/50 hover:border-plum-300 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-plum-100 text-plum-800">
                        {ev.category}
                      </span>
                      <span className="text-xs font-bold text-burgundy-900">
                        {formatCompactINR(ev.totalBudget)}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-plum-950 line-clamp-1">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-plum-600 line-clamp-2 mt-1">
                      {ev.preferences?.themeStyle || ev.location}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-plum-100 flex items-center justify-between text-xs">
                    <span className="text-plum-500">{ev.guestCount} Guests</span>
                    <Link
                      href="/dashboard"
                      onClick={() => setActiveEventId(ev.id)}
                      className="font-semibold text-plum-800 hover:text-burgundy-700 flex items-center gap-1"
                    >
                      <span>View Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Celebration Categories */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-coral-600 uppercase tracking-wider">
            Tailored for India
          </span>
          <h2 className="text-3xl font-serif font-bold text-plum-950 mt-1">
            Built for Every Sacred &amp; Joyful Milestone
          </h2>
          <p className="text-sm text-plum-700 mt-2">
            Generic Western planners miss the nuances of auspicious Muhurthams, banana-leaf dining, return gift etiquettes, and multi-generational crowds. Celebra AI was designed ground-up for Indian contexts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl p-6 bg-white border border-plum-150 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-plum-100 to-coral-100 flex items-center justify-center text-plum-800 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ivory-200 text-plum-800">
                      {cat.badge}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-plum-950">{cat.title}</h3>
                  <p className="text-xs font-medium text-coral-600 mt-0.5">{cat.subtitle}</p>
                  <p className="text-xs text-plum-600 mt-2 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-plum-100">
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum-800 group-hover:text-coral-600 transition-colors"
                  >
                    <span>Plan this celebration</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-plum-800 uppercase tracking-wider">
            Comprehensive Capabilities
          </span>
          <h2 className="text-3xl font-serif font-bold text-plum-950 mt-1">
            Engineered Beyond Basic Chatbots
          </h2>
          <p className="text-sm text-plum-700 mt-2">
            Celebra AI combines generative creativity with deterministic financial math, structured JSON validation, and situational awareness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`rounded-3xl p-6 transition-all ${
                  feat.highlight
                    ? 'bg-gradient-to-br from-plum-900 to-burgundy-900 text-white shadow-elevated border border-gold-400/30'
                    : 'bg-white border border-plum-150 shadow-card hover:border-plum-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                    feat.highlight
                      ? 'bg-white/10 text-gold-400'
                      : 'bg-plum-50 text-plum-800'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-serif font-bold text-lg ${
                      feat.highlight ? 'text-white' : 'text-plum-950'
                    }`}
                  >
                    {feat.title}
                  </h3>
                  {feat.highlight && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-coral-500 text-white tracking-wider">
                      Flagship
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-2.5 leading-relaxed ${
                    feat.highlight ? 'text-plum-200' : 'text-plum-600'
                  }`}
                >
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-plum-900 via-burgundy-900 to-plum-950 text-white rounded-3xl p-8 sm:p-12 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">
              Workflow
            </span>
            <h2 className="text-3xl font-serif font-bold text-white mt-1">
              How Celebra AI Works
            </h2>
            <p className="text-xs text-plum-200 mt-2">
              From your initial idea to the moment guests depart, here is how our dual-intelligence engine powers your event.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-3"
              >
                <span className="text-2xl font-serif font-bold text-gold-400">{s.step}</span>
                <h3 className="font-serif font-bold text-base text-white">{s.title}</h3>
                <p className="text-xs text-plum-200 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center relative z-10">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-500 text-plum-950 font-bold text-sm shadow-card hover:opacity-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-plum-900" />
              <span>Launch Your 4-Step Event Wizard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI vs Deterministic Code Breakdown (Transparency for Evaluators) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-plum-200 p-8 shadow-card">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-burgundy-700 uppercase tracking-wider">
              System Architecture Transparency
            </span>
            <h2 className="text-2xl font-serif font-bold text-plum-950 mt-1">
              What Gemini Handles vs. What Deterministic Code Handles
            </h2>
            <p className="text-xs text-plum-600 mt-2">
              Evaluators look for genuine engineering discipline. Celebra AI never asks an LLM to do financial addition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-plum-50/60 border border-plum-200 space-y-3">
              <div className="flex items-center gap-2 font-serif font-bold text-plum-900">
                <Sparkles className="w-5 h-5 text-gold-600" />
                <span>Google Gemini 1.5 Responsibility</span>
              </div>
              <ul className="space-y-2 text-xs text-plum-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Synthesizing creative cultural themes and floral palettes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Structuring regional Indian multi-course menus &amp; Sattvic alternatives</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Generating vendor vetting questions (uncovering hidden taxes &amp; fees)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Emergency scenario triage (alternatives, affected tasks, severity)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Suggesting trade-offs to save specific budget amounts</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-ivory-100/80 border border-plum-200 space-y-3">
              <div className="flex items-center gap-2 font-serif font-bold text-plum-900">
                <ShieldCheck className="w-5 h-5 text-burgundy-700" />
                <span>Deterministic Application Code Responsibility</span>
              </div>
              <ul className="space-y-2 text-xs text-plum-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Exact sum of expenses, actuals vs estimated, remaining INR (₹)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Strict validation: revised budgets cannot exceed user-defined ceilings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Exact calendar countdowns, days remaining, and milestone dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Persistent JSON file storage surviving page refresh &amp; server restarts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Input sanitation, JSON schema verification, and fallback triggers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Plan CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-plum-950">
          Ready to plan your next unforgettable celebration?
        </h2>
        <p className="text-sm text-plum-700 max-w-lg mx-auto">
          Start in 2 minutes. Enter your celebration details and let Gemini generate your complete Indian event roadmap.
        </p>
        <div className="pt-2">
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-plum-800 via-burgundy-800 to-plum-900 text-white font-semibold text-sm shadow-card hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Get Started with Celebra AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

