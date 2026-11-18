import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getCachedTranslation, autoTranslatePhrase } from '../services/autoTranslateService';
import { changeAppLanguage } from '../constants/i18n';

/**
 * useAutoTranslate Hook
 * 
 * Allows automatic runtime translation of any string anywhere in the app:
 * const { t, currentLanguage, changeLanguage } = useAutoTranslate();
 * 
 * Usage:
 * const buttonTitle = t('Export Reports');
 */
export function useAutoTranslate() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n?.language || 'en';
  const [, setTick] = useState(0);

  // Synchronous translation check or trigger async fetch
  const t = useCallback((text) => {
    if (!text || typeof text !== 'string') return text;
    if (currentLanguage === 'en') return text;

    const cached = getCachedTranslation(text, currentLanguage);
    if (cached) return cached;

    // Trigger background translation and force component re-render when fetched
    autoTranslatePhrase(text, currentLanguage).then((translated) => {
      if (translated && translated !== text) {
        setTick((prev) => prev + 1);
      }
    });

    return text;
  }, [currentLanguage]);

  return {
    t,
    currentLanguage,
    changeLanguage: changeAppLanguage,
  };
}

export default useAutoTranslate;
