import { REALTIME_TOOLS, getArivomSystemPrompt } from './realtimeSessionManager';
import { speechService } from '../utils/speech';
import { extractProfileFromSpokenText } from '../utils/nlpExtractor';
import { getVoicePack } from '../data/locales';

export type RealtimeVoiceState =
  | 'IDLE'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'LISTENING'
  | 'USER_SPEAKING'
  | 'THINKING'
  | 'SPEAKING'
  | 'DISCONNECTED'
  | 'ERROR';

export interface RealtimeMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
  timestamp: number;
}

export interface RealtimeVoiceCallbacks {
  onStateChange: (state: RealtimeVoiceState) => void;
  onAudioLevel: (level: number) => void;
  onMessage: (message: RealtimeMessage) => void;
  onMessageDelta?: (id: string, delta: string) => void;
  onProfileExtracted?: (profile: Record<string, any>) => void;
  onToolCall?: (name: string, args: any) => Promise<any>;
  onError?: (error: string) => void;
}

export class RealtimeVoiceService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private state: RealtimeVoiceState = 'IDLE';
  private callbacks: RealtimeVoiceCallbacks | null = null;
  private isMuted: boolean = false;
  private currentAssistantMessageId: string | null = null;
  private fallbackMode: boolean = false;
  private fallbackRecognition: any = null;
  private currentLanguageId: string = 'en';
  private currentStateName: string = 'Tamil Nadu';

  constructor() {
    // Create hidden remote audio playback element
    if (typeof window !== 'undefined') {
      this.remoteAudioElement = document.createElement('audio');
      this.remoteAudioElement.autoplay = true;
      document.body.appendChild(this.remoteAudioElement);
    }
  }

  public async startSession(
    languageId: string,
    stateName: string,
    callbacks: RealtimeVoiceCallbacks
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
        },
      });
      this.setupAudioAnalyser(this.localStream);
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      this.setState('ERROR');
      callbacks.onError?.('Microphone permission denied or no audio device found.');
      return;
    }

    // 2. Fetch ephemeral session token from backend
    let ephemeralKey: string | null = null;
    try {
      const res = await fetch('/api/realtime-session', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        ephemeralKey = data.client_secret?.value || null;
      }
    } catch (e) {
      console.warn('Realtime session endpoint unavailable, falling back to browser duplex engine:', e);
    }

    if (ephemeralKey) {
      try {
        await this.initWebRTC(ephemeralKey);
        return;
      } catch (err: any) {
        console.warn('WebRTC connection to OpenAI failed, activating continuous browser duplex engine:', err);
      }
    }

    // 3. Fallback to Continuous Duplex Engine
    this.initContinuousBrowserDuplex();
  }

  private async initWebRTC(ephemeralKey: string): Promise<void> {
    this.fallbackMode = false;
    this.peerConnection = new RTCPeerConnection();

    // Attach remote audio track
    this.peerConnection.ontrack = (event) => {
      if (this.remoteAudioElement && event.streams[0]) {
        this.remoteAudioElement.srcObject = event.streams[0];
      }
    };

    // Add local microphone audio track
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Create DataChannel for OpenAI Realtime events
    this.dataChannel = this.peerConnection.createDataChannel('oai-events');
    this.setupDataChannel(this.dataChannel);

    // Create SDP Offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Exchange SDP with OpenAI Realtime endpoint
    const sdpResponse = await fetch(
      'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
      {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      }
    );

    if (!sdpResponse.ok) {
      throw new Error(`OpenAI SDP handshake failed: ${sdpResponse.statusText}`);
    }

    const answerSdp = await sdpResponse.text();
    await this.peerConnection.setRemoteDescription({
      type: 'answer',
      sdp: answerSdp,
    });

    this.setState('LISTENING');
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      // Send initial session configuration
      const sessionUpdate = {
        type: 'session.update',
        session: {
          modalities: ['audio', 'text'],
          instructions: getArivomSystemPrompt(this.currentLanguageId, this.currentStateName),
          voice: 'verse',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          tools: REALTIME_TOOLS,
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
            create_response: true,
          },
        },
      };
      channel.send(JSON.stringify(sessionUpdate));
    };

    channel.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        await this.handleServerEvent(msg);
      } catch (err) {
        console.error('Error handling realtime event:', err);
      }
    };
  }

  private async handleServerEvent(event: any) {
    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        // ==========================================
        // INSTANT BARGE-IN INTERRUPTION
        // ==========================================
        this.interruptPlayback();
        this.setState('USER_SPEAKING');
        break;

      case 'input_audio_buffer.speech_stopped':
        this.setState('THINKING');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          const userMsg: RealtimeMessage = {
            id: event.item_id || `user-${Date.now()}`,
            role: 'user',
            text: event.transcript.trim(),
            timestamp: Date.now(),
          };
          this.callbacks?.onMessage(userMsg);

          // Extract demographic data
          const extracted = extractProfileFromSpokenText(event.transcript, this.currentLanguageId);
          if (Object.keys(extracted).length > 0) {
            this.callbacks?.onProfileExtracted?.(extracted);
          }
        }
        break;

      case 'response.created':
        this.currentAssistantMessageId = `asst-${Date.now()}`;
        this.callbacks?.onMessage({
          id: this.currentAssistantMessageId,
          role: 'assistant',
          text: '',
          isStreaming: true,
          timestamp: Date.now(),
        });
        break;

      case 'response.audio_transcript.delta':
        if (this.currentAssistantMessageId && event.delta) {
          this.setState('SPEAKING');
          this.callbacks?.onMessageDelta?.(this.currentAssistantMessageId, event.delta);
        }
        break;

      case 'response.audio_transcript.done':
        this.setState('LISTENING');
        break;

      case 'response.done':
        this.setState('LISTENING');
        break;

      case 'response.function_call_arguments.done':
        // Model requested deterministic tool call
        if (event.name && this.callbacks?.onToolCall) {
          const args = JSON.parse(event.arguments || '{}');
          const result = await this.callbacks.onToolCall(event.name, args);

          // Send function call output back to model
          if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(
              JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: event.call_id,
                  output: JSON.stringify(result || { status: 'success' }),
                },
              })
            );
            this.dataChannel.send(JSON.stringify({ type: 'response.create' }));
          }
        }
        break;

      case 'error':
        console.error('Realtime model error:', event.error);
        break;
    }
  }

  // ==========================================
  // CONTINUOUS BROWSER DUPLEX FALLBACK ENGINE
  // ==========================================
  private initContinuousBrowserDuplex() {
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
      // Barge-in: if assistant is currently speaking aloud, interrupt immediately!
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
        const userMsg: RealtimeMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          text,
          timestamp: Date.now(),
        };
        this.callbacks?.onMessage(userMsg);

        // Process citizen utterance
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
      // Speak initial warm greeting
      const voicePack = getVoicePack(this.currentLanguageId);
      this.speakFallback(voicePack.greetingPrompt);
    } catch (e) {
      console.warn('Failed to start fallback speech rec:', e);
    }
  }

  private async processFallbackTurn(text: string) {
    this.setState('THINKING');
    const extracted = extractProfileFromSpokenText(text, this.currentLanguageId);
    if (Object.keys(extracted).length > 0) {
      this.callbacks?.onProfileExtracted?.(extracted);
    }

    // Call tool if available
    let responseText = '';
    if (this.callbacks?.onToolCall) {
      const matchResult = await this.callbacks.onToolCall('get_matching_schemes', {});
      if (matchResult && matchResult.count > 0) {
        const top = matchResult.schemes[0];
        if (this.currentLanguageId === 'ta') {
          responseText = `உங்கள் விவரங்களின்படி ${matchResult.count} அரசு திட்டங்கள் பொருந்தக்கூடும். முதலாவது: ${top.name}. இதன் பலன்களை அறிய விரும்புகிறீர்களா?`;
        } else if (this.currentLanguageId === 'ml') {
          responseText = `താങ്കളുടെ വിവരങ്ങൾ പ്രകാരം ${matchResult.count} സർക്കാർ പദ്ധതികൾ ലഭ്യമാണ്. പ്രധാന പദ്ധതി: ${top.name}. കൂടുതൽ വിവരങ്ങൾ അറിയണമെന്നുണ്ടോ?`;
        } else {
          responseText = `Based on your profile, ${matchResult.count} government welfare schemes match your criteria, including ${top.name}. Would you like to hear the benefits?`;
        }
      }
    }

    if (!responseText) {
      const voicePack = getVoicePack(this.currentLanguageId);
      responseText = voicePack.heardConfirmation(text);
    }

    this.speakFallback(responseText);
  }

  private speakFallback(text: string) {
    const asstId = `asst-${Date.now()}`;
    this.callbacks?.onMessage({
      id: asstId,
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

  // ==========================================
  // AUDIO & CONTROL METHODS
  // ==========================================
  public interruptPlayback() {
    // 1. Mute/pause remote WebRTC audio element
    if (this.remoteAudioElement) {
      this.remoteAudioElement.pause();
      this.remoteAudioElement.currentTime = 0;
    }

    // 2. Stop browser speech synthesis if active
    speechService.stop();

    // 3. Send response.cancel event to OpenAI if WebRTC data channel is open
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify({ type: 'response.cancel' }));
      } catch (e) {
        console.warn('Failed to cancel response:', e);
      }
    }

    this.setState('LISTENING');
  }

  public sendTextMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: RealtimeMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };
    this.callbacks?.onMessage(userMsg);

    // If WebRTC is active, send via data channel
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(
        JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: text.trim() }],
          },
        })
      );
      this.dataChannel.send(JSON.stringify({ type: 'response.create' }));
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

    // Cancel speech
    speechService.stop();
    if (this.remoteAudioElement) {
      this.remoteAudioElement.pause();
      this.remoteAudioElement.srcObject = null;
    }

    // Close fallback
    if (this.fallbackRecognition) {
      try {
        this.fallbackRecognition.stop();
      } catch (_) {}
    }

    // Close WebRTC
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop microphone stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    // Stop audio analyser
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private setupAudioAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
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
      console.warn('Audio analyser setup skipped:', e);
    }
  }

  private setState(state: RealtimeVoiceState) {
    this.state = state;
    this.callbacks?.onStateChange(state);
  }
}

export const realtimeVoiceService = new RealtimeVoiceService();

