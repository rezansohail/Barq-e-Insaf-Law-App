import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useFonts, BigShouldersDisplay_800ExtraBold } from '@expo-google-fonts/big-shoulders-display';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { PlayfairDisplay_400Regular_Italic } from '@expo-google-fonts/playfair-display';

const { width, height } = Dimensions.get('window');

// Fire glow centre (top-left of the screen, like the Ember design)
const GLOW_X = width * 0.42;
const GLOW_Y = height * 0.12;

const RING = 112;

export default function StartScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    BigShouldersDisplay_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    PlayfairDisplay_400Regular_Italic,
  });

  const breathe  = useRef(new Animated.Value(0)).current; // fire glow
  const ringPulse = useRef(new Animated.Value(0)).current; // button halo

  const embers = useRef(
    Array.from({ length: 17 }, (_, i) => ({
      anim: new Animated.Value(0),
      x: [0.1, 0.28, 0.46, 0.62, 0.78, 0.2, 0.7, 0.15, 0.3, 0.9, 0.8, 0.07, 0.88, 0.56, 0.22, 0.83, 0.4][i] * width,
      y: [0.34, 0.3, 0.38, 0.26, 0.36, 0.44, 0.46, 0.52, 0.55, 0.5, 0.45, 0.1, 0.07, 0.05, 0.18, 0.2, 0.12][i] * height,
      size: [4, 3, 5, 3, 4, 3, 2, 3, 2, 2, 4, 5, 3, 2, 3, 3, 3][i],
      duration: [3400, 4200, 3000, 3900, 4600, 3300, 4000, 3500, 3500, 4000, 3700, 3800, 4300, 3100, 4500, 3600, 4100][i],
    }))
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(ringPulse, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    embers.forEach((e) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(e.anim, { toValue: 1, duration: e.duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(e.anim, { toValue: 0, duration: e.duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#1A0604' }} />;
  }

  const glowScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const glowOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] });
  const haloScale = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const haloOpacity = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.12] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0604" />

      {/* Deep oxblood base */}
      <LinearGradient
        colors={['#1A0604', '#120403', '#0A0201']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Fire glow, breathing */}
      <Animated.View
        pointerEvents="none"
        style={[styles.glowWrap, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
      >
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient
              id="fire"
              gradientUnits="userSpaceOnUse"
              cx={GLOW_X}
              cy={GLOW_Y}
              r={width * 1.0}
            >
              <Stop offset="0"    stopColor="#FFF4D2" stopOpacity="1" />
              <Stop offset="0.10" stopColor="#FFE3A3" stopOpacity="1" />
              <Stop offset="0.24" stopColor="#FFB95A" stopOpacity="0.98" />
              <Stop offset="0.40" stopColor="#FF8A26" stopOpacity="0.92" />
              <Stop offset="0.58" stopColor="#D9440F" stopOpacity="0.78" />
              <Stop offset="0.76" stopColor="#8F2208" stopOpacity="0.45" />
              <Stop offset="0.90" stopColor="#4A1004" stopOpacity="0.16" />
              <Stop offset="1"    stopColor="#1A0604" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={width} height={height} fill="url(#fire)" />
        </Svg>
      </Animated.View>

      {/* Dark pocket, bottom right */}
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <RadialGradient
            id="pocket"
            gradientUnits="userSpaceOnUse"
            cx={width * 1.0}
            cy={height * 0.95}
            r={width * 0.95}
          >
            <Stop offset="0"    stopColor="#050101" stopOpacity="0.98" />
            <Stop offset="0.55" stopColor="#050101" stopOpacity="0.85" />
            <Stop offset="0.85" stopColor="#050101" stopOpacity="0.25" />
            <Stop offset="1"    stopColor="#050101" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#pocket)" />
      </Svg>

      {/* Embers */}
      {embers.map((e, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: e.x,
            top: e.y,
            width: e.size,
            height: e.size,
            borderRadius: e.size / 2,
            backgroundColor: '#FFB35C',
            opacity: e.anim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.7] }),
            transform: [{ translateY: e.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }],
          }}
        />
      ))}

      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>SMART LEGAL HELP</Text>
        <Text style={styles.headerText}>SINDH</Text>
      </View>

      {/* Headline */}
      <View style={styles.headlineWrap}>
        <Text style={styles.headline} numberOfLines={1} adjustsFontSizeToFit>BARQ E</Text>
        <Text style={styles.headline1} numberOfLines={1} adjustsFontSizeToFit>INSAF</Text>
        <Text style={styles.tagline}>Smart decisions for legal matters</Text>

      </View>

      {/* Ring button */}
      <View style={styles.ringArea}>
        <View style={styles.ringBox}>
          <Animated.View
            pointerEvents="none"
            style={[styles.ringHalo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
          />
          <TouchableOpacity
            style={styles.ring}
            activeOpacity={0.8}
            onPress={() => router.push('/RoleSelectScreen')}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
              <Path
                d="M13 2 4 14h6l-1 8 9-12h-6z"
                stroke="#FFD9A0"
                strokeWidth={1.3}
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
        <Text style={styles.ringLabel}>GET STARTED</Text>

        <TouchableOpacity
          style={styles.exploreBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/LandingScreen')}
        >
          <Text style={styles.exploreText}>EXPLORE PROJECT</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.bottomHint}>Legal assistance for Sindh · English · Urdu · Sindhi</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0604',
  },
  gradient: {
    position: 'absolute',
    width,
    height,
  },
  glowWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width,
    height,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 14,
  },
  headerText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    letterSpacing: 1.8,
    color: '#4A1204',
  },

  // Headline
  headlineWrap: {
    paddingHorizontal: 28,
    paddingTop: height * 0.13,
  },
  headline: {
    fontFamily: 'BigShouldersDisplay_800ExtraBold',
    fontSize: width * 0.265,
    lineHeight: width * 0.3,
    color: '#ffeccf',
    includeFontPadding: false,
    textShadowColor: 'rgba(230, 65, 0, 0.72)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
    headline1: {
    fontFamily: 'BigShouldersDisplay_800ExtraBold',
    fontSize: width * 0.32,
    lineHeight: width * 0.3,
    color: '#ffeccf',
    includeFontPadding: false,
    textShadowColor: 'rgba(230, 65, 0, 0.72)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  tagline: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 19,
    lineHeight: 28,
    color: '#ffd2a6',
    marginTop: 18,
  },

  // Ring button
  ringArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  ringBox: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringHalo: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    backgroundColor: 'rgba(255,122,26,0.35)',
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 1.5,
    borderColor: '#ffc27d',
    backgroundColor: 'rgba(26,6,4,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff710c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 26,
    elevation: 14,
  },
  ringLabel: {
    marginTop: 16,
    marginBottom: 20,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    letterSpacing: 2.2,
    color: '#FFCF99',
    fontWeight: 'bold',
  },
  exploreBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,154,46,0.45)',
  },
  exploreText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    letterSpacing: 1.8,
    color: '#FFCF99',
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,154,46,0.33)',
    paddingVertical: 20,
    alignItems: 'center',
  },
  bottomHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#FFCF99',
    textAlign: 'center',
  },
});
