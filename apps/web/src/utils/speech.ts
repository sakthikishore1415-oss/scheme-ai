import { SUPPORTED_LANGUAGES } from '../data/languages';

const LANGUAGE_VOICE_MAP: Record<string, string> = {
  ta: 'Aoede',
  hi: 'Kore',
  te: 'Fenrir',
  kn: 'Aoede',
  ml: 'Charon',
  mr: 'Kore',
  bn: 'Puck',
  gu: 'Zephyr',
  or: 'Kore',
  pa: 'Fenrir',
  as: 'Aoede',
  en: 'Kore',
};

class SpeechService {
  private isSynthesizing = false;
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private speechRate: number = 1.05; // Conversational pace
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private resumeHeartbeat: any = null;
  private isAudioUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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
   */
  public getBestVoice(langId: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const langConfig = SUPPORTED_LANGUAGES[langId];
    const bcp47 = (langConfig?.bcp47Code || langId || 'en-IN').toLowerCase().replace('_', '-');
    const langPrefix = langId.toLowerCase().split('-')[0].split('_')[0];
    const langName = (langConfig?.name || '').toLowerCase();
    const nativeName = (langConfig?.nativeName || '').toLowerCase();

    const isEnglish = langPrefix === 'en';

    // 1. Exact match on full locale tag
    let best = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === bcp47
    );
    if (best) return best;

    // 2. Match on language prefix
    best = voices.find(
      (v) =>
        v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix + '-') ||
        v.lang.toLowerCase().replace('_', '-') === langPrefix
    );
    if (best) return best;

    // 3. Match on voice name or native name
    best = voices.find(
      (v) =>
        (langName && v.name.toLowerCase().includes(langName)) ||
        (nativeName && v.name.toLowerCase().includes(nativeName))
    );
    if (best) return best;

    // 4. Substring match on lang tag
    if (!isEnglish) {
      best = voices.find(
        (v) =>
          v.lang.toLowerCase().includes(langPrefix) &&
          !v.lang.toLowerCase().startsWith('en')
      );
      if (best) return best;

      // 5. Fallback for Indian regional languages
      const indicPrefixes = ['hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'or', 'pa', 'as', 'ur'];
      if (indicPrefixes.includes(langPrefix)) {
        best = voices.find((v) => {
          const vl = v.lang.toLowerCase().replace('_', '-');
          return indicPrefixes.some((pref) => vl.startsWith(pref + '-') || vl === pref);
        });
        if (best) return best;

        best = voices.find(
          (v) =>
            (v.lang.toLowerCase().includes('-in') || v.name.toLowerCase().includes('india')) &&
            !v.name.toLowerCase().includes('david') &&
            !v.name.toLowerCase().includes('zira') &&
            !v.name.toLowerCase().includes('mark')
        );
        if (best) return best;
      }
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
        this.isAudioUnlocked = true;
      } catch (_) {}
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      }
    } catch (_) {}
  }

  private startResumeHeartbeat() {
    this.stopResumeHeartbeat();
    this.resumeHeartbeat = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (this.isSynthesizing && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 250);
  }

  private stopResumeHeartbeat() {
    if (this.resumeHeartbeat) {
      clearInterval(this.resumeHeartbeat);
      this.resumeHeartbeat = null;
    }
  }

  /**
   * Primary voice speech dispatcher:
   * 1. If Gemini TTS endpoint is available or browser lacks native voice, use Gemini TTS.
   * 2. Otherwise use local browser SpeechSynthesis.
   * 3. Fallback to harmonic audio tones if both fail, so audio is NEVER dead.
   */
  public async speak(
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

    // 1. If language is not English and browser has no native voice for this language, try Gemini TTS first!
    const hasNative = this.hasNativeVoice(langId);
    if (!hasNative || langId !== 'en') {
      const ttsSuccess = await this.tryGeminiTTS(cleanText, langId, onStart, onEnd);
      if (ttsSuccess) return;
    }

    // 2. Use browser SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        try {
          window.speechSynthesis.cancel();
        } catch (_) {}

        const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const bcp47 = langConfig?.bcp47Code || 'ta-IN';
        utterance.lang = bcp47;
        utterance.rate = overrideRate || this.speechRate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const matchingVoice = this.getBestVoice(langId);
        if (matchingVoice) {
          utterance.voice = matchingVoice;
          if (matchingVoice.lang) {
            utterance.lang = matchingVoice.lang;
          }
        }

        this.activeUtterances.add(utterance);
        let hasFinished = false;

        const finishUtterance = (source: string = 'normal') => {
          if (hasFinished) return;
          hasFinished = true;
          this.isSynthesizing = false;
          this.stopResumeHeartbeat();
          this.activeUtterances.delete(utterance);
          if (onEnd) onEnd();
        };

        utterance.onstart = () => {
          this.isSynthesizing = true;
          this.startResumeHeartbeat();
          if (onStart) onStart();
        };

        utterance.onend = () => {
          finishUtterance('onend');
        };

        utterance.onerror = (e) => {
          console.warn(`SpeechSynthesis error (${e.error}):`, e);
          finishUtterance('onerror');
          // If browser speech synthesis fails, simulate tone so citizen knows system replied
          this.simulateSpeechAudio(cleanText, onStart, onEnd);
          if (onError) onError(e);
        };

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
            console.warn('SpeechSynthesis speak fallback error:', err);
            finishUtterance('catch');
            this.simulateSpeechAudio(cleanText, onStart, onEnd);
          }
        }, 50);
        return;
      } catch (err) {
        console.warn('Failed to initialize speech utterance:', err);
      }
    }

    // 3. Fallback to pleasant tone audio
    this.simulateSpeechAudio(cleanText, onStart, onEnd);
  }

  /**
   * Attempts to play speech using Gemini TTS
   */
  private async tryGeminiTTS(
    text: string,
    langId: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    try {
      const voiceName = LANGUAGE_VOICE_MAP[langId] || 'Aoede';
      const res = await fetch('/api/gemini-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName,
          languageId: langId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const audio = new Audio(data.audio);
          this.currentAudioElement = audio;

          return new Promise<boolean>((resolve) => {
            audio.onplay = () => {
              this.isSynthesizing = true;
              if (onStart) onStart();
            };
            audio.onended = () => {
              this.isSynthesizing = false;
              this.currentAudioElement = null;
              if (onEnd) onEnd();
              resolve(true);
            };
            audio.onerror = () => {
              this.isSynthesizing = false;
              this.currentAudioElement = null;
              resolve(false);
            };
            audio.play().catch(() => {
              this.isSynthesizing = false;
              this.currentAudioElement = null;
              resolve(false);
            });
          });
        }
      }
    } catch (_) {
      // Fall through to browser speech synthesis
    }
    return false;
  }

  public stop() {
    this.isSynthesizing = false;
    this.stopResumeHeartbeat();
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
    this.activeUtterances.clear();
  }

  public hasNativeVoice(langId: string): boolean {
    const voice = this.getBestVoice(langId);
    if (!voice) return false;
    const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
    const langPrefix = (langConfig?.id || langId || 'ta').toLowerCase();
    if (langPrefix === 'en') return voice.lang.toLowerCase().startsWith('en');
    return (
      voice.lang.toLowerCase().startsWith(langPrefix) ||
      (langConfig?.name && voice.name.toLowerCase().includes(langConfig.name.toLowerCase())) ||
      (langConfig?.nativeName && voice.name.toLowerCase().includes(langConfig.nativeName.toLowerCase()))
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
  public simulateSpeechAudio(text: string, onStart?: () => void, onEnd?: () => void) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        if (onStart) onStart();
        setTimeout(() => {
          if (onEnd) onEnd();
        }, 1200);
        return;
      }

      if (!this.audioContext) {
        this.audioContext = new AudioContextClass();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
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
      }, 800);
    } catch (e) {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 800);
    }
  }
}

export const speechService = new SpeechService();
