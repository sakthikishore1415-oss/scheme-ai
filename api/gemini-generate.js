const { getApiKey, getXaiApiKey } = require('./_utils');

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
    const xaiApiKey = getXaiApiKey();
    if (!apiKey && !xaiApiKey) {
      return res.status(503).json({
        error: 'NO_API_KEY',
        message: 'Neither Gemini nor xAI API key is configured on server',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const rawLang = (body.language || body.languageId || '').toLowerCase().split('-')[0].split('_')[0];
    const languageNames = {
      ta: 'Tamil (தமிழ்)',
      ml: 'Malayalam (മലയാളം)',
      hi: 'Hindi (हिन्दी)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      gu: 'Gujarati (ગુજરાતી)',
      or: 'Odia (ଓଡ଼ିଆ)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      as: 'Assamese (অসমীয়া)',
      en: 'English',
    };
    const targetLangName = languageNames[rawLang];
    let systemInstructionText = body.systemInstruction;
    if (!systemInstructionText) {
      if (targetLangName && rawLang !== 'en') {
        systemInstructionText = `You are PACS Sahayak, a warm, friendly civic voice assistant. Respond STRICTLY in ${targetLangName} in 1-2 spoken sentences. Do NOT use English.`;
      } else {
        systemInstructionText = 'You are PACS Sahayak, a warm, friendly voice assistant. Have a natural voice conversation with the citizen in 1-3 spoken sentences. Be helpful, polite, and conversational.';
      }
    } else if (targetLangName && rawLang !== 'en' && !systemInstructionText.toLowerCase().includes(rawLang)) {
      systemInstructionText += `\nCRITICAL LANGUAGE MANDATE: You MUST reply STRICTLY in ${targetLangName}. Do NOT use English.`;
    }

    let contents = [];
    const userParts = [];
    if (body.prompt) userParts.push({ text: body.prompt });
    if (body.audio) {
      userParts.push({
        inlineData: {
          mimeType: body.mimeType || 'audio/webm',
          data: body.audio,
        },
      });
    }
    if (userParts.length === 0) userParts.push({ text: 'Hello' });

    if (Array.isArray(body.history) && body.history.length > 0) {
      contents = body.history.map((h) => ({
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

    if (apiKey) {
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
    }
    if (!generatedText && xaiApiKey) {
      try {
        const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${xaiApiKey}`,
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemInstructionText },
              ...(Array.isArray(body.history)
                ? body.history.slice(-4).map((h) => ({
                    role: h.role === 'assistant' ? 'assistant' : 'user',
                    content: h.text || h.content || '',
                  }))
                : []),
              { role: 'user', content: body.prompt || 'Hello' },
            ],
            model: 'grok-beta',
            temperature: 0.5,
          }),
        });
        if (xaiRes.ok) {
          const xaiData = await xaiRes.json();
          const grokText = xaiData.choices?.[0]?.message?.content;
          if (grokText) {
            generatedText = grokText;
          }
        }
      } catch (_) {}
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
