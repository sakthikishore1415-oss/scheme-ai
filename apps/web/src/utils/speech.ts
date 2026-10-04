import { SUPPORTED_LANGUAGES } from '../data/languages';

class SpeechService {
  private isSynthesizing = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private speechRate: number = 1.05; // Conversational pace
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up voices on browser load
      this.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.getVoices();
        };
      }
    }
  }

  /**
   * Retrieves all available voices, caching loaded voices for asynchronous readiness.
   */
  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    let voices = window.speechSynthesis.getVoices();
    if ((!voices || voices.length === 0) && this.cachedVoices.length > 0) {
      voices = this.cachedVoices;
    }
    if (voices && voices.length > 0) {
      this.cachedVoices = voices;
    }
    return voices || [];
  }

  /**
   * Selects the best available voice for the specified language ID.
   * If an exact regional voice is unavailable, uses an appropriate voice from the same language family
   * rather than falling back directly to English.
   */
  public getBestVoice(langId: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
    const bcp47 = (langConfig.bcp47Code || 'ta-IN').toLowerCase();
    const langPrefix = (langConfig.id || langId || 'ta').toLowerCase();
    const langName = (langConfig.name || '').toLowerCase();
    const nativeName = (langConfig.nativeName || '').toLowerCase();

    const isEnglish = langPrefix === 'en';

    // 1. Exact match on BCP-47 locale code (e.g., "ta-in", "hi-in", "te-in", "kn-in", "ml-in", "mr-in", "bn-in", "gu-in", "or-in", "pa-in", "as-in")
    let best = voices.find(
      (v) =>
        v.lang.toLowerCase() === bcp47 ||
        v.lang.toLowerCase().replace('_', '-') === bcp47
    );
    if (best) return best;

    // 2. Match on language prefix (e.g., "ta-", "hi-", "te-", "kn-", "ml-", "mr-", "bn-", "gu-", "or-", "pa-", "as-")
    best = voices.find(
      (v) =>
        v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix + '-') ||
        v.lang.toLowerCase() === langPrefix
    );
    if (best) return best;

    // 3. Match on voice name or native name (e.g., "Google தமிழ்", "Microsoft Swara - Hindi", "Google Hindi")
    best = voices.find(
      (v) =>
        (langName && v.name.toLowerCase().includes(langName)) ||
        (nativeName && v.name.toLowerCase().includes(nativeName))
    );
    if (best) return best;

    // 4. Substring match on lang tag (excluding English voices when looking for non-English)
    if (!isEnglish) {
      best = voices.find(
        (v) =>
          v.lang.toLowerCase().includes(langPrefix) &&
          !v.lang.toLowerCase().startsWith('en')
      );
      if (best) return best;

      // 5. Fallback for Indian regional languages when specific regional voice is missing:
      // Look for any available Indic language voice (hi, ta, te, kn, ml, mr, bn, gu, pa, as)
      // so it speaks using an Indic phoneme engine instead of falling back to English!
      const indicPrefixes = ['hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'or', 'pa', 'as'];
      best = voices.find((v) => {
        const vl = v.lang.toLowerCase().replace('_', '-');
        return indicPrefixes.some((pref) => vl.startsWith(pref + '-') || vl === pref);
      });
      if (best) return best;

      // Also check voices with "India" or "-IN" in lang/name excluding default English voices
      best = voices.find(
        (v) =>
          (v.lang.toLowerCase().includes('-in') || v.name.toLowerCase().includes('india')) &&
          !v.name.toLowerCase().includes('david') &&
          !v.name.toLowerCase().includes('zira') &&
          !v.name.toLowerCase().includes('mark')
      );
      if (best) return best;
    }

    // 6. For English, return any English voice (preferably en-IN)
    if (isEnglish) {
      best =
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('en-in') ||
            v.name.toLowerCase().includes('india')
        ) || voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (best) return best;
    }

    return voices[0] || null;
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

      // Select best voice for the language and assign explicitly
      const matchingVoice = this.getBestVoice(langId);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
        if (matchingVoice.lang) {
          utterance.lang = matchingVoice.lang;
        }
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
    const voice = this.getBestVoice(langId);
    if (!voice) return false;
    const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
    const langPrefix = (langConfig.id || langId || 'ta').toLowerCase();
    if (langPrefix === 'en') return voice.lang.toLowerCase().startsWith('en');
    return (
      voice.lang.toLowerCase().startsWith(langPrefix) ||
      voice.name.toLowerCase().includes(langConfig.name.toLowerCase()) ||
      voice.name.toLowerCase().includes(langConfig.nativeName.toLowerCase())
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
