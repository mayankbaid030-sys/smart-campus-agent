'use client';

import React from 'react';
import { UserAccount, SupportedLanguage } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/translations';
import { Logo } from '@/components/Logo';
import {
  Globe2,
  LogOut,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Radio,
} from 'lucide-react';

interface HeaderProps {
  account: UserAccount | null;
  currentLang: SupportedLanguage;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLogout: () => void;
  pendingRemindersCount: number;
  onOpenReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  currentLang,
  isDarkTheme,
  onToggleTheme,
  onLanguageChange,
  onLogout,
  pendingRemindersCount,
  onOpenReminders,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Headline */}
          <div className="flex items-center gap-3">
            <Logo size={34} showWordmark={true} />
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 ml-1 hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Radar
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDarkTheme ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-violet-400" />}
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-2 py-1">
              <Globe2 className="w-3.5 h-3.5 text-pink-400 mr-1.5 hidden sm:block" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-bold text-slate-200 pr-1 py-0.5 outline-none cursor-pointer"
                aria-label="Select Interface Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#131226] text-white">
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
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  title="My Reminders"
                >
                  <Bell className="w-4 h-4" />
                  {pendingRemindersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-black bg-pink-500 text-white rounded-full flex items-center justify-center animate-bounce shadow-md">
                      {pendingRemindersCount}
                    </span>
                  )}
                </button>

                {/* Profile Pill */}
                <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {account.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                      <span className="truncate max-w-[100px]">{account.name}</span>
                      <span className="capitalize text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        {account.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-2.5 py-1.5 rounded-xl border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer"
                  title="Switch Account / Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
