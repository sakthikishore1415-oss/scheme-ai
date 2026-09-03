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

  public speak(
    text: string,
    langId: string = 'ta',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void,
    overrideRate?: number
  ) {
    const cleanText = text.replace(/[*_#`[\]()]/g, '').replace(/\s+/g, ' ').trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
    const tlMap: Record<string, string> = {
      ta: 'ta',
      hi: 'hi',
      te: 'te',
      kn: 'kn',
      ml: 'ml',
      mr: 'mr',
      bn: 'bn',
      gu: 'gu',
      pa: 'pa',
      or: 'or',
      as: 'as',
      en: 'en-IN',
    };
    const tlCode = tlMap[langId] || langId || 'ta';

    // Tier 1: Try High-Fidelity Online Indic TTS stream (supports all Indian regional languages in any browser)
    if (typeof window !== 'undefined' && navigator.onLine && cleanText.length <= 250) {
      try {
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          cleanText
        )}&tl=${tlCode}&client=tw-ob`;

        const audio = new Audio(audioUrl);
        audio.playbackRate = overrideRate || this.speechRate;
        this.currentAudioElement = audio;

        let hasFinished = false;
        const cleanupAudio = () => {
          if (hasFinished) return;
          hasFinished = true;
          this.isSynthesizing = false;
          this.currentAudioElement = null;
          if (onEnd) onEnd();
        };

        audio.onplay = () => {
          this.isSynthesizing = true;
          if (onStart) onStart();
        };

        audio.onended = () => {
          cleanupAudio();
        };

        audio.onerror = () => {
          // If network TTS fails, fall back gracefully to browser SpeechSynthesis
          this.speakViaSpeechSynthesis(cleanText, langConfig, onStart, onEnd, onError, overrideRate);
        };

        // Safety timeout in case audio loading stalls
        const maxAudioDuration = Math.max(4000, cleanText.length * 90);
        setTimeout(() => {
          if (!hasFinished && this.currentAudioElement === audio) {
            cleanupAudio();
          }
        }, maxAudioDuration);

        audio.play().catch(() => {
          // Auto-play was blocked or failed, fallback to SpeechSynthesis
          this.speakViaSpeechSynthesis(cleanText, langConfig, onStart, onEnd, onError, overrideRate);
        });
        return;
      } catch (_) {
        // Fall through to SpeechSynthesis
      }
    }

    // Tier 2: Browser SpeechSynthesis
    this.speakViaSpeechSynthesis(cleanText, langConfig, onStart, onEnd, onError, overrideRate);
  }

  private speakViaSpeechSynthesis(
    text: string,
    langConfig: any,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void,
    overrideRate?: number
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.simulateSpeechAudio(text, onStart, onEnd);
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langConfig.bcp47Code || 'ta-IN';
      utterance.rate = overrideRate || this.speechRate;
      utterance.pitch = 1.0;

      // Find best matching voice
      const voices = window.speechSynthesis.getVoices();
      const targetCode = (langConfig.bcp47Code || 'ta-IN').toLowerCase();
      const langPrefix = (langConfig.id || 'ta').toLowerCase();

      let voice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetCode ||
          v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix) ||
          v.name.toLowerCase().includes(langConfig.name.toLowerCase())
      );

      // If no exact regional voice is installed, fallback to Indian English or first available voice
      if (!voice && voices.length > 0) {
        voice = voices.find((v) => v.lang.toLowerCase().includes('in') || v.lang.toLowerCase().includes('en')) || voices[0];
      }

      if (voice) {
        utterance.voice = voice;
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
        console.warn('Speech synthesis notice:', e);
        finishUtterance();
        if (onError) onError(e);
      };

      this.currentUtterance = utterance;

      const expectedDurationMs = Math.max(3000, Math.min(15000, text.length * 85));
      watchdogTimer = setTimeout(() => {
        if (!hasFinished && this.isSynthesizing) {
          finishUtterance();
        }
      }, expectedDurationMs);

      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('SpeechSynthesis speak fallback:', err);
          finishUtterance();
        }
      }, 20);
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
