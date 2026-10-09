'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage, UserRole, ChatMessage, LanguageCode } from '@/types';
import { SUPPORTED_LANGUAGES, getTranslation, getLanguageLabel, isLanguageRtl } from '@/lib/translations';
import { getLiveFaculty } from '@/lib/events';
import { speakSmoothly, stopSpeaking } from '@/lib/voiceEngine';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { Logo } from '@/components/Logo';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Square,
  Sliders,
  Radio,
  Zap,
  Globe2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface VoiceAssistantProps {
  currentLang: SupportedLanguage;
  userRole: UserRole;
  userName: string;
  userSettings?: {
    preferredVoiceURI?: string;
    handsFreeMode?: boolean;
  };
  onReminderDetected: (reminder: any) => void;
  onUpdateUserSettings?: (settings: any) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentLang,
  userRole,
  userName,
  userSettings,
  onReminderDetected,
  onUpdateUserSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListeningBrowser, setIsListeningBrowser] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [handsFree, setHandsFree] = useState(userSettings?.handsFreeMode || false);
  const [voiceURI, setVoiceURI] = useState(userSettings?.preferredVoiceURI || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with initial welcome message
  useEffect(() => {
    const welcomeText =
      currentLang === 'kn'
        ? `ನಮಸ್ಕಾರ ${userName}! ನಾನು ಸಪ್ತಗಿri ಎನ್‌ಪಿಎಸ್ ವಿವಿ ಎಐ ಸಹಾಯಕ. ನೀವು ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಬಹುದು — ನಾನು ಅದೇ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರಿಸುತ್ತೇನೆ!`
        : currentLang === 'hi'
        ? `नमस्ते ${userName}! मैं सप्तगिरि एनपीएस यूनिवर्सिटी का एಐ सहायक हूँ। आप किसी भी भाषा में बोल सकते हैं — मैं उसी भाषा में उत्तर दूँगा!`
        : currentLang === 'ur'
        ? `خوش آمدید ${userName}! میں سپتاگری یونیورسٹی کا اے آئی کیمپس اسسٹنٹ ہوں۔ آپ جس زبان میں بھی بولیں گے، میں اسی زبان میں جواب دوں گا۔`
        : `Hey ${userName}! I am your Sapthagiri NPS University AI Campus Agent. Speak or type in any language — I will automatically detect it and reply back!`;

    const initialLangCode: LanguageCode = `${currentLang}-IN` as LanguageCode;

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        languageCode: initialLangCode,
        languageLabel: getLanguageLabel(initialLangCode),
        isRtl: isLanguageRtl(currentLang),
        suggestedActions: [
          'Where is Dr. Geetha R. right now?',
          'Check my attendance in OS & ML',
          'Next bus to Majestic?',
          'ಡಾ. ಗೀತಾ ಎಲ್ಲಿದ್ದಾರೆ? (Kannada)',
          'बस का समय क्या है? (Hindi)',
        ],
      },
    ]);
  }, [currentLang, userName]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, interimText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Text-to-Speech Playback with Mutual Exclusion
  const playSpeech = (text: string, langCode: string = 'en-IN') => {
    // STOP LISTENING while speaking so app never hears itself
    if (isListeningBrowser && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListeningBrowser(false);
    }

    setIsSpeaking(true);

    speakSmoothly(
      text,
      langCode,
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          // Auto-restart listening if hands-free is enabled
          if (handsFree) {
            startVoiceRecording();
          }
        },
        onError: () => setIsSpeaking(false),
      },
      voiceURI
    );
  };

  // Start MediaRecorder Audio Input
  const startVoiceRecording = async () => {
    stopSpeaking(); // Stop any speech
    setErrorMessage(null);
    setInterimText('');
    setRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearInterval(recordIntervalRef.current!);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 500) {
          // Empty recording
          return;
        }

        await processRecordedAudio(audioBlob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start 30s countdown timer
      let secs = 0;
      recordIntervalRef.current = setInterval(() => {
        secs++;
        setRecordSeconds(secs);
        if (secs >= 30) {
          // Max 30 seconds limit
          stopVoiceRecording();
        }
      }, 1000);
    } catch (err: any) {
      console.warn('MediaRecorder failed, falling back to browser speech recognition:', err);
      fallbackBrowserSpeech();
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    setIsRecording(false);
  };

  // Send Recorded Audio to /api/voice-chat
  const processRecordedAudio = async (blob: Blob, mimeType: string) => {
    setIsLoading(true);
    setInterimText('Analyzing speech with Gemini 3.5 Flash...');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const liveFaculty = getLiveFaculty();

        const res = await fetch('/api/voice-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64data,
            mimeType,
            role: userRole,
            liveFaculty,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Add User Voice Message
          const userMsg: ChatMessage = {
            id: `usr-${Date.now()}`,
            sender: 'user',
            text: data.transcript || 'Spoken campus query',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            languageCode: data.languageCode,
            languageLabel: getLanguageLabel(data.languageCode),
          };

          // Add Assistant Response
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'assistant',
            text: data.reply || 'Campus information processed.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            languageCode: data.languageCode,
            languageLabel: getLanguageLabel(data.languageCode),
            isRtl: isLanguageRtl(data.languageCode),
            suggestedActions: [
              'Where is Dr. Geetha?',
              'What is my attendance?',
              'Upcoming events',
            ],
          };

          setMessages((prev) => [...prev, userMsg, botMsg]);

          if (data.detectedReminder) {
            onReminderDetected(data.detectedReminder);
          }

          // Speak reply in detected language
          playSpeech(botMsg.text, data.languageCode);
        } else {
          setErrorMessage("Couldn't process audio, please try again or type");
        }

        setIsLoading(false);
        setInterimText('');
      };
    } catch (err) {
      console.error('Audio processing error:', err);
      setErrorMessage("Couldn't process audio, please try again or type");
      setIsLoading(false);
      setInterimText('');
    }
  };

  // Backup Browser SpeechRecognition fallback
  const fallbackBrowserSpeech = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Microphone not supported on this device. Please type your query.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = `${currentLang}-IN`;

    recognition.onstart = () => {
      setIsListeningBrowser(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInterimText(transcript);
      if (event.results[0].isFinal) {
        setIsListeningBrowser(false);
        setInterimText('');
        handleSendText(transcript);
      }
    };

    recognition.onerror = (e: any) => {
      setIsListeningBrowser(false);
      if (e.error === 'no-speech') {
        setErrorMessage('No speech detected. Tap the glowing orb and speak.');
      } else if (e.error === 'network') {
        setErrorMessage('Network error during speech recognition. Please type.');
      }
    };

    recognition.onend = () => {
      setIsListeningBrowser(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
    }
  };

  // Send Typed Message to /api/chat
  const handleSendText = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    stopSpeaking();
    setErrorMessage(null);
    setInputText('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const liveFaculty = getLiveFaculty();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: currentLang,
          role: userRole,
          liveFaculty,
        }),
      });

      const data = await res.json();
      const detectedLangCode = data.languageCode || `${currentLang}-IN`;

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Campus agent response ready.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        languageCode: detectedLangCode,
        languageLabel: getLanguageLabel(detectedLangCode),
        isRtl: isLanguageRtl(detectedLangCode),
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, botMsg]);

      if (data.detectedReminder) {
        onReminderDetected(data.detectedReminder);
      }

      // Automatically speak reply in detected language
      playSpeech(botMsg.text, detectedLangCode);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMessage('Connection issue. Displaying offline campus knowledge.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (newVoiceURI: string, newHandsFree: boolean) => {
    setVoiceURI(newVoiceURI);
    setHandsFree(newHandsFree);
    if (onUpdateUserSettings) {
      onUpdateUserSettings({ preferredVoiceURI: newVoiceURI, handsFreeMode: newHandsFree });
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[650px] overflow-hidden transition-all relative">
      {/* Voice Assistant Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-950/60 via-slate-900/50 to-pink-950/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Logo size={36} animated={isRecording || isSpeaking} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#131226]" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2 font-heading">
              Voice Campus AI
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-pink-500/30 text-pink-300">
                Auto Multi-Lingual
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Replies automatically in whatever language you speak or type
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio Stop Button */}
          {isSpeaking && (
            <button
              onClick={() => stopSpeaking()}
              className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 animate-pulse"
              title="Stop Speaking"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mute</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            title="Voice & Neural Speech Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              <div
                dir={msg.isRtl ? 'rtl' : 'ltr'}
                className={`max-w-[88%] rounded-2xl p-4 shadow-sm text-sm relative ${
                  isUser
                    ? 'btn-gradient rounded-br-none font-medium'
                    : 'glass-card text-slate-100 border border-white/10 rounded-bl-none'
                }`}
              >
                {/* Header: Sender and Language Tag */}
                <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] opacity-80 font-semibold">
                  <span>{isUser ? userName : 'SNPU Campus AI'}</span>
                  <div className="flex items-center gap-1.5">
                    {msg.languageLabel && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/15 border border-white/20 text-white font-bold">
                        {msg.languageLabel}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <p className="whitespace-pre-line leading-relaxed text-sm">{msg.text}</p>

                {/* Speaker button on AI message */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => playSpeech(msg.text, msg.languageCode || 'en-IN')}
                      className="text-[11px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen Aloud</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Suggested quick action pills */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendText(action)}
                      className="text-[11px] rounded-full px-3 py-1 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 hover:border-pink-500/40 transition-all font-medium cursor-pointer shadow-xs"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Interim / Loading State */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-slate-300 text-xs font-semibold glass-card p-3 rounded-2xl border border-white/10 w-fit">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span>{interimText || 'Gemini is synthesizing campus intelligence...'}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-200 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Glowing Voice Orb & Controls Area */}
      <div className="p-4 border-t border-white/10 bg-[#0F0E1D]/90 backdrop-blur-md space-y-3">
        {/* Central Orb Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[11px] text-slate-400 block font-medium">
              {isRecording ? (
                <span className="text-pink-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  Recording voice: 00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:30
                </span>
              ) : isListeningBrowser ? (
                <span className="text-violet-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <Mic className="w-3.5 h-3.5" />
                  Listening browser microphone...
                </span>
              ) : isSpeaking ? (
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  Speaking neural response...
                </span>
              ) : (
                'Tap Glowing Orb to speak in any language'
              )}
            </span>
          </div>

          {/* GLOWING ANIMATED GRADIENT ORB BUTTON */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (isRecording) {
                  stopVoiceRecording();
                } else {
                  startVoiceRecording();
                }
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-xl relative z-10 ${
                isRecording
                  ? 'voice-orb voice-orb-active scale-110'
                  : 'voice-orb hover:scale-105 active:scale-95'
              }`}
              title={isRecording ? 'Stop Recording' : 'Speak to Voice Agent'}
              aria-label="Voice input button"
            >
              {isRecording ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
            {/* Subtle glow aura */}
            <div
              className={`absolute inset-0 rounded-full blur-xl pointer-events-none transition-all ${
                isRecording
                  ? 'bg-gradient-to-r from-pink-500 to-violet-500 opacity-90 scale-125'
                  : 'bg-gradient-to-r from-violet-600 to-pink-600 opacity-40 scale-100'
              }`}
            />
          </div>
        </div>

        {/* Text Input Row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or speak in any language..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-10 text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-2xl btn-gradient flex items-center justify-center shrink-0 disabled:opacity-30 cursor-pointer shadow-lg shadow-pink-500/20"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Voice Settings Modal */}
      {showSettings && (
        <VoiceSettingsModal
          currentVoiceURI={voiceURI}
          handsFreeMode={handsFree}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
