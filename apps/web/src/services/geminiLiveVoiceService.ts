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
  onStopListening?: (reason: 'pause_timeout' | 'manual' | 'turn_complete' | 'turn_processing') => void;
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
    speechService.unlockAudio();
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

    // 1. Initialize Continuous Speech Recognition (direct, non-blocking microphone access)
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      const noSpeechRecNotices: Record<string, string> = {
        ta: 'வணக்கம்! கீழே தட்டச்சு செய்து கேள்வி கேட்கலாம். நேரடி குரல் பதிவுக்கு கூகுள் குரோம் பயன்படுத்தலாம்.',
        hi: 'नमस्ते! आप नीचे टाइप करके प्रश्न पूछ सकते हैं। सीधे वॉइस माइक के लिए गूगल क्रोम का उपयोग करें।',
        te: 'నమస్కారం! మీరు క్రింద టైప్ చేయడం ద్వారా ప్రశ్నలను అడగవచ్చు. డైరెక్ట్ వాయిస్ మైక్ కోసం గూగుల్ క్రోమ్ ఉపయోగించండి.',
        kn: 'ನಮಸ್ಕಾರ! ನೀವು ಕೆಳಗೆ ಟೈಪ್ ಮಾಡುವ ಮೂಲಕ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು. ನೇರ ವಾಯ್ಸ್ ಮೈಕ್‌ಗಾಗಿ ಗೂಗಲ್ ಕ್ರೋಮ್ ಬಳಸಿ.',
        ml: 'നമസ്കാരം! താഴെ ടൈപ്പ് ചെയ്ത ചോദ്യങ്ങൾ ചോദിക്കാം. നേരിട്ടുള്ള ശബ്ദത്തിന് ഗൂഗിൾ ക്രോം ഉപയോഗിക്കുക.',
        mr: 'नमस्कार! आपण खाली टाईप करून प्रश्न विचारू शकता. थेट व्हॉइस मायक्रोफोनसाठी गूगल क्रोम वापरा.',
        bn: 'নমস্কার! নিচে টাইপ করে প্রশ্ন জিজ্ঞাসা করতে পারেন। সরাসরি ভয়েস মাইকের জন্য গুগল ক্রোম ব্যবহার করুন।',
        gu: 'નમસ્તે! તમે નીચે ટાઈપ કરીને પ્રશ્નો પૂછી શકો છો. સીધા વોઈસ માઈક માટે ગૂગલ ક્રોમનો ઉપયોગ કરો.',
        or: 'ନମସ୍କାର! ଆପଣ ତଳେ ଟାଇପ୍ କରି ପ୍ରଶ୍ନ ପଚାରିପାରିବେ। ସିଧାସଳଖ ଭଏସ୍ ମାଇକ୍ ପାଇଁ ଗୁଗଲ୍ କ୍ରୋମ୍ ବ୍ୟବହାର କରନ୍ତୁ।',
        pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਸੀਂ ਹੇਠਾਂ ਟਾਈਪ ਕਰਕੇ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ। ਸਿੱਧੇ ਵਾਇਸ ਮਾਈਕ ਲਈ ਗੂਗਲ ਕਰੋਮ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
        as: 'নমস্কাৰ! আপুনি তলত টাইপ কৰি প্ৰশ্ন সুধিব পাৰে। প্ৰত্যক্ষ ভয়েছ মাইকৰ বাবে গুগল ক্ৰোম ব্যৱহাৰ কৰক।',
        en: 'Hello! Speech recognition is available via typing below. You can also use Google Chrome for direct voice mic.',
      };
      const notif = noSpeechRecNotices[this.currentLanguageId] || noSpeechRecNotices.en;
      this.setState('IDLE');
      this.isListeningActive = false;
      callbacks.onMessage?.({
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: notif,
        timestamp: Date.now(),
        audioVoice: 'Arivom Scheme Advisor',
      });
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

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

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            if (item.isFinal) {
              finalTranscript += item[0].transcript;
            } else {
              interimTranscript += item[0].transcript;
            }
          }
        }

        const candidate = (finalTranscript || interimTranscript).trim();

        if (candidate) {
          this.setState('USER_SPEAKING');
          this.currentInterimText = candidate;
          this.callbacks?.onInterimTranscript?.(candidate);

          if (finalTranscript.trim()) {
            if (this.pauseSilenceTimer !== null) {
              clearTimeout(this.pauseSilenceTimer);
              this.pauseSilenceTimer = null;
            }
            this.commitTurn(finalTranscript.trim());
          } else {
            // Reset and start silence debounce timer
            if (this.pauseSilenceTimer !== null) {
              clearTimeout(this.pauseSilenceTimer);
            }
            this.pauseSilenceTimer = window.setTimeout(() => {
              this.handlePauseTimeout();
            }, this.PAUSE_SILENCE_THRESHOLD_MS);
          }
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
        const candidate = this.currentInterimText.trim();
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
        // Keep speech listener cleanly looping between turns when listening is active and assistant is not speaking/thinking
        if (
          this.state !== 'DISCONNECTED' &&
          this.state !== 'IDLE' &&
          this.state !== 'SPEAKING' &&
          this.state !== 'THINKING' &&
          this.isListeningActive &&
          !this.isProcessingSpeechQueue
        ) {
          try {
            this.recognition.start();
          } catch (_) {}
        }
      };

      // Welcome voice greeting displayed in transcript
      const greetings: Record<string, string> = {
        ta: 'வணக்கம்! நான் அறிவோம். உங்களுடன் பேச தயாராக இருக்கிறேன். உங்கள் கேள்வியைக் கூறுங்கள்!',
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
        en: "Hello! I'm Arivom. I'm listening. Ask me any government scheme question!",
      };
      const welcome = greetings[this.currentLanguageId] || greetings.en;
      this.callbacks?.onMessage?.({
        id: `asst-welcome-${Date.now()}`,
        role: 'assistant',
        text: welcome,
        timestamp: Date.now(),
        audioVoice: 'Arivom Scheme Advisor',
      });

      // Start listening directly for citizen's voice
      this.startListening();
    } catch (e: any) {
      console.error('Failed to start speech recognition engine:', e);
      this.setState('IDLE');
      callbacks.onError?.('Could not activate microphone. Tap the microphone button or use typing below.');
    }
  }

  public commitTurn(text: string) {
    const clean = text.trim();
    if (!clean) return;

    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.currentInterimText = '';

    // Guard against duplicate triggers
    if (clean === this.lastProcessedText) return;
    this.lastProcessedText = clean;

    // Immediately stop mic listening while AI thinks and speaks
    this.stopListening('turn_processing');

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
    const candidate = this.currentInterimText.trim();
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

    const candidate = this.currentInterimText.trim();

    // 1. Automatically trigger 'stop listening' event
    this.stopListening('pause_timeout');

    // 2. Automatically dispatch captured short query to Gemini
    if (candidate && candidate !== this.lastProcessedText) {
      this.commitTurn(candidate);
    }
  }

  /**
   * Stop Button Action: Immediately interrupts current AI speech/thinking turn,
   * clears queue, and immediately keeps listening active for citizen's next query without permanently disabling voice.
   */
  public stopEverything(): void {
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (_) {}
      this.currentAbortController = null;
    }
    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.speechQueue = [];
    this.isProcessingSpeechQueue = false;
    this.stopPlayback();
    this.currentInterimText = '';
    this.callbacks?.onInterimTranscript?.('');

    // Resume listening immediately so citizen can speak their next query right away
    if (this.state !== 'DISCONNECTED') {
      this.startListening();
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
        setTimeout(() => {
          if (this.state !== 'DISCONNECTED' && this.state !== 'MUTED' && !this.isProcessingSpeechQueue) {
            this.startListening();
          }
        }, 300);
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
      const fallbackNotices: Record<string, string> = {
        ta: 'மன்னிக்கவும், தெளிவாகக் கேட்கவில்லை. மீண்டும் கூறுங்கள் அல்லது கீழே தட்டச்சு செய்யுங்கள்.',
        hi: 'क्षमा करें, स्पष्ट सुनाई नहीं दिया। कृपया पुनः बोलें या नीचे टाइप करें।',
        te: 'క్షమించండి, స్పష్టంగా వినపడలేదు. దయచేసి మళ్లీ చెప్పండి లేదా టైప్ చేయండి.',
        kn: 'ಕ್ಷಮಿಸಿ, ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
        ml: 'ക്ഷമിക്കണം, വ്യക്തമായി കേട്ടില്ല. ദയവായി വീണ്ടും പറയുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക.',
        mr: 'माफ करा, स्पष्ट ऐकू आले नाही. कृपया पुन्हा बोला किंवा टाईप करा.',
        bn: 'দুঃখিত, পরিষ্কার শোনা যায়নি। অনুগ্রহ করে আবার বলুন বা টাইপ করুন।',
        gu: 'માફ કરશો, સ્પષ્ટ સંભળાયું નથી. કૃપા કરીને ફરી બોલો અથવા ટાઈપ કરો.',
        or: 'କ୍ଷମା କରିବେ, ସ୍ପଷ୍ଟ ଶୁଣାଗଲାନାହିଁ। ଦୟାକରି ପୁଣି କୁହନ୍ତୁ କିମ୍ବା ଟାଇପ୍ କରନ୍ତୁ।',
        pa: 'ਮੁਆਫ਼ ਕਰਨਾ, ਸਪੱਸ਼ਟ ਨਹੀਂ ਸੁਣਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ ਜਾਂ ਟਾਈਪ ਕਰੋ।',
        as: 'ক্ষমা কৰিব, স্পষ্টকৈ শুના নগ’ল। অনুগ্ৰহ কৰি পুনৰ কওক বা টাইপ কৰক।',
        en: "I didn't quite catch that. Could you please say that again or type below?",
      };
      const fallback = fallbackNotices[this.currentLanguageId] || fallbackNotices.en;
      await this.speak(fallback);
    }
  }

  private async generateGeminiReply(spokenText: string): Promise<string> {
    try {
      const langConfig = SUPPORTED_LANGUAGES[this.currentLanguageId] || SUPPORTED_LANGUAGES['ta'];
      const languageName = langConfig.name;
      const nativeName = langConfig.nativeName;
      
      const systemInstruction = `You are Arivom (அறிவோம்), a warm, empathetic, proactive civic AI voice counsellor for citizens in ${this.currentStateName}, India.

CRITICAL SINGLE SOURCE OF TRUTH LANGUAGE MANDATE:
The user has explicitly chosen to converse in: ${languageName.toUpperCase()} (${nativeName}).
You MUST write your ENTIRE response ONLY in ${languageName} (${nativeName}) text script.
Do NOT use English, do NOT use any other language, and do NOT translate into English.
Even if the citizen speaks in English, Latin script, or another language, you MUST respond STRICTLY in ${languageName} (${nativeName}).
Even if the conversation history has turns in previous languages, IGNORE the previous language and output ONLY in ${languageName} (${nativeName}).

🎯 CORE INTERACTIVE TWO-WAY CONVERSATION MANDATE:
Never give a dry, flat factual statement and stop. You MUST always maintain a lively, supportive dialogue.
Every response MUST follow this exact 2-step spoken format (strictly 1 to 2 spoken sentences total, under 35 words):
1. [HELPFUL INSIGHT / ADVICE]: In 1 warm, clear spoken sentence, directly answer their question with specific government scheme names and benefits in ${nativeName}.
2. [INTERACTIVE FOLLOW-UP QUESTION]: In 1 natural spoken sentence, proactively ask them a relevant follow-up question to diagnose their eligibility (e.g. asking about their land size, student grade/course, ration card type, income, age, or disability status) or guide them on how to apply.

CRITICAL VOICE RULES:
1. Speak directly and respectfully to the citizen strictly in spoken ${languageName} (${nativeName}).
2. Keep replies concise (strictly 1 to 2 spoken sentences, maximum 30-35 words).
3. NEVER output bullet points, asterisks, formatting tags, URLs, or markdown symbols.
4. Keep the turn-taking active, encouraging the citizen to answer your question.`;

      // 1. Try local Vite dev server /api/gemini-generate endpoint first
      try {
        const localRes = await fetch('/api/gemini-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: this.currentAbortController?.signal,
          body: JSON.stringify({
            prompt: spokenText,
            systemInstruction,
            history: this.conversationHistory.slice(-6),
          }),
        });
        if (localRes.ok) {
          const localData = await localRes.json();
          if (localData.text) {
            return localData.text
              .replace(/[*_#`[\]()]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
      } catch (_) {
        // Fall through to direct Google Gemini API call
      }

      const xaiApiKey = (import.meta as any).env?.VITE_XAI_API_KEY || (window as any).__XAI_API_KEY__;

      const apiKey =
        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
        (window as any).__GEMINI_API_KEY__ ||
        '';

      // 2. Try xAI Grok API if key exists
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

      // Build multi-turn conversational turns
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      const historyTurns = this.conversationHistory.slice(-8);
      for (const h of historyTurns) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }],
        });
      }

      if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: spokenText }],
        });
      }

      const promptPayload = {
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 250,
        },
      };

      // Verified working models with priority on gemini-3.6-flash
      const candidateModels = [
        'gemini-3.6-flash',
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite',
      ];

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
            signal: this.currentAbortController?.signal,
            body: JSON.stringify(promptPayload),
          });

          if (res.ok) {
            const data = await res.json();
            const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate && candidate.trim()) {
              return candidate
                .replace(/[*_#`[\]()]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            }
          }
        } catch (modelErr: any) {
          if (modelErr?.name === 'AbortError' || this.currentAbortController?.signal.aborted) {
            return '';
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
    const lang = this.currentLanguageId;

    const sectorReplies: Record<string, Record<string, string>> = {
      farmer: {
        ta: 'விவசாயிகளுக்காக பிரதமரின் கிசான் திட்டம் (PM-KISAN) மற்றும் மானியத் திட்டங்கள் உள்ளன. உங்களிடம் நிலப்பட்டா அல்லது சிட்டா ஆவணம் உள்ளதா?',
        te: 'రైతుల కోసం PM-KISAN పథకం మరియు సబ్సిడీ పథకాలు అందుబాటులో ఉన్నాయి. మీ పేరు మీద వ్యవసాయ భూమి పాస్ పుస్తకం ఉందా?',
        kn: 'ರೈತರಿಗಾಗಿ ಪಿಎಂ ಕಿಸಾನ್ ಮತ್ತು ಕೃಷಿ ಸಬ್ಸಿಡಿ ಯೋಜನೆಗಳಿವೆ. ನಿಮ್ಮ ಬಳಿ ಜಮೀನಿನ ಪಹಣಿ ಅಥವಾ ದಾಖಲೆಗಳಿವೆಯೇ?',
        ml: 'കർഷകർക്കായി പിഎം കിസാൻ പദ്ധതിയും സബ്സിഡികളും ലഭ്യമാണ്. നിങ്ങളുടെ പേരിൽ കൃഷിഭൂമിയുടെ പട്ടയം ഉണ്ടോ?',
        hi: 'किसानों के लिए पीएम किसान योजना और कृषि सब्सिडी उपलब्ध हैं। क्या आपके नाम पर कृषि भूमि के दस्तावेज हैं?',
        mr: 'शेतकऱ्यांसाठी पीएम किसान योजना आणि कृषी अनुदाने उपलब्ध आहेत. आपल्या नावावर 7/12 उतारा आहे का?',
        bn: 'কৃষকদের জন্য পিএম কিষাণ প্রকল্প ও কৃষি ভর্তুকি উপলব্ধ। আপনার নামে কি জমির খতিয়ান বা পরচা রয়েছে?',
        gu: 'ખેડૂતો માટે પીએમ કિસાન યોજના અને કૃષિ સબસિડી ઉપલબ્ધ છે. શું તમારી પાસે જમીનના 7/12 ના દસ્તાવેજ છે?',
        or: 'କୃଷକମାନଙ୍କ ପାଇଁ ପିଏମ କିଷାନ ଯୋଜନା ଓ କୃଷି ରିହାତି ଉପଲବ୍ଧ। ଆପଣଙ୍କ ପାଖରେ ଜମି ପଟ୍ଟା ଅଛି କି?',
        pa: 'ਕਿਸਾਨਾਂ ਲਈ ਪੀਐੱਮ ਕਿਸਾਨ ਸਕੀਮ ਅਤੇ ਖੇਤੀਬਾੜੀ ਸਬਸਿਡੀਆਂ ਉਪਲਬਧ ਹਨ। ਕੀ ਤੁਹਾਡੇ ਨਾਂ ਉੱਤੇ ਜ਼ਮੀਨ ਦੀ ਫ਼ਰਦ ਹੈ?',
        as: 'কৃষকসকলৰ বাবে পিএম কিষাণ আঁচনি আৰু ৰেহাই ব্যৱস্থা উপলব্ধ। আপোনাৰ নামত কৃষি ভূমিৰ পট্টা আছে নেকি?',
        en: 'Farmers can benefit from PM-KISAN (₹6,000/year) and agricultural input subsidies. Do you hold agricultural land records?',
      },
      student: {
        ta: 'மாணவர்களுக்கான உதவித்தொகை மற்றும் கட்டணச் சலுகை திட்டங்கள் உள்ளன. நீங்கள் எந்த வகுப்பு அல்லது படிப்பு படிக்கிறீர்கள்?',
        te: 'విద్యార్థుల కోసం పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్‌లు మరియు విద్యా దీవెన ఉన్నాయి. మీరు ఏ తరగతి లేదా కోర్సు చదువుతున్నారు?',
        kn: 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮೆಟ್ರಿಕ್ ನಂತರದ ಸ್ಕಾಲರ್‌ಶಿಪ್ ಮತ್ತು ಶುಲ್ಕ ವಿನಾಯಿತಿಗಳಿವೆ. ನೀವು ಯಾವ ಕೋರ್ಸ್ ಓದುತ್ತಿದ್ದೀರಿ?',
        ml: 'വിദ്യാർത്ഥികൾക്കായി പോസ്റ്റ്-മെട്രിക് സ്കോളർഷിപ്പും വിദ്യാഭ്യാസ ഗ്രാന്റുകളും ലഭ്യമാണ്. നിങ്ങൾ ഏത് കോഴ്സാണ് പഠിക്കുന്നത്?',
        hi: 'छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति और शुल्क प्रतिपूर्ति उपलब्ध है। आप किस कक्षा या कोर्स में पढ़ रहे हैं?',
        mr: 'विद्यार्थ्यांसाठी शिष्यवृत्ती आणि शिक्षण शुल्क माफीच्या योजना आहेत. आपण कोणत्या वर्गात किंवा अभ्यासक्रमात शिकत आहात?',
        bn: 'শিক্ষার্থীদের জন্য পোস্ট-ম্যাট্রিক বৃত্তি ও শিক্ষাগত অনুদান উপলব্ধ। আপনি কোন ক্লাসে বা কোর্সে পড়াশোনা করছেন?',
        gu: 'વિદ્યાર્થીઓ માટે શિષ્યવૃત્તિ અને શિક્ષણ સહાય યોજનાઓ ઉપલબ્ધ છે. તમે કયા ધોરણ અથવા કોર્સમાં અભ્યાસ કરો છો?',
        or: 'ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ ପୋଷ୍ଟ-ମେଟ୍ରିକ ବୃତ୍ତି ଓ ଶିକ୍ଷା ସହାୟତା ଉପଲବ୍ଧ। ଆପଣ କେଉଁ ଶ୍ରେଣୀ ବା ପାଠ୍ୟକ୍ରମରେ ପଢ଼ୁଛନ୍ତି?',
        pa: 'ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਵਜ਼ੀਫ਼ੇ ਅਤੇ ਮੁਫ਼ਤ ਸਿੱਖਿਆ ਸਕੀਮਾਂ ਉਪਲਬਧ ਹਨ। ਤੁਸੀਂ ਕਿਹੜੀ ਜਮਾਤ ਜਾਂ ਕੋਰਸ ਵਿੱਚ ਪੜ੍ਹ ਰਹੇ ਹੋ?',
        as: 'ছাত্ৰ-ছাত্ৰীসকলৰ বাবে বৃত্তি আৰু শিক্ষাগত অনুদান উপলব্ধ। আপুনি কোন শ্ৰেণীত বা পাঠ্যক্ৰমত পঢ়ি আছে?',
        en: 'Students can receive merit scholarships and tuition assistance. What grade or course are you currently studying?',
      },
      women: {
        ta: 'மகளிருக்காக மகளிர் உரிமைத் தொகை மற்றும் சுயஉதவிக் குழு கடன் திட்டங்கள் உள்ளன. உங்களிடம் ரேஷன் கார்டு உள்ளதா?',
        te: 'మహిళల కోసం స్వయం సహాయక సంఘాల రుణాలు మరియు ఆర్థిక సహాయ పథకాలు ఉన్నాయి. మీ వద్ద రేషన్ కార్డు ఉందా?',
        kn: 'ಮಹಿಳೆಯರಿಗಾಗಿ ಗೃಹಲಕ್ಷ್ಮಿ ಮತ್ತು ಸ್ವಸಹಾಯ ಗುಂಪುಗಳ ಸಾಲ ಯೋಜನೆಗಳಿವೆ. ನಿಮ್ಮ ಬಳಿ ರೇಷನ್ ಕಾರ್ಡ್ ಇದೆಯೇ?',
        ml: 'വനിതകൾക്കായി കുടുംബശ്രീ സ്വയംതൊഴിൽ വായ്പകളും സഹായങ്ങളും ലഭ്യമാണ്. നിങ്ങളുടെ അടുക്കൽ റേഷൻ കാർഡ് ഉണ്ടോ?',
        hi: 'महिलाओं के लिए आजीविका मिशन, मातृत्व वंदना और ऋण योजनाएं उपलब्ध हैं। क्या आपके पास राशन कार्ड है?',
        mr: 'महिलांसाठी लाडकी बहीण आणि बचत गट कर्ज योजना उपलब्ध आहेत. आपल्याकडे रेशन कार्ड आहे का?',
        bn: 'মহিলাদের জন্য লক্ষ্মীর ভাণ্ডার এবং স্বনির্ভর গোষ্ঠী ঋণ প্রকল্প রয়েছে। আপনার কি রেশন কার্ড আছে?',
        gu: 'મહિલાઓ માટે આજીવિકા મિશન અને સહાય યોજનાઓ ઉપલબ્ધ છે. શું તમારી પાસે રેશન કાર્ડ છે?',
        or: 'ମହିଳାମାନଙ୍କ ପାଇଁ ମିଶନ ଶକ୍ତି ଏବଂ ସହାୟତା ଯୋଜନା ଉପଲବ୍ଧ। ଆପଣଙ୍କ ପାଖରେ ରାସନ କାର୍ଡ ଅଛି କି?',
        pa: 'ਮਹਿਲਾਵਾਂ ਲਈ ਵਿੱਤੀ ਸਹਾਇਤਾ ਅਤੇ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਸਕੀਮਾਂ ਉਪਲਬਧ ਹਨ। ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਰਾਸ਼ਨ ਕਾਰਡ ਹੈ?',
        as: 'মহিলাসকলৰ বাবে অৰুণোদয় আৰু আত্মসহায়ক গোটৰ ঋণ উপলব্ধ। আপোনাৰ ৰেচন কাৰ্ড আছে নেকি?',
        en: 'Women can access direct monthly financial aid and self-help group loans. Do you have an active ration card?',
      },
      senior: {
        ta: 'முதியோருக்கான தேசிய முதியோர் ஓய்வூதியத் திட்டம் (IGNOAPS) மூலம் மாதம் உதவித்தொகை வழங்கப்படுகிறது. உங்கள் வயது 60க்கு மேல் உள்ளதா?',
        te: 'వృద్ధుల కోసం వృద్ధాప్య పెన్షన్ పథకం ద్వారా ప్రతినెలా పింఛను అందుతుంది. మీ వయస్సు 60 సంవత్సరాలు దాటిందా?',
        kn: 'ಹಿರಿಯ ನಾಗರಿಕರಿಗಾಗಿ ಮಾಸಿಕ ವೃದ್ಧಾಪ್ಯ ವೇತನ ಯೋಜನೆ ಲಭ್ಯವಿದೆ. ನಿಮ್ಮ ವಯಸ್ಸು 60 ವರ್ಷ ಮೇಲ್ಪಟ್ಟಿದೆಯೇ?',
        ml: 'മുതിർന്ന പൗരന്മാർക്കായി പ്രതിമാസ പെൻഷൻ പദ്ധതി ലഭ്യമാണ്. നിങ്ങളുടെ പ്രായം 60 വയസ്സിന് മുകളിലാണോ?',
        hi: 'वरिष्ठ नागरिकों के लिए वृद्धावस्था पेंशन योजना उपलब्ध है। क्या आपकी आयु 60 वर्ष या उससे अधिक है?',
        mr: 'ज्येष्ठ नागरिकांसाठी वृद्धापकाळ निवृत्तीवेतन योजना उपलब्ध आहे. आपले वय 60 वर्षे किंवा त्याहून अधिक आहे का?',
        bn: 'বয়স্ক নাগরিকদের জন্য বার্ধক্য ভাতা প্রকল্প উপলব্ধ রয়েছে। আপনার বয়স কি ৬০ বছরের বেশি?',
        gu: 'વરિષ્ઠ નાગરિકો માટે વૃદ્ધ પેન્શન યોજના ઉપલબ્ધ છે. શું તમારી ઉંમર 60 વર્ષ કે તેથી વધુ છે?',
        or: 'ବରିଷ୍ଠ ନାଗରିକମାନଙ୍କ ପାଇଁ ବାର୍ଦ୍ଧକ୍ୟ ଭତ୍ତା ଯୋଜନା ଉପଲବ୍ଧ। ଆପଣଙ୍କ ବୟସ ୬୦ ବର୍ଷରୁ ଅଧିକ କି?',
        pa: 'ਬਜ਼ੁਰਗਾਂ ਲਈ ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ ਸਕੀਮ ਉਪਲਬਧ ਹੈ। ਕੀ ਤੁਹਾਡੀ ਉਮਰ 60 ਸਾਲ ਤੋਂ ਵੱਧ ਹੈ?',
        as: 'বয়োজ্যেষ্ঠ নাগৰিকসকলৰ বাবে বাৰ্ধক্য পেঞ্চন আঁচনি উপলব্ধ। আপোনাৰ বয়স ৬০ বছৰৰ ওপৰত নেকি?',
        en: 'Senior citizens can receive monthly old-age pensions. Is your age 60 years or above?',
      },
      health: {
        ta: 'முதலமைச்சரின் மருத்துவக் காப்பீட்டுத் திட்டம் மற்றும் ஆயுஷ்மான் பாரத் மூலம் ₹5 லட்சம் வரை இலவச சிகிச்சை பெறலாம். உங்களிடம் காப்பீட்டு அட்டை உள்ளதா?',
        te: 'ఆరోగ్యశ్రీ మరియు ఆయుష్మాన్ భారత్ ద్వారా ₹5 లక్షల వరకు ఉచిత చికిత్స లభిస్తుంది. మీ వద్ద ఆరోగ్య కార్డు ఉందా?',
        kn: 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಮತ್ತು ಆರೋಗ್ಯ ಕರ್ನಾಟಕ ಮೂಲಕ ₹5 ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ಚಿಕಿತ್ಸೆ ಸಿಗುತ್ತದೆ. ನಿಮ್ಮ ಬಳಿ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಇದೆಯೇ?',
        ml: 'കാരുണ്യ ആരോഗ്യ സുരക്ഷാ പദ്ധതി വഴി ₹5 ലക്ഷം വരെയുള്ള സൗജന്യ ചികിത്സ ലഭ്യമാണ്. നിങ്ങളുടെ റേഷൻ കാർഡ് ബിപിഎൽ ആണോ?',
        hi: 'आयुष्मान भारत योजना के तहत ₹5 लाख तक का निःशुल्क उपचार उपलब्ध है। क्या आपके पास आयुष्मान कार्ड है?',
        mr: 'महात्मा फुले जन आरोग्य योजना आणि आयुष्मान भारत अंतर्गत ₹5 लाखांपर्यंत मोफत उपचार मिळतात. आपल्याकडे आरोग्य कार्ड आहे का?',
        bn: 'স্বাস্থ্য সাথী ও আয়ুষ্মান ভারত প্রকল্পে ₹৫ লক্ষ পর্যন্ত বিনামূল্যে চিকিৎসা মেলে। আপনার কি স্বাস্থ্য কার্ড রয়েছে?',
        gu: 'મા અમૃતમ અને આયુષ્માન ભારત હેઠળ ₹5 લાખ સુધીની મફત સારવાર મળે છે. શું તમારી પાસે આયુષ્માન કાર્ડ છે?',
        or: 'ବିଜୁ ସ୍ୱାସ୍ଥ୍ୟ କଲ୍ୟାଣ ଯୋଜନା ଏବଂ ଆୟୁଷ୍ମାନ ଭାରତରେ ₹୫ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ମାଗଣା ଚିକିତ୍ସା ମିଳେ। ଆପଣଙ୍କ ପାଖରେ ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ଅଛି କି?',
        pa: 'ਸਰਬੱਤ ਸਿਹਤ ਬੀਮਾ ਅਤੇ ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਤਹਿਤ ₹5 ਲੱਖ ਤੱਕ ਮੁਫ਼ਤ ਇਲਾਜ ਮਿਲਦਾ ਹੈ। ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਸਿਹਤ ਕਾਰਡ ਹੈ?',
        as: 'আয়ুষ্মান অসম আৰু আয়ুষ্মান ভাৰতত ₹৫ লাখলৈকে বিনামূলীয়া চিকিৎসা উপলব্ধ। আপোনাৰ স্বাস্থ্য কাৰ্ড আছে নেকি?',
        en: 'Ayushman Bharat and State Health Insurance provide up to ₹5 Lakhs free hospitalization. Do you have a health card?',
      },
      general: {
        ta: `வணக்கம்! ${this.currentStateName} மாநிலத்தில் விவசாயம், கல்வி, மகளிர் நலம், முதியோர் ஓய்வூதியம் மற்றும் மருத்துவக் காப்பீடு திட்டங்கள் உள்ளன. உங்களுக்கு எந்தத் துறையின் உதவி தேவைப்படுகிறது?`,
        te: `నమస్కారం! ${this.currentStateName} లో వ్యవసాయం, విద్య, మహిళా సంక్షేమం, పెన్షన్ మరియు ఆరోగ్య పథకాలు ఉన్నాయి. మీకు ఏ రంగంలో సహాయం కావాలి?`,
        kn: `ನಮಸ್ಕಾರ! ${this.currentStateName} ನಲ್ಲಿ ಕೃಷಿ, ಶಿಕ್ಷಣ, ಮಹಿಳಾ ಕಲ್ಯಾಣ, ಪಿಂಚಣಿ ಮತ್ತು ಆರೋಗ್ಯ ಯೋಜನೆಗಳಿವೆ. ನಿಮಗೆ ಯಾವ ಯೋಜನೆಯ ಮಾಹಿತಿ ಬೇಕು?`,
        ml: `നമസ്കാരം! ${this.currentStateName} സംസ്ഥാനത്ത് കൃഷി, വിദ്യാഭ്യാസം, വനിതാ ക്ഷേമം, പെൻഷൻ പദ്ധതികൾ ലഭ്യമാണ്. നിങ്ങൾക്ക് ഏത് സഹായമാണ് വേണ്ടത്?`,
        hi: `नमस्ते! ${this.currentStateName} में कृषि, छात्रवृत्ति, महिला कल्याण, पेंशन और स्वास्थ्य योजनाएं उपलब्ध हैं। आप किस प्रकार की योजना की जानकारी चाहते हैं?`,
        mr: `नमस्कार! ${this.currentStateName} मध्ये कृषी, शिक्षण, महिला कल्याण, निवृत्तीवेतन आणि आरोग्य योजना आहेत. आपल्याला कोणत्या योजनेची मदत हवी आहे?`,
        bn: `নমস্কার! ${this.currentStateName} রাজ্যে কৃষি, শিক্ষা, মহিলা কল্যাণ, বার্ধক্য ভাতা ও স্বাস্থ্য প্রকল্প রয়েছে। আপনি কোন বিষয়ে জানতে চান?`,
        gu: `નમસ્તે! ${this.currentStateName} માં ખેતી, શિક્ષણ, મહિલા કલ્યાણ, પેન્શન અને આરોગ્ય યોજનાઓ ઉપલબ્ધ છે. તમને કયા ક્ષેત્રની સહાય જોઈએ છે?`,
        or: `ନମସ୍କାର! ${this.currentStateName} ରେ କୃଷି, ଶିକ୍ଷା, ମହିଳା କଲ୍ୟାଣ, ଭତ୍ତା ଏବଂ ସ୍ୱାସ୍ଥ୍ୟ ଯୋଜନା ଉପଲବ୍ଧ। ଆପଣ କେଉଁ ବିଷୟରେ ଜାଣିବାକୁ ଚାହାଁନ୍ତି?`,
        pa: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ${this.currentStateName} ਵਿੱਚ ਖੇਤੀਬਾੜੀ, ਸਿੱਖਿਆ, ਮਹਿਲਾ ਭਲਾਈ, ਪੈਨਸ਼ਨ ਅਤੇ ਸਿਹਤ ਸਕੀਮਾਂ ਹਨ। ਤੁਹਾਨੂੰ ਕਿਸ ਯੋਜਨਾ ਦੀ ਲੋੜ ਹੈ?`,
        as: `নমস্কাৰ! ${this.currentStateName} ত কৃষি, শিক্ষা, মহিলা কল্যাণ, পেঞ্চন আৰু স্বাস্থ্য আঁচনিসমূহ উপলব্ধ। আপোনাক কি আঁচনিৰ সহায় লাগে?`,
        en: `Hello! We have verified government schemes for agriculture, education, women welfare, pensions, and healthcare in ${this.currentStateName}. Which category are you looking for?`,
      },
    };

    if (q.includes('விவசாய') || q.includes('farmer') || q.includes('பயிர்') || q.includes('கடன்') || q.includes('കൃഷി') || q.includes('किसान') || q.includes('రైతు') || q.includes('ರೈತ') || q.includes('শেকত') || q.includes('কৃষক') || q.includes('ਖੇਤੀ')) {
      return sectorReplies.farmer[lang] || sectorReplies.farmer.en;
    }

    if (q.includes('மாணவர்') || q.includes('student') || q.includes('பள்ளி') || q.includes('கல்லூரி') || q.includes('படிப்பு') || q.includes('വിദ്യാർത്ഥി') || q.includes('scholarship') || q.includes('छात्र') || q.includes('విద్యార్థి') || q.includes('ವಿದ್ಯಾರ್ಥಿ') || q.includes('পড়াশোনা')) {
      return sectorReplies.student[lang] || sectorReplies.student.en;
    }

    if (q.includes('பெண்') || q.includes('women') || q.includes('மகளிர்') || q.includes('தாய்') || q.includes('സ്ത്രീ') || q.includes('mahila') || q.includes('महिला') || q.includes('మహిళ') || q.includes('ಮಹಿಳೆ') || q.includes('মহিলা')) {
      return sectorReplies.women[lang] || sectorReplies.women.en;
    }

    if (q.includes('முதியோர்') || q.includes('senior') || q.includes('வயது') || q.includes('pension') || q.includes('பென்ஷன்') || q.includes('പെൻഷൻ') || q.includes('पेंशन') || q.includes('పింఛన్') || q.includes('ವೃದ್ಧಾಪ್ಯ') || q.includes('ভাতা')) {
      return sectorReplies.senior[lang] || sectorReplies.senior.en;
    }

    if (q.includes('மருத்துவ') || q.includes('health') || q.includes('சிகிச்சை') || q.includes('ஆரோக்கிய') || q.includes('ആശുപത്രി') || q.includes('स्वास्थ्य') || q.includes('ఆరోగ్య') || q.includes('ಆರೋಗ್ಯ') || q.includes('হাসপাতাল')) {
      return sectorReplies.health[lang] || sectorReplies.health.en;
    }

    return sectorReplies.general[lang] || sectorReplies.general.en;
  }

  public getGeminiVoiceForLanguage(langId: string): string {
    const map: Record<string, string> = {
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
    return map[langId] || 'Kore';
  }

  public async speak(text: string): Promise<void> {
    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) return;

    const currentVoice = this.getGeminiVoiceForLanguage(this.currentLanguageId);
    this.selectedVoice = currentVoice;

    this.callbacks?.onMessage({
      id: `asst-${Date.now()}`,
      role: 'assistant',
      text: cleanText,
      timestamp: Date.now(),
      audioVoice: currentVoice,
    });

    this.setState('SPEAKING');

    // 1. Primary: High-Definition Gemini Voice via Server TTS (gemini-3.1-flash-tts-preview)
    try {
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
      const bcp47Code = bcp47Map[this.currentLanguageId] || 'ta-IN';

      const ttsRes = await fetch('/api/gemini-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceName: currentVoice,
          languageId: this.currentLanguageId,
          bcp47Code: bcp47Code,
        }),
      });

      const contentType = ttsRes.headers.get('content-type') || '';
      if (ttsRes.ok && contentType.includes('application/json')) {
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
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE' && this.state !== 'MUTED') {
          this.setState('LISTENING');
          this.startListening();
        }
      },
      () => {
        this.stopSpeechWaveSimulation();
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE' && this.state !== 'MUTED') {
          this.setState('LISTENING');
          this.startListening();
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
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE' && this.state !== 'MUTED') {
          this.setState('LISTENING');
          this.startListening();
        }
        resolve();
      };

      audio.onerror = (e) => {
        console.warn('Gemini voice audio element error:', e);
        this.stopSpeechWaveSimulation();
        this.currentAudioElement = null;
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE' && this.state !== 'MUTED') {
          this.setState('LISTENING');
          this.startListening();
        }
        resolve();
      };

      audio.play().catch((err) => {
        console.warn('Audio play notice:', err);
        this.stopSpeechWaveSimulation();
        this.currentAudioElement = null;
        if (this.state !== 'DISCONNECTED' && this.state !== 'IDLE' && this.state !== 'MUTED') {
          this.setState('LISTENING');
          this.startListening();
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

  public async ensureMicrophoneStream(): Promise<boolean> {
    if (this.localStream && this.localStream.active) {
      return true;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.setupAudioAnalyser(this.localStream);
      return true;
    } catch (err: any) {
      console.warn('Microphone permission notice:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.callbacks?.onError?.('Microphone access was blocked. Please grant microphone permission in your browser to speak.');
      }
      return false;
    }
  }

  public async startListening(): Promise<boolean> {
    if (this.pauseSilenceTimer !== null) {
      clearTimeout(this.pauseSilenceTimer);
      this.pauseSilenceTimer = null;
    }
    this.accumulatedQueryText = '';
    this.currentInterimText = '';
    this.isListeningActive = true;
    this.isMuted = false;

    // Ensure audio unlocking and active microphone stream with real visualizer feedback
    speechService.unlockAudio();
    await this.ensureMicrophoneStream();

    this.setState('LISTENING');

    if (this.recognition) {
      try {
        this.recognition.start();
        return true;
      } catch (e: any) {
        if (e.name !== 'InvalidStateError') {
          console.warn('Speech recognition start notice:', e);
        }
        return true;
      }
    }
    return true;
  }

  /**
   * Triggers a 'stop listening' event.
   * Can be triggered manually or automatically when the user pauses for > 2 seconds.
   */
  public stopListening(reason: 'pause_timeout' | 'manual' | 'turn_complete' | 'turn_processing' = 'manual'): void {
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
    if (this.currentLanguageId !== languageId) {
      this.conversationHistory = [];
    }
    this.currentLanguageId = languageId;
    this.selectedVoice = this.getGeminiVoiceForLanguage(languageId);
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

