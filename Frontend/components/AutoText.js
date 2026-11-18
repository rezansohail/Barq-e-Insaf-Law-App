import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCachedTranslation, autoTranslatePhrase } from '../services/autoTranslateService';

/**
 * <AutoText> - Drop-in replacement for React Native's <Text>
 * 
 * Automatically translates whatever English text you put inside it
 * into the currently selected language (Urdu, Sindhi, Roman Urdu, English)
 * WITHOUT requiring manual dictionary keys or JSON editing!
 * 
 * Example:
 * <AutoText style={styles.title}>Welcome to Barq-e-Insaf</AutoText>
 */
export default function AutoText({ children, style, ...restProps }) {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language || 'en';

  const rawText = typeof children === 'string' ? children : '';
  const cached = getCachedTranslation(rawText, currentLang);

  const [displayText, setDisplayText] = useState(cached || rawText || children);

  useEffect(() => {
    let isMounted = true;

    if (!rawText || currentLang === 'en') {
      setDisplayText(rawText || children);
      return;
    }

    const immediate = getCachedTranslation(rawText, currentLang);
    if (immediate) {
      setDisplayText(immediate);
      return;
    }

    // Translate on the fly
    autoTranslatePhrase(rawText, currentLang).then((translated) => {
      if (isMounted && translated) {
        setDisplayText(translated);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [rawText, currentLang]);

  return (
    <Text style={style} {...restProps}>
      {displayText}
    </Text>
  );
}
