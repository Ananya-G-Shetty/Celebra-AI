'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEvent } from '@/components/EventContext';
import {
  Compass,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Tag,
  Palette,
  Utensils,
  Gift,
  Heart,
  Leaf,
  Layers,
  Check,
  Send,
  Trash2,
} from 'lucide-react';
import { SavedInspiration } from '@/types';

export default function InspirationPage() {
  const { activeEvent, activeEventId } = useEvent();

  const [savedIdeas, setSavedIdeas] = useState<SavedInspiration[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchInspirations = useCallback(async () => {
    if (!activeEventId) return;
    try {
      const res = await fetch(`/api/inspiration?eventId=${activeEventId}`);
      const data = await res.json();
      if (data.success) {
        setSavedIdeas(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [activeEventId]);

  useEffect(() => {
    fetchInspirations();
  }, [fetchInspirations]);

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-plum-700">Please select or create an event first.</p>
      </div>
    );
  }

  // Curated Cultural Indian Ideas Catalog tailored to current celebration
  const curatedIdeas = [
    {
      title: 'Brass Urli & Floating Fragrant Tuberose Entrance',
      category: 'Decoration',
      description:
        'Arrange three stepped antique brass urlis at the foyer filled with water, orange marigolds, and floating fragrant Mysore jasmine with warm brass diyas.',
      culturalContext: 'Traditional Mangala welcome symbolizing auspicious flow, purity, and sensory warmth.',
      tags: ['Auspicious', 'Florals', 'Eco-friendly', 'South Indian'],
    },
    {
      title: 'Interactive Live Mysore Pak & Obbattu (Holige) Tawa',
      category: 'Catering',
      description:
        'Live live counter where fresh Bele Holige (sweet puran poli) is roasted with pure desi ghee, served alongside steaming brass filter coffee in traditional davarah-tumblers.',
      culturalContext: 'Celebrates authentic Karnataka culinary hospitality with interactive theatrical aroma.',
      tags: ['Karnataka', 'Sweets', 'Crowd Pleaser', 'Interactive'],
    },
    {
      title: 'Channapatna Lacquer Wooden Toy Return Hampers',
      category: 'Gifts',
      description:
        'Curated eco-jute gift hampers containing artisan-crafted Channapatna wooden figurines, roasted organic cashews, and a packet of plantable marigold seed paper.',
      culturalContext: 'Supports local GI-tagged Karnataka handicrafts; zero-plastic sustainable return blessing.',
      tags: ['GI Tagged', 'Sustainable', 'Handicraft', 'Memorable'],
    },
    {
      title: 'Botanical WhatsApp Video Invite with Google Maps Pin',
      category: 'Invitations',
      description:
        'A 20-second animated video invite featuring Carnatic flute score, customized watercolor illustrations of the couple/host, and an interactive Google Maps RSVP pin.',
      culturalContext: 'Saves ₹25,000 in paper printing and courier logistics while providing seamless navigation for outstation guests.',
      tags: ['Digital First', 'Cost Saving', 'Interactive', 'Eco-friendly'],
    },
    {
      title: 'Acoustic Violin & Bamboo Flute Sunset Raga Jugalbandi',
      category: 'Entertainment',
      description:
        'A gentle, non-intrusive 90-minute classical jugalbandi playing ragas like Kalyani and Hamsadhwani as sunset approaches during high tea.',
      culturalContext: 'Elevates atmosphere without overwhelming conversations between elder family members.',
      tags: ['Classical', 'Soulful', 'Acoustic', 'Reception'],
    },
    {
      title: 'Eco-Friendly Clay Diya Lighting Ceremony by Guests',
      category: 'Decoration',
      description:
        'Provide each arriving guest with a small handmade terracotta diya to light and place around a central stone lotus pool before taking their seat.',
      culturalContext: 'Invokes community blessings and collective participation in sanctifying the celebration ground.',
      tags: ['Interactive', 'Spiritual', 'Terracotta', 'Community'],
    },
    {
      title: 'Toddler Sensory Play & Wooden Block Corner',
      category: 'Activities',
      description:
        'A designated soft carpet area with non-toxic wooden blocks, folk animal coloring sheets, and an attendant so parents can enjoy dinner comfortably.',
      culturalContext: 'Thoughtful family-first hospitality ensuring kids and parents are both cared for.',
      tags: ['Kid Friendly', 'Hospitality', 'Stress Free'],
    },
    {
      title: 'Traditional Banana Leaf Etiquette & Course Guide Signage',
      category: 'Catering',
      description:
        'A beautifully lettered wooden board illustrating the auspicious placement of salt, pickle, Kosambari, Palya, Payasa, and Rasam on the banana leaf.',
      culturalContext: 'Delights outstation and younger guests with authentic Vedic culinary knowledge.',
      tags: ['Cultural Heritage', 'Educational', 'Authentic'],
    },
  ];

  const handleToggleSave = async (idea: any) => {
    const isSaved = savedIdeas.some((s) => s.title === idea.title);
    if (isSaved) {
      const existing = savedIdeas.find((s) => s.title === idea.title);
      if (existing) {
        await fetch(`/api/inspiration?id=${existing.id}`, { method: 'DELETE' });
        fetchInspirations();
      }
    } else {
      await fetch('/api/inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          title: idea.title,
          category: idea.category,
          description: idea.description,
          culturalContext: idea.culturalContext,
          tags: idea.tags,
        }),
      });
      fetchInspirations();
    }
  };

  const filteredIdeas = curatedIdeas.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-burgundy-800 uppercase tracking-wider">
            AI-Powered Inspiration & Cultural Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 mt-1">
            Celebration Ideas & Themes
          </h1>
          <p className="text-xs text-plum-600 mt-0.5">
            Tailored for <strong>{activeEvent.name}</strong> ({activeEvent.category} in {activeEvent.location}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-plum-800 bg-plum-50 px-3 py-1.5 rounded-xl border border-plum-200">
            {savedIdeas.length} Saved Ideas
          </span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-plum-150 shadow-subtle text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'Decoration', 'Catering', 'Gifts', 'Invitations', 'Entertainment', 'Activities'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-plum-800 text-white'
                    : 'bg-ivory-100 text-plum-700 hover:bg-plum-100'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <input
          type="text"
          placeholder="Search themes, foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-60 px-3 py-1.5 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
        />
      </div>

      {/* Saved Ideas Strip (if any) */}
      {savedIdeas.length > 0 && (
        <div className="p-5 rounded-3xl bg-ivory-100 border border-plum-200 space-y-3">
          <h3 className="font-serif font-bold text-sm text-plum-950 flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-burgundy-800" />
            <span>Saved to This Celebration's Moodboard ({savedIdeas.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedIdeas.map((saved) => (
              <div
                key={saved.id}
                className="p-3.5 rounded-2xl bg-white border border-plum-150 flex items-start justify-between gap-2 shadow-subtle"
              >
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-plum-100 text-plum-800">
                    {saved.category}
                  </span>
                  <p className="text-xs font-bold text-plum-950 mt-1 line-clamp-1">{saved.title}</p>
                  <p className="text-[10px] text-plum-600 line-clamp-2 mt-0.5">{saved.description}</p>
                </div>
                <button
                  onClick={() => handleToggleSave(saved)}
                  className="p-1 text-rose-400 hover:text-rose-600"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curated Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea, idx) => {
          const isSaved = savedIdeas.some((s) => s.title === idea.title);
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card hover:border-plum-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-plum-100 text-plum-800">
                    {idea.category}
                  </span>
                  <button
                    onClick={() => handleToggleSave(idea)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      isSaved
                        ? 'border-burgundy-700 bg-burgundy-50 text-burgundy-800'
                        : 'border-plum-150 text-plum-400 hover:text-plum-800'
                    }`}
                    title={isSaved ? 'Saved to event' : 'Save idea'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 fill-burgundy-800 text-burgundy-800" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <h3 className="font-serif font-bold text-base text-plum-950 leading-snug">
                  {idea.title}
                </h3>

                <p className="text-xs text-plum-700 leading-relaxed">{idea.description}</p>

                <div className="p-3 rounded-2xl bg-ivory-100/80 border border-plum-150 text-[11px] text-plum-800 leading-relaxed">
                  <strong className="text-burgundy-900">Cultural Significance:</strong>{' '}
                  {idea.culturalContext}
                </div>
              </div>

              {/* Tags */}
              <div className="pt-3 border-t border-plum-100 flex flex-wrap gap-1.5">
                {idea.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-plum-50 text-plum-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
