import { SUPPORTED_LANGUAGES } from '../data/languages';

class SpeechService {
  private isSynthesizing = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private speechRate: number = 1.05; // Conversational pace

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up voices on browser load
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }

  public setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.75, Math.min(2.0, rate));
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public unlockAudio() {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (_) {}
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        this.audioContext.resume();
      } catch (_) {}
    }
  }

  public speak(
    text: string,
    langId: string = 'ta',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void,
    overrideRate?: number
  ) {
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    this.unlockAudio();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.simulateSpeechAudio(cleanText, onStart, onEnd);
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const bcp47 = langConfig.bcp47Code || 'ta-IN';
      utterance.lang = bcp47;
      utterance.rate = overrideRate || this.speechRate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Look for authentic native voice matching language code or name (e.g. ta, hi, te, kn, ml, mr, bn, gu, or, pa, as, etc.)
      const voices = window.speechSynthesis.getVoices();
      const targetCode = bcp47.toLowerCase();
      const langPrefix = (langConfig.id || 'ta').toLowerCase();

      const matchingVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetCode ||
          v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix) ||
          (v.lang.toLowerCase().includes(langPrefix) && !v.lang.toLowerCase().startsWith('en')) ||
          v.name.toLowerCase().includes(langConfig.name.toLowerCase()) ||
          v.name.toLowerCase().includes(langConfig.nativeName.toLowerCase())
      );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      let hasFinished = false;
      let watchdogTimer: any = null;

      const finishUtterance = () => {
        if (hasFinished) return;
        hasFinished = true;
        if (watchdogTimer) clearTimeout(watchdogTimer);
        this.isSynthesizing = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onstart = () => {
        this.isSynthesizing = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        finishUtterance();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance notice:', e);
        finishUtterance();
        if (onError) onError(e);
      };

      this.currentUtterance = utterance;

      const expectedDurationMs = Math.max(3000, Math.min(15000, cleanText.length * 90));
      watchdogTimer = setTimeout(() => {
        if (!hasFinished && this.isSynthesizing) {
          finishUtterance();
        }
      }, expectedDurationMs);

      // Speak with safe microtask delay (60ms allows Chrome speech engine pipeline to reset after cancel)
      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (err) {
          console.warn('SpeechSynthesis speak fallback:', err);
          finishUtterance();
        }
      }, 60);
    } catch (err) {
      console.warn('Failed to initialize speech utterance:', err);
      if (onEnd) onEnd();
    }
  }

  public stop() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (_) {}
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    this.isSynthesizing = false;
    this.currentUtterance = null;
  }

  public hasNativeVoice(langId: string): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
    const voices = window.speechSynthesis.getVoices();
    const targetCode = (langConfig.bcp47Code || 'ta-IN').toLowerCase();
    const langPrefix = (langConfig.id || 'ta').toLowerCase();

    return voices.some(
      (v) =>
        v.lang.toLowerCase() === targetCode ||
        v.lang.toLowerCase().startsWith(langPrefix) ||
        v.name.toLowerCase().includes(langConfig.name.toLowerCase())
    );
  }

  public isSpeaking(): boolean {
    return (
      this.isSynthesizing ||
      (this.currentAudioElement !== null && !this.currentAudioElement.paused) ||
      (typeof window !== 'undefined' && window.speechSynthesis?.speaking)
    );
  }

  // Audio tone simulation fallback so audio is NEVER dead
  private simulateSpeechAudio(text: string, onStart?: () => void, onEnd?: () => void) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        if (onStart) onStart();
        setTimeout(() => {
          if (onEnd) onEnd();
        }, 1500);
        return;
      }

      if (!this.audioContext) {
        this.audioContext = new AudioContextClass();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      if (onStart) onStart();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, this.audioContext.currentTime); // D5 pleasant chime
      oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.3); // A5

      gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.6);

      setTimeout(() => {
        if (onEnd) onEnd();
      }, 1000);
    } catch (e) {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 1000);
    }
  }
}

export const speechService = new SpeechService();
