// StartScreen – obsidian & amber luxury aesthetic with delicate tiny starry night stars and liquid glass buttons
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
  Easing,
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
import { useAppTranslation } from '../utils/translationHelper';

// 45 delicate, tiny pinpoint stars scattered like an authentic starry night sky
const STARRY_NIGHT_STARS = [
  { id: 's1',  top: '5%',  left: '12%', size: 1.5, color: '#FFFFFF', delay: 0,    dur: 2200 },
  { id: 's2',  top: '7%',  left: '34%', size: 2.0, color: '#FFF9E6', delay: 400,  dur: 2800 },
  { id: 's3',  top: '8%',  right: '22%',size: 1.2, color: '#FFD54F', delay: 900,  dur: 2400 },
  { id: 's4',  top: '11%', left: '78%', size: 2.2, color: '#FFFFFF', delay: 1500, dur: 3100 },
  { id: 's5',  top: '13%', left: '6%',  size: 1.0, color: '#FFE082', delay: 200,  dur: 2600 },
  { id: 's6',  top: '14%', right: '14%',size: 2.5, color: '#FFA726', delay: 700,  dur: 3300 },
  { id: 's7',  top: '17%', left: '48%', size: 1.2, color: '#FFFFFF', delay: 1100, dur: 2100 },
  { id: 's8',  top: '19%', right: '42%',size: 1.8, color: '#FFF8E1', delay: 350,  dur: 2900 },
  { id: 's9',  top: '22%', left: '20%', size: 2.0, color: '#FFB74D', delay: 1300, dur: 2700 },
  { id: 's10', top: '23%', right: '8%',  size: 1.5, color: '#FFFFFF', delay: 600,  dur: 2500 },
  { id: 's11', top: '26%', left: '88%', size: 1.0, color: '#FFE082', delay: 1700, dur: 3000 },
  { id: 's12', top: '28%', left: '38%', size: 1.8, color: '#FFFFFF', delay: 500,  dur: 2400 },
  { id: 's13', top: '30%', right: '32%',size: 2.2, color: '#FFD54F', delay: 1200, dur: 3200 },
  { id: 's14', top: '33%', left: '15%', size: 1.2, color: '#FFFFFF', delay: 800,  dur: 2300 },
  { id: 's15', top: '36%', right: '18%',size: 1.6, color: '#FFA726', delay: 450,  dur: 2800 },
  { id: 's16', top: '39%', left: '72%', size: 2.0, color: '#FFF9E6', delay: 1400, dur: 3400 },
  { id: 's17', top: '42%', left: '5%',  size: 1.5, color: '#FFFFFF', delay: 300,  dur: 2600 },
  { id: 's18', top: '45%', right: '48%',size: 1.2, color: '#FFE5B4', delay: 1000, dur: 2200 },
  { id: 's19', top: '48%', left: '28%', size: 2.4, color: '#FFB74D', delay: 650,  dur: 3000 },
  { id: 's20', top: '51%', right: '12%',size: 1.0, color: '#FFFFFF', delay: 1600, dur: 2700 },
  { id: 's21', top: '54%', left: '84%', size: 1.8, color: '#FFF8E1', delay: 250,  dur: 2900 },
  { id: 's22', top: '57%', left: '18%', size: 2.0, color: '#FFD54F', delay: 1150, dur: 3100 },
  { id: 's23', top: '60%', right: '28%',size: 1.4, color: '#FFFFFF', delay: 750,  dur: 2400 },
  { id: 's24', top: '63%', left: '62%', size: 1.2, color: '#FFE082', delay: 1350, dur: 2800 },
  { id: 's25', top: '66%', left: '9%',  size: 2.2, color: '#FFA726', delay: 400,  dur: 3200 },
  { id: 's26', top: '68%', right: '16%',size: 1.5, color: '#FFFFFF', delay: 950,  dur: 2500 },
  { id: 's27', top: '71%', left: '42%', size: 1.0, color: '#FFF9E6', delay: 1550, dur: 2900 },
  { id: 's28', top: '74%', right: '38%',size: 2.0, color: '#FFB74D', delay: 550,  dur: 3300 },
  { id: 's29', top: '76%', left: '25%', size: 1.4, color: '#FFFFFF', delay: 1250, dur: 2300 },
  { id: 's30', top: '79%', left: '76%', size: 2.5, color: '#FFD54F', delay: 350,  dur: 3000 },
  { id: 's31', top: '82%', right: '8%',  size: 1.2, color: '#FFFFFF', delay: 850,  dur: 2600 },
  { id: 's32', top: '84%', left: '14%', size: 1.8, color: '#FFE5B4', delay: 1450, dur: 2800 },
  { id: 's33', top: '87%', right: '24%',size: 2.0, color: '#FFA726', delay: 200,  dur: 3100 },
  { id: 's34', top: '89%', left: '55%', size: 1.2, color: '#FFFFFF', delay: 1050, dur: 2400 },
  { id: 's35', top: '92%', left: '32%', size: 1.6, color: '#FFF8E1', delay: 600,  dur: 2700 },
  { id: 's36', top: '94%', right: '44%',size: 2.0, color: '#FFB74D', delay: 1300, dur: 3200 },
  { id: 's37', top: '96%', left: '8%',  size: 1.0, color: '#FFFFFF', delay: 450,  dur: 2500 },
  { id: 's38', top: '97%', right: '15%',size: 1.5, color: '#FFE082', delay: 1100, dur: 2900 },
  { id: 's39', top: '16%', left: '30%', size: 1.0, color: '#FFFFFF', delay: 700,  dur: 2600 },
  { id: 's40', top: '35%', left: '92%', size: 1.4, color: '#FFD54F', delay: 1500, dur: 3000 },
  { id: 's41', top: '4%',  left: '60%', size: 1.6, color: '#FFF8E1', delay: 500,  dur: 2500 },
  { id: 's42', top: '9%',  left: '4%',  size: 2.1, color: '#FFB74D', delay: 1200, dur: 2900 },
  { id: 's43', top: '12%', right: '35%',size: 1.2, color: '#FFFFFF', delay: 350,  dur: 2200 },
  { id: 's44', top: '18%', left: '80%', size: 1.8, color: '#FFE082', delay: 900,  dur: 3100 },
  { id: 's45', top: '21%', left: '10%', size: 1.3, color: '#FFA726', delay: 1400, dur: 2700 },
  { id: 's46', top: '25%', right: '20%',size: 2.2, color: '#FFFFFF', delay: 250,  dur: 2400 },
  { id: 's47', top: '29%', left: '52%', size: 1.1, color: '#FFF9E6', delay: 800,  dur: 3000 },
  { id: 's48', top: '32%', right: '4%',  size: 1.5, color: '#FFD54F', delay: 1350, dur: 2600 },
  { id: 's49', top: '38%', left: '22%', size: 2.0, color: '#FFFFFF', delay: 600,  dur: 2800 },
  { id: 's50', top: '44%', right: '25%',size: 1.4, color: '#FFE5B4', delay: 1100, dur: 3300 },
  { id: 's51', top: '47%', left: '68%', size: 1.7, color: '#FFA726', delay: 450,  dur: 2300 },
  { id: 's52', top: '53%', left: '3%',  size: 1.2, color: '#FFFFFF', delay: 950,  dur: 2900 },
  { id: 's53', top: '56%', right: '38%',size: 2.4, color: '#FFB74D', delay: 1500, dur: 3200 },
  { id: 's54', top: '62%', left: '35%', size: 1.0, color: '#FFF8E1', delay: 300,  dur: 2500 },
  { id: 's55', top: '65%', right: '10%',size: 1.9, color: '#FFFFFF', delay: 850,  dur: 2700 },
  { id: 's56', top: '70%', left: '16%', size: 1.5, color: '#FFD54F', delay: 1250, dur: 3000 },
  { id: 's57', top: '75%', right: '26%',size: 2.0, color: '#FFA726', delay: 400,  dur: 2400 },
  { id: 's58', top: '78%', left: '50%', size: 1.2, color: '#FFFFFF', delay: 1050, dur: 2800 },
  { id: 's59', top: '83%', right: '48%',size: 1.6, color: '#FFE082', delay: 700,  dur: 3100 },
  { id: 's60', top: '86%', left: '88%', size: 2.2, color: '#FFB74D', delay: 1400, dur: 2600 },
  { id: 's61', top: '90%', left: '6%',  size: 1.3, color: '#FFFFFF', delay: 550,  dur: 2900 },
  { id: 's62', top: '93%', right: '20%',size: 1.8, color: '#FFF9E6', delay: 1150, dur: 2700 },
  { id: 's63', top: '95%', left: '44%', size: 1.1, color: '#FFD54F', delay: 350,  dur: 2300 },
  { id: 's64', top: '98%', left: '72%', size: 2.0, color: '#FFA726', delay: 800,  dur: 3300 },
];

function TwinklingStar({ star }) {
  const opacityAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.95,
          duration: star.dur * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.15,
          duration: star.dur * 0.5,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => {
      twinkle.start();
    }, star.delay);

    return () => {
      clearTimeout(timer);
      twinkle.stop();
    };
  }, []);

  const posStyle = {
    position: 'absolute',
    top: star.top,
    ...(star.left !== undefined ? { left: star.left } : { right: star.right }),
    width: star.size,
    height: star.size,
    borderRadius: star.size / 2,
    backgroundColor: star.color,
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        posStyle,
        {
          opacity: opacityAnim,
          shadowColor: star.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: star.size * 2,
        },
      ]}
    />
  );
}

export default function StartScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { t, appName, currentLang } = useAppTranslation();

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

      {/* Warm Ambient Radial Halos */}
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            top: -height * 0.05,
            right: -width * 0.15,
            width: width * 0.85,
            height: width * 0.85,
            backgroundColor: 'rgba(255, 120, 20, 0.06)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            bottom: height * 0.05,
            left: -width * 0.15,
            width: width * 0.9,
            height: width * 0.9,
            backgroundColor: 'rgba(234, 88, 12, 0.05)',
          },
        ]}
      />

      {/* Delicate authentic starry night sky */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {STARRY_NIGHT_STARS.map((star) => (
          <TwinklingStar key={star.id} star={star} />
        ))}
      </View>

      {/* Safe Area wrapper for content */}
      <SafeAreaView style={styles.safeArea}>
        {/* Central content */}
        <View style={styles.contentWrapper}>
          {/* Logo 1 on top of title */}
          <Image
            source={require('../assets/images/logo1.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={[styles.title, (cinzelLoaded && currentLang === 'en') ? { fontFamily: 'Cinzel_700Bold' } : {}]}>
            {appName.toUpperCase()}
          </Text>
          {/* Tagline */}
          <Text style={[styles.tagline, (playfairLoaded && currentLang === 'en') ? { fontFamily: 'PlayfairDisplay_400Regular' } : {}]}>
            {t('start.tagline', 'Your legal companion for swift justice')}
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
                  <Text style={styles.buttonText}>{t('start.getStarted', 'GET STARTED')}</Text>
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
                  <Text style={styles.buttonText}>{t('start.exploreProject', 'EXPLORE PROJECT')}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  ambientHalo: {
    position: 'absolute',
    borderRadius: 999,
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
    zIndex: 5,
  },
  brandLogo: {
    width: 90,
    height: 90,
    marginBottom: 14,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
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
    fontSize: 14,
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
    backgroundColor: 'rgba(255, 85, 0, 0.7)',
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
    color: '#ffebce',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 140, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
