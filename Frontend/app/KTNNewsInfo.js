import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../components/AppHeader';
import { useAppTheme } from '../context/ThemeContext';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { getMediaProfile, subscribeToStore } from '../constants/ngoMediaStore';

const { width } = Dimensions.get('window');

export default function KTNNewsInfo() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useAppTheme();
  const [profile, setProfile] = useState(getMediaProfile());

  const targetHome = params.from === 'lawyer' ? '/(lawyer)/LawyerHome' : '/(citizen)/CitizenHome';

  // Hardware back returns directly to the user's home screen
  useAppNavigation({ isHome: false, homeRoute: targetHome });

  useEffect(() => {
    return subscribeToStore(() => {
      setProfile(getMediaProfile());
    });
  }, []);

  const handleBack = () => {
    router.replace(targetHome);
  };

  const handleEmailPress = async (email) => {
    const url = `mailto:${email}?subject=Broadcast%20Investigation%20Lead%20-%20Barq-e-Insaf`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Newsdesk Contact', `Please email directly to:\n\n${email}`);
      }
    } catch (_) {
      Alert.alert('Newsdesk Contact', `Please email directly to:\n\n${email}`);
    }
  };

  const handlePhonePress = (phone) => {
    const clean = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      Alert.alert('Whistleblower Helpline', `Helpline: ${phone}`);
    });
  };

  const bg = isDark ? '#060201' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)';
  const textPrimary = isDark ? '#FFFFFF' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 235, 215, 0.85)' : '#4A3B32';
  const textMuted = isDark ? 'rgba(255, 200, 150, 0.65)' : '#7A6B60';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor={isDark ? '#0A0402' : '#FAF7F2'}
      />

      <AppHeader
        title="KTN News Desk"
        showBack={true}
        onBack={handleBack}
        homeRoute={targetHome}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP HALF HERO BANNER IMAGE (full width bleed with certain height & bottom black fade) */}
        <View style={styles.topHeroContainer}>
          <Image
            source={require('../assets/images/mediainfo.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.98)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroOverlayContent}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{profile.categoryBadge}</Text>
            </View>
            <Text style={styles.heroTitle}>{profile.name}</Text>
            <Text style={styles.heroSubtitle}>{profile.nativeName}</Text>
          </View>
        </View>

        {/* STATS CHIPS ROW */}
        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={styles.statVal}>30</Text>
            <Text style={[styles.statLbl, { color: textMuted }]}>Districts Covered</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={styles.statVal}>24/7</Text>
            <Text style={[styles.statLbl, { color: textMuted }]}>Live Satellite</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={styles.statVal}>118+</Text>
            <Text style={[styles.statLbl, { color: textMuted }]}>Exposés Aired</Text>
          </View>
        </View>

        {/* INVESTIGATIVE JOURNALISM MISSION (OUT IN THE OPEN) */}
        <View style={styles.openMissionSection}>
          <Text style={[styles.openMissionHeading, { color: isDark ? '#FFA726' : '#EA580C' }]}>Investigative Journalism Mission</Text>
          <Text style={[styles.openMissionBody, { color: textSecondary }]}>
            {profile.description}
          </Text>
        </View>

        {/* DIRECT OUTREACH & WHISTLEBLOWER DESK */}
        <View style={[styles.reachOutCard, { backgroundColor: cardBg, borderColor: '#FF9500' }]}>
          <Text style={[styles.cardHeading, { color: textPrimary }]}>Direct Whistleblower Outreach</Text>
          <Text style={[styles.cardSubText, { color: textSecondary }]}>
            Submit your evidence dossier directly to the KTN Newsroom investigative bureau:
          </Text>

          {/* Email button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleEmailPress(profile.email)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnLabel}>CENTRAL NEWSDESK EMAIL</Text>
            <Text style={styles.actionBtnValue}>{profile.email}</Text>
          </TouchableOpacity>

          {/* Phone button */}
          <TouchableOpacity
            style={[styles.actionBtn, { marginTop: 10 }]}
            onPress={() => handlePhonePress(profile.phone)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnLabel}>CONFIDENTIAL WHISTLEBLOWER RELAY</Text>
            <Text style={styles.actionBtnValue}>{profile.phone} · {profile.helpline}</Text>
          </TouchableOpacity>

          {/* Address */}
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>CENTRAL BROADCAST HEADQUARTERS</Text>
            <Text style={[styles.addressText, { color: textSecondary }]}>{profile.officeAddress}</Text>
          </View>
        </View>

        {/* KEY INVESTIGATIVE BEATS */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, marginBottom: 30 }]}>
          <Text style={[styles.cardHeading, { color: textPrimary }]}>Verified Investigative Beats</Text>
          {profile.keyFocus.map((focus, idx) => (
            <View key={idx} style={styles.focusRow}>
              <View style={styles.bulletDot} />
              <Text style={[styles.focusText, { color: textSecondary }]}>{focus}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  topHeroContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  openMissionSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
  },
  openMissionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  openMissionBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  heroOverlayContent: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.28)',
    borderWidth: 1,
    borderColor: '#FFA726',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgePillText: {
    color: '#FFEED6',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    color: 'rgba(255, 220, 180, 0.85)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  statChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    color: '#FF9500',
    fontSize: 16,
    fontWeight: '800',
  },
  statLbl: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  reachOutCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  cardSubText: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardBodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  actionBtnLabel: {
    color: '#FFB74D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  actionBtnValue: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  addressBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 160, 40, 0.2)',
  },
  addressLabel: {
    color: '#FFB74D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  addressText: {
    fontSize: 12,
    lineHeight: 17,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 160, 40, 0.1)',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9500',
    marginRight: 10,
  },
  focusText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
