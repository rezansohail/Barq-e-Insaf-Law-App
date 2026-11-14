import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * useAppNavigation
 * Enforces proper mobile navigation flow:
 * 1. From secondary tabs (cases, lawyers, profile): back goes to homeRoute via router.replace (doesn't stack or fall back to login).
 * 2. On home/dashboard screens: back does NOT jump to login/roleselect. Pressing back twice within 2 seconds exits the app.
 *
 * @param {boolean} isHome - Whether the current screen is the home/dashboard screen
 * @param {string} homeRoute - Module home route (e.g. '/(citizen)/CitizenHome')
 */
export function useAppNavigation({ isHome = false, homeRoute = '/(citizen)/CitizenHome' } = {}) {
  const router = useRouter();
  const lastBackPressRef = useRef(0);

  useEffect(() => {
    const onBackPress = () => {
      if (!isHome) {
        // From any tab or secondary screen, go directly to Home without stacking
        router.replace(homeRoute);
        return true; // handled
      }

      // On home screen: double-press back to exit app
      const now = Date.now();
      if (lastBackPressRef.current && now - lastBackPressRef.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressRef.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      }
      return true; // Handled: prevents popping back to LoginScreen or RoleSelectScreen!
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [isHome, homeRoute, router]);

  const goBack = () => {
    if (isHome) return;
    router.replace(homeRoute);
  };

  return { goBack };
}
