const { getApiKey, getXaiApiKey } = require('./_utils');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = getApiKey();
  const xaiApiKey = getXaiApiKey();
  if (!apiKey && !xaiApiKey) {
    return res.status(503).json({
      error: 'NO_API_KEY',
      message: 'Neither Gemini nor xAI API key is configured on server',
    });
  }

  return res.status(200).json({
    status: 'configured',
    gemini: Boolean(apiKey),
    xai: Boolean(xaiApiKey),
  });
};
