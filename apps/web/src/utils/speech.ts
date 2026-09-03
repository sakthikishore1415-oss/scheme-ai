import { SUPPORTED_LANGUAGES } from '../data/languages';

class SpeechService {
  private isSynthesizing = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioContext: AudioContext | null = null;
  private speechRate: number = 1.12; // Fast, natural, responsive conversational pace

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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in browser, using audio simulation fallback.');
      this.simulateSpeechAudio(text, onStart, onEnd);
      return;
    }

    try {
      // Ensure audio context is unpaused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langConfig.bcp47Code || 'ta-IN';
      utterance.rate = overrideRate || this.speechRate;
      utterance.pitch = 1.0;

      // Find best matching system voice
      const voices = window.speechSynthesis.getVoices();
      const targetCode = (langConfig.bcp47Code || 'ta-IN').toLowerCase();
      const langPrefix = (langConfig.id || 'ta').toLowerCase();

      const voice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetCode ||
          v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix) ||
          v.name.toLowerCase().includes(langConfig.name.toLowerCase())
      );

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSynthesizing = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSynthesizing = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        this.isSynthesizing = false;
        this.currentUtterance = null;
        this.simulateSpeechAudio(text, onStart, onEnd);
        if (onError) onError(e);
      };

      this.currentUtterance = utterance;

      // Small tick delay to avoid Chrome cancel race condition
      setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn('SpeechSynthesis speak failed:', err);
          this.simulateSpeechAudio(text, onStart, onEnd);
        }
      }, 20);
    } catch (err) {
      console.warn('Failed to initialize speech utterance:', err);
      this.simulateSpeechAudio(text, onStart, onEnd);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
    return this.isSynthesizing || (typeof window !== 'undefined' && window.speechSynthesis?.speaking);
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
