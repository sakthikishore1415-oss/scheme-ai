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

  // Fast / Conversational Mode Processing
  private async processFastTurn(spokenText: string): Promise<void> {
    const assistantMsgId = `asst-${Date.now()}`;
    
    // Set initial Thinking state in transcript
    this.callbacks?.onMessage({
      id: assistantMsgId,
      role: 'assistant',
      text: '...',
      isStreaming: true,
      timestamp: Date.now(),
      audioVoice: 'Arivom Scheme Advisor',
    });

    const reply = await this.generateGeminiReply(spokenText);
    if (this.currentAbortController?.signal.aborted) return;

    if (reply) {
      this.callbacks?.onMessage({
        id: assistantMsgId,
        role: 'assistant',
        text: reply,
        isStreaming: false,
        timestamp: Date.now(),
        audioVoice: 'Arivom Scheme Advisor',
      });
      this.conversationHistory.push({ role: 'assistant', text: reply });
      this.enqueueSpeech(reply);
    } else {
      const contextualReply = this.getContextualOfflineReply(spokenText);
      this.callbacks?.onMessage({
        id: assistantMsgId,
        role: 'assistant',
        text: contextualReply,
        isStreaming: false,
        timestamp: Date.now(),
        audioVoice: 'Arivom Scheme Advisor',
      });
      this.conversationHistory.push({ role: 'assistant', text: contextualReply });
      this.enqueueSpeech(contextualReply);
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

      const systemInstruction = `You are Arivom (அறிவோம்), an empathetic, warm, proactive civic AI voice counsellor for citizens in ${this.currentStateName}, India.
You are having an engaging real-time, two-way conversational dialogue like Gemini Live Voice or a direct civic helpline counsellor.

CURRENT CONVERSATION LANGUAGE: ${languageName.toUpperCase()}
${languageDirective}

🎯 CORE INTERACTIVE CONVERSATIONAL DIRECTIVE:
Never give a flat one-sided answer and stop. You must actively interact, consult, and converse with the citizen.
Every response MUST follow this 2-step structure (strictly under 2 short spoken sentences):
1. [HELPFUL INSIGHT / ADVICE]: In 1 simple, warm spoken sentence, validate or answer their question clearly with government scheme details.
2. [INTERACTIVE FOLLOW-UP QUESTION]: In 1 natural spoken question, proactively ask them a relevant follow-up question to diagnose their eligibility (e.g. asking about their land size, student course, ration card status, family income, age) or offer step-by-step guidance on how to apply.

CRITICAL VOICE RULES:
1. Speak directly and respectfully to the citizen strictly in spoken ${languageName}.
2. Keep replies concise (strictly 1 to 2 spoken sentences, under 35 words total).
3. NEVER dump bullet points, asterisks, URLs, or markdown symbols.
4. Keep the back-and-forth alive, encouraging the citizen to speak back.`;

      const xaiApiKey =
        (import.meta as any).env?.VITE_XAI_API_KEY ||
        (window as any).__XAI_API_KEY__ ||
        'xai-HGfw0p7ZC3kABWgf29QA7wfqDQvNFQqfu8H336JL5auLBZFI0t1R5ll1DFmTGBPLU025MzsIhhqvhENP';

      const apiKey =
        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
        (window as any).__GEMINI_API_KEY__ ||
        'AQ.Ab8RN6JSV7z-KRN41yTnI3bUKbzFOGsw5ekHPVh5zSeoMt7DqA';

      // 1. Try xAI Grok API first if key exists
      if (xaiApiKey) {
        try {
          const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${xaiApiKey}`,
            },
            signal: this.currentAbortController?.signal,
            body: JSON.stringify({
              messages: [
                { role: 'system', content: systemInstruction },
                ...this.conversationHistory.slice(-4).map((h) => ({
                  role: h.role === 'assistant' ? 'assistant' : 'user',
                  content: h.text,
                })),
                { role: 'user', content: spokenText },
              ],
              model: 'grok-beta',
              temperature: this.voiceMode === 'fast' ? 0.3 : 0.5,
            }),
          });

          if (xaiRes.ok) {
            const xaiData = await xaiRes.json();
            const grokText = xaiData.choices?.[0]?.message?.content;
            if (grokText) {
              return grokText
                .replace(/[*_#`[\]()]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            }
          }
        } catch (_) {
          // Seamless fallback to Gemini Flash
        }
      }

      // 2. Google Gemini 3.6 Flash
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
            temperature: 0.4,
            maxOutputTokens: 1000,
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
        // Fallback endpoint: gemini-flash-latest
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
              maxOutputTokens: 1000,
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

  private getContextualOfflineReply(spokenText: string): string {
    const q = spokenText.toLowerCase();
    const isTa = this.currentLanguageId === 'ta';
    const isMl = this.currentLanguageId === 'ml';
    const isHi = this.currentLanguageId === 'hi';

    if (q.includes('விவசாய') || q.includes('farmer') || q.includes('பயிர்') || q.includes('கடன்') || q.includes('കൃഷി')) {
      if (isTa) return 'விவசாயிகளுக்காக பிரதமரின் கிசான் திட்டம் (PM-KISAN) மற்றும் கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டம் பயன்படும். உங்களிடம் பட்டா சிட்டா ஆவணம் உள்ளதா?';
      if (isMl) return 'കർഷകർക്കായി പിഎം കിസാൻ പദ്ധതി വഴി പ്രതിവർഷം ₹6,000 ലഭിക്കും. നിങ്ങളുടെ പേരിൽ കൃഷിഭൂമിയുടെ രേഖകൾ ഉണ്ടോ?';
      if (isHi) return 'किसानों के लिए पीएम किसान योजना के तहत ₹6,000 वार्षिक सहायता मिलती है। क्या आपके नाम पर कृषि भूमि है?';
      return 'Farmers can benefit from PM-KISAN (₹6,000/year) and subsidized agricultural inputs. Do you hold agricultural land records?';
    }

    if (q.includes('மாணவர்') || q.includes('student') || q.includes('பள்ளி') || q.includes('கல்லூரி') || q.includes('படிப்பு') || q.includes('വിദ്യാർത്ഥി') || q.includes('scholarship')) {
      if (isTa) return 'மாணவர்களுக்கான புதுமைப் பெண் மற்றும் தமிழ்ப் புதல்வன் திட்டங்கள் மூலம் மாதம் ₹1,000 உதவித்தொகை வழங்கப்படுகிறது. நீங்கள் அரசுப் பள்ளியில் படித்தவரா?';
      if (isMl) return 'വിദ്യാർത്ഥികൾക്കായി പോസ്റ്റ്-മെട്രിക് സ്കോളർഷിപ്പും ഉന്നത വിദ്യാഭ്യാസ ഗ്രാന്റുകളും ലഭ്യമാണ്. നിങ്ങൾ ഏത് കോഴ്സാണ് പഠിക്കുന്നത്?';
      if (isHi) return 'छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति और उच्च शिक्षा सहायता उपलब्ध है। आप किस कक्षा या कोर्स में पढ़ रहे हैं?';
      return 'Students can receive monthly scholarships (₹1,000/month) and tuition fee waivers. Are you studying in government or aided institutions?';
    }

    if (q.includes('பெண்') || q.includes('women') || q.includes('மகளிர்') || q.includes('தாய்') || q.includes('സ്ത്രീ') || q.includes('mahila')) {
      if (isTa) return 'மகளிருக்காக கலைஞர் மகளிர் உரிமைத் திட்டம் மூலம் மாதம் ₹1,000 உரிமைத்தொகையும் விடியல் பயணமும் வழங்கப்படுகிறது. உங்களிடம் ஸ்மார்ட் ரேஷன் கார்டு உள்ளதா?';
      if (isMl) return 'വനിതകൾക്കായി സ്വയംതൊഴിൽ വായ്പകളും കുടുംബശ്രീ സഹായങ്ങളും ലഭ്യമാണ്. നിങ്ങൾക്ക് കൂടുതൽ വിവരങ്ങൾ അറിയണമെന്നുണ്ടോ?';
      if (isHi) return 'महिलाओं के लिए आजीविका मिशन और मातृत्व वंदना योजना उपलब्ध हैं। क्या आपके पास आधार कार्ड है?';
      return 'Women can access monthly direct financial aid and zero-fare transit schemes. Do you have a ration card and Aadhaar card ready?';
    }

    if (q.includes('முதியோர்') || q.includes('senior') || q.includes('வயது') || q.includes('pension') || q.includes('பென்ஷன்') || q.includes('പെൻഷൻ')) {
      if (isTa) return 'முதியோருக்கான இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதியத் திட்டம் (IGNOAPS) மூலம் மாதம் ₹1,000 வழங்கப்படுகிறது. உங்கள் வயது 60க்கு மேல் உள்ளதா?';
      if (isMl) return 'മുതിർന്ന പൗരന്മാർക്കായി ₹1,600 പ്രതിമാസ പെൻഷൻ പദ്ധതി ലഭ്യമാണ്. അപേക്ഷ സമർപ്പിക്കാൻ സഹായിക്കണോ?';
      if (isHi) return 'वरिष्ठ नागरिकों के लिए राष्ट्रीय वृद्धावस्था पेंशन योजना उपलब्ध है। क्या आपकी आयु 60 वर्ष से अधिक है?';
      return 'Senior citizens can receive monthly old-age pensions (IGNOAPS). Is your age 60 years or above?';
    }

    if (q.includes('மருத்துவ') || q.includes('health') || q.includes('சிகிச்சை') || q.includes('ஆரோக்கிய') || q.includes('ആശുപത്രി')) {
      if (isTa) return 'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS) மற்றும் ஆயுஷ்மான் பாரத் மூலம் ₹5 லட்சம் வரை இலவச சிகிச்சை பெறலாம். உங்களிடம் முதலமைச்சர் காப்பீட்டு அட்டை உள்ளதா?';
      if (isMl) return 'കാരുണ്യ ആരോഗ്യ സുരക്ഷാ പദ്ധതി (KASP) വഴി ₹5 ലക്ഷം വരെയുള്ള സൗജന്യ ചികിത്സ ലഭ്യമാണ്. നിങ്ങളുടെ റേഷൻ കാർഡ് ബിപിഎൽ ആണോ?';
      if (isHi) return 'आयुष्मान भारत योजना के तहत प्रति वर्ष ₹5 लाख तक का निःशुल्क उपचार उपलब्ध है। क्या आपके पास आयुष्मान कार्ड है?';
      return 'Ayushman Bharat and State Health Insurance provide up to ₹5 Lakhs free hospitalization per year. Do you have a health card?';
    }

    if (isTa) return `வணக்கம்! ${this.currentStateName} மாநிலத்தில் விவசாயம், கல்வி, மகளிர் நலம், முதியோர் ஓய்வூதியம் மற்றும் மருத்துவக் காப்பீடு திட்டங்கள் உள்ளன. உங்களுக்கு எந்தத் துறையின் உதவி தேவைப்படுகிறது?`;
    if (isMl) return `നമസ്കാരം! കൃഷി, വിദ്യാഭ്യാസം, വനിതാ ക്ഷേമം, പെൻഷൻ പദ്ധതികളെക്കുറിച്ച് അറിയാൻ സഹായിക്കാം. നിങ്ങൾക്ക് ഏത് സഹായമാണ് വേണ്ടത്?`;
    if (isHi) return `नमस्ते! कृषि, छात्रवृत्ति, महिला कल्याण, पेंशन और स्वास्थ्य योजनाओं की जानकारी उपलब्ध है। आप किस प्रकार की योजना चाहते हैं?`;
    return `Hello! We have verified government schemes for agriculture, education, women empowerment, pensions, and healthcare in ${this.currentStateName}. Which category are you looking for?`;
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

