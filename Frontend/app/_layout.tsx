import '../constants/i18n';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AIChatFloatingButton from '../components/AIChatFloatingButton';
import LanguageFloatingButton from '../components/LanguageFloatingButton';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '../context/ThemeContext';
import { AlertProvider } from '../context/AlertContext';
import { LanguageModalProvider } from '../context/LanguageModalContext';

function NavigationRoot() {
  const { isDark } = useAppTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Core Startup Screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
        <Stack.Screen name="StartScreen" options={{ headerShown: false }} />
        <Stack.Screen name="OnboardingScreen" options={{ headerShown: false }} />
        <Stack.Screen name="LandingScreen" options={{ headerShown: false }} />
        <Stack.Screen name="RoleSelectScreen" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="TermsScreen" options={{ headerShown: false }} />
        
        {/* Route Group Folders */}
        <Stack.Screen name="(Admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(lawyer)" options={{ headerShown: false }} />
        <Stack.Screen name="(citizen)" options={{ headerShown: false }} />
        <Stack.Screen name="(ngo)" options={{ headerShown: false }} />
        <Stack.Screen name="(media)" options={{ headerShown: false }} />
        <Stack.Screen name="KTNNewsInfo" options={{ headerShown: false }} />
        <Stack.Screen name="NCHDInfo" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Moveable Draggable AI Chatbot Button on Screens */}
      <AIChatFloatingButton />

      {/* Barq-e-Insaf Floating Language Switcher Pill (English / اردو / سنڌي) */}
      <LanguageFloatingButton />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AlertProvider>
          <LanguageModalProvider>
            <NavigationRoot />
          </LanguageModalProvider>
        </AlertProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}