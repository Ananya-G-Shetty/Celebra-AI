import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-plum-800 to-burgundy-800 flex items-center justify-center text-gold-400 shadow-plumGlow animate-bounce">
        <Sparkles className="w-6 h-6 animate-spin" />
      </div>
      <p className="font-serif font-semibold text-sm text-plum-900 tracking-wide animate-pulse">
        Loading Celebra AI...
      </p>
    </div>
  );
}
