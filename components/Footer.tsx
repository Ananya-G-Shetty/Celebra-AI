'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, ShieldCheck, IndianRupee } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-plum-150 bg-ivory-100/80 text-plum-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-plum-800 to-burgundy-800 flex items-center justify-center text-gold-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg text-plum-950">CELEBRA AI</span>
            </div>
            <p className="text-sm font-medium text-plum-800">
              "Every celebration deserves a perfect plan."
            </p>
            <p className="text-xs text-plum-600 max-w-sm leading-relaxed">
              An intelligent GenAI-powered celebration planning platform crafted for Indian weddings, birthdays, community utsavs, and milestones. Structured budgeting in INR (₹), cultural sensitivity, and rapid emergency contingency planning.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-plum-200/60 text-plum-900">
                <Sparkles className="w-3 h-3 text-gold-600" />
                Google Build with AI | PromptWars 2026
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                INR (₹) Native
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-plum-950 uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs text-plum-700">
              <li>
                <Link href="/plan" className="hover:text-plum-950 transition-colors">
                  4-Step Event Wizard
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-plum-950 transition-colors">
                  Planning Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/budget" className="hover:text-plum-950 transition-colors">
                  Smart Budget & Optimizer
                </Link>
              </li>
              <li>
                <Link href="/dashboard/timeline" className="hover:text-plum-950 transition-colors">
                  Preparation Timeline
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vendors" className="hover:text-plum-950 transition-colors">
                  Vendor Directory & Vetting
                </Link>
              </li>
              <li>
                <Link href="/dashboard/emergency" className="text-coral-600 hover:text-coral-700 font-semibold transition-colors">
                  Emergency Scenario Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Cultural Context */}
          <div>
            <h4 className="text-xs font-bold text-plum-950 uppercase tracking-wider mb-3">
              Indian Celebrations
            </h4>
            <ul className="space-y-2 text-xs text-plum-700">
              <li>South Indian Traditional Weddings</li>
              <li>Karnataka & Regional Utsavs</li>
              <li>Milestone Birthdays & Anniversaries</li>
              <li>Eco-Friendly Community Gatherings</li>
              <li>Traditional Gruhapravesha (Housewarming)</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-plum-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-plum-500 gap-4">
          <p className="flex items-center gap-1.5 text-center sm:text-left flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span>Built with love</span>
              <Heart className="w-3.5 h-3.5 text-coral-500 fill-coral-500 shrink-0 inline-block" />
            </span>
            <span>by Ananya Shetty</span>
          </p>
          <p className="text-[11px] text-plum-400 text-center sm:text-right">
            Estimates are AI-generated based on Indian event market benchmarks. Always confirm exact supplier contracts.
          </p>
        </div>
      </div>
    </footer>
  );
}

