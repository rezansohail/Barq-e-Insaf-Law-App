import safeStorage from './safeStorage';
import api from '../constants/api';

// Pre-load static dictionaries to seed the cache immediately
import en from '../locales/en.json';
import ur from '../locales/ur.json';
import roman_ur from '../locales/roman_ur.json';
import sd from '../locales/sd.json';

// In-memory runtime translation dictionary
const runtimeCache = {
  ur: {},
  roman_ur: {},
  sd: {},
};

// Seed initial dictionary pairs so common terms are 100% instant (0ms)
function seedCache() {
  const seedFromObject = (enObj, targetObj, lang) => {
    if (!enObj || !targetObj) return;
    Object.keys(enObj).forEach((key) => {
      if (typeof enObj[key] === 'object') {
        seedFromObject(enObj[key], targetObj[key], lang);
      } else if (typeof enObj[key] === 'string' && typeof targetObj[key] === 'string') {
        const enPhrase = enObj[key].trim();
        const translated = targetObj[key].trim();
        if (enPhrase && translated) {
          runtimeCache[lang][enPhrase] = translated;
        }
      }
    });
  };

  seedFromObject(en, ur, 'ur');
  seedFromObject(en, roman_ur, 'roman_ur');
  seedFromObject(en, sd, 'sd');
}

seedCache();

// Load any dynamic cached translations saved from previous sessions
(async () => {
  try {
    const saved = await safeStorage.getItem('dynamic_translations_cache');
    if (saved) {
      const parsed = JSON.parse(saved);
      ['ur', 'roman_ur', 'sd'].forEach((lang) => {
        if (parsed[lang]) {
          runtimeCache[lang] = { ...runtimeCache[lang], ...parsed[lang] };
        }
      });
    }
  } catch (_) {}
})();

// Save new translations to storage (debounced)
let saveTimeout = null;
function persistDynamicCache() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await safeStorage.setItem('dynamic_translations_cache', JSON.stringify(runtimeCache));
    } catch (_) {}
  }, 2000);
}

/**
 * Synchronously get translation if already in cache
 */
export function getCachedTranslation(phrase, targetLang) {
  if (!phrase || typeof phrase !== 'string') return phrase;
  if (!targetLang || targetLang === 'en') return phrase;
  const clean = phrase.trim();
  if (runtimeCache[targetLang] && runtimeCache[targetLang][clean]) {
    return runtimeCache[targetLang][clean];
  }
  return null;
}

/**
 * Asynchronously translate a single phrase at runtime
 */
export async function autoTranslatePhrase(phrase, targetLang) {
  if (!phrase || typeof phrase !== 'string') return phrase;
  if (!targetLang || targetLang === 'en') return phrase;

  const clean = phrase.trim();
  const cached = getCachedTranslation(clean, targetLang);
  if (cached) return cached;

  try {
    const res = await api.post('/translate', {
      text: clean,
      targetLang,
    });

    if (res.data?.success && res.data?.translation) {
      const translated = res.data.translation;
      if (!runtimeCache[targetLang]) runtimeCache[targetLang] = {};
      runtimeCache[targetLang][clean] = translated;
      persistDynamicCache();
      return translated;
    }
  } catch (err) {
    console.warn('[AutoTranslate] Fetch error for phrase:', clean, err.message);
  }

  return clean;
}

/**
 * Asynchronously translate a batch of phrases at runtime
 */
export async function autoTranslateBatch(phrases, targetLang) {
  if (!Array.isArray(phrases) || phrases.length === 0) return {};
  if (!targetLang || targetLang === 'en') {
    const identity = {};
    phrases.forEach((p) => { identity[p] = p; });
    return identity;
  }

  const result = {};
  const missing = [];

  for (const phrase of phrases) {
    if (typeof phrase !== 'string') continue;
    const clean = phrase.trim();
    const cached = getCachedTranslation(clean, targetLang);
    if (cached) {
      result[clean] = cached;
    } else {
      missing.push(clean);
    }
  }

  if (missing.length === 0) return result;

  try {
    const res = await api.post('/translate', {
      texts: missing,
      targetLang,
    });

    if (res.data?.success && res.data?.translations) {
      Object.keys(res.data.translations).forEach((key) => {
        const trans = res.data.translations[key];
        if (!runtimeCache[targetLang]) runtimeCache[targetLang] = {};
        runtimeCache[targetLang][key] = trans;
        result[key] = trans;
      });
      persistDynamicCache();
    }
  } catch (err) {
    console.warn('[AutoTranslate] Batch fetch error:', err.message);
    missing.forEach((p) => { result[p] = p; });
  }

  return result;
}

export default {
  getCachedTranslation,
  autoTranslatePhrase,
  autoTranslateBatch,
};
