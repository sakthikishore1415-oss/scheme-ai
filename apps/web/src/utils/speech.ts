import { SUPPORTED_LANGUAGES } from '../data/languages';

class SpeechService {
  private isSynthesizing = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioContext: AudioContext | null = null;

  public speak(
    text: string,
    langId: string = 'ta',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in browser, using audio simulation fallback.');
      this.simulateSpeechAudio(text, onStart, onEnd);
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langConfig.bcp47Code || 'ta-IN';
    utterance.rate = 0.95; // Clear pace for citizen accessibility
    utterance.pitch = 1.0;

    // Find best voice match
    const voices = window.speechSynthesis.getVoices();
    const targetCode = langConfig.bcp47Code.toLowerCase();
    const langPrefix = langConfig.id.toLowerCase();

    const voice = voices.find(
      (v) =>
        v.lang.toLowerCase() === targetCode ||
        v.lang.toLowerCase().startsWith(langPrefix) ||
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
      console.warn('Speech synthesis error or regional voice missing, falling back to simulated speech tone:', e);
      this.isSynthesizing = false;
      this.currentUtterance = null;
      // Fallback to simulated audio if browser voice fails
      this.simulateSpeechAudio(text, onStart, onEnd);
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSynthesizing = false;
    this.currentUtterance = null;
  }

  public hasNativeVoice(langId: string): boolean {
    if (!('speechSynthesis' in window)) return false;
    const langConfig = SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['ta'];
    const voices = window.speechSynthesis.getVoices();
    const targetCode = langConfig.bcp47Code.toLowerCase();
    const langPrefix = langConfig.id.toLowerCase();

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
        }, 2000);
        return;
      }

      if (!this.audioContext) {
        this.audioContext = new AudioContextClass();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      if (onStart) onStart();

      // Generate a gentle chime + frequency pattern representing speech cadence
      const now = this.audioContext.currentTime;
      const duration = Math.min(6, Math.max(2, text.length * 0.05));

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(440, now + duration - 0.2);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + duration);

      setTimeout(() => {
        if (onEnd) onEnd();
      }, duration * 1000);
    } catch (e) {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 2000);
    }
  }
}

export const speechService = new SpeechService();
