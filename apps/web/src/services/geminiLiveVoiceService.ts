import { getVoicePack } from '../data/locales';
import { SUPPORTED_LANGUAGES } from '../data/languages';
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
  audioVoice?: string;
  toolCalls?: Array<{ name: string; args: any; result?: any }>;
}

export interface GeminiLiveVoiceCallbacks {
  onStateChange: (state: GeminiLiveVoiceState) => void;
  onAudioLevel: (level: number) => void;
  onMessage: (message: GeminiLiveMessage) => void;
  onInterimTranscript?: (text: string) => void;
  onMessageDelta?: (id: string, delta: string) => void;
  onProfileExtracted?: (profile: Record<string, any>) => void;
  onToolCall?: (name: string, args: any) => Promise<any>;
  onError?: (error: string) => void;
  onStopListening?: (reason: 'pause_timeout' | 'manual' | 'turn_complete') => void;
}

export class GeminiLiveVoiceService {
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private speechWaveTimer: number | null = null;

  private state: GeminiLiveVoiceState = 'IDLE';
  private callbacks: GeminiLiveVoiceCallbacks | null = null;
  private isMuted: boolean = false;
  private recognition: any = null;
  private currentLanguageId: string = 'ta';
  private currentStateName: string = 'Tamil Nadu';
  private isListeningActive: boolean = false;

  // Ultra-Fast Voice Reply Engine Settings
  private voiceMode: 'fast' | 'studio' = 'fast'; // 'fast' = stream-to-speech sub-second reply, 'studio' = Gemini TTS
  private speechRate: number = 1.15; // Fast, crisp conversational cadence
  private pauseSilenceTimer: number | null = null;
  private readonly PAUSE_SILENCE_THRESHOLD_MS: number = 2000; // 2 seconds auto-stop listening pause threshold
  private accumulatedQueryText: string = '';
  private currentInterimText: string = '';
  private lastProcessedText: string = '';
  private speechQueue: string[] = [];
  private isProcessingSpeechQueue: boolean = false;
  private currentAbortController: AbortController | null = null;

  // Assistant Voice State
  private selectedVoice: string = 'Kore';
  private currentAudioElement: HTMLAudioElement | null = null;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }> = [];

  public getVoice(): string {
    return this.selectedVoice;
  }

  public setVoice(voice: string) {
    this.selectedVoice = voice;
  }

  public getVoiceMode(): 'fast' | 'studio' {
    return this.voiceMode;
  }

  public setVoiceMode(mode: 'fast' | 'studio') {
    this.voiceMode = mode;
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.85, Math.min(2.0, rate));
    speechService.setSpeechRate(this.speechRate);
  }

  public async startSession(
    languageId: string,
    stateName: string,
    callbacks: GeminiLiveVoiceCallbacks
  ): Promise<void> {
    this.callbacks = callbacks;
    this.currentLanguageId = languageId;
    this.currentStateName = stateName;
    this.conversationHistory = [];
    this.speechQueue = [];
    this.isProcessingSpeechQueue = false;
    this.lastProcessedText = '';
    this.currentInterimText = '';
    this.accumulatedQueryText = '';
    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.stopPlayback();
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

    // 2. Initialize Continuous Speech Recognition
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
        as: 'as-IN',
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

        // Auto-interrupt assistant voice speech when citizen starts speaking (Live Barge-in)
        if (this.state === 'SPEAKING' || this.currentAudioElement || speechService.isSpeaking() || this.isProcessingSpeechQueue) {
          this.interruptPlayback();
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

        if (final.trim()) {
          this.accumulatedQueryText = (this.accumulatedQueryText ? this.accumulatedQueryText + ' ' : '') + final.trim();
        }
        this.currentInterimText = interim.trim();

        const candidateText = [this.accumulatedQueryText, this.currentInterimText]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (candidateText) {
          this.setState('USER_SPEAKING');
          this.callbacks?.onInterimTranscript?.(candidateText);

          // Reset and start 2-second pause silence timer:
          // When the user pauses for more than 2 seconds, automatically trigger a 'stop listening' event
          if (this.pauseSilenceTimer !== null) {
            clearTimeout(this.pauseSilenceTimer);
            this.pauseSilenceTimer = null;
          }

          this.pauseSilenceTimer = window.setTimeout(() => {
            this.handlePauseTimeout();
          }, this.PAUSE_SILENCE_THRESHOLD_MS);
        }
      };

      this.recognition.onspeechstart = () => {
        if (this.state !== 'SPEAKING' && this.state !== 'THINKING') {
          this.setState('USER_SPEAKING');
        }
        if (this.pauseSilenceTimer !== null) {
          clearTimeout(this.pauseSilenceTimer);
          this.pauseSilenceTimer = null;
        }
      };

      this.recognition.onspeechend = () => {
        // Speech ended in browser VAD; ensure the 2-second pause triggers 'stop listening'
        const candidate = [this.accumulatedQueryText, this.currentInterimText]
          .filter(Boolean)
          .join(' ')
          .trim();

        if (candidate.length >= 1) {
          if (this.pauseSilenceTimer !== null) {
            clearTimeout(this.pauseSilenceTimer);
          }
          this.pauseSilenceTimer = window.setTimeout(() => {
            this.handlePauseTimeout();
          }, this.PAUSE_SILENCE_THRESHOLD_MS);
        }
      };

      this.recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          console.warn('Microphone permission blocked:', e);
          this.callbacks?.onError?.('Microphone access was blocked. Please allow microphone permissions in your browser to speak.');
        } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition notice:', e);
        }
      };

      this.recognition.onend = () => {
        // Keep continuous speech listener alive during live voice conversation if listening is still active
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE' && this.isListeningActive) {
          try {
            this.recognition.start();
          } catch (_) {}
        }
      };

      this.recognition.start();
      this.isListeningActive = true;

      // Welcome voice greeting directly spoken in citizen's chosen language
      const greetings: Record<string, string> = {
        ta: 'வணக்கம்! நான் அறிவோம். உங்களுடன் பேச தயாராக இருக்கிறேன். சொல்லுங்கள்!',
        hi: 'नमस्ते! मैं अरिवोम हूं। मैं आपकी कैसे मदद कर सकता हूं? बताइए!',
        te: 'నమస్కారం! నేను అరివోమ్. మాట్లాడటానికి సిద్ధంగా ఉన్నాను, చెప్పండి!',
        kn: 'ನಮಸ್ಕಾರ! ನಾನು ಅರಿವೋಮ್. ಮಾತನಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ, ತಿಳಿಸಿ!',
        ml: 'നമസ്കാരം! ഞാൻ അറിവോം ആണ്. സംസാരിക്കാൻ തയ്യാറാണ്, പറയൂ!',
        mr: 'नमस्कार! मी अरिवोम आहे. मी तुम्हाला कशी मदत करू शकतो?',
        bn: 'নমস্কার! আমি অরিভোম। আপনার সাথে কথা বলতে প্রস্তুত, বলুন!',
        gu: 'નમસ્તે! હું અરિવોમ છું. હું તમારી શું મદદ કરી શકું?',
        or: 'ନମସ୍କାର! ମୁଁ ଅରିଭୋମ୍। ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
        pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਅਰਿਵੋਮ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
        as: 'নমস্কাৰ! মই অৰিবোম। মই আপোনাক কিদৰে সহায় কৰিব পাৰোঁ?',
        en: "Hello! I'm Arivom. I'm ready to talk with you. How can I help today?",
      };
      const welcome = greetings[this.currentLanguageId] || greetings.en;
      this.speak(welcome);
    } catch (e: any) {
      console.error('Failed to start speech recognition engine:', e);
      this.setState('ERROR');
      callbacks.onError?.('Could not activate microphone recognition.');
    }
  }

  public commitTurn(text: string) {
    const clean = text.trim();
    if (!clean) return;

    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.accumulatedQueryText = '';
    this.currentInterimText = '';

    // Guard against duplicate triggers
    if (clean === this.lastProcessedText) return;
    this.lastProcessedText = clean;

    this.callbacks?.onInterimTranscript?.('');
    this.callbacks?.onMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
      timestamp: Date.now(),
    });

    this.processTurn(clean);
  }

  public commitInterimNow() {
    const candidate = [this.accumulatedQueryText, this.currentInterimText]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (candidate) {
      this.stopListening('manual');
      this.commitTurn(candidate);
    }
  }

  /**
   * Automatically triggers a 'stop listening' event when the user pauses for more than 2 seconds,
   * reducing manual clicks and interaction for short queries.
   */
  private handlePauseTimeout(): void {
    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }

    const candidate = [this.accumulatedQueryText, this.currentInterimText]
      .filter(Boolean)
      .join(' ')
      .trim();

    // 1. Automatically trigger 'stop listening' event
    this.stopListening('pause_timeout');

    // 2. Automatically dispatch captured short query to Gemini
    if (candidate && candidate !== this.lastProcessedText) {
      this.commitTurn(candidate);
    }
  }

  private enqueueSpeech(sentence: string) {
    const clean = sentence
      .replace(/[*_#`[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return;

    this.speechQueue.push(clean);
    if (!this.isProcessingSpeechQueue) {
      this.processSpeechQueue();
    }
  }

  private processSpeechQueue() {
    if (this.speechQueue.length === 0) {
      this.isProcessingSpeechQueue = false;
      this.stopSpeechWaveSimulation();
      if (this.state !== 'DISCONNECTED' && this.state !== 'MUTED') {
        this.startListening();
      }
      return;
    }

    this.isProcessingSpeechQueue = true;
    const nextSentence = this.speechQueue.shift()!;
    this.setState('SPEAKING');
    this.startSpeechWaveSimulation();

    speechService.speak(
      nextSentence,
      this.currentLanguageId,
      () => {
        this.setState('SPEAKING');
      },
      () => {
        // When current sentence concludes, immediately transition to next queued sentence
        this.processSpeechQueue();
      },
      (err) => {
        console.warn('Speech queue utterance error:', err);
        this.processSpeechQueue();
      },
      this.speechRate
    );
  }

  private async processTurn(text: string) {
    // Abort any existing ongoing generation before starting new turn
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (_) {}
      this.currentAbortController = null;
    }
    this.currentAbortController = new AbortController();

    this.setState('THINKING');

    // 1. Remember conversation history for natural conversational continuity
    this.conversationHistory.push({ role: 'user', text });
    if (this.conversationHistory.length > 12) {
      this.conversationHistory = this.conversationHistory.slice(-12);
    }

    // 2. Quietly track demographics/criteria if mentioned in conversation
    const extracted = extractProfileFromSpokenText(text, this.currentLanguageId);
    if (Object.keys(extracted).length > 0) {
      this.callbacks?.onProfileExtracted?.(extracted);
    }

    // 3. Fast mode (Sub-second stream-to-speech) vs Studio mode
    if (this.voiceMode === 'fast') {
      await this.processFastTurn(text);
    } else {
      await this.processStudioTurn(text);
    }
  }

  // Ultra-Fast Stream-to-Speech (TTFA < 500ms)
  private async processFastTurn(spokenText: string): Promise<void> {
    const langConfig = SUPPORTED_LANGUAGES[this.currentLanguageId] || SUPPORTED_LANGUAGES['ta'];
    const languageName = `${langConfig.name} (${langConfig.nativeName})`;

    const systemInstruction = `You are Arivom (அறிவோம்), a warm, lightning-fast civic voice assistant for citizens in ${this.currentStateName}, India.
CURRENT SPOKEN LANGUAGE: ${languageName.toUpperCase()}
CRITICAL RULES FOR INSTANT VOICE:
1. Reply STRICTLY in natural, spoken ${languageName}.
2. Keep response to 1 or 2 SHORT sentences (maximum 20-25 words).
3. Do NOT use markdown, bullet points, asterisks, URLs, or lists. Everything you say is spoken aloud instantly.
4. If citizen asks for schemes, directly mention 1 or 2 relevant programs and invite questions.`;

    const historyPayload = this.conversationHistory.slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      text: h.text,
    }));

    const assistantMsgId = `asst-${Date.now()}`;
    let fullText = '';
    let spokenIndex = 0;

    // Create initial streaming entry in transcript
    this.callbacks?.onMessage({
      id: assistantMsgId,
      role: 'assistant',
      text: '',
      isStreaming: true,
      timestamp: Date.now(),
      audioVoice: 'Arivom Scheme Advisor',
    });

    try {
      const response = await fetch('/api/gemini-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: this.currentAbortController?.signal,
        body: JSON.stringify({
          systemInstruction,
          history: historyPayload,
          prompt: spokenText,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (this.currentAbortController?.signal.aborted) {
          try {
            await reader.cancel();
          } catch (_) {}
          return;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (this.currentAbortController?.signal.aborted) {
            try {
              await reader.cancel();
            } catch (_) {}
            return;
          }

          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const partText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (partText) {
                fullText += partText;

                // Live transcript update
                this.callbacks?.onMessage({
                  id: assistantMsgId,
                  role: 'assistant',
                  text: fullText,
                  isStreaming: true,
                  timestamp: Date.now(),
                  audioVoice: 'Arivom Scheme Advisor',
                });

                // Immediate sentence-level audio piping:
                // As soon as the first sentence boundary is reached, start speaking immediately!
                const unhandled = fullText.slice(spokenIndex);
                const sentenceBoundaryMatch = unhandled.match(/([.?!।\n]+|\s*;\s*)/);
                if (sentenceBoundaryMatch && sentenceBoundaryMatch.index !== undefined) {
                  const boundaryEnd = sentenceBoundaryMatch.index + sentenceBoundaryMatch[0].length;
                  const sentenceToSpeak = unhandled.slice(0, boundaryEnd).trim();
                  if (sentenceToSpeak.length >= 2) {
                    spokenIndex += boundaryEnd;
                    if (!this.currentAbortController?.signal.aborted) {
                      this.enqueueSpeech(sentenceToSpeak);
                    }
                  }
                }
              }
            } catch (_) {}
          }
        }
      }

      if (this.currentAbortController?.signal.aborted) return;

      // Speak any remaining unsent portion of the reply
      const trailing = fullText.slice(spokenIndex).trim();
      if (trailing.length >= 2 && !this.currentAbortController?.signal.aborted) {
        this.enqueueSpeech(trailing);
      }

      // Mark streaming as finalized
      this.callbacks?.onMessage({
        id: assistantMsgId,
        role: 'assistant',
        text: fullText.trim(),
        isStreaming: false,
        timestamp: Date.now(),
        audioVoice: 'Arivom Scheme Advisor',
      });

      if (fullText.trim()) {
        this.conversationHistory.push({ role: 'assistant', text: fullText.trim() });
      }
    } catch (streamErr: any) {
      if (streamErr?.name === 'AbortError' || this.currentAbortController?.signal.aborted) {
        // Quietly exit on intentional user interruption
        return;
      }
      console.warn('Fast stream notice, falling back to instant generate:', streamErr);

      // Instant single-hop fallback
      const fallbackReply = await this.generateGeminiReply(spokenText);
      if (this.currentAbortController?.signal.aborted) return;

      if (fallbackReply) {
        this.callbacks?.onMessage({
          id: assistantMsgId,
          role: 'assistant',
          text: fallbackReply,
          isStreaming: false,
          timestamp: Date.now(),
          audioVoice: 'Arivom Scheme Advisor',
        });
        this.conversationHistory.push({ role: 'assistant', text: fallbackReply });
        this.enqueueSpeech(fallbackReply);
      } else {
        const fallbacks: Record<string, string> = {
          ta: 'மன்னிக்கவும், உங்கள் குரல் கேட்கவில்லை. மீண்டும் கூற முடியுமா?',
          hi: 'माफ़ कीजिए, मैं सुन नहीं पाया। क्या आप दोबारा कह सकते हैं?',
          te: 'క్షమించండి, మీ మాట వినిపించలేదు. దయచేసి మళ్ళీ చెప్పండి.',
          kn: 'ಕ್ಷಮಿಸಿ, ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ಹೇಳಿ.',
          ml: 'ക്ഷമിക്കണം, വ്യക്തമായില്ല. വീണ്ടും പറയാമോ?',
          mr: 'माफ करा, ऐकू आले नाही. पुन्हा सांगा.',
          bn: 'দুঃখিত, শুনতে পাইনি। আবার বলবেন কি?',
          gu: 'માફ કરશો, સંભળાયું નહીં. ફરીથી કહો.',
          or: 'କ୍ଷମା କରିବେ, ଶୁଣାଗଲା ନାହିଁ। ପୁଣି କୁହନ୍ତୁ।',
          pa: 'ਮਾਫ਼ ਕਰਨਾ, ਸੁਣਿਆ ਨਹੀਂ। ਦੁਬਾਰਾ ਬੋਲੋ।',
          as: 'ক্ষমা কৰিব, শুনা নাপালোঁ। আকৌ কওক।',
          en: "I didn't catch that. Could you say that again?",
        };
        const msg = fallbacks[this.currentLanguageId] || fallbacks.en;
        this.enqueueSpeech(msg);
      }
    }
  }

  // Studio Mode (HD Gemini TTS)
  private async processStudioTurn(text: string): Promise<void> {
    const responseText = await this.generateGeminiReply(text);
    if (this.currentAbortController?.signal.aborted) return;

    if (responseText) {
      this.conversationHistory.push({ role: 'assistant', text: responseText });
      await this.speak(responseText);
    } else {
      const fallback = "I didn't quite catch that. Could you please say that again?";
      await this.speak(fallback);
    }
  }

  private async generateGeminiReply(spokenText: string): Promise<string> {
    try {
      const langConfig = SUPPORTED_LANGUAGES[this.currentLanguageId] || SUPPORTED_LANGUAGES['ta'];
      const languageName = `${langConfig.name} (${langConfig.nativeName})`;
      
      const languageDirective = `STRICT LANGUAGE DIRECTIVE: You MUST converse, reply, and speak STRICTLY in natural, empathetic spoken ${langConfig.name} (${langConfig.nativeName}). Do NOT reply in another language or mix unnecessarily with English. Style: Speak naturally and conversationally in ${langConfig.nativeName}. Keep answers concise in 1 to 2 spoken sentences without markdown, bullet points, asterisks, or technical jargon.`;

      const systemInstruction = `You are Arivom (அறிவோம்), a warm, intelligent, and friendly civic voice conversation assistant for citizens in ${this.currentStateName}, India.
You are having a real-time, two-way voice conversation like Gemini Live Voice or a direct citizen telephone hotline.

CURRENT CONVERSATION LANGUAGE: ${languageName.toUpperCase()}
${languageDirective}

CRITICAL RULES FOR VOICE-TO-VOICE:
1. Speak directly to the citizen strictly in ${languageName}.
2. Keep replies concise (strictly 1 to 2 spoken sentences) so the conversation flows seamlessly without long monologues.
3. NEVER dump lists of schemes, bullet points, asterisks, URLs, or markdown. Everything you return will be spoken aloud to the user.
4. Converse freely about everyday citizen questions, farming, education, student scholarships, women empowerment, health, pensions, or welfare when asked.
5. If the citizen asks for scheme advice or help, guide them warmly and conversationally by naming 1 or 2 relevant programs naturally, and invite them to ask more.
6. Treat this as an ongoing natural voice chat.`;

      const apiKey =
        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
        (window as any).__GEMINI_API_KEY__ ||
        'AQ.Ab8RN6JSV7z-KRN41yTnI3bUKbzFOGsw5ekHPVh5zSeoMt7DqA';

      // Build contents array for Gemini REST
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      // Add recent conversation history
      const recentHistory = this.conversationHistory.slice(-6);
      for (const h of recentHistory) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }],
        });
      }

      // Add current turn with system instructions
      const combinedPrompt = `${systemInstruction}\n\nCitizen says: "${spokenText}"\nRespond naturally and conversationally in 1-2 spoken sentences:`;
      contents.push({
        role: 'user',
        parts: [{ text: combinedPrompt }],
      });

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        signal: this.currentAbortController?.signal,
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: this.voiceMode === 'fast' ? 0.3 : 0.5,
            maxOutputTokens: this.voiceMode === 'fast' ? 120 : 250,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return candidate
            .replace(/[*_#`[\]()]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }
      } else {
        // Fallback endpoint if gemini-3.6-flash has temporary model alias issue
        const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        const fallbackRes = await fetch(fallbackEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          signal: this.currentAbortController?.signal,
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 150,
            },
          }),
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const text = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return text
              .replace(/[*_#`[\]()]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError' || this.currentAbortController?.signal.aborted) {
        return '';
      }
      console.warn('Gemini conversational generation notice:', e);
    }
    return '';
  }

  public async speak(text: string): Promise<void> {
    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) return;

    this.callbacks?.onMessage({
      id: `asst-${Date.now()}`,
      role: 'assistant',
      text: cleanText,
      timestamp: Date.now(),
      audioVoice: this.selectedVoice,
    });

    this.setState('SPEAKING');

    // 1. Primary: High-Definition Gemini Voice via Server TTS (gemini-3.1-flash-tts-preview)
    try {
      const ttsRes = await fetch('/api/gemini-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceName: this.selectedVoice,
          languageId: this.currentLanguageId,
        }),
      });

      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        if (ttsData.audio) {
          await this.playGeminiAudio(ttsData.audio);
          return;
        }
      }
    } catch (ttsErr) {
      console.warn('Gemini TTS service notice, falling back to local speech synthesis:', ttsErr);
    }

    // 2. Seamless Fallback: Local Speech Synthesis Engine
    this.startSpeechWaveSimulation();
    speechService.speak(
      cleanText,
      this.currentLanguageId,
      () => this.setState('SPEAKING'),
      () => {
        this.stopSpeechWaveSimulation();
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE') {
          this.setState('LISTENING');
        }
      },
      () => {
        this.stopSpeechWaveSimulation();
        if (this.state !== 'DISCONNECTED') {
          this.setState('LISTENING');
        }
      }
    );
  }

  private playGeminiAudio(audioDataUrl: string): Promise<void> {
    return new Promise((resolve) => {
      this.stopPlayback();

      const audio = new Audio(audioDataUrl);
      this.currentAudioElement = audio;

      this.startSpeechWaveSimulation();

      audio.onplay = () => {
        this.setState('SPEAKING');
      };

      audio.onended = () => {
        this.stopSpeechWaveSimulation();
        this.currentAudioElement = null;
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE') {
          this.setState('LISTENING');
        }
        resolve();
      };

      audio.onerror = (e) => {
        console.warn('Gemini voice audio element error:', e);
        this.stopSpeechWaveSimulation();
        this.currentAudioElement = null;
        if (this.state !== 'DISCONNECTED') {
          this.setState('LISTENING');
        }
        resolve();
      };

      audio.play().catch((err) => {
        console.warn('Audio play notice:', err);
        this.stopSpeechWaveSimulation();
        this.currentAudioElement = null;
        if (this.state !== 'DISCONNECTED') {
          this.setState('LISTENING');
        }
        resolve();
      });
    });
  }

  private startSpeechWaveSimulation() {
    this.stopSpeechWaveSimulation();
    let step = 0;
    this.speechWaveTimer = window.setInterval(() => {
      step++;
      // Natural human speech cadence wave (varied amplitude between 0.25 and 0.85)
      const base = 0.4 + Math.sin(step * 0.4) * 0.25 + Math.cos(step * 0.7) * 0.15;
      const level = Math.max(0.1, Math.min(0.9, base));
      this.callbacks?.onAudioLevel(level);
    }, 60);
  }

  private stopSpeechWaveSimulation() {
    if (this.speechWaveTimer !== null) {
      clearInterval(this.speechWaveTimer);
      this.speechWaveTimer = null;
    }
  }

  public interruptAndListen(): void {
    // 1. Immediately abort any ongoing network request or streaming SSE response
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (_) {}
      this.currentAbortController = null;
    }

    // 2. Immediately stop any active audio playback, speech queue, and wave simulation
    this.speechQueue = [];
    this.isProcessingSpeechQueue = false;
    this.stopPlayback();

    // 3. Clear any pending turn silence timers and interim transcripts
    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.accumulatedQueryText = '';
    this.lastProcessedText = '';
    this.currentInterimText = '';
    this.callbacks?.onInterimTranscript?.('');

    // 4. Force un-mute and active listening mode
    this.isMuted = false;
    this.isListeningActive = true;

    // 5. Trigger new listening state immediately in state machine and visual UI
    this.setState('LISTENING');

    // 6. Ensure browser's Speech Recognition engine restarts cleanly and begins listening immediately
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (_) {}

      setTimeout(() => {
        if (this.isListeningActive && this.recognition) {
          try {
            this.recognition.start();
          } catch (e: any) {
            if (e.name !== 'InvalidStateError') {
              console.warn('Speech recognition restart notice:', e);
            }
          }
        }
      }, 40);
    }
  }

  public interruptPlayback(): void {
    this.interruptAndListen();
  }

  private stopPlayback() {
    this.speechQueue = [];
    this.isProcessingSpeechQueue = false;
    this.stopSpeechWaveSimulation();
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (_) {}
      this.currentAudioElement = null;
    }
    speechService.stop();
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

  public isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public isListening(): boolean {
    return this.isListeningActive && (this.state === 'LISTENING' || this.state === 'USER_SPEAKING');
  }

  public startListening(): boolean {
    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.accumulatedQueryText = '';
    this.currentInterimText = '';
    if (!this.recognition) return false;
    this.isListeningActive = true;
    this.isMuted = false;
    try {
      this.recognition.start();
      this.setState('LISTENING');
      return true;
    } catch (e: any) {
      if (e.name !== 'InvalidStateError') {
        console.warn('Speech recognition start notice:', e);
      }
      this.setState('LISTENING');
      return true;
    }
  }

  /**
   * Triggers a 'stop listening' event.
   * Can be triggered manually or automatically when the user pauses for > 2 seconds.
   */
  public stopListening(reason: 'pause_timeout' | 'manual' | 'turn_complete' = 'manual'): void {
    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.isListeningActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.callbacks?.onStopListening?.(reason);
    if (this.state === 'LISTENING' || this.state === 'USER_SPEAKING') {
      this.setState('IDLE');
    }
  }

  public getLanguage(): string {
    return this.currentLanguageId;
  }

  public setLanguage(languageId: string): void {
    this.currentLanguageId = languageId;
    const bcp47Map: Record<string, string> = {
      ta: 'ta-IN',
      en: 'en-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
      te: 'te-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      or: 'or-IN',
      pa: 'pa-IN',
      as: 'as-IN',
    };
    if (this.recognition) {
      try {
        this.recognition.lang = bcp47Map[languageId] || (languageId === 'en' ? 'en-IN' : 'ta-IN');
        // If actively listening, restart recognition to ensure the browser speech engine applies the new language locale immediately
        if (this.isListeningActive) {
          try {
            this.recognition.stop();
          } catch (_) {}
          setTimeout(() => {
            if (this.isListeningActive && this.recognition) {
              try {
                this.recognition.start();
              } catch (_) {}
            }
          }, 150);
        }
      } catch (_) {}
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.setState('MUTED');
      this.stopPlayback();
    } else {
      this.setState('LISTENING');
    }
    return this.isMuted;
  }

  public endSession() {
    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.accumulatedQueryText = '';
    this.currentInterimText = '';
    this.isListeningActive = false;
    this.stopPlayback();
    this.setState('DISCONNECTED');

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

        // When user is speaking or listening, calculate real microphone input level
        if (this.state === 'USER_SPEAKING' || this.state === 'LISTENING') {
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          const normalized = Math.min(1.0, avg / 128);
          this.callbacks?.onAudioLevel(normalized);
        }

        this.animFrameId = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn('Audio analyser setup notice:', e);
    }
  }

  private setState(newState: GeminiLiveVoiceState) {
    this.state = newState;
    this.callbacks?.onStateChange(newState);
  }
}

export const geminiLiveVoiceService = new GeminiLiveVoiceService();

