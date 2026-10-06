const { getApiKey, pcmToWav } = require('./_utils');

const LANGUAGE_VOICE_MAP = {
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({
        error: 'NO_API_KEY',
        message: 'Gemini API key not configured on server',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const textToSpeak = (body.text || '').trim();
    const languageId = (body.languageId || 'ta').toLowerCase().split('-')[0].split('_')[0];

    const voiceName =
      body.voiceName && body.voiceName !== 'Kore'
        ? body.voiceName
        : LANGUAGE_VOICE_MAP[languageId] || 'Kore';

    if (!textToSpeak) {
      return res.status(400).json({ error: 'Empty text to speak' });
    }

    const ttsEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
    let apiRes = null;

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
      return res.status(502).json({ error: 'TTS request network error' });
    }

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(apiRes.status).json({ error: errText });
    }

    const data = await apiRes.json();
    const rawBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!rawBase64) {
      return res.status(502).json({ error: 'No audio returned from Gemini TTS' });
    }

    const pcmBuffer = Buffer.from(rawBase64, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
    const wavBase64 = wavBuffer.toString('base64');

    return res.status(200).json({
      audio: `data:audio/wav;base64,${wavBase64}`,
      format: 'wav',
      voice: voiceName,
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
};
