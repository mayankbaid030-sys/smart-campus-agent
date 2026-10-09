'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableVoices, speakSmoothly, stopSpeaking } from '@/lib/voiceEngine';
import {
  Volume2,
  Sliders,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Mic,
  Moon,
  Sun,
} from 'lucide-react';

interface VoiceSettingsModalProps {
  currentVoiceURI?: string;
  handsFreeMode?: boolean;
  onSave: (voiceURI: string, handsFree: boolean) => void;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  currentVoiceURI,
  handsFreeMode = false,
  onSave,
  onClose,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedURI, setSelectedURI] = useState(currentVoiceURI || '');
  const [handsFree, setHandsFree] = useState(handsFreeMode);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    getAvailableVoices().then((loaded) => {
      setVoices(loaded);
      if (!selectedURI && loaded.length > 0) {
        setSelectedURI(loaded[0].voiceURI);
      }
    });
  }, []);

  const handlePreview = (voiceURI: string) => {
    stopSpeaking();
    setIsPlayingPreview(true);
    speakSmoothly(
      'Welcome to Sapthagiri NPS University. I am your voice-first AI campus assistant.',
      'en-IN',
      {
        onEnd: () => setIsPlayingPreview(false),
        onError: () => setIsPlayingPreview(false),
      },
      voiceURI
    );
  };

  const handleSave = () => {
    stopSpeaking();
    onSave(selectedURI, handsFree);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131226] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-900/50 to-pink-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-500/20 text-pink-300 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white font-heading">
                Voice & Speech Preferences
              </h3>
              <p className="text-xs text-slate-400">Customized per account & stored on device</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Hands-Free Mode Toggle */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-white">Hands-Free Loop Mode</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Auto-restart listening after the assistant finishes speaking
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={handsFree}
                onChange={(e) => setHandsFree(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {/* Voice Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Installed Neural / System Voices ({voices.length})
              </label>
              <span className="text-[10px] text-pink-400 font-semibold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                Auto-Picks Natural Voice
              </span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {voices.map((v) => {
                const isSelected = selectedURI === v.voiceURI;
                const isNatural = v.name.includes('Natural') || v.name.includes('Online');
                const isGoogle = v.name.includes('Google');

                return (
                  <div
                    key={v.voiceURI}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-violet-900/40 border-pink-500/60 shadow-xs'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedURI(v.voiceURI)}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{v.name}</span>
                        {isNatural && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            Neural
                          </span>
                        )}
                        {isGoogle && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                            Google
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">{v.lang}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePreview(v.voiceURI)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/10 hover:bg-pink-600 text-slate-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      title="Preview this voice"
                    >
                      <Play className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-gradient px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Voice Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
