import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function getApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;

  const candidatePaths = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../../.env'),
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        const match = content.match(/^(?:VITE_)?GEMINI_API_KEY=(.+)$/m);
        if (match && match[1]) {
          return match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    } catch (_) {}
  }
  return '';
}

function getXaiApiKey(): string {
  if (process.env.XAI_API_KEY) return process.env.XAI_API_KEY;
  if (process.env.VITE_XAI_API_KEY) return process.env.VITE_XAI_API_KEY;

  const candidatePaths = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../../.env'),
  ];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        const match = content.match(/^(?:VITE_)?XAI_API_KEY=(.+)$/m);
        if (match && match[1]) {
          return match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    } catch (_) {}
  }
  return '';
}

function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1): Buffer {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataLength = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

function geminiLiveServerPlugin(): Plugin {
  return {
    name: 'gemini-live-backend-gateway',
    configureServer(server) {
      server.middlewares.use('/api/gemini-token', (req, res) => {
        const apiKey = getApiKey();
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'NO_API_KEY', message: 'Gemini API key not configured on server' }));
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'configured' }));
      });

      // 1. Conversational Multi-Turn Gemini 3.8 Flash Generation
      server.middlewares.use('/api/gemini-generate', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const apiKey = getApiKey();
            if (!apiKey) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'NO_API_KEY', message: 'Gemini API key not configured on server' }));
              return;
            }

            const parsed = JSON.parse(body || '{}');
            const systemInstructionText =
              parsed.systemInstruction ||
              'You are PACS Sahayak, a warm, friendly voice assistant. Have a natural voice conversation with the citizen in 1-3 spoken sentences. Be helpful, polite, and conversational.';
            
            let contents: any[] = [];
            const userParts: any[] = [];
            if (parsed.prompt) userParts.push({ text: parsed.prompt });
            if (parsed.audio) {
              userParts.push({
                inlineData: {
                  mimeType: parsed.mimeType || 'audio/webm',
                  data: parsed.audio,
                },
              });
            }
            if (userParts.length === 0) userParts.push({ text: 'Hello' });

            if (Array.isArray(parsed.history) && parsed.history.length > 0) {
              contents = parsed.history.map((h: any) => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.text || h.content || '' }],
              }));
              contents.push({
                role: 'user',
                parts: userParts,
              });
            } else {
              contents = [
                {
                  role: 'user',
                  parts: userParts,
                },
              ];
            }

              const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
              let generatedText = '';
              let lastStatus = 500;
              let lastErrText = '';

              for (const model of candidateModels) {
                try {
                  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                  const apiRes = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      systemInstruction: {
                        parts: [{ text: systemInstructionText }],
                      },
                      contents,
                      generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 600,
                      },
                    }),
                  });

                  if (apiRes.ok) {
                    const data: any = await apiRes.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (text) {
                      generatedText = text;
                      break;
                    }
                  } else {
                    lastStatus = apiRes.status;
                    lastErrText = await apiRes.text();
                  }
                } catch (err: any) {
                  lastErrText = err?.message || 'Network error';
                }
              }

              if (generatedText) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ text: generatedText }));
              } else {
                res.statusCode = lastStatus;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: lastErrText || 'All models unavailable' }));
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Server error' }));
            }
          });
      });

      // 1b. Ultra-Low Latency Streaming Generation (Stream-to-Speech)
      server.middlewares.use('/api/gemini-stream', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const apiKey = getApiKey();
            if (!apiKey) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'NO_API_KEY', message: 'Gemini API key not configured' }));
              return;
            }

            const parsed = JSON.parse(body || '{}');
            const systemInstructionText =
              parsed.systemInstruction ||
              'You are PACS Sahayak, a warm, friendly voice assistant. Answer concisely in 1-2 punchy spoken sentences.';

            let contents: any[] = [];
            if (Array.isArray(parsed.history) && parsed.history.length > 0) {
              contents = parsed.history.map((h: any) => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.text || h.content || '' }],
              }));
              if (parsed.prompt) {
                contents.push({
                  role: 'user',
                  parts: [{ text: parsed.prompt }],
                });
              }
            } else {
              contents = [
                {
                  role: 'user',
                  parts: [{ text: parsed.prompt || 'Hello' }],
                },
              ];
            }

            const streamEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
            const apiRes = await fetch(streamEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemInstructionText }],
                },
                contents,
                generationConfig: {
                  temperature: 0.5,
                  maxOutputTokens: 120,
                },
              }),
            });

            if (!apiRes.ok) {
              const errText = await apiRes.text();
              res.statusCode = apiRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: errText }));
              return;
            }

            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
            });

            if (apiRes.body) {
              const reader = (apiRes.body as any).getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
              res.end();
            } else {
              res.end();
            }
          } catch (err: any) {
            console.error('Streaming endpoint error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
        });
      });

      // 2. High-Definition Gemini Text-to-Speech (gemini-3.1-flash-tts-preview)
      server.middlewares.use('/api/gemini-tts', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const apiKey = getApiKey();
            if (!apiKey) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'NO_API_KEY', message: 'Gemini API key not configured' }));
              return;
            }

            const parsed = JSON.parse(body || '{}');
            const textToSpeak = (parsed.text || '').trim();
            const languageId = (parsed.languageId || 'ta').toLowerCase();
            
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
            
            const voiceName = parsed.voiceName && parsed.voiceName !== 'Kore' 
              ? parsed.voiceName 
              : (LANGUAGE_VOICE_MAP[languageId] || 'Kore');

            if (!textToSpeak) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Empty text to speak' }));
              return;
            }

            const ttsEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
            let apiRes: any = null;
            for (let attempt = 0; attempt < 2; attempt++) {
              try {
                apiRes = await fetch(ttsEndpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: textToSpeak }] }],
                    generationConfig: {
                      responseModalities: ['AUDIO'],
                      speechConfig: {
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName },
                        },
                      },
                    },
                  }),
                });
                if (apiRes && apiRes.ok) break;
              } catch (_) {
                if (attempt === 0) await new Promise((r) => setTimeout(r, 200));
              }
            }

            if (!apiRes) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'TTS request network error' }));
              return;
            }

            if (!apiRes.ok) {
              const errText = await apiRes.text();
              console.warn('Gemini TTS API error:', errText);
              res.statusCode = apiRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: errText }));
              return;
            }

            const data: any = await apiRes.json();
            const rawBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!rawBase64) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No audio returned from Gemini TTS' }));
              return;
            }

            // Convert 24kHz 16-bit mono PCM into standard browser-compatible WAV
            const pcmBuffer = Buffer.from(rawBase64, 'base64');
            const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
            const wavBase64 = wavBuffer.toString('base64');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                audio: `data:audio/wav;base64,${wavBase64}`,
                format: 'wav',
                voice: voiceName,
              })
            );
          } catch (err: any) {
            console.error('TTS endpoint error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiLiveServerPlugin()],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(getApiKey()),
      '__GEMINI_API_KEY__': JSON.stringify(getApiKey()),
      'import.meta.env.VITE_XAI_API_KEY': JSON.stringify(getXaiApiKey()),
      '__XAI_API_KEY__': JSON.stringify(getXaiApiKey()),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            icons: ['lucide-react'],
          },
        },
      },
    },
  };
});
