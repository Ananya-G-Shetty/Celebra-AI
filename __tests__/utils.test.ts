import {
  formatINR,
  formatCompactINR,
  calculateBudgetSummary,
  getDaysRemaining,
  formatCelebrationDate,
  parseColorItem,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/utils';
import { ExpenseItem } from '@/types';

describe('Currency & Number Formatting Utils (formatINR & formatCompactINR)', () => {
  test('formats standard Indian rupee amounts with comma grouping', () => {
    expect(formatINR(0)).toMatch(/₹\s?0/);
    expect(formatINR(50000)).toMatch(/₹\s?50,000/);
    expect(formatINR(1500000)).toMatch(/₹\s?15,00,000/);
  });

  test('handles invalid, null, or undefined inputs gracefully', () => {
    expect(formatINR(NaN)).toBe('₹0');
    // @ts-expect-error testing runtime safety
    expect(formatINR(null)).toBe('₹0');
    // @ts-expect-error testing runtime safety
    expect(formatINR(undefined)).toBe('₹0');
  });

  test('formats compact INR for charts and metric badges', () => {
    expect(formatCompactINR(0)).toBe('₹0');
    expect(formatCompactINR(500)).toBe('₹500');
    expect(formatCompactINR(15000)).toBe('₹15.0k');
    expect(formatCompactINR(250000)).toBe('₹2.5L');
    expect(formatCompactINR(15000000)).toBe('₹1.5Cr');
    expect(formatCompactINR(-500000)).toBe('-₹5.0L');
  });
});

describe('Budget Calculation Engine (calculateBudgetSummary)', () => {
  const mockExpenses: ExpenseItem[] = [
    {
      id: 'exp-1',
      eventId: 'ev-test',
      category: 'venue',
      title: 'Banquet Hall Advance',
      estimatedAmount: 300000,
      actualAmount: 280000,
      paidAmount: 100000,
      status: 'paid',
      createdAt: '2026-11-01',
    },
    {
      id: 'exp-2',
      eventId: 'ev-test',
      category: 'catering',
      title: 'South Indian Sadhya Feast',
      estimatedAmount: 400000,
      actualAmount: 420000,
      paidAmount: 200000,
      status: 'paid',
      createdAt: '2026-11-01',
    },
  ];

  test('calculates budget metrics accurately with actual spend', () => {
    const summary = calculateBudgetSummary(1000000, mockExpenses);

    expect(summary.totalBudget).toBe(1000000);
    expect(summary.totalEstimated).toBe(700000);
    expect(summary.totalActual).toBe(700000);
    expect(summary.totalPaid).toBe(300000);
    expect(summary.remainingAmount).toBe(300000);
    expect(summary.utilizationPercentage).toBe(70);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.statusLabel).toBe('Safe');
  });

  test('detects Near Limit when utilization is 85% or higher', () => {
    const highExpenses: ExpenseItem[] = [
      {
        id: 'exp-1',
        eventId: 'ev-test',
        category: 'venue',
        title: 'Luxury Resort',
        estimatedAmount: 880000,
        actualAmount: 880000,
        paidAmount: 500000,
        status: 'paid',
        createdAt: '2026-11-01',
      },
    ];
    const summary = calculateBudgetSummary(1000000, highExpenses);
    expect(summary.utilizationPercentage).toBe(88);
    expect(summary.statusLabel).toBe('Near Limit');
    expect(summary.isOverBudget).toBe(false);
  });

  test('flags Over Budget when expenditure exceeds total budget ceiling', () => {
    const overExpenses: ExpenseItem[] = [
      {
        id: 'exp-1',
        eventId: 'ev-test',
        category: 'venue',
        title: 'Palace Booking',
        estimatedAmount: 1200000,
        actualAmount: 1250000,
        paidAmount: 600000,
        status: 'paid',
        createdAt: '2026-11-01',
      },
    ];
    const summary = calculateBudgetSummary(1000000, overExpenses);
    expect(summary.remainingAmount).toBe(-250000);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.statusLabel).toBe('Over Budget');
  });

  test('handles empty expense list safely', () => {
    const summary = calculateBudgetSummary(500000, []);
    expect(summary.totalBudget).toBe(500000);
    expect(summary.totalEstimated).toBe(0);
    expect(summary.totalActual).toBe(0);
    expect(summary.remainingAmount).toBe(500000);
    expect(summary.utilizationPercentage).toBe(0);
    expect(summary.statusLabel).toBe('Safe');
  });
});

describe('Date Utilities (getDaysRemaining & formatCelebrationDate)', () => {
  test('returns 0 when target date is empty', () => {
    expect(getDaysRemaining('')).toBe(0);
  });

  test('calculates positive days remaining for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = futureDate.toISOString().split('T')[0];
    expect(getDaysRemaining(dateStr)).toBeGreaterThanOrEqual(9);
    expect(getDaysRemaining(dateStr)).toBeLessThanOrEqual(11);
  });

  test('formats celebration date in Indian locale with month name', () => {
    expect(formatCelebrationDate('2026-12-15')).toContain('December');
    expect(formatCelebrationDate('2026-12-15')).toContain('2026');
    expect(formatCelebrationDate('')).toBe('Date TBD');
  });
});

describe('Color & Palette Parsing (parseColorItem)', () => {
  test('extracts hex and clean color name when hex code is present', () => {
    const parsed = parseColorItem('Royal Coral (#FF6F61)');
    expect(parsed.name).toBe('Royal Coral');
    expect(parsed.hex.toUpperCase()).toBe('#FF6F61');
  });

  test('resolves known Indian celebration palette names to hex values', () => {
    expect(parseColorItem('Marigold Yellow').hex).toBe('#FFA000');
    expect(parseColorItem('Deep Plum').hex).toBe('#4A154B');
    expect(parseColorItem('Warm Gold').hex).toBe('#D4AF37');
  });

  test('provides sensible fallback for empty or unknown palette item', () => {
    const fallback = parseColorItem('');
    expect(fallback.name).toBe('Accent');
    expect(fallback.hex).toBeTruthy();
  });
});

describe('Category Labels and Color Constants', () => {
  test('contains definitions for all 10 core expense categories', () => {
    const expectedCategories = [
      'venue',
      'catering',
      'decoration',
      'photography',
      'entertainment',
      'invitations',
      'clothing_makeup',
      'transportation',
      'gifts',
      'miscellaneous',
    ];
    expectedCategories.forEach((cat) => {
      // @ts-expect-error key check
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      // @ts-expect-error key check
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

