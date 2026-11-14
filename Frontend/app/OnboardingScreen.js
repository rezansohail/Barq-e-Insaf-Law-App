import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  FlatList,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

const slides = [
  {
    id: '1',
    badge: 'LEGAL EMPOWERMENT',
    title: 'Your Justice.\nYour Control.',
    subtitle:
      'Bridging the legal access gap across Pakistan with instant AI assistance and certified advocate connection.',
    image: require('../assets/images/onb1.jpg'),
  },
  {
    id: '2',
    badge: 'MULTILINGUAL AI CHATBOT',
    title: 'Instant Legal Guidance\nin English, Urdu & Sindhi.',
    subtitle:
      'Ask legal questions regarding Pakistan Penal Code, Family Laws, and Property rights 24/7.',
    image: require('../assets/images/onb2.png'),
  },
  {
    id: '3',
    badge: 'SBC VERIFIED ADVOCATES',
    title: 'Verified Lawyers &\nBiometric Security.',
    subtitle:
      'Connect directly with Sindh Bar Council advocates and sign representation agreements digitally.',
    image: require('../assets/images/onb3.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const getItemLayout = (_, index) => ({
    length: width,
    offset: width * index,
    index,
  });

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      try {
        slidesRef.current?.scrollToOffset({
          offset: nextIndex * width,
          animated: true,
        });
      } catch (e) {
        console.warn(e);
      }
    } else {
      router.push('/RoleSelectScreen');
    }
  };

  return (
    <View style={styles.container}>
      {/* Translucent status bar */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Deep Obsidian Background */}
      <LinearGradient
        colors={['#0A0402', '#060201', '#020101']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient warm glow halos */}
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            top: -height * 0.05,
            left: -width * 0.1,
            width: width * 0.7,
            height: width * 0.7,
            backgroundColor: 'rgba(255, 120, 20, 0.07)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            bottom: height * 0.1,
            right: -width * 0.15,
            width: width * 0.75,
            height: width * 0.75,
            backgroundColor: 'rgba(234, 88, 12, 0.06)',
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topRow}>
          {currentIndex > 0 ? (
            <TouchableOpacity
              onPress={() => {
                slidesRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ padding: 6 }}
            >
              <Image
                source={require('../assets/images/backarrow.png')}
                style={{ width: 22, height: 15 }}
                contentFit="contain"
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 34 }} />
          )}

          <Text style={styles.brandTitle}>BARQ-E-INSAF</Text>

          {currentIndex < slides.length - 1 ? (
            <TouchableOpacity
              onPress={() => router.push('/RoleSelectScreen')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.skipText}>SKIP</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 34 }} />
          )}
        </View>

        {/* Carousel Slides */}
        <FlatList
          data={slides}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={(info) => {
            slidesRef.current?.scrollToOffset({
              offset: info.index * width,
              animated: true,
            });
          }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              {/* Frosted Glass Illustration Card with Image */}
              <View
                style={[
                  styles.cardWrapper,
                  {
                    width: Math.min(width - 32, 450),
                    height: Math.round(Math.min(width - 32, 450) / 1.95),
                  },
                ]}
              >
                <Image
                  source={item.image}
                  style={styles.cardImage}
                  contentFit="cover"
                  contentPosition="center"
                  transition={250}
                />
                {/* Top specular sheen */}
                <View style={styles.cardSheen} pointerEvents="none" />
              </View>

              {/* Text Information */}
              <View style={[styles.textWrapper, { maxWidth: 380 }]}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.subtitleText}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Pagination Indicator */}
          <View style={styles.paginationRow}>
            {slides.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [6, 22, 6],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor: i === currentIndex ? '#FF9800' : 'rgba(255, 170, 60, 0.3)',
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Liquid Glass Pill Action Button (Outer Touchable for 100% click reliability) */}
          <View style={styles.actionPillWrapper}>
            <TouchableOpacity
              style={styles.actionTouch}
              activeOpacity={0.8}
              onPress={handleNext}
              accessibilityRole="button"
            >
              <View style={styles.actionCoronaGlow} pointerEvents="none" />
              <BlurView
                intensity={Platform.OS === 'ios' ? 40 : 65}
                tint="dark"
                style={styles.actionBlur}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.24)',
                    'rgba(255, 170, 50, 0.12)',
                    'rgba(20, 10, 4, 0.52)',
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.actionGradient}
                >
                  <View style={styles.actionSheen} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={styles.actionBtnText}>
                      {currentIndex === slides.length - 1 ? 'GET STARTED' : 'CONTINUE'}
                    </Text>
                    <Image
                      source={require('../assets/images/arrow.png')}
                      style={{ width: 18, height: 13 }}
                      contentFit="contain"
                    />
                  </View>
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
    backgroundColor: '#060201',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  ambientHalo: {
    position: 'absolute',
    borderRadius: 999,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 4,
    zIndex: 10,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF2DF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  boltSymbol: {
    color: '#FF9800',
  },
  skipText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 180, 70, 0.75)',
    letterSpacing: 1.8,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 210, 140, 0.24)',
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: '#0E0603',
    position: 'relative',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow:
            '0 0 20px rgba(255, 120, 20, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        }
      : {}),
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardSheen: {
    position: 'absolute',
    top: 1,
    left: '12%',
    right: '12%',
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
    zIndex: 2,
  },
  textWrapper: {
    width: '100%',
    paddingHorizontal: 6,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.32)',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: '#FFB74D',
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFF5E8',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13,
    color: 'rgba(255, 225, 200, 0.68)',
    marginTop: 8,
    lineHeight: 20,
    fontWeight: '400',
  },
  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 20,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    height: 6,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  actionPillWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  actionTouch: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 10,
  },
  actionCoronaGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 120, 20, 0.15)',
    ...(Platform.OS === 'web' ? { filter: 'blur(16px)' } : {}),
  },
  actionBlur: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 220, 160, 0.52)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow:
            '0 0 20px rgba(255, 122, 0, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.45), inset 0 -1px 2px rgba(0, 0, 0, 0.5)',
        }
      : {}),
  },
  actionGradient: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(20, 10, 4, 0.42)',
  },
  actionSheen: {
    position: 'absolute',
    top: 1,
    left: '15%',
    right: '15%',
    height: 1.2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  actionBtnText: {
    color: '#FFEED6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
});
