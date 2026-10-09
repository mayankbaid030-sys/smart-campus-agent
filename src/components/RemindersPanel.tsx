'use client';

import React, { useState } from 'react';
import { Reminder } from '@/types';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  X,
  AlertCircle,
} from 'lucide-react';

interface RemindersPanelProps {
  reminders: Reminder[];
  onAddReminder: (title: string, category: Reminder['category'], datetime?: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onClose: () => void;
}

export const RemindersPanel: React.FC<RemindersPanelProps> = ({
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onClose,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Reminder['category']>('assignment');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddReminder(newTitle.trim(), newCategory);
    setNewTitle('');
    setIsAdding(false);
  };

  const getCategoryColor = (cat: Reminder['category']) => {
    switch (cat) {
      case 'class':
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-rose-100 text-rose-800';
      case 'bus':
        return 'bg-amber-100 text-amber-800';
      case 'assignment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        {/* Panel Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Personal Campus Reminders</h3>
              <p className="text-xs text-slate-400">Stored on device & tied to your verified mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reminders List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs font-medium">No pending reminders.</p>
              <p className="text-[11px] text-slate-400">
                You can say to Voice AI: "Remind me to check bus timings at 4:30 PM"
              </p>
            </div>
          ) : (
            reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  rem.isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-blue-400'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => onToggleReminder(rem.id)}
                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                  >
                    {rem.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h4
                      className={`text-xs font-bold text-slate-900 ${
                        rem.isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {rem.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${getCategoryColor(
                          rem.category
                        )}`}
                      >
                        {rem.category}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rem.datetime).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Reminder Form / Trigger */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Reminder</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Reminder title (e.g. Submit Machine Learning assignment)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Reminder['category'])}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="assignment">Assignment</option>
                  <option value="class">Class</option>
                  <option value="exam">Exam</option>
                  <option value="bus">Bus Departure</option>
                  <option value="event">Campus Event</option>
                  <option value="personal">Personal</option>
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
