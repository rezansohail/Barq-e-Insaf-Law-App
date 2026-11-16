import React, { createContext, useContext, useState } from 'react';

export const themes = {
  dark: {
    isDark: true,
    bg: '#121218',
    bgSecondary: '#181822',
    cardBg: '#1E202C',
    cardBgSecondary: '#252737',
    cardBorder: 'rgba(255, 160, 40, 0.32)',
    accent: '#FF7A00',
    accentLight: '#FFA726',
    accentWarm: '#FF9500',
    textPrimary: '#FFFFFF',
    textSecondary: '#E5E7EB',
    textMuted: '#9CA3AF',
    inputBg: '#222434',
    inputBorder: '#32354A',
    glow: 'rgba(255, 149, 0, 0.25)',
    headerBg: '#181822',
    bottomNavBg: '#161722',
    navBorder: 'rgba(255, 160, 40, 0.22)',
    statusBarStyle: 'light-content',
    statusBarBg: '#121218',
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
    textSecondary: '#374151',
    textMuted: '#6B7280',
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

export default ThemeContext;
