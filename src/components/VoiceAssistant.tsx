'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage, UserRole, ChatMessage, Faculty } from '@/types';
import { SUPPORTED_LANGUAGES, getTranslation } from '@/lib/translations';
import { campusEventBus, CAMPUS_EVENTS, getLiveFaculty } from '@/lib/events';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Bot,
  User as UserIcon,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';

interface VoiceAssistantProps {
  currentLang: SupportedLanguage;
  userRole: UserRole;
  userName: string;
  onReminderDetected: (reminder: any) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentLang,
  userRole,
  userName,
  onReminderDetected,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with localized welcome message
  useEffect(() => {
    const initialWelcome =
      currentLang === 'kn'
        ? `ನಮಸ್ಕಾರ ${userName}! ನಾನು ಸಪ್ತಗಿರಿ ಎನ್‌ಪಿಎಸ್ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಎಐ ಸಹಾಯಕ. ಉಪನ್ಯಾಸಕರ ಲೈವ್ ರೇಡಾರ್, ಹಾಜರಾತಿ, ಬಸ್ ವೇಳಾಪಟ್ಟಿ, ನೋಟ್ಸ್ ಅಥವಾ ಹ್ಯಾಕಥಾನ್ ಬಗ್ಗೆ ನನಗೆ ಧ್ವನಿ ಮೂಲಕ ಕೇಳಿ.`
        : currentLang === 'hi'
        ? `नमस्ते ${userName}! मैं सप्तगिरि एनपीएस विश्वविद्यालय का एआई सहायक हूँ। आप फैकल्टी लोकेशन, उपस्थिति, बस समय, नोट्स या हैकाथॉन के बारे में पूछ सकते हैं।`
        : `Hello ${userName}! I am your Sapthagiri NPS University AI Campus Agent. You can speak or type to locate faculty live on campus radar, check your attendance, look up bus timings, find notes, or get reminders.`;

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: initialWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'Where is Dr. Geetha right now?',
          'Check my attendance in OS and ML',
          'Next bus to Majestic?',
          'Tell me about SAPHACK 2026',
        ],
      },
    ]);
  }, [currentLang, userName]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
        recognition.lang = langMeta ? langMeta.speechLang : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          // Automatically submit voice query
          sendMessage(transcript);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, [currentLang]);

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Update language before starting
      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
      recognitionRef.current.lang = langMeta ? langMeta.speechLang : 'en-IN';
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Error starting speech recognition:', e);
      }
    }
  };

  // Text to Speech playback
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any active utterance

      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
      utterance.lang = langMeta ? langMeta.speechLang : 'en-IN';
      utterance.rate = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Send Message
  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
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
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I am ready to help you with your campus queries.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, botMsg]);

      // If a reminder was detected by the agent, auto-schedule it
      if (data.detectedReminder) {
        onReminderDetected(data.detectedReminder);
      }

      // Auto speak response
      speakText(botMsg.text);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'I am here to assist you. Please verify your query or select from the quick options below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[580px] transition-all">
      {/* Voice Assistant Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/30 border border-blue-300/40 flex items-center justify-center text-white backdrop-blur">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-blue-950" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
              Voice Campus Agent
              <span className="text-[10px] font-semibold bg-blue-400/20 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                Gemini Powered
              </span>
            </h3>
            <p className="text-xs text-blue-200/80">
              {isListening ? (
                <span className="text-red-300 font-semibold animate-pulse">
                  ● {getTranslation(currentLang, 'listening')}
                </span>
              ) : (
                'Speak in any of the 6 languages'
              )}
            </p>
          </div>
        </div>

        {/* Audio control button */}
        <button
          onClick={() => {
            if (isSpeaking) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }
          }}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isSpeaking
              ? 'bg-amber-400 text-slate-900 font-bold animate-pulse'
              : 'bg-white/10 hover:bg-white/20 text-blue-100'
          }`}
          title={isSpeaking ? 'Stop Speaking' : 'Audio Readout'}
        >
          {isSpeaking ? <Volume2 className="w-4 h-4" /> : <Volume2 className="w-4 h-4 opacity-70" />}
          <span className="text-[11px] hidden sm:inline">{isSpeaking ? 'Speaking...' : 'TTS'}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-75 font-semibold">
                <span>{msg.sender === 'user' ? userName : 'SNPU Campus AI'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

              {/* Action speaker button for assistant message */}
              {msg.sender === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => speakText(msg.text)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>
              )}
            </div>

            {/* Suggested quick action pills for bot message */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {msg.suggestedActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(action)}
                    className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-full px-3 py-1 font-medium transition-all shadow-2xs hover:shadow-xs"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium bg-white p-3 rounded-2xl border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1">Synthesizing campus knowledge...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Mic Controls Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Big Voice Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white mic-active scale-105'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-102'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak into Microphone'}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={getTranslation(currentLang, 'voicePromptPlaceholder')}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 pl-4 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Voice recognition active in{' '}
            <strong className="text-slate-700 uppercase font-bold">{currentLang}</strong>
          </span>
          <span className="hidden sm:inline">Press mic or enter text</span>
        </div>
      </div>
    </div>
  );
};
