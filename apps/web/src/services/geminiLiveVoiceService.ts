import { getVoicePack } from '../data/locales';
import { extractProfileFromSpokenText } from '../utils/nlpExtractor';
import { speechService } from '../utils/speech';

export type GeminiLiveVoiceState =
  | 'IDLE'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'LISTENING'
  | 'USER_SPEAKING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'MUTED'
  | 'DISCONNECTED'
  | 'ERROR';

export interface GeminiLiveMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
  timestamp: number;
  toolCalls?: Array<{ name: string; args: any; result?: any }>;
}

export interface GeminiLiveVoiceCallbacks {
  onStateChange: (state: GeminiLiveVoiceState) => void;
  onAudioLevel: (level: number) => void;
  onMessage: (message: GeminiLiveMessage) => void;
  onMessageDelta?: (id: string, delta: string) => void;
  onProfileExtracted?: (profile: Record<string, any>) => void;
  onToolCall?: (name: string, args: any) => Promise<any>;
  onError?: (error: string) => void;
}

export class GeminiLiveVoiceService {
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private state: GeminiLiveVoiceState = 'IDLE';
  private callbacks: GeminiLiveVoiceCallbacks | null = null;
  private isMuted: boolean = false;
  private recognition: any = null;
  private currentLanguageId: string = 'ta';
  private currentStateName: string = 'Tamil Nadu';
  private isListeningActive: boolean = false;

  public async startSession(
    languageId: string,
    stateName: string,
    callbacks: GeminiLiveVoiceCallbacks
  ): Promise<void> {
    this.callbacks = callbacks;
    this.currentLanguageId = languageId;
    this.currentStateName = stateName;
    this.setState('CONNECTING');

    // 1. Initialize microphone stream for audio visualizer
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.setupAudioAnalyser(this.localStream);
    } catch (err: any) {
      console.warn('Microphone stream access notice:', err);
    }

    // 2. Initialize Direct Speech Recognition
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      this.setState('ERROR');
      callbacks.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Android Browser.');
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      const bcp47Map: Record<string, string> = {
        ta: 'ta-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
        te: 'te-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        gu: 'gu-IN',
        or: 'or-IN',
        pa: 'pa-IN',
        en: 'en-IN',
      };
      this.recognition.lang = bcp47Map[this.currentLanguageId] || 'ta-IN';

      this.recognition.onstart = () => {
        this.isListeningActive = true;
        if (this.state !== 'SPEAKING' && this.state !== 'THINKING') {
          this.setState('LISTENING');
        }
      };

      this.recognition.onresult = (event: any) => {
        if (this.isMuted) return;

        // Auto-interrupt speech synthesis when user starts speaking
        if (this.state === 'SPEAKING' || speechService.isSpeaking()) {
          speechService.stop();
          this.setState('USER_SPEAKING');
        }

        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          this.setState('USER_SPEAKING');
        }

        if (final.trim()) {
          const spokenText = final.trim();
          this.callbacks?.onMessage({
            id: `user-${Date.now()}`,
            role: 'user',
            text: spokenText,
            timestamp: Date.now(),
          });
          this.processTurn(spokenText);
        }
      };

      this.recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition warning:', e);
        }
      };

      this.recognition.onend = () => {
        // Keep continuous listener alive unless explicitly disconnected
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE' && this.isListeningActive) {
          try {
            this.recognition.start();
          } catch (_) {}
        }
      };

      this.recognition.start();
      this.isListeningActive = true;

      // Speak welcome greeting in citizen's selected language
      const voicePack = getVoicePack(this.currentLanguageId);
      const greeting = voicePack.greetingPrompt || 'வணக்கம்! நான் அறிவோம். உங்களுக்கு என்ன அரசு திட்டம் வேண்டும்?';
      this.speak(greeting);
    } catch (e: any) {
      console.error('Failed to start speech recognition engine:', e);
      this.setState('ERROR');
      callbacks.onError?.('Could not activate speech recognition.');
    }
  }

  private async processTurn(text: string) {
    this.setState('THINKING');

    // 1. Extract demographics/criteria from spoken words
    const extracted = extractProfileFromSpokenText(text, this.currentLanguageId);
    if (Object.keys(extracted).length > 0) {
      this.callbacks?.onProfileExtracted?.(extracted);
    }

    // 2. Retrieve current matching schemes
    let topSchemes: any[] = [];
    if (this.callbacks?.onToolCall) {
      try {
        const matchResult = await this.callbacks.onToolCall('findEligibleSchemes', {});
        if (matchResult && matchResult.schemes) {
          topSchemes = matchResult.schemes;
        }
      } catch (err) {
        console.warn('Tool call error:', err);
      }
    }

    // 3. Generate natural response via Gemini-flash-latest
    let responseText = await this.generateGeminiReply(text, topSchemes);

    // 4. Deterministic fallback if offline
    if (!responseText) {
      if (topSchemes.length > 0) {
        const top = topSchemes[0];
        if (this.currentLanguageId === 'ta') {
          responseText = `உங்கள் தகுதியின்படி ${topSchemes.length} அரசு திட்டங்கள் கண்டறியப்பட்டன. முதன்மை திட்டம்: ${top.name}. இதன் பலன்களை அறிய விரும்புகிறீர்களா?`;
        } else if (this.currentLanguageId === 'ml') {
          responseText = `താങ്കളുടെ വിവരങ്ങൾ പ്രകാരം ${topSchemes.length} സർക്കാർ പദ്ധതികൾ കണ്ടെത്തി. പ്രധാന പദ്ധതി: ${top.name}. കൂടുതൽ വിവരങ്ങൾ അറിയണമെന്നുണ്ടോ?`;
        } else {
          responseText = `Based on your profile, ${topSchemes.length} schemes match your criteria, including ${top.name}. Would you like to hear the benefits?`;
        }
      } else {
        const voicePack = getVoicePack(this.currentLanguageId);
        responseText = voicePack.heardConfirmation(text);
      }
    }

    // 5. Speak response aloud
    this.speak(responseText);
  }

  private async generateGeminiReply(spokenText: string, matchingSchemes: any[]): Promise<string> {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
    if (!apiKey) return '';

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      const systemInstruction =
        this.currentLanguageId === 'ml'
          ? 'നിങ്ങൾ അറിവോം (Arivom) എന്ന സർക്കാർ പദ്ധതി ശബ്ദ സഹായിയാണ്. സ്വാഭാവിക മലയാളത്തിൽ മാത്രം സംസാരിക്കുക. തമിഴ് വാക്കുകൾ ഒരിക്കലും ഉപയോഗിക്കരുത്. പദ്ധതി അർஹതകൾ നൽകിയ വിവരങ്ങളിൽ നിന്ന് മാത്രം പറയുക.'
          : this.currentLanguageId === 'ta'
          ? 'நீங்கள் அறிவோம் (Arivom) அரசு நலத்திட்ட குரல் வழிகாட்டி. இயல்பான தமிழில் மட்டும் பேசவும். அரசு திட்ட தகவல்களை எப்போதும் துல்லியமாக விளக்குங்கள்.'
          : `You are Arivom, a friendly government scheme discovery assistant for India (${this.currentStateName}). Keep responses concise (1-2 sentences), warm, conversational, and strictly grounded in the provided verified schemes.`;

      const schemeSummary = matchingSchemes
        .slice(0, 3)
        .map((s) => `${s.name} (${s.benefits || s.shortSummary || 'Welfare'})`)
        .join('; ');

      const prompt = `
Citizen Spoke: "${spokenText}"
State: ${this.currentStateName}
Verified Matching Schemes: ${schemeSummary || 'None currently matched'}

Respond in 1-2 natural spoken sentences directly answering the user in the selected language (${this.currentLanguageId}).
`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 150,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate.trim();
      }
    } catch (e) {
      console.warn('Gemini generateContent request failed:', e);
    }
    return '';
  }

  public speak(text: string) {
    this.callbacks?.onMessage({
      id: `asst-${Date.now()}`,
      role: 'assistant',
      text,
      timestamp: Date.now(),
    });

    this.setState('SPEAKING');
    speechService.speak(
      text,
      this.currentLanguageId,
      () => this.setState('SPEAKING'),
      () => {
        if (this.state !== 'DISCONNECTED') {
          this.setState('LISTENING');
        }
      }
    );
  }

  public interruptPlayback() {
    speechService.stop();
    this.setState('LISTENING');
  }

  public sendTextMessage(text: string) {
    if (!text.trim()) return;

    this.callbacks?.onMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    });

    this.processTurn(text.trim());
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.setState('MUTED');
      speechService.stop();
    } else {
      this.setState('LISTENING');
    }
    return this.isMuted;
  }

  public endSession() {
    this.isListeningActive = false;
    this.setState('DISCONNECTED');
    speechService.stop();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private setupAudioAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (this.state === 'DISCONNECTED' || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1.0, avg / 128);

        this.callbacks?.onAudioLevel(normalized);
        this.animFrameId = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn('Audio analyser setup error:', e);
    }
  }

  private setState(newState: GeminiLiveVoiceState) {
    this.state = newState;
    this.callbacks?.onStateChange(newState);
  }
}

export const geminiLiveVoiceService = new GeminiLiveVoiceService();
