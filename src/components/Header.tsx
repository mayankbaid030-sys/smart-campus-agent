'use client';

import React from 'react';
import { UserAccount, SupportedLanguage } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/translations';
import {
  GraduationCap,
  Globe2,
  LogOut,
  Bell,
  ShieldCheck,
  Radio,
  User,
  School,
} from 'lucide-react';

interface HeaderProps {
  account: UserAccount | null;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLogout: () => void;
  pendingRemindersCount: number;
  onOpenReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  currentLang,
  onLanguageChange,
  onLogout,
  pendingRemindersCount,
  onOpenReminders,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & University Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/20">
              <School className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Sapthagiri NPS
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 hidden sm:inline-block">
                  University
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Radar
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Voice-First AI Campus Agent • Multilingual
              </p>
            </div>
          </div>

          {/* Right Controls: Language Selector, Reminders, User Profile, Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <div className="relative flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Globe2 className="w-4 h-4 text-slate-500 ml-1 mr-1.5 hidden sm:block" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-semibold text-slate-800 pr-2 py-1 outline-none cursor-pointer"
                aria-label="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {account ? (
              <>
                {/* Reminders Button */}
                <button
                  onClick={onOpenReminders}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="My Reminders"
                >
                  <Bell className="w-5 h-5" />
                  {pendingRemindersCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center animate-bounce">
                      {pendingRemindersCount}
                    </span>
                  )}
                </button>

                {/* Profile Pill */}
                <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {account.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                      {account.name}
                      <span className="capitalize text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                        {account.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">{account.phoneNumber}</div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                  title="Switch Account / Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
