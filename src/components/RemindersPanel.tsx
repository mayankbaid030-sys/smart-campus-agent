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
  X,
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
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'exam':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'bus':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'assignment':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#131226] rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh] text-slate-100">
        <div className="bg-gradient-to-r from-violet-950 via-[#131226] to-pink-950 p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-pink-500/20 rounded-2xl text-pink-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-heading text-white">
                Personal Campus Reminders
              </h3>
              <p className="text-xs text-slate-400">Stored on device & tied to your phone number</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs font-medium">No pending reminders.</p>
              <p className="text-[11px] text-slate-500">
                You can say to Voice AI: "Remind me to submit machine learning assignment"
              </p>
            </div>
          ) : (
            reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  rem.isCompleted
                    ? 'bg-white/5 border-white/5 opacity-50'
                    : 'glass-card border-white/10 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => onToggleReminder(rem.id)}
                    className="mt-0.5 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer shrink-0"
                  >
                    {rem.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h4
                      className={`text-xs font-bold text-white ${
                        rem.isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {rem.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase border ${getCategoryColor(
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
                  className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 btn-gradient font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-pink-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Reminder</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Reminder title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Reminder['category'])}
                  className="bg-[#1b1933] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-300"
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
                    className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl btn-gradient text-xs font-bold shadow-md shadow-pink-500/20"
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
