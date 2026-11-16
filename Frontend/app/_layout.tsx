import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import AIChatFloatingButton from '../components/AIChatFloatingButton';
import { ThemeProvider as AppThemeProvider } from '../context/ThemeContext';
import { AlertProvider } from '../context/AlertContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AlertProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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

            <StatusBar style="auto" />
            
            {/* Moveable Draggable AI Chatbot Button on Screens */}
            <AIChatFloatingButton />
          </ThemeProvider>
        </AlertProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}