import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Image,
  Platform,
  useWindowDimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useFonts, RacingSansOne_400Regular } from '@expo-google-fonts/racing-sans-one';
import { useAppTranslation } from '../utils/translationHelper';
import { openAIChat } from '../constants/chatBotStore';

export default function LandingScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const { width, height } = useWindowDimensions();
  const { t, appName, currentLang } = useAppTranslation();

  const [fontsLoaded] = useFonts({ RacingSansOne_400Regular });

  const toggleExpandCard = (id) => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  const handleAskAI = () => {
    openAIChat(searchQuery);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Obsidian & Amber Background ── */}
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
            left: -width * 0.12,
            width: width * 0.75,
            height: width * 0.75,
            backgroundColor: 'rgba(255, 120, 20, 0.08)',
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
            width: width * 0.8,
            height: width * 0.8,
            backgroundColor: 'rgba(234, 88, 12, 0.06)',
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* ── 1. HEADER NAV BAR ── */}
        <View style={styles.headerNav}>
          <View style={styles.leftNavGroup}>
            <TouchableOpacity
              style={styles.headerBackBtn}
              onPress={() => router.replace('/StartScreen')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Back to Start Screen"
            >
              <Image
                source={require('../assets/images/backarrow.png')}
                style={{ width: 22, height: 15 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.navTitle}>
              {currentLang === 'ur' ? 'ایپ کا جائزہ' : currentLang === 'sd' ? 'ايپ جو جائزو' : 'Explore App'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/RoleSelectScreen')}
          >
            <Text style={styles.signInText}>{t('landing.signIn', 'Sign In')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── 2. HERO SECTION ── */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['rgba(255, 140, 20, 0.12)', 'rgba(20, 10, 4, 0.6)', 'rgba(10, 4, 2, 0.9)']}
              style={styles.heroGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
              <View style={styles.logo}>
                <Image
                  source={require('../assets/images/logo1.png')}
                  style={[styles.logoImage, { width: 120, height: 120 }]}
                  resizeMode="contain"
                />
              </View>

              <Text
                style={[
                  styles.heroTitle,
                  (fontsLoaded && currentLang === 'en') ? { fontFamily: 'RacingSansOne_400Regular' } : { fontFamily: 'System' },
                ]}
              >
                {appName}
              </Text>

              <Text style={styles.heroSubtitle}>
                {t('landing.heroSubtitle', "Pakistan's Premier AI Legal Assistant & Verified Advocate Network")}
              </Text>

              <Text style={styles.heroDesc}>
                {t('landing.heroDesc', 'Instant AI legal guidance in Urdu & Sindhi for Pakistan Penal Code, Property, and Family laws, paired with Sindh Bar Council verified advocates.')}
              </Text>

              {/* ── 3. "Ask AI" SEARCH INPUT BAR ── */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('landing.searchPlaceholder', 'Ask legal question (PPC Section 302, Divorce, Property)...')}
                  placeholderTextColor="rgba(255, 220, 185, 0.45)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleAskAI}
                  returnKeyType="search"
                />
                <TouchableOpacity style={styles.askAiBtn} activeOpacity={0.88} onPress={handleAskAI}>
                  <LinearGradient
                    colors={['#EA580C', '#FF8C14', '#FF9800']}
                    style={styles.askAiGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.askAiText}>{t('landing.askAi', 'Ask AI')}</Text>
                      <Image
                        source={require('../assets/images/arrow.png')}
                        style={{ width: 14, height: 10 }}
                        resizeMode="contain"
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* ── 4. VISUAL SHOWCASE CAROUSEL ── */}
          <View style={styles.showcaseSection}>
            <Text style={styles.sectionHeader}>{t('landing.exploreTitle', 'Explore Legal Access Across Pakistan')}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
              {/* Image 1 */}
              <View style={styles.imageCard}>
                <Image
                  source={require('../assets/images/bg2.jpg')}
                  style={styles.cardPhoto}
                  resizeMode="cover"
                />
                <LinearGradient colors={['transparent', 'rgba(10, 4, 2, 0.95)']} style={styles.imageGradient}>
                  <Text style={styles.cardTag}>{t('landing.card1Tag', '24/7 AI LEGAL RESEARCH')}</Text>
                  <Text style={styles.cardTitle}>{t('landing.card1Title', 'Pakistan Penal Code & Precedents')}</Text>
                </LinearGradient>
              </View>

              {/* Image 2 */}
              <View style={styles.imageCard}>
                <Image
                  source={require('../assets/images/pak falg.jpg')}
                  style={styles.cardPhoto}
                  resizeMode="cover"
                />
                <LinearGradient colors={['transparent', 'rgba(10, 4, 2, 0.95)']} style={styles.imageGradient}>
                  <Text style={styles.cardTag}>{t('landing.card2Tag', 'SBC VERIFIED ADVOCATES')}</Text>
                  <Text style={styles.cardTitle}>{t('landing.card2Title', 'Verified Bar Council Advocate Network')}</Text>
                </LinearGradient>
              </View>

              {/* Image 3 */}
              <View style={styles.imageCard}>
                <Image
                  source={require('../assets/images/scbg.png')}
                  style={styles.cardPhoto}
                  resizeMode="cover"
                />
                <LinearGradient colors={['transparent', 'rgba(10, 4, 2, 0.95)']} style={styles.imageGradient}>
                  <Text style={styles.cardTag}>{t('landing.card3Tag', 'DIGITAL SIGNATURES')}</Text>
                  <Text style={styles.cardTitle}>{t('landing.card3Title', 'Digital Representation Agreements')}</Text>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>

          {/* ── 5. CORE PLATFORM CAPABILITIES (EXPANDABLE CARDS) ── */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionHeader}>{t('landing.whyTitle', 'Why Barq-e-Insaf?')}</Text>

            {[
              {
                id: 'feature-1',
                title: t('landing.feature1Title', 'Multilingual AI Legal Research'),
                desc: t('landing.feature1Desc', 'Get instant responses in Urdu, Sindhi, and English for PPC, property disputes, and labor rights.'),
                icon: require('../assets/images/img1.png'),
                bgColor: 'rgba(255, 152, 0, 0.15)',
              },
              {
                id: 'feature-2',
                title: t('landing.feature2Title', 'SBC Verified Advocate Directory'),
                desc: t('landing.feature2Desc', 'Connect with certified Sindh Bar Council lawyers with transparent case assistance and misconduct reporting.'),
                icon: require('../assets/images/img2.png'),
                bgColor: 'rgba(245, 158, 11, 0.15)',
              },
              {
                id: 'feature-3',
                title: t('landing.feature3Title', 'Digital signatures signing'),
                desc: t('landing.feature3Desc', 'Sign Vakalatnama representation agreements securely with encrypted digital touch signatures.'),
                icon: require('../assets/images/img3.png'),
                bgColor: 'rgba(234, 88, 12, 0.15)',
              },
            ].map((card) => {
              const isExpanded = expandedCard === card.id;
              return (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.featureBox,
                    isExpanded && styles.featureBoxExpanded,
                  ]}
                  onPress={() => toggleExpandCard(card.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.featureHeaderRow}>
                    <View style={[styles.featureIconCircle, { backgroundColor: card.bgColor }]}>
                      <Image
                        source={card.icon}
                        style={styles.featureIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.featureTextGroup}>
                      <Text style={styles.featureTitle}>{card.title}</Text>
                    </View>
                    <View style={styles.chevronWrap}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d={isExpanded ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
                          stroke="#FFA726"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.featureExpandedBody}>
                      <Text style={styles.featureDesc}>{card.desc}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── 6. GET STARTED CTA CARD ── */}
          <View style={styles.ctaCard}>
            <LinearGradient
              colors={['rgba(255, 132, 0, 0.29)', 'rgba(20, 10, 4, 0.7)', 'rgba(10, 4, 2, 0.9)']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaTitle}>{t('landing.ctaTitle', 'Ready to Get Started?')}</Text>
              <Text style={styles.ctaSubtitle}>{t('landing.ctaSubtitle', 'Select your portal to log in as a Citizen, Verified Lawyer, or NGO Administrator.')}</Text>

              <TouchableOpacity
                style={styles.ctaBtn}
                activeOpacity={0.88}
                onPress={() => router.push('/RoleSelectScreen')}
              >
                <LinearGradient
                  colors={['#EA580C', '#FF8C14', '#FF9800']}
                  style={styles.ctaBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.ctaBtnText}>{t('landing.ctaBtn', 'GET STARTED')}</Text>
                    <Image
                      source={require('../assets/images/arrow.png')}
                      style={{ width: 18, height: 13 }}
                      resizeMode="contain"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0402',
  },
  safeArea: {
    flex: 1,
  },
  ambientHalo: {
    position: 'absolute',
    borderRadius: 999,
  },

  // ── HEADER ──
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 150, 0.1)',
  },
  leftNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBackBtn: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  navTitle: {
    color: '#FFF2DF',
    fontSize: 18,
    fontWeight: '900',
  },
  signInBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 80, 0.3)',
  },
  signInText: {
    color: '#FFD9A0',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── SCROLL ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // ── HERO ──
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 210, 140, 0.15)',
    elevation: 6,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  heroGradient: {
    padding: 22,
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF2DF',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: '#FF9800',
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: 11,
    color: 'rgba(255, 240, 224, 0.65)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
    fontWeight: '500',
  },

  // ── SEARCH ──
  searchContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(63, 40, 25, 0.7)',
    borderRadius: 14,
    padding: 5,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 80, 0.2)',
    elevation: 4,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.13,
    shadowRadius: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#ffffff',
  },
  askAiBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  askAiGradient: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  askAiText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },

  // ── SHOWCASE ──
  showcaseSection: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF2DF',
    marginBottom: 12,
  },
  carouselContainer: {
    gap: 10,
  },
  imageCard: {
    width: Dimensions.get('window').width * 0.7,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0A0402',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 80, 0.12)',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  cardTag: {
    color: '#fbbf24',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  cardTitle: {
    color: '#FFF2DF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },

  // ── FEATURES ──
  featuresSection: {
    marginBottom: 18,
  },
  featureBox: {
    backgroundColor: 'rgba(75, 49, 34, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 13,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 180, 80, 0.14)',
    shadowColor: '#ff7b00a6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 0.5,
  },
  featureBoxExpanded: {
    backgroundColor: 'rgba(88, 48, 25, 0.72)',
    borderColor: 'rgba(255, 149, 0, 0.38)',
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 7,
  },
  featureTextGroup: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#f5e1c4',
    letterSpacing: -0.1,
  },
  chevronWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureExpandedBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 180, 80, 0.15)',
    paddingLeft: 4,
  },
  featureDesc: {
    fontSize: 11.5,
    color: 'rgba(245, 235, 225, 0.85)',
    lineHeight: 17,
  },

  // ── CTA ──
  ctaCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 180, 80, 0.15)',
  },
  ctaGradient: {
    padding: 22,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#FFF2DF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  ctaSubtitle: {
    color: 'rgba(255, 215, 178, 0.71)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  ctaBtn: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaBtnGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
