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
import { LoginModal } from '@/components/LoginModal';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { FacultyRadar } from '@/components/FacultyRadar';
import { RoleDashboard } from '@/components/RoleDashboard';
import { CampusHub } from '@/components/CampusHub';
import { RemindersPanel } from '@/components/RemindersPanel';
import { Bell, Sparkles, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Initialize session from localStorage on mount
  useEffect(() => {
    setIsClientLoaded(true);
    const activePhone = getActiveSessionPhone();
    if (activePhone) {
      const userAcc = getAccountByPhone(activePhone);
      setAccount(userAcc);
      setCurrentLang(userAcc.language || 'en');
    }

    // Start Real-Time Campus Simulation
    startCampusSimulator(30000);

    // Subscribe to in-app notification event bus
    const unsub = campusEventBus.on<AppNotification>(
      CAMPUS_EVENTS.NOTIFICATION_TRIGGERED,
      (notif) => {
        setActiveToast(notif);
        // Auto-dismiss toast after 6 seconds
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

  const handleLoginSuccess = (phoneNumber: string) => {
    setActiveSessionPhone(phoneNumber);
    const userAcc = getAccountByPhone(phoneNumber);
    setAccount(userAcc);
    setCurrentLang(userAcc.language || 'en');
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading Sapthagiri NPS University Campus Agent...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-100">
      {/* App Header */}
      <Header
        account={account}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
        pendingRemindersCount={account?.reminders?.filter((r) => !r.isCompleted).length || 0}
        onOpenReminders={() => setShowReminders(true)}
      />

      {/* Floating Real-Time Campus Toast Alert */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-start gap-3 animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white">{activeToast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{activeToast.message}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">{activeToast.timestamp}</span>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner with University Overview */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Sapthagiri NPS University • Voice-First AI
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Intelligence, Voice-Activated & Live
            </h1>
            <p className="text-sm text-blue-200/90 leading-relaxed">
              Find faculty live via Wi-Fi radar, verify attendance against VTU thresholds, check bus
              departures from Gate 1, access course notes, and register for SAPHACK 2026. Available in 6 languages.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />
        </div>

        {/* Core Grid: Left Voice Assistant | Right Role & Campus Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Voice Assistant (5 cols) */}
          <div className="lg:col-span-5 sticky top-22">
            <VoiceAssistant
              currentLang={currentLang}
              userRole={account?.role || 'guest'}
              userName={account?.name || 'Campus Visitor'}
              onReminderDetected={(rem) =>
                handleAddReminder(rem.title, rem.category, rem.datetime)
              }
            />
          </div>

          {/* Right Column: Role Dashboard + Campus Data Hub (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {account && (
              <RoleDashboard
                account={account}
                onAskAI={(q) => {
                  // Direct trigger to AI
                  const micBtn = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (micBtn) {
                    micBtn.value = q;
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
                }
              }}
            />
          </div>
        </div>

        {/* Full Width Section: Live Faculty Radar & Location Simulator */}
        <div className="pt-2">
          <FacultyRadar
            onAskAboutFaculty={(query) => {
              const input = document.querySelector('input[placeholder*="Ask anything"]') as HTMLInputElement;
              if (input) {
                input.value = query;
                input.focus();
              }
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Sapthagiri NPS University (SNPU), Hesaraghatta Main Rd, Bengaluru.</span>
          <span className="text-slate-400">
            Powered by Google Gemini 1.5 & Next.js Serverless • 6 Indian Languages
          </span>
        </div>
      </footer>

      {/* Login Modal (if no account logged in) */}
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
