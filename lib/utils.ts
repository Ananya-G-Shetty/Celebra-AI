import { ExpenseCategory, ExpenseItem } from '@/types';

/**
 * Format an amount into Indian Rupees (INR - ₹) with standard Indian numbering format (Lakhs & Crores).
 * Example: 250000 -> "₹2,50,000"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Compact Indian currency formatter for charts and badges
 * Example: 150000 -> "₹1.5L", 12000000 -> "₹1.2Cr"
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${abs}`;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  venue: 'Venue & Hall',
  catering: 'Catering & Food',
  decoration: 'Decoration & Florals',
  photography: 'Photography & Video',
  entertainment: 'Music & Entertainment',
  invitations: 'Invitations & Gifts',
  clothing_makeup: 'Attire & Styling',
  transportation: 'Travel & Logistics',
  gifts: 'Presents & Favors',
  miscellaneous: 'Miscellaneous & Contingency',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  venue: '#4A154B', // Deep plum
  catering: '#D4AF37', // Warm gold
  decoration: '#FF6F61', // Soft coral
  photography: '#722F37', // Royal burgundy
  entertainment: '#9B51E0', // Lavender purple
  invitations: '#2E7D32', // Emerald green
  clothing_makeup: '#E91E63', // Rose blush
  transportation: '#0288D1', // Sapphire
  gifts: '#FF8F00', // Amber
  miscellaneous: '#607D8B', // Slate
};

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  remainingAmount: number;
  utilizationPercentage: number;
  isOverBudget: boolean;
  statusLabel: 'Safe' | 'Near Limit' | 'Over Budget';
}

/**
 * Deterministic budget calculation engine.
 * Never rely on LLMs for financial arithmetic.
 */
export function calculateBudgetSummary(
  totalBudget: number,
  expenses: ExpenseItem[] = []
): BudgetSummary {
  const safeBudget = Math.max(0, Number(totalBudget) || 0);

  const totalEstimated = expenses.reduce(
    (acc, item) => acc + (Number(item.estimatedAmount) || 0),
    0
  );
  const totalActual = expenses.reduce(
    (acc, item) => acc + (Number(item.actualAmount) || 0),
    0
  );
  const totalPaid = expenses.reduce(
    (acc, item) => acc + (Number(item.paidAmount) || 0),
    0
  );

  const effectiveSpent = totalActual > 0 ? totalActual : totalEstimated;
  const remainingAmount = safeBudget - effectiveSpent;
  const utilizationPercentage =
    safeBudget > 0 ? Math.min(999, Math.round((effectiveSpent / safeBudget) * 100)) : 0;

  let statusLabel: 'Safe' | 'Near Limit' | 'Over Budget' = 'Safe';
  if (remainingAmount < 0) {
    statusLabel = 'Over Budget';
  } else if (utilizationPercentage >= 85) {
    statusLabel = 'Near Limit';
  }

  return {
    totalBudget: safeBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    remainingAmount,
    utilizationPercentage,
    isOverBudget: remainingAmount < 0,
    statusLabel,
  };
}

/**
 * Calculate days remaining until the celebration date.
 */
export function getDaysRemaining(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  const now = new Date();
  // Normalize both dates to midnight
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format date nicely (e.g., "14 November 2026")
 */
export function formatCelebrationDate(dateStr: string): string {
  if (!dateStr) return 'Date TBD';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Parse a color palette entry (e.g. "Royal Coral (#FF6F61)" or "Marigold Yellow")
 * Extracts the clean human-friendly color name and resolves the actual CSS hex color.
 */
export function parseColorItem(col: string): { name: string; hex: string } {
  if (!col) return { name: 'Accent', hex: '#943C82' };

  // Match hex code if present e.g. #FF6F61 or #FFF
  const hexMatch = col.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
  const hex = hexMatch ? hexMatch[0] : null;

  // Extract clean name by stripping (#...) and #...
  let name = col
    .replace(/\(#[0-9a-fA-F]{3,6}\)/g, '')
    .replace(/#[0-9a-fA-F]{3,6}/g, '')
    .trim();

  if (!name && hex) {
    name = hex;
  }

  // Fallback map for common celebration palette names
  const colorMap: Record<string, string> = {
    coral: '#FF6F61',
    plum: '#4A154B',
    burgundy: '#722F37',
    gold: '#D4AF37',
    ivory: '#FAF7F2',
    marigold: '#FFA000',
    yellow: '#FFB300',
    pink: '#F8BBD0',
    blush: '#FCE4EC',
    lavender: '#EDE7F6',
    white: '#FFFFFF',
    red: '#D32F2F',
    green: '#388E3C',
    emerald: '#2E7D32',
    orange: '#F57C00',
    blue: '#1976D2',
    sky: '#81D4FA',
    purple: '#7B1FA2',
    teal: '#00796B',
    jasmine: '#FFF9C4',
    amber: '#FF8F00',
    rose: '#E91E63',
    champagne: '#F7E7CE',
    peach: '#FFDAB9',
    copper: '#B87333',
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    cream: '#FFFDD0',
  };

  let resolvedColor = hex;
  if (!resolvedColor) {
    const lower = name.toLowerCase();
    // Sort keys by descending length so compound words like "marigold" match before "gold"
    const sortedKeys = Object.keys(colorMap).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (lower.includes(key)) {
        resolvedColor = colorMap[key];
        break;
      }
    }
  }

  return {
    name: name || col,
    hex: resolvedColor || '#7B2A6A',
  };
}

/**
 * Safely extract an error message from an unknown thrown value.
 * Complies with strict TypeScript no-explicit-any standards.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  if (
    err !== null &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  return 'An unexpected error occurred';
}
