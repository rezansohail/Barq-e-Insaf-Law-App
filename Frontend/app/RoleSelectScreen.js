import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

const roles = [
  {
    id: 'citizen',
    label: 'CITIZEN',
    tag: 'INDIVIDUAL PORTAL',
    subtitle: 'Build legal cases, get 24/7 AI guidance & connect with verified lawyers',
    accentColor: '#FF9500',
    accentBorder: 'rgba(255, 149, 0, 0.40)',
    accentGlow: 'rgba(255, 149, 0, 0.32)',
    hasImage: true,
    image: require('../assets/images/citizen.png'),
    iconPath:
      'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  },
  {
    id: 'lawyer',
    label: 'LAWYER',
    tag: 'LEGAL COUNSEL',
    subtitle: 'Find cases and connect with clients',
    accentColor: '#FFB300',
    accentBorder: 'rgba(255, 179, 0, 0.38)',
    accentGlow: 'rgba(255, 179, 0, 0.28)',
    hasImage: true,
    image: require('../assets/images/lawyer.png'),
    iconPath:
      'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
  },
  {
    id: 'ngo',
    label: 'NGO - NCHD',
    tag: 'National Commission for Human Development (NCHD)',
    subtitle: 'National Commission for Human Development (NCHD)',
    accentColor: '#FF7A29',
    accentBorder: 'rgba(255, 122, 41, 0.38)',
    accentGlow: 'rgba(255, 122, 41, 0.30)',
    hasImage: true,
    image: require('../assets/images/ngo.png'),
    iconPath:
      'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
  },
  {
    id: 'media',
    label: 'MEDIA - KTN NEWS',
    tag: 'KTN News Broadcast & Journalism',
    subtitle: 'KTN News Broadcast & Journalism',
    accentColor: '#F59E0B',
    accentBorder: 'rgba(245, 158, 11, 0.40)',
    accentGlow: 'rgba(245, 158, 11, 0.30)',
    hasImage: true,
    image: require('../assets/images/media.png'),
    iconPath:
      'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7z',
  },
  {
    id: 'admin',
    label: 'ADMIN',
    tag: 'GOVERNANCE',
    accentColor: '#EF4444',
    accentBorder: 'rgba(239, 68, 68, 0.44)',
    accentGlow: 'rgba(239, 68, 68, 0.35)',
    hasImage: false,
    image: null,
    iconPath:
      'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Hardware back navigates normally back to StartScreen
  useEffect(() => {
    const onBackPress = () => {
      router.replace('/StartScreen');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  // Load Plus Jakarta Sans
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const fontBold = fontsLoaded ? 'PlusJakartaSans_700Bold' : undefined;
  const fontExtraBold = fontsLoaded ? 'PlusJakartaSans_800ExtraBold' : undefined;
  const fontMedium = fontsLoaded ? 'PlusJakartaSans_500Medium' : undefined;
  const fontSemiBold = fontsLoaded ? 'PlusJakartaSans_600SemiBold' : undefined;

  const handleSelect = (roleId) => {
    router.push({ pathname: '/LoginScreen', params: { role: roleId } });
  };

  return (
    <View style={styles.container}>
      {/* Translucent status bar */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Obsidian Luxury Background */}
      <LinearGradient
        colors={['#140803', '#0C0502', '#060201']}
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
            top: -height * 0.04,
            left: -width * 0.1,
            width: width * 0.85,
            height: width * 0.85,
            backgroundColor: 'rgba(255, 130, 20, 0.12)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            bottom: height * 0.05,
            right: -width * 0.15,
            width: width * 0.85,
            height: width * 0.85,
            backgroundColor: 'rgba(234, 88, 12, 0.09)',
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header - spacious and clean */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.circularBackBtn}
              onPress={() => router.replace('/StartScreen')}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Back to Start Screen"
            >
              <BlurView intensity={Platform.OS === 'ios' ? 40 : 60} tint="dark" style={styles.backBlur}>
                <Image
                  source={require('../assets/images/backarrow.png')}
                  style={styles.backArrowImg}
                  contentFit="contain"
                />
              </BlurView>
            </TouchableOpacity>

            <View style={styles.headerPill}>
              <Text style={[styles.headerPillText, fontSemiBold ? { fontFamily: fontSemiBold } : {}]}>
                PORTAL ACCESS
              </Text>
            </View>
          </View>
          <Text style={[styles.headerTitle, fontExtraBold ? { fontFamily: fontExtraBold } : {}]}>
            Choose your role
          </Text>
        </View>

        {/* Roles List */}
        <ScrollView
          contentContainerStyle={styles.rolesScroll}
          showsVerticalScrollIndicator={false}
        >
          {roles.map((role) => {
            // Citizen, Lawyer, NGO: Orange Liquid Glass Card
            if (role.hasImage) {
              return (
                <View key={role.id} style={styles.cardContainer}>
                  {/* Subtle Under-Card Glow */}
                  <LinearGradient
                    colors={[role.accentGlow || 'rgba(255, 140, 20, 0.28)', 'transparent']}
                    style={styles.cardUnderGlow}
                    pointerEvents="none"
                  />
                  <TouchableOpacity
                    onPress={() => handleSelect(role.id)}
                    activeOpacity={0.84}
                    style={[
                      styles.liquidCardTouch,
                      {
                        borderColor: role.accentBorder,
                      },
                    ]}
                  >
                    <BlurView
                      intensity={Platform.OS === 'ios' ? 45 : 65}
                      tint="dark"
                      style={styles.cardBlur}
                    >
                      <LinearGradient
                        colors={[
                          'rgba(255, 150, 40, 0.15)',
                          'rgba(255, 100, 15, 0.07)',
                          'rgba(20, 10, 4, 0.58)',
                        ]}
                        style={styles.cardContent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {/* Top Specular Liquid Glass Sheen */}
                        <View style={styles.liquidSheen} pointerEvents="none" />

                        {/* Left: Image (Cleanly inside card, no box/glow container) */}
                        <View style={styles.imageSlot}>
                          {role.image ? (
                            <Image
                              source={role.image}
                              style={styles.roleImage}
                              contentFit="contain"
                              transition={200}
                            />
                          ) : (
                            <View style={styles.placeholderContainer}>
                              <View style={styles.placeholderIconCircle}>
                                <Svg
                                  width={22}
                                  height={22}
                                  viewBox="0 0 24 24"
                                  fill="#FFA726"
                                >
                                  <Path d={role.iconPath} />
                                </Svg>
                              </View>
                              <Text
                                style={[
                                  styles.placeholderText,
                                  fontSemiBold ? { fontFamily: fontSemiBold } : {},
                                ]}
                              >
                                + Add Image
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Right: Clean White/Light Typography */}
                        <View style={styles.roleInfo}>
                          <Text
                            style={[
                              styles.roleTitle,
                              fontBold ? { fontFamily: fontBold } : {},
                            ]}
                          >
                            {role.label}
                          </Text>
                          <Text
                            style={[
                              styles.roleDesc,
                              fontMedium ? { fontFamily: fontMedium } : {},
                            ]}
                          >
                            {role.subtitle}
                          </Text>
                        </View>

                        {/* Liquid Glass Arrow Pill */}
                        <View style={styles.arrowPill}>
                          <Image
                            source={require('../assets/images/arrow.png')}
                            style={styles.forwardArrowImg}
                            contentFit="contain"
                          />
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              );
            }

            // System Admin: Minimal Red Liquid Glass Card (Distinct from the rest)
            return (
              <View key={role.id} style={styles.cardContainer}>
                {/* Subtle Red Under-Card Glow */}
                <LinearGradient
                  colors={[role.accentGlow || 'rgba(239, 68, 68, 0.32)', 'transparent']}
                  style={styles.cardUnderGlow}
                  pointerEvents="none"
                />
                <TouchableOpacity
                  onPress={() => handleSelect(role.id)}
                  activeOpacity={0.84}
                  style={[
                    styles.adminCardTouch,
                    {
                      borderColor: role.accentBorder,
                    },
                  ]}
                >
                  <BlurView
                    intensity={Platform.OS === 'ios' ? 45 : 65}
                    tint="dark"
                    style={styles.cardBlur}
                  >
                    <LinearGradient
                      colors={[
                        'rgba(239, 68, 68, 0.18)',
                        'rgba(185, 28, 28, 0.08)',
                        'rgba(26, 6, 8, 0.70)',
                      ]}
                      style={styles.adminCardContent}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.liquidSheen} pointerEvents="none" />

                      {/* Left Red Icon Orb */}
                      <View style={styles.adminIconOrb}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="#F87171">
                          <Path d={role.iconPath} />
                        </Svg>
                      </View>

                      {/* Text in Crisp White */}
                      <View style={styles.adminTextGroup}>
                        <Text
                          style={[
                            styles.adminTitle,
                            fontBold ? { fontFamily: fontBold } : {},
                          ]}
                        >
                          {role.label}
                        </Text>
                      </View>

                      {/* Red Arrow Pill */}
                      <View style={styles.adminArrowPill}>
                        <Image
                          source={require('../assets/images/arrow.png')}
                          style={styles.forwardArrowImg}
                          contentFit="contain"
                        />
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              fontMedium ? { fontFamily: fontMedium } : {},
            ]}
          >
            Legal assistance for Sindh · English · Urdu · Sindhi
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0502',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ambientHalo: {
    position: 'absolute',
    borderRadius: 999,
  },

  // ── HEADER ──
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  circularBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.35)',
    backgroundColor: 'rgba(25, 10, 3, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBlur: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowImg: {
    width: 18,
    height: 13,
  },
  headerPill: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  headerPillText: {
    color: '#FFB85A',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 20,
    marginTop: 6,
  },

  // ── ROLES SCROLL (spacious & uncongested) ──
  rolesScroll: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 18,
    gap: 16,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },

  // ── SUBTLE CARD UNDER-GLOW CONTAINER ──
  cardContainer: {
    position: 'relative',
  },
  cardUnderGlow: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    bottom: -6,
    height: 20,
    borderRadius: 14,
    opacity: 0.85,
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(16px)',
        }
      : {}),
  },

  // ── ORANGE LIQUID GLASS CARD ──
  liquidCardTouch: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.2,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 6,
    backgroundColor: 'rgba(22, 10, 4, 0.38)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 10px 28px rgba(255, 140, 20, 0.22), 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.28)',
        }
      : {}),
  },
  cardBlur: {
    flex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 30,
    position: 'relative',
  },
  liquidSheen: {
    position: 'absolute',
    top: 1,
    left: '8%',
    right: '8%',
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 1,
  },

  // Image (Direct inside card, no box/glow container)
  imageSlot: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleImage: {
    width: '110%',
    height: '110%',
  },

  // Text: White & Lighter Colors
  roleInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 4,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  roleDesc: {
    fontSize: 12,
    color: 'rgba(255, 240, 225, 0.78)',
    lineHeight: 17,
    letterSpacing: 0.1,
  },

  // Liquid Glass Arrow Pill
  arrowPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 150, 40, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 80, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forwardArrowImg: {
    width: 16,
    height: 11,
  },
  arrowText: {
    fontSize: 15,
    color: '#FFE4C4',
    fontWeight: '700',
    lineHeight: 17,
  },

  // ── ADMIN CARD (DISTINCT RED LIQUID GLASS) ──
  adminCardTouch: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.36,
    shadowRadius: 16,
    elevation: 6,
    backgroundColor: 'rgba(32, 8, 10, 0.42)',
    marginTop: 20,
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 8px 28px rgba(239, 68, 68, 0.26), 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.28)',
        }
      : {}),
  },
  adminCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 12,
    position: 'relative',
  },
  adminIconOrb: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminTextGroup: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  adminArrowPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.40)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminArrowText: {
    fontSize: 15,
    color: '#FECACA',
    fontWeight: '700',
    lineHeight: 17,
  },

  // ── FOOTER ──
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 149, 0, 0.12)',
    paddingTop: 10,
    paddingBottom: 4,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  footerText: {
    fontSize: 10.5,
    color: 'rgba(255, 220, 185, 0.55)',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
