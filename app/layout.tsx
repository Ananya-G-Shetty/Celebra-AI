import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { EventProvider } from '@/components/EventContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Celebra AI — Every celebration deserves a perfect plan',
  description:
    'GenAI-powered celebration planning assistant for Indian weddings, birthdays, community utsavs, and family milestones. Features structured budgeting in INR (₹), cultural intelligence, interactive timelines, and emergency contingency planning.',
  keywords: [
    'event planner',
    'wedding planner India',
    'birthday planner',
    'community event planner',
    'Google Gemini AI',
    'Indian celebration AI',
    'budget optimizer INR',
    'Celebra AI',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col antialiased bg-ivory-50 text-plum-950 selection:bg-plum-200 selection:text-plum-900`}>
        <EventProvider>
          {/* Skip to Main Content Link for Keyboard Accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-plum-800 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-lg"
          >
            Skip to main content
          </a>

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Content Landmark */}
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </EventProvider>
      </body>
    </html>
  );
}
