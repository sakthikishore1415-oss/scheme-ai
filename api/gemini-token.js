const { getApiKey } = require('./_utils');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(503).json({
      error: 'NO_API_KEY',
      message: 'Gemini API key not configured on server',
    });
  }

  return res.status(200).json({ status: 'configured' });
};
