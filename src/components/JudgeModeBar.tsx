'use client';

import React, { useState } from 'react';
import { UserRole, SupportedLanguage } from '@/types';
import {
  Gavel,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface JudgeModeBarProps {
  onSwitchPersona: (phoneNumber: string) => void;
  onSetLanguage: (lang: SupportedLanguage) => void;
  onRunTestPrompt: (prompt: string) => void;
  onSimulateFacultyMove: () => void;
  currentRole: UserRole;
  currentLang: SupportedLanguage;
}

export const JudgeModeBar: React.FC<JudgeModeBarProps> = ({
  onSwitchPersona,
  onSetLanguage,
  onRunTestPrompt,
  onSimulateFacultyMove,
  currentRole,
  currentLang,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const testPrompts = [
    { label: '📍 Live Faculty Location', prompt: 'Where is Dr. Geetha R. right now?' },
    { label: '📊 Attendance Check', prompt: 'What is my attendance in OS and ML?' },
    { label: '🚌 Bus to Majestic', prompt: 'When is the next university bus to Majestic?' },
    { label: '🏆 SAPHACK 2026', prompt: 'Tell me about the SAPHACK 2026 hackathon and prizes' },
    { label: '⏰ Reminder Intent', prompt: 'Remind me to meet Dr. Geetha at 4 PM for project review' },
    { label: 'ಕನ್ನಡ (Kannada)', lang: 'kn', prompt: 'ಡಾ. ಗೀತಾ ಅವರು ಈಗ ಎಲ್ಲಿದ್ದಾರೆ?' },
    { label: 'हिन्दी (Hindi)', lang: 'hi', prompt: 'मैजेस्टिक के लिए अगली बस कब है?' },
    { label: 'اردو (Urdu)', lang: 'ur', prompt: 'ڈاکٹر گیتا کہاں ہیں؟' },
  ];

  return (
    <div className="bg-[#100E22]/95 border-b border-pink-500/20 text-slate-100 px-4 py-2 text-xs font-semibold shadow-lg transition-all backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-pink-500/20 rounded-md text-pink-400">
            <Gavel className="w-3.5 h-3.5" />
          </span>
          <span className="font-extrabold uppercase tracking-wider text-pink-300 font-heading">
            Hackathon Judge & Evaluator Mode
          </span>
          <span className="bg-pink-500/10 border border-pink-500/30 text-pink-300 text-[10px] px-2 py-0.2 rounded-full font-bold">
            1-Click Demo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <span>{isOpen ? 'Close Evaluation Panel' : 'Open Quick Judge Tools'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-white/10 space-y-3 pb-1">
          {/* Quick Role Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold text-[11px] uppercase">
              Switch Verified Persona:
            </span>
            <button
              onClick={() => onSwitchPersona('+91 98451 23456')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'student'
                  ? 'btn-gradient shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
              }`}
            >
              🎓 Student (Rahul)
            </button>
            <button
              onClick={() => onSwitchPersona('+91 98860 12345')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'faculty'
                  ? 'btn-gradient shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
              }`}
            >
              👩‍🏫 Faculty (Dr. Geetha)
            </button>
            <button
              onClick={() => onSwitchPersona('+91 94481 98765')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'parent'
                  ? 'btn-gradient shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
              }`}
            >
              👨‍👩‍👦 Parent (Ramesh)
            </button>
            <button
              onClick={() => onSwitchPersona('+91 91234 56789')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'guest'
                  ? 'btn-gradient shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
              }`}
            >
              👤 Campus Visitor
            </button>

            <button
              onClick={onSimulateFacultyMove}
              className="ml-auto bg-gradient-to-r from-violet-600/30 to-pink-600/30 border border-pink-500/30 text-pink-300 hover:text-white px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>Simulate Movement Ping</span>
            </button>
          </div>

          {/* Test Prompts Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-bold text-[11px] uppercase">
              Instant AI Test Prompts:
            </span>
            {testPrompts.map((tp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (tp.lang) onSetLanguage(tp.lang as SupportedLanguage);
                  onRunTestPrompt(tp.prompt);
                }}
                className="bg-white/5 hover:bg-pink-500/15 text-slate-200 hover:text-pink-300 border border-white/10 hover:border-pink-500/30 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
