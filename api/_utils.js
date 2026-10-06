const fs = require('fs');
const path = require('path');

function getApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }
  if (process.env.VITE_GEMINI_API_KEY) {
    return process.env.VITE_GEMINI_API_KEY.trim();
  }

  // Attempt local .env resolution for local preview or dev
  const candidatePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps', 'web', '.env'),
    path.resolve(__dirname, '..', '.env'),
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

function getXaiApiKey() {
  if (process.env.XAI_API_KEY) {
    return process.env.XAI_API_KEY.trim();
  }
  if (process.env.VITE_XAI_API_KEY) {
    return process.env.VITE_XAI_API_KEY.trim();
  }

  const candidatePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps', 'web', '.env'),
    path.resolve(__dirname, '..', '.env'),
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

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1) {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataLength = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // Bits per sample
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

module.exports = {
  getApiKey,
  getXaiApiKey,
  pcmToWav,
};
