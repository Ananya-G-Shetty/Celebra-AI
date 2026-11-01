'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useEvent } from '@/components/EventContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Check,
  CheckCircle2,
  Heart,
  Gift,
  Flame,
  Home,
  HelpCircle,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { EventCategory, BudgetFlexibility } from '@/types';
import { formatINR } from '@/lib/utils';

export default function EventWizardPage() {
  const router = useRouter();
  const { setActiveEventId, refreshEvents, apiKey } = useEvent();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genStatusText, setGenStatusText] = useState<string>('Initializing AI engine...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'wedding' as EventCategory,
    date: '',
    location: '',
    guestCount: 200,
    totalBudget: 800000,
    budgetFlexibility: 'moderate' as BudgetFlexibility,
    spendingPriorities: ['catering', 'venue', 'decoration'] as string[],
    preferences: {
      themeStyle: '',
      foodPreferences: '',
      culturalPreferences: '',
      indoorOutdoor: 'indoor' as 'indoor' | 'outdoor' | 'both',
      specialRequirements: '',
    },
  });

  const categoryOptions = [
    { id: 'wedding', label: 'Wedding & Muhurtham', icon: Heart, desc: 'Rituals, Sangeet & Reception' },
    { id: 'birthday', label: 'Birthday Celebration', icon: Gift, desc: 'Kids, Milestones & Jubilees' },
    { id: 'community', label: 'Community Event / Utsav', icon: Users, desc: 'Festivals, Cultural Melas' },
    { id: 'anniversary', label: 'Anniversary', icon: Heart, desc: 'Silver, Golden & Milestones' },
    { id: 'housewarming', label: 'Gruhapravesha', icon: Home, desc: 'Traditional Housewarming & Puja' },
    { id: 'other', label: 'Other Celebration', icon: Sparkles, desc: 'Custom Gatherings & Parties' },
  ];

  const priorityOptions = [
    { id: 'catering', label: 'Catering & Food' },
    { id: 'venue', label: 'Venue & Hall' },
    { id: 'decoration', label: 'Decoration & Florals' },
    { id: 'photography', label: 'Photography & Cinema' },
    { id: 'entertainment', label: 'Music & Entertainment' },
    { id: 'clothing_makeup', label: 'Attire & Styling' },
    { id: 'gifts', label: 'Presents & Return Hampers' },
  ];

  const togglePriority = (id: string) => {
    setFormData((prev) => {
      const exists = prev.spendingPriorities.includes(id);
      if (exists) {
        return {
          ...prev,
          spendingPriorities: prev.spendingPriorities.filter((p) => p !== id),
        };
      } else {
        return {
          ...prev,
          spendingPriorities: [...prev.spendingPriorities, id],
        };
      }
    });
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrorMsg('Please enter a celebration name.');
        return false;
      }
      if (!formData.date) {
        setErrorMsg('Please select the celebration date.');
        return false;
      }
      if (!formData.location.trim()) {
        setErrorMsg('Please specify the city or venue location.');
        return false;
      }
      if (!formData.guestCount || formData.guestCount <= 0) {
        setErrorMsg('Please specify a valid guest count (at least 1).');
        return false;
      }
    } else if (step === 2) {
      if (!formData.totalBudget || formData.totalBudget <= 0) {
        setErrorMsg('Please enter a realistic celebration budget in INR (₹).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleCreateAndGenerate = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg(null);

      setGenStatusText('Saving celebration profile...');
      const createRes = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const createData = await createRes.json();

      if (!createData.success || !createData.data) {
        throw new Error(createData.error || 'Failed to create celebration profile.');
      }

      const savedEvent = createData.data;
      const eventId = savedEvent?.id;

      // Generation steps simulation for rich user UX
      setGenStatusText('Synthesizing regional cultural traditions...');
      await new Promise((r) => setTimeout(r, 600));

      setGenStatusText('Balancing INR (₹) expenditure across 9 categories...');
      await new Promise((r) => setTimeout(r, 600));

      setGenStatusText('Gemini 1.5 is drafting your master celebration plan...');
      const planRes = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          customApiKey: apiKey,
          eventData: savedEvent || { ...formData, id: eventId },
        }),
      });
      const planData = await planRes.json();

      if (!planData.success) {
        throw new Error(planData.error || 'Failed to generate AI plan.');
      }

      // Celebrate with confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4A154B', '#FF6F61', '#D4AF37', '#722F37'],
      });

      setGenStatusText('Plan completed! Redirecting to your dashboard...');
      await refreshEvents();
      setActiveEventId(eventId);

      setTimeout(() => {
        router.push('/dashboard');
      }, 900);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong while generating your plan.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full animate-fade-in">
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-coral-600 uppercase tracking-wider">
          Onboarding Wizard
        </span>
        <h1 className="text-3xl font-serif font-bold text-plum-950 mt-1">
          Plan Your Celebration in 4 Steps
        </h1>
        <p className="text-xs text-plum-600 mt-1">
          Provide your vision and let Google Gemini draft a tailored, culturally-grounded Indian event blueprint.
        </p>
      </div>

      {/* Step Indicator Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-plum-150 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-plum-800 to-coral-500 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {[
            { num: 1, title: 'Basics' },
            { num: 2, title: 'Budget' },
            { num: 3, title: 'Preferences' },
            { num: 4, title: 'Review' },
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep > s.num
                    ? 'bg-emerald-600 text-white'
                    : currentStep === s.num
                    ? 'bg-plum-800 text-gold-400 ring-4 ring-plum-150'
                    : 'bg-white border-2 border-plum-200 text-plum-400'
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 ${
                  currentStep === s.num ? 'text-plum-950 font-bold' : 'text-plum-500'
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800 font-medium animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wizard Form Container */}
      <div className="bg-white border border-plum-200 rounded-3xl p-6 sm:p-10 shadow-card">
        {/* STEP 1: Basic Event Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-serif font-bold text-plum-950">
                Step 1: Event Information
              </h2>
              <p className="text-xs text-plum-600 mt-0.5">
                Tell us the core details about your upcoming celebration.
              </p>
            </div>

            {/* Event Category Grid */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-2">
                Celebration Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoryOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.category === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: opt.id as EventCategory })}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-plum-800 bg-plum-50/70 ring-2 ring-plum-800'
                          : 'border-plum-150 bg-white hover:border-plum-300'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mb-2 ${
                          isSelected ? 'text-plum-800' : 'text-plum-400'
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold text-plum-950">{opt.label}</p>
                        <p className="text-[10px] text-plum-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-1.5">
                Celebration Name
              </label>
              <input
                type="text"
                placeholder="e.g. Smitha & Karthik's South Indian Wedding, or Aarav's 1st Birthday"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-plum-200 bg-ivory-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
              />
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-1.5">
                  Celebration Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-plum-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-plum-200 bg-ivory-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-1.5">
                  Location (City / Area)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-plum-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, Karnataka (or Indiranagar Club)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-plum-200 bg-ivory-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
                  />
                </div>
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-plum-900 uppercase tracking-wider">
                  Expected Guests
                </label>
                <span className="text-xs font-bold text-burgundy-800">
                  {formData.guestCount} Attendees
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                step="10"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                className="w-full accent-plum-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-plum-500 mt-1">
                <span>10 (Intimate)</span>
                <span>250 (Medium)</span>
                <span>500 (Traditional)</span>
                <span>2,000+ (Grand Mela)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Budget Management */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-serif font-bold text-plum-950">
                Step 2: Budget & Spending Priorities
              </h2>
              <p className="text-xs text-plum-600 mt-0.5">
                Every calculation in Celebra AI operates strictly in Indian Rupees (INR - ₹).
              </p>
            </div>

            {/* Total Budget Input */}
            <div className="p-5 rounded-2xl bg-ivory-100/70 border border-plum-200 space-y-3">
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider">
                Total Available Budget (INR)
              </label>
              <div className="relative">
                <span className="text-base font-bold text-plum-600 absolute left-4 top-3.5">
                  ₹
                </span>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-plum-200 bg-white text-lg font-bold text-plum-950 focus:outline-none focus:ring-2 focus:ring-plum-700"
                />
              </div>
              <p className="text-xs font-semibold text-burgundy-800">
                Formatted: {formatINR(formData.totalBudget)}
              </p>
            </div>

            {/* Budget Flexibility */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-2">
                Budget Flexibility
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'strict', label: 'Strict Ceiling', desc: 'Zero tolerance for overages' },
                  { id: 'moderate', label: 'Moderate (±10%)', desc: 'Willing to buffer for quality' },
                  { id: 'flexible', label: 'Flexible', desc: 'Focus on exceptional experience' },
                ].map((flex) => (
                  <button
                    key={flex.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, budgetFlexibility: flex.id as BudgetFlexibility })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      formData.budgetFlexibility === flex.id
                        ? 'border-plum-800 bg-plum-50 ring-2 ring-plum-800'
                        : 'border-plum-150 bg-white hover:border-plum-300'
                    }`}
                  >
                    <p className="text-xs font-bold text-plum-950">{flex.label}</p>
                    <p className="text-[10px] text-plum-500 mt-0.5">{flex.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Spending Priorities */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-2">
                Preferred Spending Priorities (Select Top 2-4)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {priorityOptions.map((p) => {
                  const isChecked = formData.spendingPriorities.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePriority(p.id)}
                      className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-plum-800 bg-plum-100/60 text-plum-950 font-semibold'
                          : 'border-plum-150 bg-white text-plum-700 hover:bg-ivory-50'
                      }`}
                    >
                      <span>{p.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-plum-800" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Preferences & Cultural Details */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-serif font-bold text-plum-950">
                Step 3: Cultural Nuances & Preferences
              </h2>
              <p className="text-xs text-plum-600 mt-0.5">
                Help Gemini personalize your theme, menu, and logistics with authentic Indian cultural intelligence.
              </p>
            </div>

            {/* Theme & Style */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-1.5">
                Theme and Style
              </label>
              <input
                type="text"
                placeholder="e.g. Traditional Heritage Temple Mandap with natural marigold & jasmine, or Minimalist Pastel Boho"
                value={formData.preferences.themeStyle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, themeStyle: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-plum-200 bg-ivory-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
              />
            </div>

            {/* Food Preferences */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-1.5">
                Food & Catering Preferences
              </label>
              <input
                type="text"
                placeholder="e.g. Authentic Karnataka Sadhya on Plantain Leaf, Live Dosa & Chaat counters, Sattvic Pure Veg, or Multi-cuisine"
                value={formData.preferences.foodPreferences}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, foodPreferences: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-plum-200 bg-ivory-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
              />
            </div>

            {/* Cultural Traditions */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-1.5">
                Cultural & Regional Customs
              </label>
              <input
                type="text"
                placeholder="e.g. South Indian Brahmin-Kannadiga Muhurtham, Punjabi Sangeet, Modern Fusion, or Eco-Friendly"
                value={formData.preferences.culturalPreferences}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, culturalPreferences: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-plum-200 bg-ivory-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
              />
            </div>

            {/* Indoor vs Outdoor */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-2">
                Setting (Indoor / Outdoor)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'indoor', label: 'Indoor Hall / Banquet' },
                  { id: 'outdoor', label: 'Open-Air Lawn / Courtyard' },
                  { id: 'both', label: 'Both (Lawn & Mandap Hall)' },
                ].map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          indoorOutdoor: set.id as any,
                        },
                      })
                    }
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.preferences.indoorOutdoor === set.id
                        ? 'border-plum-800 bg-plum-50 text-plum-950 ring-2 ring-plum-800'
                        : 'border-plum-150 bg-white text-plum-700 hover:border-plum-300'
                    }`}
                  >
                    {set.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-xs font-semibold text-plum-900 uppercase tracking-wider mb-1.5">
                Special Requirements or Sensitivities
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Wheelchair ramp needed for grandparents, no single-use plastic, Channapatna wooden toy return gifts, Nadaswaram troupe at 6:30 AM"
                value={formData.preferences.specialRequirements}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      specialRequirements: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-plum-200 bg-ivory-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Review and AI Generation */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-serif font-bold text-plum-950">
                Step 4: Review & Generate Celebration Plan
              </h2>
              <p className="text-xs text-plum-600 mt-0.5">
                Verify your celebration inputs. When ready, click below to have Google Gemini engineer your personalized master plan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-ivory-100/70 border border-plum-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-plum-500 uppercase tracking-wider">
                    Basic Info
                  </span>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-plum-800 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-base font-bold text-plum-950">{formData.name}</p>
                <p className="text-xs text-plum-700 capitalize">
                  Category: {formData.category} | {formData.guestCount} Guests
                </p>
                <p className="text-xs text-plum-600">
                  {formData.date} | {formData.location}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-ivory-100/70 border border-plum-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-plum-500 uppercase tracking-wider">
                    Budget (INR)
                  </span>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-semibold text-plum-800 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xl font-bold font-serif text-burgundy-900">
                  {formatINR(formData.totalBudget)}
                </p>
                <p className="text-xs text-plum-700 capitalize">
                  Flexibility: {formData.budgetFlexibility}
                </p>
                <p className="text-xs text-plum-600 truncate">
                  Priorities: {formData.spendingPriorities.join(', ')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-ivory-100/70 border border-plum-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-plum-500 uppercase tracking-wider">
                  Cultural Context & Preferences
                </span>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-semibold text-plum-800 hover:underline"
                >
                  Edit
                </button>
              </div>
              <p className="text-xs text-plum-800">
                <strong>Theme:</strong> {formData.preferences.themeStyle || 'Traditional and elegant'}
              </p>
              <p className="text-xs text-plum-800">
                <strong>Catering:</strong> {formData.preferences.foodPreferences || 'Regional Indian feast'}
              </p>
              <p className="text-xs text-plum-800">
                <strong>Tradition:</strong> {formData.preferences.culturalPreferences || 'Authentic regional customs'}
              </p>
              <p className="text-xs text-plum-800 capitalize">
                <strong>Setting:</strong> {formData.preferences.indoorOutdoor}
              </p>
            </div>

            {/* AI Generator Notice */}
            <div className="p-4 rounded-2xl bg-plum-50 border border-plum-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-plum-800 space-y-1">
                <p className="font-semibold text-plum-950">
                  What Gemini Generates Next:
                </p>
                <p className="text-plum-700 leading-relaxed">
                  A structured JSON plan breaking down themes, stage designs, banana-leaf/buffet menus, entertainment, seating logistics, and 9-category INR budget distribution, plus initial countdown milestones!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-plum-150 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-plum-200 text-plum-800 text-xs font-semibold hover:bg-ivory-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-3 rounded-xl bg-plum-800 hover:bg-plum-900 text-white text-xs font-semibold shadow-card transition-all flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleCreateAndGenerate}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-plum-800 via-burgundy-800 to-plum-900 text-white text-sm font-bold shadow-card hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-gold-400" />
                  <span>{genStatusText}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Generate AI Celebration Blueprint</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
