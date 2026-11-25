import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Appearance,
  useColorScheme as useRNColorScheme,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import safeStorage from '../services/safeStorage';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = '@barqeinsaf_theme_mode';

export const themes = {
  dark: {
    isDark: true,
    bg: '#080402',
    bgSecondary: '#120804',
    card: 'rgba(38, 20, 10, 0.94)',
    cardBg: 'rgba(38, 20, 10, 0.94)',
    cardBgSecondary: 'rgba(25, 12, 5, 0.85)',
    cardBorder: 'rgba(255, 160, 40, 0.25)',
    surface: 'rgba(25, 12, 5, 0.72)',
    surfaceBorder: 'rgba(255, 160, 40, 0.22)',
    text: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#FFEED6',
    textMuted: '#C8A892',
    accent: '#FF9500',
    accentLight: '#FFA726',
    accentWarm: '#FF9500',
    border: 'rgba(255, 160, 40, 0.22)',
    divider: 'rgba(255, 255, 255, 0.08)',
    inputBg: 'rgba(25, 12, 5, 0.72)',
    inputBorder: 'rgba(255, 160, 40, 0.25)',
    glow: 'rgba(255, 149, 0, 0.25)',
    headerBg: '#140704',
    bottomNavBg: '#120804',
    navBorder: 'rgba(255, 160, 40, 0.22)',
    statusBarStyle: 'light-content',
    statusBarBg: '#080402',
  },
  light: {
    isDark: false,
    bg: '#FAF8F5',
    bgSecondary: '#F3EFEA',
    card: '#FFFFFF',
    cardBg: '#FFFFFF',
    cardBgSecondary: '#F5F2EB',
    cardBorder: 'rgba(234, 88, 12, 0.20)',
    surface: '#FFFFFF',
    surfaceBorder: 'rgba(234, 88, 12, 0.20)',
    text: '#1A0C04',
    textPrimary: '#1A0C04',
    textSecondary: '#4A3325',
    textMuted: '#7C6859',
    accent: '#EA580C',
    accentLight: '#FF8A00',
    accentWarm: '#FF7A00',
    border: 'rgba(234, 88, 12, 0.18)',
    divider: 'rgba(0, 0, 0, 0.08)',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(234, 88, 12, 0.25)',
    glow: 'rgba(234, 88, 12, 0.15)',
    headerBg: '#FFFFFF',
    bottomNavBg: '#FFFFFF',
    navBorder: 'rgba(234, 88, 12, 0.18)',
    statusBarStyle: 'dark-content',
    statusBarBg: '#FAF8F5',
  },
};

const ThemeContext = createContext({
  theme: themes.dark,
  isDarkMode: true,
  isDark: true,
  themeMode: 'dark',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState('dark');
  const [hasLoadedPersisted, setHasLoadedPersisted] = useState(false);

  // 1. Load saved theme mode from safeStorage (works seamlessly on Web and Native)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const saved = await safeStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'dark' || saved === 'light' || saved === 'system')) {
          if (isMounted) {
            console.log('[ThemeAPI] Loaded saved theme mode:', saved);
            setThemeModeState(saved);
          }
        }
      } catch (e) {
        console.warn('[ThemeAPI] Failed to load saved theme preference:', e);
      } finally {
        if (isMounted) setHasLoadedPersisted(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Listen to device Appearance changes when in 'system' mode
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        if (Platform.OS !== 'web') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        // Triggers re-render with new system theme
      }
    });
    return () => listener.remove();
  }, [themeMode]);

  const setThemeMode = useCallback(async (newMode) => {
    try {
      if (Platform.OS !== 'web') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      console.log('[ThemeAPI] Setting theme mode to:', newMode);
      setThemeModeState(newMode);
      await safeStorage.setItem(STORAGE_KEY, newMode);
    } catch (e) {
      console.warn('[ThemeAPI] Failed to persist theme preference:', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const currentIsDark = themeMode === 'system' ? (systemScheme === 'dark') : (themeMode === 'dark');
    const nextMode = currentIsDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [themeMode, systemScheme, setThemeMode]);

  const isDark = themeMode === 'system'
    ? (systemScheme === 'dark')
    : (themeMode === 'dark');

  const theme = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: isDark,
        isDark,
        themeMode,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);

export default ThemeContext;
