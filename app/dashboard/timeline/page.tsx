'use client';

import React, { useState, useEffect } from 'react';
import { useEvent } from '@/components/EventContext';
import {
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Filter,
  Calendar,
  Sparkles,
  X,
  Bell,
  Check,
} from 'lucide-react';
import { TimelineTask, TaskMilestone, TaskPriority } from '@/types';
import { getDaysRemaining, formatCelebrationDate } from '@/lib/utils';

export default function TimelinePage() {
  const { activeEvent, activeEventId } = useEvent();

  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TimelineTask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    deadline: '',
    milestone: '30_days_before' as TaskMilestone,
    priority: 'high' as TaskPriority,
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
    category: 'general' as any,
  });

  const fetchTasks = async () => {
    if (!activeEventId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?eventId=${activeEventId}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeEventId]);

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-plum-700">Please select or create an event first.</p>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(activeEvent.date);
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const milestones: Array<{ id: TaskMilestone; label: string; daysTarget: number }> = [
    { id: '30_days_before', label: '30 Days Before (Foundations)', daysTarget: 30 },
    { id: '15_days_before', label: '15 Days Before (Logistics & RSVPs)', daysTarget: 15 },
    { id: '7_days_before', label: '7 Days Before (Final Preparations)', daysTarget: 7 },
    { id: '3_days_before', label: '3 Days Before (Trials & Delivery)', daysTarget: 3 },
    { id: '1_day_before', label: '1 Day Before (Venue & Sound Check)', daysTarget: 1 },
    { id: 'event_day', label: 'Event Day (Celebration & Hospitality)', daysTarget: 0 },
  ];

  const handleToggleTaskStatus = async (task: TimelineTask) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      // Optimistic update
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleOpenAddTask = (milestone?: TaskMilestone) => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      deadline: milestone ? milestone.replace('_', ' ') : 'Upcoming',
      milestone: milestone || '30_days_before',
      priority: 'high',
      status: 'pending',
      category: 'general',
    });
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: TimelineTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      milestone: task.milestone,
      priority: task.priority,
      status: task.status,
      category: task.category,
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) return;
    try {
      if (editingTask) {
        await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTask.id, ...taskForm }),
        });
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: activeEvent.id, ...taskForm }),
        });
      }
      setIsTaskModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-burgundy-800 uppercase tracking-wider">
            Preparation Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 mt-1">
            Smart Countdown Timeline
          </h1>
          <p className="text-xs text-plum-600 mt-0.5">
            Event Date: <strong>{formatCelebrationDate(activeEvent.date)}</strong> | <span className="text-burgundy-900 font-bold">
              {daysLeft > 0 ? `${daysLeft} days until event` : 'Event day is here!'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAddTask()}
            className="px-4 py-2.5 rounded-2xl bg-plum-800 text-white text-xs font-semibold shadow-card hover:bg-plum-900 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add Custom Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Reminders Bar */}
      <div className="p-6 rounded-3xl bg-white border border-plum-200 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-plum-950">
              Celebration Readiness: {completedCount} of {tasks.length} tasks completed
            </span>
            <span className="text-burgundy-800 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-ivory-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-plum-800 to-coral-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* In-App Reminder Badge */}
        <div className="p-3.5 rounded-2xl bg-plum-50 border border-plum-150 flex items-start gap-2.5 text-xs text-plum-800">
          <Bell className="w-4 h-4 text-plum-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-plum-950">In-App Countdown Active</p>
            <p className="text-[11px] text-plum-600">
              Upcoming milestones update automatically based on your celebration date.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-plum-150 shadow-subtle text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-plum-500" />
          <span className="font-semibold text-plum-900">Filter By Priority:</span>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-xl uppercase text-[10px] font-bold transition-all ${
                priorityFilter === p
                  ? 'bg-plum-800 text-white'
                  : 'bg-ivory-100 text-plum-700 hover:bg-plum-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-plum-900">Status:</span>
          {['all', 'pending', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-xl uppercase text-[10px] font-bold transition-all ${
                statusFilter === s
                  ? 'bg-plum-800 text-white'
                  : 'bg-ivory-100 text-plum-700 hover:bg-plum-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Milestones Section */}
      <div className="space-y-6">
        {milestones.map((m) => {
          const milestoneTasks = filteredTasks.filter((t) => t.milestone === m.id);
          const isCurrentPhase = daysLeft <= m.daysTarget + 10 && daysLeft >= m.daysTarget - 5;

          return (
            <div
              key={m.id}
              className={`p-6 rounded-3xl bg-white border transition-all ${
                isCurrentPhase
                  ? 'border-plum-800 shadow-card ring-2 ring-plum-150'
                  : 'border-plum-150 shadow-subtle'
              }`}
            >
              {/* Milestone Header */}
              <div className="flex items-center justify-between border-b border-plum-100 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isCurrentPhase
                        ? 'bg-plum-800 text-gold-400'
                        : 'bg-ivory-200 text-plum-800'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-plum-950">{m.label}</h3>
                    <p className="text-[11px] text-plum-500">
                      Target deadline: ~{m.daysTarget} days before event
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAddTask(m.id)}
                  className="text-xs font-semibold text-plum-700 hover:text-plum-950 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Task Checklist */}
              {milestoneTasks.length > 0 ? (
                <div className="space-y-2.5">
                  {milestoneTasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          isCompleted
                            ? 'bg-plum-50/40 border-plum-100 opacity-75'
                            : 'bg-ivory-50/60 border-plum-150 hover:border-plum-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(task)}
                            className="mt-0.5 p-1 rounded-lg text-plum-800 hover:text-emerald-700 transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5 text-plum-300 hover:text-plum-600" />
                            )}
                          </button>

                          <div>
                            <p
                              className={`text-xs font-bold ${
                                isCompleted ? 'line-through text-plum-400' : 'text-plum-950'
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-plum-600 mt-0.5 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-[10px]">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  task.priority === 'high'
                                    ? 'bg-rose-100 text-rose-800'
                                    : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-plum-100 text-plum-800'
                                }`}
                              >
                                {task.priority} Priority
                              </span>
                              <span className="text-plum-500">Deadline: {task.deadline}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenEditTask(task)}
                            className="p-1 text-plum-500 hover:text-plum-800"
                            title="Edit Task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-rose-400 hover:text-rose-600"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-plum-400 italic py-2">
                  No tasks scheduled in this milestone. Click "+ Add Task" to schedule one.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-plum-200 rounded-3xl shadow-elevated w-full max-w-md overflow-hidden">
            <div className="bg-plum-800 text-white p-5 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingTask ? 'Edit Task' : 'Add Celebration Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-plum-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Conduct Nadaswaram acoustic sound check"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-plum-200 bg-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-plum-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                  Description / Action Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Confirm 2 microphones and monitor speaker on stage"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Milestone Stage
                  </label>
                  <select
                    value={taskForm.milestone}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, milestone: e.target.value as TaskMilestone })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  >
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-plum-900 uppercase tracking-wider mb-1">
                  Deadline Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 December 2026 or 3 days before"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-plum-200 bg-ivory-50 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-plum-700 hover:bg-plum-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTask}
                  className="px-5 py-2 text-xs font-semibold bg-plum-800 text-white rounded-xl shadow-card"
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
