import React from 'react';
import Link from 'next/link';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-ivory-50 border border-plum-200 rounded-3xl p-8 text-center shadow-card space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-plum-100 border border-plum-200 flex items-center justify-center text-plum-800">
          <Sparkles className="w-8 h-8 text-plum-800" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-burgundy-700 uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="font-serif font-bold text-2xl text-plum-950">
            Page Not Found
          </h1>
          <p className="text-sm text-plum-700 leading-relaxed">
            The celebration planning page you requested could not be found or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-plum-800 to-burgundy-800 text-white text-xs font-semibold shadow-card hover:opacity-95 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-plum-200 bg-white text-plum-800 text-xs font-semibold hover:bg-plum-50 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
