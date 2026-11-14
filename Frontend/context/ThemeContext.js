import React, { createContext, useContext, useState } from 'react';

// Barq-e-Insaf Color Schemes
export const themes = {
  dark: {
    isDark: true,
    bg: '#0C0502',
    bgSecondary: '#140803',
    cardBg: 'rgba(22, 10, 4, 0.55)',
    cardBorder: 'rgba(255, 149, 0, 0.32)',
    accent: '#FF9500',
    accentLight: '#FFA726',
    accentWarm: '#FF7A29',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 240, 225, 0.82)',
    textMuted: 'rgba(255, 220, 185, 0.55)',
    inputBg: 'rgba(28, 12, 4, 0.65)',
    glow: 'rgba(255, 149, 0, 0.28)',
    headerBg: '#140803',
    bottomNavBg: '#100602',
    navBorder: 'rgba(255, 149, 0, 0.22)',
  },
  light: {
    isDark: false,
    bg: '#FFF8F2',
    bgSecondary: '#FDF0E4',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(255, 140, 0, 0.35)',
    accent: '#EA580C',
    accentLight: '#FF8A00',
    accentWarm: '#C2410C',
    textPrimary: '#1E1008',
    textSecondary: '#4A3425',
    textMuted: '#786252',
    inputBg: '#FBF3EB',
    glow: 'rgba(234, 88, 12, 0.18)',
    headerBg: '#FFFFFF',
    bottomNavBg: '#FFFFFF',
    navBorder: 'rgba(234, 88, 12, 0.20)',
  },
};

const ThemeContext = createContext({
  theme: themes.dark,
  isDarkMode: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
