const express = require('express');
const router = express.Router();

// High-speed in-memory translation cache (persists for the life of the server)
const translationCache = {
  ur: {},
  sd: {},
  roman_ur: {},
};

// Translate via Google Translate free endpoint (Urdu / Sindhi)
async function fetchGoogleTranslate(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);
  const data = await response.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map((item) => item[0]).join('');
  }
  throw new Error('Unexpected translation format');
}

// Translate via Groq AI (Specialized for Roman Urdu and fallback)
async function fetchGroqTranslate(texts, targetLang) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) throw new Error('GROQ_API_KEY not configured');

  const langNames = {
    roman_ur: 'conversational Pakistani Roman Urdu (Latin alphabet, e.g. "Case Darj Karein", "Qanooni Madad")',
    ur: 'formal Pakistani Urdu in Urdu script',
    sd: 'authentic Sindhi in Sindhi script',
  };

  const targetDescription = langNames[targetLang] || targetLang;

  const prompt = `Translate the following English app UI phrases into ${targetDescription}.
Return ONLY a valid JSON object mapping each English phrase exactly to its translation, with no explanation and no markdown formatting:
Phrases:
${JSON.stringify(texts)}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

// POST /api/translate
// Supports single: { text: "...", targetLang: "..." }
// Or batch: { texts: ["...", "..."], targetLang: "..." }
router.post('/', async (req, res) => {
  try {
    const { text, texts, targetLang } = req.body;
    const target = (targetLang || 'ur').toLowerCase();

    if (target === 'en') {
      if (text) return res.json({ success: true, translation: text });
      if (texts) {
        const identity = {};
        texts.forEach((t) => (identity[t] = t));
        return res.json({ success: true, translations: identity });
      }
    }

    if (!['ur', 'sd', 'roman_ur'].includes(target)) {
      return res.status(400).json({ success: false, message: 'Invalid target language. Supported: ur, sd, roman_ur, en' });
    }

    if (!translationCache[target]) {
      translationCache[target] = {};
    }

    const inputList = texts || (text ? [text] : []);
    if (inputList.length === 0) {
      return res.status(400).json({ success: false, message: 'Must provide text or texts array' });
    }

    const results = {};
    const missing = [];

    // Check cache first
    for (const phrase of inputList) {
      if (translationCache[target][phrase]) {
        results[phrase] = translationCache[target][phrase];
      } else {
        missing.push(phrase);
      }
    }

    // Translate missing phrases
    if (missing.length > 0) {
      if (target === 'roman_ur') {
        try {
          const aiTranslations = await fetchGroqTranslate(missing, target);
          for (const phrase of missing) {
            const translated = aiTranslations[phrase] || phrase;
            translationCache[target][phrase] = translated;
            results[phrase] = translated;
          }
        } catch (groqErr) {
          console.error('[Translate] Groq Roman Urdu Error:', groqErr.message);
          // Fallback to phrase itself if failed
          missing.forEach((p) => { results[p] = p; });
        }
      } else {
        // Urdu or Sindhi: Use Google Translate with parallel fetching
        await Promise.all(
          missing.map(async (phrase) => {
            try {
              const googleLang = target === 'sd' ? 'sd' : 'ur';
              const translated = await fetchGoogleTranslate(phrase, googleLang);
              translationCache[target][phrase] = translated;
              results[phrase] = translated;
            } catch (gtErr) {
              // Fallback to Groq if Google fails
              try {
                const ai = await fetchGroqTranslate([phrase], target);
                const translated = ai[phrase] || phrase;
                translationCache[target][phrase] = translated;
                results[phrase] = translated;
              } catch (fallbackErr) {
                results[phrase] = phrase;
              }
            }
          })
        );
      }
    }

    if (text && !texts) {
      return res.json({ success: true, translation: results[text] || text });
    }

    return res.json({ success: true, translations: results });
  } catch (err) {
    console.error('[Translate Route] General error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/translate/trigger
// Triggers 'cd frontend npm run translate' when a new account or record is created
const { triggerTranslate } = require('../utils/triggerTranslate');
router.post('/trigger', (req, res) => {
  try {
    triggerTranslate(req.body);
    return res.json({ success: true, message: 'Translation triggered successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
