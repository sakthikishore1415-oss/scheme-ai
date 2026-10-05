const { getApiKey } = require('./_utils');

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
    const systemInstructionText =
      body.systemInstruction ||
      'You are Arivom (அறிவோம்), a warm, friendly voice assistant. Have a natural voice conversation with the citizen in 1-3 spoken sentences. Be helpful, polite, and conversational.';

    let contents = [];
    if (Array.isArray(body.history) && body.history.length > 0) {
      contents = body.history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text || h.content || '' }],
      }));
      if (body.prompt) {
        contents.push({
          role: 'user',
          parts: [{ text: body.prompt }],
        });
      }
    } else {
      contents = [
        {
          role: 'user',
          parts: [{ text: body.prompt || 'Hello' }],
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
          const data = await apiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            generatedText = text;
            break;
          }
        } else {
          lastStatus = apiRes.status;
          lastErrText = await apiRes.text();
        }
      } catch (err) {
        lastErrText = err?.message || 'Network error';
      }
    }

    if (generatedText) {
      return res.status(200).json({ text: generatedText });
    } else {
      return res.status(lastStatus).json({ error: lastErrText || 'All candidate models unavailable' });
    }
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
};
