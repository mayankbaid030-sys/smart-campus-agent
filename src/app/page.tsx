'use client';

import React, { useState, useEffect } from 'react';
import { UserAccount, SupportedLanguage, AppNotification } from '@/types';
import {
  getAccountByPhone,
  saveAccount,
  getActiveSessionPhone,
  setActiveSessionPhone,
  updateAccountLanguage,
  addAccountReminder,
  toggleReminderStatus,
  deleteAccountReminder,
} from '@/lib/localStorageUtil';
import {
  startCampusSimulator,
  stopCampusSimulator,
  campusEventBus,
  CAMPUS_EVENTS,
} from '@/lib/events';
import { Header } from '@/components/Header';
import { JudgeModeBar } from '@/components/JudgeModeBar';
import { LoginModal } from '@/components/LoginModal';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { FacultyRadar } from '@/components/FacultyRadar';
import { RoleDashboard } from '@/components/RoleDashboard';
import { CampusHub } from '@/components/CampusHub';
import { RemindersPanel } from '@/components/RemindersPanel';
import { Bell, Sparkles, X, Radio } from 'lucide-react';

export default function Home() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Initialize session and theme on mount
  useEffect(() => {
    setIsClientLoaded(true);
    const activePhone = getActiveSessionPhone();
    if (activePhone) {
      const userAcc = getAccountByPhone(activePhone);
      setAccount(userAcc);
      setCurrentLang(userAcc.language || 'en');
      const isDark = userAcc.settings?.theme !== 'light';
      setIsDarkTheme(isDark);
      document.documentElement.classList.toggle('light', !isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      document.documentElement.classList.add('dark');
    }

    startCampusSimulator(30000);

    const unsub = campusEventBus.on<AppNotification>(
      CAMPUS_EVENTS.NOTIFICATION_TRIGGERED,
      (notif) => {
        setActiveToast(notif);
        setTimeout(() => {
          setActiveToast((current) => (current?.id === notif.id ? null : current));
        }, 6000);
      }
    );

    return () => {
      unsub();
      stopCampusSimulator();
    };
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDarkTheme;
    setIsDarkTheme(nextDark);
    document.documentElement.classList.toggle('light', !nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    if (account) {
      account.settings.theme = nextDark ? 'dark' : 'light';
      saveAccount(account);
      setAccount({ ...account });
    }
  };

  const handleLoginSuccess = (phoneNumber: string) => {
    setActiveSessionPhone(phoneNumber);
    const userAcc = getAccountByPhone(phoneNumber);
    setAccount(userAcc);
    setCurrentLang(userAcc.language || 'en');
    const isDark = userAcc.settings?.theme !== 'light';
    setIsDarkTheme(isDark);
    document.documentElement.classList.toggle('light', !isDark);
    document.documentElement.classList.toggle('dark', isDark);
  };

  const handleLogout = () => {
    setActiveSessionPhone(null);
    setAccount(null);
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    if (account) {
      const updated = updateAccountLanguage(account.phoneNumber, lang);
      setAccount(updated);
    }
  };

  const handleUpdateUserSettings = (newSettings: any) => {
    if (!account) return;
    account.settings = { ...account.settings, ...newSettings };
    saveAccount(account);
    setAccount({ ...account });
  };

  const handleAddReminder = (
    title: string,
    category: any,
    datetime: string = new Date(Date.now() + 3600 * 1000 * 2).toISOString()
  ) => {
    if (!account) return;
    const updated = addAccountReminder(account.phoneNumber, {
      title,
      category,
      datetime,
      isCompleted: false,
    });
    setAccount(updated);

    setActiveToast({
      id: `toast-${Date.now()}`,
      title: 'Reminder Saved',
      message: `"${title}" has been saved to your campus agenda.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'success',
      read: false,
    });
  };

  const handleToggleReminder = (id: string) => {
    if (!account) return;
    const updated = toggleReminderStatus(account.phoneNumber, id);
    setAccount(updated);
  };

  const handleDeleteReminder = (id: string) => {
    if (!account) return;
    const updated = deleteAccountReminder(account.phoneNumber, id);
    setAccount(updated);
  };

  if (!isClientLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
        <div className="flex items-center gap-3 text-pink-400 font-bold text-sm">
          <span className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Sapthagiri NPS University Campus Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors selection:bg-pink-500/30 selection:text-pink-200">
      {/* Hackathon Judge / Evaluator Mode Bar */}
      <JudgeModeBar
        currentRole={account?.role || 'guest'}
        currentLang={currentLang}
        onSwitchPersona={(phone) => handleLoginSuccess(phone)}
        onSetLanguage={(lang) => handleLanguageChange(lang)}
        onSimulateFacultyMove={() => {
          const { simulateRandomMovement } = require('@/lib/events');
          simulateRandomMovement();
        }}
        onRunTestPrompt={(prompt) => {
          const input = document.querySelector('input[placeholder*="Ask anything"]') as HTMLInputElement;
          if (input) {
            input.value = prompt;
            input.focus();
            const form = input.closest('form');
            if (form) form.requestSubmit();
          }
        }}
      />

      {/* Header with Dark/Light Toggle */}
      <Header
        account={account}
        currentLang={currentLang}
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleToggleTheme}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
        pendingRemindersCount={account?.reminders?.filter((r) => !r.isCompleted).length || 0}
        onOpenReminders={() => setShowReminders(true)}
      />

      {/* Floating Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm glass-panel text-white rounded-3xl p-4 shadow-2xl border border-pink-500/30 flex items-start gap-3 animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-pink-500/20 rounded-2xl text-pink-300 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white font-heading">{activeToast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{activeToast.message}</p>
            <span className="text-[10px] text-pink-400 font-mono mt-1 block">{activeToast.timestamp}</span>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area - Bento Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Bento Hero Header */}
        <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden glass-panel border border-white/10 shadow-2xl bg-gradient-to-r from-violet-950/70 via-[#131226] to-pink-950/50">
          <div className="relative z-10 max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-300">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Sapthagiri NPS University • Voice-First AI
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-heading text-gradient leading-tight">
              Campus Intelligence, Voice-Activated & Live
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Track faculty live on Wi-Fi radar, check attendance against VTU thresholds, look up
              city bus departures from Gate 1, and access course notes. Speak or type in any language.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-pink-500/10 via-violet-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Bento Grid: Voice AI (5 cols) & Role Dashboard / Campus Hub (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Voice Assistant */}
          <div className="lg:col-span-5 sticky top-22">
            <VoiceAssistant
              currentLang={currentLang}
              userRole={account?.role || 'guest'}
              userName={account?.name || 'Campus Visitor'}
              userSettings={account?.settings}
              onReminderDetected={(rem) =>
                handleAddReminder(rem.title, rem.category, rem.datetime)
              }
              onUpdateUserSettings={handleUpdateUserSettings}
            />
          </div>

          {/* Right Column: Role Dashboard + Campus Hub */}
          <div className="lg:col-span-7 space-y-6">
            {account && (
              <RoleDashboard
                account={account}
                onAskAI={(q) => {
                  const input = document.querySelector('input[placeholder*="Ask anything"]') as HTMLInputElement;
                  if (input) {
                    input.value = q;
                    input.focus();
                    const form = input.closest('form');
                    if (form) form.requestSubmit();
                  }
                }}
              />
            )}

            <CampusHub
              onAskAI={(q) => {
                const input = document.querySelector('input[placeholder*="Ask anything"]') as HTMLInputElement;
                if (input) {
                  input.value = q;
                  input.focus();
                  const form = input.closest('form');
                  if (form) form.requestSubmit();
                }
              }}
            />
          </div>
        </div>

        {/* Full Width Section: Live Faculty Radar */}
        <div className="pt-2">
          <FacultyRadar
            onAskAboutFaculty={(query) => {
              const input = document.querySelector('input[placeholder*="Ask anything"]') as HTMLInputElement;
              if (input) {
                input.value = query;
                input.focus();
                const form = input.closest('form');
                if (form) form.requestSubmit();
              }
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 glass-panel border-t border-white/10 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Sapthagiri NPS University (SNPU), Hesaraghatta Main Rd, Bengaluru.</span>
          <span className="text-slate-400">
            Powered by Google Gemini 3.5 & Next.js Serverless • Multilingual Speech
          </span>
        </div>
      </footer>

      {/* Login Modal */}
      {!account && (
        <LoginModal
          currentLang={currentLang}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Reminders Modal */}
      {showReminders && account && (
        <RemindersPanel
          reminders={account.reminders || []}
          onAddReminder={handleAddReminder}
          onToggleReminder={handleToggleReminder}
          onDeleteReminder={handleDeleteReminder}
          onClose={() => setShowReminders(false)}
        />
      )}
    </div>
  );
}
