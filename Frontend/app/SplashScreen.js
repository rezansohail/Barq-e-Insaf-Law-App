import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance fade and spring scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth continuous floating / hovering loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(hoverAnim, {
          toValue: -12,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(hoverAnim, {
          toValue: 12,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Transition to StartScreen after 3000ms
    const timer = setTimeout(() => {
      router.replace('/StartScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Translucent Edge-to-Edge StatusBar so gradient covers entire top */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen Background Image spanning absolute edge-to-edge */}
      <Image
        source={require('../assets/images/login-bg.jpeg')}
        style={[styles.bgImage, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
        resizeMode="cover"
      />

      {/* Warm Vibrant Amber & Orange Gradient spanning full screen */}
      <LinearGradient
        colors={[
          'rgba(255, 120, 20, 0.28)',
          'rgba(180, 70, 10, 0.22)',
          'rgba(32, 13, 5, 0.72)',
          'rgba(15, 6, 2, 0.94)',
          '#0A0402',
        ]}
        locations={[0, 0.22, 0.55, 0.82, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Center Ambient Orange Glow Halo */}
      <View style={styles.centerGlowHalo} pointerEvents="none" />

      {/* Center Hovering Animated Logo Only */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: hoverAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0402',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerGlowHalo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 140, 20, 0.20)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 40,
    elevation: 12,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: {
    width: 260,
    height: 260,
  },
});
