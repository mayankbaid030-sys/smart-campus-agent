'use client';

import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '@/types';
import { normalizePhone, formatPhoneDisplay } from '@/lib/localStorageUtil';
import { getTranslation } from '@/lib/translations';
import { Logo } from '@/components/Logo';
import {
  KeyRound,
  Phone,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  Copy,
  Check,
  School,
  Lock,
} from 'lucide-react';

interface LoginModalProps {
  currentLang: SupportedLanguage;
  onLoginSuccess: (phoneNumber: string) => void;
}

const DEMO_PERSONAS = [
  {
    role: 'Student',
    name: 'Rahul Sharma',
    phone: '+91 98451 23456',
    desc: 'CSE 6th Sem • 1SG21CS085',
    avatar: '🎓',
  },
  {
    role: 'Faculty',
    name: 'Dr. Geetha R.',
    phone: '+91 98860 12345',
    desc: 'HOD CSE • Cabin AB-304',
    avatar: '👩‍🏫',
  },
  {
    role: 'Parent',
    name: 'Ramesh Kumar',
    phone: '+91 94481 98765',
    desc: 'Father of Rahul Sharma',
    avatar: '👨‍👩‍👦',
  },
  {
    role: 'Faculty',
    name: 'Prof. Priya Sundaram',
    phone: '+91 97412 34567',
    desc: 'Dean Student Affairs • Admin 105',
    avatar: '🏢',
  },
  {
    role: 'Visitor',
    name: 'Campus Visitor',
    phone: '+91 91234 56789',
    desc: 'Prospective Student / Guest',
    avatar: '👤',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  currentLang,
  onLoginSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = async (targetPhone?: string) => {
    const rawNumber = targetPhone || phoneNumber;
    setError(null);

    const normalized = normalizePhone(rawNumber);
    const indianRegex = /^\+91[6-9]\d{9}$/;
    if (!indianRegex.test(normalized)) {
      setError('Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phoneNumber: normalized }),
      });
      const data = await res.json();

      if (res.ok && data.demoOtp) {
        setGeneratedOtp(data.demoOtp);
        setOtpSent(true);
        setTimer(30);
        setInputOtp('');
      } else {
        setError(data.error || 'Failed to generate Demo OTP.');
      }
    } catch (err) {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fallbackOtp);
      setOtpSent(true);
      setTimer(30);
      setInputOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!inputOtp || inputOtp.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const normalized = normalizePhone(phoneNumber);
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phoneNumber: normalized, code: inputOtp }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(normalized);
      } else if (inputOtp === generatedOtp || inputOtp === '123456') {
        onLoginSuccess(normalized);
      } else {
        setError(getTranslation(currentLang, 'wrongOtp'));
      }
    } catch (err) {
      if (inputOtp === generatedOtp || inputOtp === '123456') {
        onLoginSuccess(normalizePhone(phoneNumber));
      } else {
        setError(getTranslation(currentLang, 'wrongOtp'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (phone: string) => {
    setPhoneNumber(phone);
    setError(null);
    handleSendOtp(phone);
  };

  const copyToClipboard = () => {
    if (generatedOtp) {
      navigator.clipboard.writeText(generatedOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#131226] rounded-3xl shadow-2xl border border-white/10 overflow-hidden my-6 text-slate-100">
        {/* Banner with Big Bold Gradient Headline */}
        <div className="p-6 bg-gradient-to-br from-violet-950 via-[#131226] to-pink-950/60 border-b border-white/10 relative">
          <div className="space-y-2">
            <Logo size={46} showWordmark={true} animated={true} />
            <p className="text-xs text-slate-400">
              Welcome to Sapthagiri NPS University! Enter your mobile number to access live campus radar & intelligence.
            </p>
          </div>
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Demo OTP Login • Simulated & Free</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {!otpSent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {getTranslation(currentLang, 'enterPhone')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1 text-slate-400 font-bold text-sm">
                    <Phone className="w-4 h-4 text-pink-400" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="98451 23456"
                    value={phoneNumber.replace(/^\+91\s*/, '')}
                    onChange={(e) => setPhoneNumber(`+91 ${e.target.value.replace(/\D/g, '')}`)}
                    className="w-full pl-20 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 text-base tracking-wide"
                    maxLength={13}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Enter any 10-digit mobile number, or tap a pre-configured persona below.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={() => handleSendOtp()}
                disabled={isLoading}
                className="w-full py-3.5 px-4 btn-gradient font-bold rounded-2xl shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{getTranslation(currentLang, 'sendOtp')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Code sent to: <strong className="text-white">{formatPhoneDisplay(phoneNumber)}</strong>
                </span>
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setInputOtp('');
                    setError(null);
                  }}
                  className="text-pink-400 font-bold hover:underline cursor-pointer"
                >
                  Change Number
                </button>
              </div>

              {/* DEMO OTP PROMINENT BOX WITH SOFT GLOW */}
              <div className="bg-gradient-to-br from-violet-950/70 to-pink-950/50 border-2 border-pink-500/40 rounded-2xl p-4 shadow-xl shadow-pink-500/10 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-pink-300 font-heading">
                      Demo OTP Code (Simulated)
                    </span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="my-3 flex items-center justify-center font-mono text-3xl font-black tracking-widest text-white drop-shadow-md">
                  {generatedOtp}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">
                    Use this simulated OTP to complete entry.
                  </span>
                  <button
                    onClick={() => setInputOtp(generatedOtp)}
                    className="text-xs font-bold text-pink-300 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Auto-fill Code
                  </button>
                </div>
              </div>

              {/* Input OTP */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {getTranslation(currentLang, 'enterOtpCode')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white font-black"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || inputOtp.length < 6}
                className="w-full py-3.5 px-4 btn-gradient font-bold rounded-2xl shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{getTranslation(currentLang, 'verifyOtp')}</span>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timer > 0 ? (
                  <span>
                    {getTranslation(currentLang, 'resendOtpIn')} <strong>{timer}s</strong>
                  </span>
                ) : (
                  <button
                    onClick={() => handleSendOtp()}
                    className="text-pink-400 font-bold hover:underline cursor-pointer"
                  >
                    {getTranslation(currentLang, 'resendOtp')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Demo Personas */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {getTranslation(currentLang, 'quickDemoUsers')}
              </span>
              <span className="text-[10px] text-pink-300 font-bold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                Seed College Database
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_PERSONAS.map((persona) => (
                <button
                  key={persona.phone}
                  type="button"
                  onClick={() => handleSelectPersona(persona.phone)}
                  className="text-left p-3 rounded-2xl border border-white/10 hover:border-pink-500/50 bg-white/5 hover:bg-pink-500/5 transition-all group flex items-start gap-2.5 cursor-pointer"
                >
                  <span className="text-xl shrink-0 p-1.5 rounded-xl bg-white/10">
                    {persona.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-pink-300 flex items-center justify-between">
                      <span className="truncate">{persona.name}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 px-1.5 py-0.2 rounded-full bg-white/10">
                        {persona.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{persona.desc}</div>
                    <div className="text-[10px] font-mono text-pink-400 font-semibold">
                      {persona.phone}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl text-[11px] text-slate-400 leading-relaxed border border-white/5">
            <strong>Architecture Note:</strong> Demo OTP is simulated and data is stored on the device for the demo. Production uses an SMS provider for OTP and a cloud database (e.g. Firestore) so accounts sync across devices. Roles are strictly seed-enforced.
          </div>
        </div>
      </div>
    </div>
  );
};
