import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../constants/api';

const CACHE_PREFIX = 'auto_trans_cache_';
const memCache = new Map();

/**
 * Get cached translation synchronously if already loaded in memory
 */
export function getCachedTranslation(phrase, lang) {
  if (!phrase || lang === 'en') return phrase;
  const key = `${lang}:${phrase.trim()}`;
  return memCache.get(key) || null;
}

/**
 * Auto translate phrase via backend or free translation fallback
 */
export async function autoTranslatePhrase(phrase, targetLang) {
  if (!phrase || targetLang === 'en') return phrase;
  const trimmed = phrase.trim();
  const cacheKey = `${targetLang}:${trimmed}`;

  if (memCache.has(cacheKey)) {
    return memCache.get(cacheKey);
  }

  try {
    const asyncCached = await AsyncStorage.getItem(CACHE_PREFIX + cacheKey);
    if (asyncCached) {
      memCache.set(cacheKey, asyncCached);
      return asyncCached;
    }

    // Call backend translation service if available
    const response = await axios.post(
      `${BASE_URL || 'http://localhost:5000/api'}/translate`,
      { text: trimmed, targetLang },
      { timeout: 4000 }
    ).catch(() => null);

    if (response?.data?.translatedText) {
      const translated = response.data.translatedText;
      memCache.set(cacheKey, translated);
      AsyncStorage.setItem(CACHE_PREFIX + cacheKey, translated).catch(() => {});
      return translated;
    }
  } catch (_) {
    // Fail gracefully without breaking UI
  }

  return trimmed;
}

export default {
  getCachedTranslation,
  autoTranslatePhrase,
};
