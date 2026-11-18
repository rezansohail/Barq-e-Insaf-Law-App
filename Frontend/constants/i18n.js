import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import safeStorage from '../services/safeStorage';

import en from '../locales/en.json';
import ur from '../locales/ur.json';
import roman_ur from '../locales/roman_ur.json';
import sd from '../locales/sd.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', isRtl: false, flag: '🇬🇧' },
  { code: 'ur', label: 'Urdu', native: 'اردو', isRtl: true, flag: '🇵🇰' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي', isRtl: true, flag: '🏴' },
];

const resources = {
  en: { translation: en },
  ur: { translation: ur },
  sd: { translation: sd },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Automatically restore user's saved language preference on startup
safeStorage.getItem('app_language')
  .then((savedLanguage) => {
    if (savedLanguage && ['en', 'ur', 'sd'].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    }
  })
  .catch((err) => {
    // Handled silently
  });

export const changeAppLanguage = async (languageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    await safeStorage.setItem('app_language', languageCode);
  } catch (err) {
    console.error('[i18n] Error changing language:', err.message);
  }
};

export const getCurrentLanguage = () => i18n.language || 'en';

export default i18n;
