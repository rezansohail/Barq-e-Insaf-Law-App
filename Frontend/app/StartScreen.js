// StartScreen – restored layout with responsive background and liquid glass buttons
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import {
  useFonts as useCinzel,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  useFonts as usePlayfair,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';

export default function StartScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Load fonts – Cinzel for the title, Playfair for the tagline
  const [cinzelLoaded] = useCinzel({ Cinzel_700Bold });
  const [playfairLoaded] = usePlayfair({ PlayfairDisplay_400Regular });

  // Navigation handlers – "Get Started" goes to onboarding, "Explore Project" to LandingScreen
  const goToOnboarding = () => router.push('/OnboardingScreen');
  const goToLanding = () => router.push('/LandingScreen');

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Responsive full‑screen background image */}
      <Image
        source={require('../assets/images/bg5.jpg')}
        style={[styles.backgroundImage, { width, height }]}
        resizeMode="cover"
        pointerEvents="none"
        accessible={false}
      />

      {/* Dark overlay to improve readability */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Safe Area wrapper for content */}
      <SafeAreaView style={styles.safeArea}>
        {/* Central content */}
        <View style={styles.contentWrapper}>
          {/* Title */}
          <Text style={[styles.title, cinzelLoaded ? { fontFamily: 'Cinzel_700Bold' } : {}]}>
            BARQ‑E‑INSAF
          </Text>
          {/* Tagline */}
          <Text style={[styles.tagline, playfairLoaded ? { fontFamily: 'PlayfairDisplay_400Regular' } : {}]}>
            Your legal companion for swift justice
          </Text>

          {/* Buttons – Liquid Glass with amber glow */}
          <View style={styles.buttonStack}>
            <TouchableOpacity
              onPress={goToOnboarding}
              activeOpacity={0.82}
              style={styles.touchWrapper}
              accessibilityRole="button"
            >
              <BlurView
                intensity={Platform.OS === 'ios' ? 45 : 75}
                tint="dark"
                style={styles.liquidGlassPill}
              >
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.24)',
                    'rgba(255, 170, 50, 0.12)',
                    'rgba(18, 9, 3, 0.45)',
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.liquidGlassGradient}
                >
                  <View style={styles.liquidGlassSheen} pointerEvents="none" />
                  <Text style={styles.buttonText}>GET STARTED</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToLanding}
              activeOpacity={0.82}
              style={styles.touchWrapper}
              accessibilityRole="button"
            >
              <BlurView
                intensity={Platform.OS === 'ios' ? 45 : 75}
                tint="dark"
                style={styles.liquidGlassPill}
              >
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.18)',
                    'rgba(255, 160, 40, 0.08)',
                    'rgba(15, 7, 2, 0.48)',
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.liquidGlassGradient}
                >
                  <View style={styles.liquidGlassSheen} pointerEvents="none" />
                  <Text style={styles.buttonText}>EXPLORE PROJECT</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#050607',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? {
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }
      : {}),
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === 'web' ? { userSelect: 'none', WebkitUserDrag: 'none' } : {}),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)', // dark veil for contrast
  },
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 33,
    color: '#FFF',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 1,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,225,150,0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 60,
  },
  buttonStack: {
    width: '85%',
    gap: 20,
  },
  touchWrapper: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 8,
  },
  liquidGlassPill: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 215, 140, 0.45)',
    backgroundColor: 'rgba(24, 12, 6, 0.32)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 0 20px rgba(255, 122, 0, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.45), inset 0 -1px 2px rgba(0, 0, 0, 0.5)',
        }
      : {}),
  },
  liquidGlassGradient: {
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  liquidGlassSheen: {
    position: 'absolute',
    top: 1,
    left: '12%',
    right: '12%',
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  buttonText: {
    color: '#FFE2B8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 140, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
