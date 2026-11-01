'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime exception for diagnostics
    if (process.env.NODE_ENV === 'development') {
      console.warn('Celebra AI Client Boundary caught an error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-ivory-50 border border-plum-200 rounded-3xl p-8 text-center shadow-card space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-burgundy-50 border border-burgundy-200 flex items-center justify-center text-burgundy-700">
          <AlertTriangle className="w-8 h-8 text-burgundy-700" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-plum-950">
            Something went wrong
          </h2>
          <p className="text-sm text-plum-700 leading-relaxed">
            {error.message || 'An unexpected error occurred while rendering the celebration planner.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-plum-800 to-burgundy-800 text-white text-xs font-semibold shadow-card hover:opacity-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-plum-200 bg-white text-plum-800 text-xs font-semibold hover:bg-plum-50 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
