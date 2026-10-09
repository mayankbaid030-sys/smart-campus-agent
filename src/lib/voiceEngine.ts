'use client';

import { LanguageCode } from '@/types';

// Cached voice lookup map
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Wait for browser speechSynthesis voices to load and cache them
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  if (cachedVoices.length > 0) {
    return Promise.resolve(cachedVoices);
  }

  if (voicesLoadedPromise) {
    return voicesLoadedPromise;
  }

  voicesLoadedPromise = new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
      return;
    }

    const onVoicesChanged = () => {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded.length > 0) {
        cachedVoices = loaded;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(loaded);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    // Timeout fallback after 1.5 seconds if browser doesn't trigger event
    setTimeout(() => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    }, 1500);
  });

  return voicesLoadedPromise;
}

/**
 * Pick the most natural installed voice according to the strict priority:
 * 1. Voices whose name contains "Natural" or "Online" (Microsoft Edge neural voices)
 * 2. Then "Google" voices
 * 3. Then any voice matching language code (e.g. en-IN, hi-IN, kn-IN, ta-IN, te-IN, ur-IN)
 * 4. Then any English voice
 */
export function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  targetLangCode: string,
  userPreferredVoiceURI?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // If user selected a custom voice in settings, honor it
  if (userPreferredVoiceURI) {
    const userVoice = voices.find((v) => v.voiceURI === userPreferredVoiceURI);
    if (userVoice) return userVoice;
  }

  const langPrefix = targetLangCode.toLowerCase().split('-')[0]; // e.g. 'kn', 'hi', 'en'
  const targetTag = targetLangCode.toLowerCase(); // e.g. 'kn-in'

  // Filter voices that match this language
  const matchingVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase() === targetTag ||
      v.lang.toLowerCase().startsWith(langPrefix)
  );

  // 1. Natural / Online neural voices for target language
  const naturalLanguageVoice = matchingVoices.find(
    (v) =>
      (v.name.includes('Natural') || v.name.includes('Online')) &&
      (v.lang.toLowerCase() === targetTag || v.lang.toLowerCase().startsWith(langPrefix))
  );
  if (naturalLanguageVoice) return naturalLanguageVoice;

  // 2. Google voices for target language
  const googleLanguageVoice = matchingVoices.find(
    (v) =>
      v.name.toLowerCase().includes('google') &&
      (v.lang.toLowerCase() === targetTag || v.lang.toLowerCase().startsWith(langPrefix))
  );
  if (googleLanguageVoice) return googleLanguageVoice;

  // 3. Any voice for target language
  if (matchingVoices.length > 0) {
    return matchingVoices[0];
  }

  // 4. Fallback to English Natural / Google voice
  const englishNatural = voices.find(
    (v) =>
      (v.name.includes('Natural') || v.name.includes('Online')) &&
      v.lang.toLowerCase().startsWith('en')
  );
  if (englishNatural) return englishNatural;

  const englishGoogle = voices.find(
    (v) =>
      v.name.toLowerCase().includes('google') &&
      v.lang.toLowerCase().startsWith('en')
  );
  if (englishGoogle) return englishGoogle;

  const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  return voices[0] || null;
}

/**
 * Clean text for natural speech: strip markdown symbols, tables, URLs, and emojis
 */
export function sanitizeSpeechText(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove URLs
      .replace(/https?:\/\/\S+/gi, '')
      // Remove markdown bold/italics
      .replace(/[*_~`]/g, '')
      // Remove headers (#, ##, etc)
      .replace(/^#+\s+/gm, '')
      // Remove blockquotes & list dashes
      .replace(/^>\s+/gm, '')
      .replace(/^[-*+]\s+/gm, '')
      // Remove markdown links [title](url) -> title
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove emojis
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Remove excess whitespace and newlines
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Split text into smooth sentences for interruption-free speech synthesis
 */
export function splitIntoSentences(text: string): string[] {
  const clean = sanitizeSpeechText(text);
  if (!clean) return [];

  // Split on standard punctuation or Indian danda (। / ॥)
  const rawSentences = clean.match(/[^.!?।॥]+[.!?।॥]+|[^.!?।॥]+$/g) || [clean];
  return rawSentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

export interface VoicePlaybackCallbacks {
  onStart?: () => void;
  onSentence?: (sentence: string, index: number, total: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Speak full response smoothly sentence-by-sentence
 */
export async function speakSmoothly(
  text: string,
  langCode: string,
  callbacks?: VoicePlaybackCallbacks,
  userPreferredVoiceURI?: string
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    callbacks?.onError?.('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const voices = await getAvailableVoices();
  const selectedVoice = selectBestVoice(voices, langCode, userPreferredVoiceURI);
  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    callbacks?.onEnd?.();
    return;
  }

  callbacks?.onStart?.();

  let currentIndex = 0;

  const playNext = () => {
    if (currentIndex >= sentences.length) {
      callbacks?.onEnd?.();
      return;
    }

    const sentence = sentences[currentIndex];
    callbacks?.onSentence?.(sentence, currentIndex, sentences.length);

    const utterance = new SpeechSynthesisUtterance(sentence);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = langCode;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      currentIndex++;
      playNext();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error on sentence:', e);
      currentIndex++;
      playNext();
    };

    window.speechSynthesis.speak(utterance);
  };

  playNext();
}

/**
 * Stop any active browser speech
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
