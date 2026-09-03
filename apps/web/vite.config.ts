import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function realtimeSessionPlugin(): Plugin {
  return {
    name: 'realtime-session-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/realtime-session', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'NO_API_KEY',
            message: 'OpenAI API key not configured on server. Falling back to local high-performance voice engine.'
          }));
          return;
        }

        try {
          const sessionResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-realtime-preview-2024-12-17',
              voice: 'verse',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 600,
                create_response: true
              }
            })
          });

          if (!sessionResponse.ok) {
            const errText = await sessionResponse.text();
            res.statusCode = sessionResponse.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'OPENAI_ERROR', details: errText }));
            return;
          }

          const data = await sessionResponse.json();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'INTERNAL_ERROR', message: err.message }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), realtimeSessionPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
