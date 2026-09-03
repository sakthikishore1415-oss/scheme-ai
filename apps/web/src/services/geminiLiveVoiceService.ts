import { GEMINI_LIVE_TOOLS, getArivomGeminiSystemInstruction } from './realtimeSessionManager';
import { speechService } from '../utils/speech';
import { extractProfileFromSpokenText } from '../utils/nlpExtractor';
import { getVoicePack } from '../data/locales';

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
  private ws: WebSocket | null = null;
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private playbackContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private processorNode: ScriptProcessorNode | null = null;

  private state: GeminiLiveVoiceState = 'IDLE';
  private callbacks: GeminiLiveVoiceCallbacks | null = null;
  private isMuted: boolean = false;
  private currentAssistantMessageId: string | null = null;
  private fallbackMode: boolean = false;
  private fallbackRecognition: any = null;
  private currentLanguageId: string = 'en';
  private currentStateName: string = 'Tamil Nadu';

  public async startSession(
    languageId: string,
    stateName: string,
    callbacks: GeminiLiveVoiceCallbacks
  ): Promise<void> {
    this.callbacks = callbacks;
    this.currentLanguageId = languageId;
    this.currentStateName = stateName;
    this.setState('CONNECTING');

    // 1. Request microphone permission & audio stream
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });
      this.setupAudioAnalyser(this.localStream);
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      this.setState('ERROR');
      callbacks.onError?.('Microphone permission denied or no audio device found.');
      return;
    }

    // 2. Connect to secure Gemini Live WebSocket Gateway
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/gemini-live-ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.fallbackMode = false;
        this.setState('LISTENING');

        // Send initial setup frame
        const setupFrame = {
          setup: {
            model: 'models/gemini-2.5-flash-native-audio-latest',
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Aoede',
                  },
                },
              },
            },
            systemInstruction: {
              parts: [{ text: getArivomGeminiSystemInstruction(this.currentLanguageId, this.currentStateName) }],
            },
            tools: [{ functionDeclarations: GEMINI_LIVE_TOOLS }],
          },
        };
        this.ws?.send(JSON.stringify(setupFrame));

        // Start streaming PCM audio from microphone
        this.startPcmStreaming();
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          await this.handleGeminiServerMessage(data);
        } catch (err) {
          console.error('Error handling Gemini server message:', err);
        }
      };

      this.ws.onerror = () => {
        console.warn('Gemini Live WS gateway unavailable, using continuous duplex engine.');
        this.initContinuousDuplexFallback();
      };

      this.ws.onclose = () => {
        if (this.state !== 'DISCONNECTED' && !this.fallbackMode) {
          this.initContinuousDuplexFallback();
        }
      };
    } catch (e) {
      this.initContinuousDuplexFallback();
    }
  }

  private startPcmStreaming() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(this.localStream!);
      
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.processorNode.onaudioprocess = (e) => {
        if (this.isMuted || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32 to Int16 PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Send base64 PCM chunk
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        const realtimeInput = {
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio,
              },
            ],
          },
        };
        this.ws.send(JSON.stringify(realtimeInput));
      };

      source.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);
    } catch (err) {
      console.warn('PCM streaming setup error:', err);
    }
  }

  private async handleGeminiServerMessage(data: any) {
    // 1. Check for barge-in / interruption
    if (data.serverContent?.interrupted) {
      this.interruptPlayback();
      this.setState('INTERRUPTED');
      return;
    }

    // 2. Check for model audio output
    if (data.serverContent?.modelTurn?.parts) {
      this.setState('SPEAKING');
      for (const part of data.serverContent.modelTurn.parts) {
        if (part.text) {
          if (!this.currentAssistantMessageId) {
            this.currentAssistantMessageId = `asst-${Date.now()}`;
            this.callbacks?.onMessage({
              id: this.currentAssistantMessageId,
              role: 'assistant',
              text: part.text,
              timestamp: Date.now(),
            });
          } else {
            this.callbacks?.onMessageDelta?.(this.currentAssistantMessageId, part.text);
          }
        }
        if (part.inlineData?.data) {
          this.playPcm16AudioChunk(part.inlineData.data);
        }
      }
    }

    // 3. Check for Tool / Function Calls
    if (data.toolCall?.functionCalls) {
      this.setState('THINKING');
      const functionResponses = [];
      for (const call of data.toolCall.functionCalls) {
        let result = { status: 'success' };
        if (this.callbacks?.onToolCall) {
          result = await this.callbacks.onToolCall(call.name, call.args || {});
        }
        functionResponses.push({
          response: { output: result },
          id: call.id,
        });
      }

      // Send function response back to Gemini Live
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            toolResponse: {
              functionResponses,
            },
          })
        );
      }
    }

    if (data.serverContent?.turnComplete) {
      this.currentAssistantMessageId = null;
      this.setState('LISTENING');
    }
  }

  private playPcm16AudioChunk(base64Data: string) {
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);

      if (!this.playbackContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.playbackContext = new AudioCtx({ sampleRate: 24000 });
      }

      const audioBuffer = this.playbackContext.createBuffer(1, pcm16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 32768.0;
      }

      const bufferSource = this.playbackContext.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.connect(this.playbackContext.destination);
      bufferSource.start();
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  // ==========================================
  // CONTINUOUS BROWSER DUPLEX FALLBACK
  // ==========================================
  private initContinuousDuplexFallback() {
    this.fallbackMode = true;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      this.setState('ERROR');
      this.callbacks?.onError?.('Speech recognition not supported in this browser.');
      return;
    }

    this.fallbackRecognition = new SpeechRec();
    this.fallbackRecognition.continuous = true;
    this.fallbackRecognition.interimResults = true;

    const bcp47Map: Record<string, string> = {
      ta: 'ta-IN',
      ml: 'ml-IN',
      hi: 'hi-IN',
      en: 'en-IN',
    };
    this.fallbackRecognition.lang = bcp47Map[this.currentLanguageId] || 'en-IN';

    this.fallbackRecognition.onstart = () => {
      this.setState('LISTENING');
    };

    this.fallbackRecognition.onresult = (event: any) => {
      if (this.state === 'SPEAKING') {
        speechService.stop();
        this.setState('LISTENING');
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
        const text = final.trim();
        this.callbacks?.onMessage({
          id: `user-${Date.now()}`,
          role: 'user',
          text,
          timestamp: Date.now(),
        });
        this.processFallbackTurn(text);
      }
    };

    this.fallbackRecognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        console.warn('Fallback speech error:', e);
      }
    };

    this.fallbackRecognition.onend = () => {
      if (this.state !== 'DISCONNECTED' && this.fallbackMode) {
        try {
          this.fallbackRecognition.start();
        } catch (_) {}
      }
    };

    try {
      this.fallbackRecognition.start();
      const voicePack = getVoicePack(this.currentLanguageId);
      this.speakFallback(voicePack.greetingPrompt);
    } catch (e) {
      console.warn('Failed to start fallback speech:', e);
    }
  }

  private async generateGeminiReply(spokenText: string, matchingSchemes: any[]): Promise<string> {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
    if (!apiKey) return '';

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
      const systemInstruction =
        this.currentLanguageId === 'ml'
          ? 'നിങ്ങൾ അറിവോം (Arivom) എന്ന സർക്കാർ പദ്ധതി ശബ്ദ സഹായിയാണ്. സ്വാഭാവിക മലയാളത്തിൽ മാത്രം സംസാരിക്കുക. തമിഴ് വാക്കുകൾ ഒരിക്കലും ഉപയോഗിക്കരുത്. പദ്ധതി അർഹതകൾ നിർബന്ധമായും നൽകിയ വിവരങ്ങളിൽ നിന്ന് മാത്രം പറയുക.'
          : this.currentLanguageId === 'ta'
          ? 'நீங்கள் அறிவோம் (Arivom) அரசு நலத்திட்ட குரல் வழிகாட்டி. இயல்பான தமிழில் மட்டும் பேசவும். அரசு திட்ட தகவல்களை எப்போதும் துல்லியமாக விளக்குங்கள்.'
          : `You are Arivom, a friendly government scheme discovery assistant for India (${this.currentStateName}). Keep responses concise, warm, conversational, and strictly grounded in the provided verified schemes.`;

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
      console.warn('Direct Gemini API request failed, using local rule reply:', e);
    }
    return '';
  }

  private async processFallbackTurn(text: string) {
    this.setState('THINKING');
    const extracted = extractProfileFromSpokenText(text, this.currentLanguageId);
    if (Object.keys(extracted).length > 0) {
      this.callbacks?.onProfileExtracted?.(extracted);
    }

    let topSchemes: any[] = [];
    if (this.callbacks?.onToolCall) {
      const matchResult = await this.callbacks.onToolCall('findEligibleSchemes', {});
      if (matchResult && matchResult.schemes) {
        topSchemes = matchResult.schemes;
      }
    }

    // Generate intelligent reply via Gemini (same as Android)
    let responseText = await this.generateGeminiReply(text, topSchemes);

    // If Gemini offline, use deterministic template
    if (!responseText) {
      if (topSchemes.length > 0) {
        const top = topSchemes[0];
        if (this.currentLanguageId === 'ta') {
          responseText = `உங்கள் தகுதியின்படி ${topSchemes.length} அரசு திட்டங்கள் கண்டறியப்பட்டன. முதன்மை திட்டம்: ${top.name}. இதன் பலன்களை அறிய விரும்புகிறீர்களா?`;
        } else if (this.currentLanguageId === 'ml') {
          responseText = `താങ്കളുടെ വിവരങ്ങൾ പ്രകാരം ${topSchemes.length} സർക്കാർ പദ്ധതികൾ കണ്ടെത്തി. പ്രധാന പദ്ധതി: ${top.name}. കൂടുതൽ അറിയണമെന്നുണ്ടോ?`;
        } else {
          responseText = `Based on your profile, ${topSchemes.length} schemes match your criteria, including ${top.name}. Would you like to hear the benefits?`;
        }
      } else {
        const voicePack = getVoicePack(this.currentLanguageId);
        responseText = voicePack.heardConfirmation(text);
      }
    }

    this.speakFallback(responseText);
  }

  private speakFallback(text: string) {
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
      () => this.setState('LISTENING')
    );
  }

  public interruptPlayback() {
    speechService.stop();
    if (this.playbackContext && this.playbackContext.state !== 'closed') {
      this.playbackContext.suspend().catch(() => {});
    }
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

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const clientContent = {
        clientContent: {
          turns: [
            {
              role: 'user',
              parts: [{ text: text.trim() }],
            },
          ],
          turnComplete: true,
        },
      };
      this.ws.send(JSON.stringify(clientContent));
      this.setState('THINKING');
    } else {
      this.processFallbackTurn(text);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted;
      });
    }
    return this.isMuted;
  }

  public endSession() {
    this.setState('DISCONNECTED');
    speechService.stop();

    if (this.fallbackRecognition) {
      try {
        this.fallbackRecognition.stop();
      } catch (_) {}
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.playbackContext) {
      this.playbackContext.close().catch(() => {});
      this.playbackContext = null;
    }
  }

  private setupAudioAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const buffer = new Uint8Array(this.analyser.frequencyBinCount);
      const updateLevel = () => {
        if (this.analyser && this.state !== 'DISCONNECTED') {
          this.analyser.getByteFrequencyData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i];
          }
          const avg = sum / buffer.length / 255;
          this.callbacks?.onAudioLevel(avg);
          this.animFrameId = requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
    } catch (e) {
      console.warn('Audio analyser setup error:', e);
    }
  }

  private setState(state: GeminiLiveVoiceState) {
    this.state = state;
    this.callbacks?.onStateChange(state);
  }
}

export const geminiLiveVoiceService = new GeminiLiveVoiceService();

