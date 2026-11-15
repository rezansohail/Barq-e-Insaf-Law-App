import React, { createContext, useContext, useState } from 'react';

export const themes = {
  dark: {
    isDark: true,
    bg: '#080402',
    bgSecondary: '#120703',
    cardBg: 'rgba(32, 16, 7, 0.94)',
    cardBgSecondary: 'rgba(20, 10, 4, 0.95)',
    cardBorder: 'rgba(255, 160, 40, 0.35)',
    accent: '#FF7A00',
    accentLight: '#FFA726',
    accentWarm: '#FF9500',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 235, 215, 0.75)',
    textMuted: 'rgba(255, 220, 185, 0.55)',
    inputBg: 'rgba(20, 9, 4, 0.95)',
    inputBorder: 'rgba(255, 160, 40, 0.35)',
    glow: 'rgba(255, 140, 0, 0.28)',
    headerBg: '#080402',
    bottomNavBg: '#0A0402',
    navBorder: 'rgba(255, 160, 40, 0.22)',
    statusBarStyle: 'light-content',
    statusBarBg: '#080402',
  },
  light: {
    isDark: false,
    bg: '#FAF8F5',
    bgSecondary: '#F3EFEA',
    cardBg: '#FFFFFF',
    cardBgSecondary: '#F5F2EB',
    cardBorder: 'rgba(234, 88, 12, 0.25)',
    accent: '#EA580C',
    accentLight: '#FF8A00',
    accentWarm: '#FF7A00',
    textPrimary: '#1A0C04',
    textSecondary: 'rgba(45, 25, 12, 0.75)',
    textMuted: 'rgba(75, 45, 25, 0.55)',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(234, 88, 12, 0.35)',
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
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, isDark: isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
