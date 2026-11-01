'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEvent } from '@/components/EventContext';
import {
  IndianRupee,
  PieChart as PieIcon,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  formatINR,
  formatCompactINR,
  calculateBudgetSummary,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/utils';
import { ExpenseCategory, ExpenseItem, BudgetOptimizationResult } from '@/types';

export default function BudgetPage() {
  const { activeEvent, activeEventId, apiKey } = useEvent();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'catering' as ExpenseCategory,
    estimatedAmount: 0,
    actualAmount: 0,
    paidAmount: 0,
    status: 'planned' as 'planned' | 'paid' | 'pending',
    notes: '',
  });

  // AI Optimizer State
  const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);
  const [targetSavings, setTargetSavings] = useState<number>(50000);
  const [preservedCategories, setPreservedCategories] = useState<string[]>([
    'catering',
    'photography',
  ]);
  const [optimizerNotes, setOptimizerNotes] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] =
    useState<BudgetOptimizationResult | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!activeEventId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/expenses?eventId=${activeEventId}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeEventId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const budgetSummary = useMemo(
    () => calculateBudgetSummary(activeEvent ? activeEvent.totalBudget : 0, expenses),
    [activeEvent, expenses]
  );

  // Prepare Recharts Data with memoization for optimal rendering efficiency
  const { pieData, barData } = useMemo(() => {
    const categorySpendMap: Record<string, { estimated: number; actual: number }> = {};
    Object.keys(CATEGORY_LABELS).forEach((cat) => {
      categorySpendMap[cat] = { estimated: 0, actual: 0 };
    });

    expenses.forEach((e) => {
      if (categorySpendMap[e.category]) {
        categorySpendMap[e.category].estimated += Number(e.estimatedAmount) || 0;
        categorySpendMap[e.category].actual += Number(e.actualAmount) || 0;
      }
    });

    const pie = Object.entries(categorySpendMap)
      .filter(([_, val]) => val.estimated > 0 || val.actual > 0)
      .map(([cat, val]) => ({
        name: CATEGORY_LABELS[cat as ExpenseCategory] || cat,
        value: val.actual > 0 ? val.actual : val.estimated,
        color: CATEGORY_COLORS[cat as ExpenseCategory] || '#4A154B',
      }));

    const bar = Object.entries(categorySpendMap)
      .filter(([_, val]) => val.estimated > 0 || val.actual > 0)
      .map(([cat, val]) => ({
        category: CATEGORY_LABELS[cat as ExpenseCategory] || cat,
        Estimated: val.estimated,
        Actual: val.actual,
      }));

    return { pieData: pie, barData: bar };
  }, [expenses]);

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-plum-700">Please select or create an event first.</p>
      </div>
    );
  }

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      title: '',
      category: 'catering',
      estimatedAmount: 0,
      actualAmount: 0,
      paidAmount: 0,
      status: 'planned',
      notes: '',
    });
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (item: ExpenseItem) => {
    setEditingExpense(item);
    setExpenseForm({
      title: item.title,
      category: item.category,
      estimatedAmount: item.estimatedAmount,
      actualAmount: item.actualAmount,
      paidAmount: item.paidAmount,
      status: item.status,
      notes: item.notes || '',
    });
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async () => {
    try {
      if (!expenseForm.title.trim()) {
        setErrorMsg('Please enter an expense title.');
        return;
      }

      if (editingExpense) {
        // Update
        const res = await fetch('/api/expenses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingExpense.id,
            ...expenseForm,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        // Create
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: activeEvent.id,
            ...expenseForm,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      }

      setIsExpenseModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunOptimizer = async () => {
    try {
      setIsOptimizing(true);
      setErrorMsg(null);
      const res = await fetch('/api/budget/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          targetSavings,
          preservedCategories,
          userNotes: optimizerNotes,
          customApiKey: apiKey,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to optimize budget');
      }
      setOptimizationResult(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to run AI Budget Optimizer');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimizerReallocations = async () => {
    if (!optimizationResult?.reallocations?.length) return;
    try {
      for (const realloc of optimizationResult.reallocations) {
        const existing = expenses.find((e) => e.category === realloc.category);
        if (existing) {
          await fetch('/api/expenses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: existing.id,
              estimatedAmount: realloc.revisedAmount,
              notes: `${existing.notes || ''} [AI Optimized: Saved ${formatINR(realloc.savingAmount)} - ${realloc.savingsExplanation}]`,
            }),
          });
        }
      }
      setIsOptimizerModalOpen(false);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to apply optimization:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in">
      {/* Header & Optimizer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-burgundy-800 uppercase tracking-wider">
            Deterministic Financial Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 mt-1">
            Smart Budget Management
          </h1>
          <p className="text-xs text-plum-600 mt-0.5">
            Real calculations in Indian Rupees (₹) with Recharts visualizations and Gemini savings optimizer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOptimizerModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-plum-800 to-burgundy-800 text-white text-xs font-semibold shadow-card hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>AI Budget Optimizer</span>
          </button>

          <button
            onClick={handleOpenAddExpense}
            className="px-4 py-2.5 rounded-2xl bg-white border border-plum-200 text-plum-950 text-xs font-semibold shadow-subtle hover:bg-plum-50 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-plum-800" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card">
          <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
            Total Budget
          </p>
          <p className="text-xl font-bold font-serif text-plum-950 mt-1">
            {formatINR(budgetSummary.totalBudget)}
          </p>
          <p className="text-[10px] text-plum-500 mt-1">Allocated Ceiling</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card">
          <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
            Estimated Spend
          </p>
          <p className="text-xl font-bold font-serif text-burgundy-900 mt-1">
            {formatINR(budgetSummary.totalEstimated)}
          </p>
          <p className="text-[10px] text-plum-500 mt-1">From Planned Items</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card">
          <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
            Actual Spent / Contracted
          </p>
          <p className="text-xl font-bold font-serif text-plum-900 mt-1">
            {formatINR(budgetSummary.totalActual)}
          </p>
          <p className="text-[10px] text-plum-500 mt-1">
            Advances Paid: {formatINR(budgetSummary.totalPaid)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-plum-150 shadow-card">
          <p className="text-[11px] font-semibold text-plum-500 uppercase tracking-wider">
            Remaining Buffer
          </p>
          <p
            className={`text-xl font-bold font-serif mt-1 ${
              budgetSummary.isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {formatINR(budgetSummary.remainingAmount)}
          </p>
          <span
            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              budgetSummary.statusLabel === 'Safe'
                ? 'bg-emerald-100 text-emerald-800'
                : budgetSummary.statusLabel === 'Near Limit'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {budgetSummary.statusLabel} ({budgetSummary.utilizationPercentage}%)
          </span>
        </div>
      </div>

      {/* Interactive Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Allocation Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-plum-950 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-plum-800" />
              <span>Category Share (INR)</span>
            </h3>
            <span className="text-[11px] text-plum-500 font-medium">9 Indian Categories</span>
          </div>

          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#FAF7F2',
                      borderColor: '#E4BADB',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-plum-400">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Estimated vs Actual */}
        <div className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-plum-950 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-burgundy-800" />
              <span>Estimated vs. Actual Spend</span>
            </h3>
            <span className="text-[11px] text-plum-500 font-medium">In Indian Rupees (₹)</span>
          </div>

          <div className="h-72 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: '#4A154B' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#641E55' }}
                    tickFormatter={(v) => formatCompactINR(v)}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), '']}
                    contentStyle={{
                      backgroundColor: '#FAF7F2',
                      borderColor: '#E4BADB',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                  />
                  <Bar dataKey="Estimated" fill="#D190C3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#4A154B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-plum-400">
                No expense comparisons to display
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Management Table */}
      <div className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-plum-950">
            Itemized Expense Register
          </h3>
          <span className="text-xs text-plum-500">{expenses.length} Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-plum-150 bg-ivory-100/60">
                <th className="py-3 px-3 font-semibold text-plum-900">Title & Notes</th>
                <th className="py-3 px-3 font-semibold text-plum-900">Category</th>
                <th className="py-3 px-3 font-semibold text-plum-900 text-right">Estimated</th>
                <th className="py-3 px-3 font-semibold text-plum-900 text-right">Actual</th>
                <th className="py-3 px-3 font-semibold text-plum-900 text-right">Paid</th>
                <th className="py-3 px-3 font-semibold text-plum-900 text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-plum-900 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-100">
              {expenses.map((item) => (
                <tr key={item.id} className="hover:bg-plum-50/40 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-plum-950">{item.title}</p>
                    {item.notes && (
                      <p className="text-[11px] text-plum-500 max-w-sm line-clamp-1">{item.notes}</p>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-plum-100 text-plum-800">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-plum-800 text-right">
                    {formatINR(item.estimatedAmount)}
                  </td>
                  <td className="py-3 px-3 font-bold text-burgundy-900 text-right">
                    {item.actualAmount > 0 ? formatINR(item.actualAmount) : '—'}
                  </td>
                  <td className="py-3 px-3 font-medium text-emerald-700 text-right">
                    {item.paidAmount > 0 ? formatINR(item.paidAmount) : '₹0'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-ivory-200 text-plum-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditExpense(item)}
                        className="p-1.5 rounded-lg text-plum-600 hover:text-plum-900 hover:bg-plum-100 transition-colors"
                        title="Edit Expense"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete Expense"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-plum-200 rounded-3xl shadow-elevated w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-plum-800 to-burgundy-800 text-white p-5 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingExpense ? 'Edit Expense' : 'Add New Celebration Expense'}
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-plum-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sangeet Sound & Lighting Equipment"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 bg-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-plum-200 bg-ivory-50 text-xs focus:outline-none focus:ring-2 focus:ring-plum-700"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                      <option key={cat} value={cat}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={expenseForm.status}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-plum-200 bg-ivory-50 text-xs focus:outline-none focus:ring-2 focus:ring-plum-700"
                  >
                    <option value="planned">Planned</option>
                    <option value="pending">Advance Paid / Pending</option>
                    <option value="paid">Fully Settled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Estimated (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={expenseForm.estimatedAmount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        estimatedAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Actual Quote (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={expenseForm.actualAmount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        actualAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Paid So Far (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={expenseForm.paidAmount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        paidAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Advance paid via UPI, remaining balance due on setup day"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-plum-700 hover:bg-plum-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExpense}
                  className="px-5 py-2 text-xs font-semibold bg-plum-800 text-white rounded-xl shadow-card"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Budget Optimizer Modal (Requirement 7) */}
      {isOptimizerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-plum-200 rounded-3xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-plum-800 via-burgundy-800 to-plum-950 text-white p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">AI Budget Optimizer</h3>
                  <p className="text-xs text-plum-200">
                    Find intelligent savings without hurting your protected priorities.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOptimizerModalOpen(false)}
                className="text-plum-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Context Summary */}
              <div className="p-4 rounded-2xl bg-ivory-100 border border-plum-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-plum-500 uppercase tracking-wider">
                    Current Budget
                  </p>
                  <p className="text-lg font-bold font-serif text-plum-950">
                    {formatINR(activeEvent.totalBudget)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-plum-500 uppercase tracking-wider">
                    Target Ceiling
                  </p>
                  <p className="text-lg font-bold font-serif text-burgundy-900">
                    {formatINR(Math.max(0, activeEvent.totalBudget - targetSavings))}
                  </p>
                </div>
              </div>

              {/* Input: Target Savings in INR */}
              <div>
                <label className="block font-bold text-plum-950 uppercase tracking-wider mb-1.5">
                  How much would you like to save? (INR ₹)
                </label>
                <div className="relative">
                  <span className="text-sm font-bold text-plum-600 absolute left-3.5 top-2.5">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="5000"
                    step="5000"
                    value={targetSavings}
                    onChange={(e) => setTargetSavings(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-plum-200 text-sm font-bold text-plum-950"
                  />
                </div>
                <p className="text-[11px] text-plum-600 mt-1">
                  Example: "Save ₹30,000 without compromising catering and photography."
                </p>
              </div>

              {/* Protected Priorities Selection */}
              <div>
                <label className="block font-bold text-plum-950 uppercase tracking-wider mb-1.5">
                  Preserve These Categories (Do Not Cut):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
                    const isProtected = preservedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          if (isProtected) {
                            setPreservedCategories(preservedCategories.filter((c) => c !== cat));
                          } else {
                            setPreservedCategories([...preservedCategories, cat]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isProtected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                            : 'border-plum-150 bg-white text-plum-700'
                        }`}
                      >
                        <span className="truncate">{label}</span>
                        {isProtected && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Notes */}
              <div>
                <label className="block font-bold text-plum-950 uppercase tracking-wider mb-1.5">
                  Special Instructions for Gemini:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keep South Indian Banana leaf Sadhya untouched; reduce floral imported flowers"
                  value={optimizerNotes}
                  onChange={(e) => setOptimizerNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-plum-200"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isOptimizing}
                onClick={handleRunOptimizer}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-plum-800 to-burgundy-800 text-white font-bold text-xs shadow-card hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>{isOptimizing ? 'Analyzing Budget Trade-offs...' : 'Calculate AI Reallocations'}</span>
              </button>

              {/* Optimization Result Display */}
              {optimizationResult && (
                <div className="p-5 rounded-2xl bg-plum-50/70 border border-plum-200 space-y-4 animate-slide-up">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Optimization Strategy
                    </span>
                    <span className="text-xs font-bold text-plum-950">
                      Savings: {formatINR(optimizationResult.targetSavings)}
                    </span>
                  </div>

                  <p className="text-xs text-plum-900 leading-relaxed font-medium">
                    {optimizationResult.tradeOffSummary}
                  </p>

                  <div className="space-y-2">
                    <p className="font-bold text-plum-950 text-[11px]">Revised Category Allocations:</p>
                    {optimizationResult.reallocations.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white border border-plum-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-bold text-plum-950">{r.categoryLabel}</p>
                          <p className="text-[11px] text-plum-600">{r.savingsExplanation}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="line-through text-plum-400 mr-2">
                            {formatINR(r.originalAmount)}
                          </span>
                          <span className="font-bold text-emerald-700">
                            {formatINR(r.revisedAmount)}
                          </span>
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            Saved {formatINR(r.savingAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-plum-600">
                      Preserved: {optimizationResult.preservedPriorities.join(', ')}
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyOptimizerReallocations}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-card transition-colors"
                    >
                      Apply Reallocations to Budget
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
