import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import styles from './CitizenHome.styles';
import {
  useMockStore,
  userData,
  lawyers,
  activeCases,
  fetchCitizenDashboard,
  fetchLawyersList,
  fetchNgosList,
} from './MockStore';
import { getCurrentCitizenId } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';

export default function CitizenHome() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode, theme } = useAppTheme();
  const { t, currentLang, translateDistrict, translateCategory, translateLawyerName, translateDynamic } = useAppTranslation();
  const currentCitizenId = params.citizenId || params.id || getCurrentCitizenId();

  // Root screen: back button confirms exit, does not back to login screen
  useAppNavigation({ isHome: true, homeRoute: '/(citizen)/CitizenHome' });

  useEffect(() => {
    fetchLawyersList();
    fetchNgosList();
    if (currentCitizenId) {
      fetchCitizenDashboard(currentCitizenId);
    }
  }, [currentCitizenId]);

  const handleBuildCase = () => {
    router.push('/(citizen)/CaseForm');
  };

  const handleLawyerPress = (lawyer) => {
    router.push({
      pathname: '/(citizen)/RequestConsultation',
      params: { lawyerId: lawyer.id }
    });
  };

  const handleCasePress = (caseItem) => {
    router.push({
      pathname: '/(citizen)/CaseDetail',
      params: { caseId: caseItem.id }
    });
  };

  const localLawyers = lawyers.filter(
    (l) => userData.district && l.district && l.district.toLowerCase() === userData.district.toLowerCase()
  );
  const otherLawyers = lawyers.filter(
    (l) => !userData.district || !l.district || l.district.toLowerCase() !== userData.district.toLowerCase()
  );
  const displayLawyers = localLawyers.length > 0 ? [...localLawyers, ...otherLawyers] : lawyers;

  const districtDisplay = userData.district ? translateDistrict(userData.district) : (currentLang === 'ur' ? 'سندھ' : currentLang === 'sd' ? 'سنڌ' : 'Sindh Province');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDarkMode ? '#080402' : '#FAF8F5' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={isDarkMode ? '#080402' : '#FAF8F5'} />

      {/* Modern AppHeader with user greeting & menu */}
      <AppHeader
        showBack={false}
        role="citizen"
        userName={userData.name || (currentLang === 'ur' ? 'شہری' : currentLang === 'sd' ? 'شهري' : 'Citizen')}
        avatarText={userData.dp || 'C'}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* DISTRICT & PORTAL STATUS BANNER */}
        <View style={[styles.welcomeBanner, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingSub}>{t('citizen.portalTitle', 'CITIZEN PORTAL')}</Text>
            <Text style={[styles.districtBadgeText, !isDarkMode && { color: theme.textSecondary }]}>
              {currentLang === 'ur'
                ? `ضلع: ${districtDisplay} · فعال قانونی وکالت اور ثبوت والٹ`
                : currentLang === 'sd'
                ? `ضلعو: ${districtDisplay} · فعال قانوني وڪالت ۽ ثبوت والٽ`
                : `District: ${userData.district || 'Sindh Province'} · Active Legal Representation & Dossier Vault`}
            </Text>
          </View>
        </View>

        {/* BUILD A CASE PRIMARY CTA - LIQUID GLASS BUTTON */}
        <TouchableOpacity
          style={styles.buildCaseBtn}
          activeOpacity={0.85}
          onPress={handleBuildCase}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? [
                    'rgba(255, 149, 0, 0.38)',
                    'rgba(255, 122, 0, 0.22)',
                    'rgba(24, 25, 36, 0.90)',
                  ]
                : [
                    '#FF9500',
                    '#F97316',
                    '#EA580C',
                  ]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buildCaseGradient}
          >
            {/* Top Liquid Glass Highlight Sheen */}
            <View style={styles.glassSheen} pointerEvents="none" />

            <View style={styles.buildCaseContent}>
              <View style={[styles.buildCaseIconBox, !isDarkMode && { backgroundColor: 'rgba(255, 255, 255, 0.25)', borderColor: 'rgba(255, 255, 255, 0.5)' }]}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    fill={isDarkMode ? '#FFD180' : '#FFFFFF'}
                    stroke={isDarkMode ? '#FF9500' : '#FFFFFF'}
                    strokeWidth={1.2}
                  />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.buildCaseBtnText}>{t('citizen.buildCase', 'BUILD YOUR CASE')}</Text>
                <Text style={[styles.buildCaseBtnSub, !isDarkMode && { color: 'rgba(255, 255, 255, 0.95)' }]}>
                  {t('citizen.buildCaseSub', 'Start legal intake with facts, sections & evidence')}
                </Text>
              </View>
              <View style={[styles.glassArrowPill, !isDarkMode && { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <Image
                  source={require('../../assets/images/arrow.png')}
                  style={[styles.buildCaseArrowImg, !isDarkMode && { tintColor: '#FFFFFF' }]}
                  resizeMode="contain"
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* VERIFIED LAWYERS NEAR YOU */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>
            {currentLang === 'ur'
              ? `${districtDisplay} میں مصدقہ وکلاء`
              : currentLang === 'sd'
              ? `${districtDisplay} ۾ تصديق ٿيل وڪيل`
              : `Verified Advocates in ${userData.district || 'Karachi'}`}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(citizen)/FindLawyer')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.seeAllText}>{t('common.viewAll', 'View All')}</Text>
              <Image
                source={require('../../assets/images/arrow.png')}
                style={styles.inlineArrowImg}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.lawyerRow}
        >
          {displayLawyers.length > 0 ? (
            displayLawyers.map((l, i) => (
              <TouchableOpacity
                key={l.id || i}
                style={[styles.lawyerCard, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
                activeOpacity={0.84}
                onPress={() => handleLawyerPress(l)}
              >
                <View style={styles.lawyerCardTop}>
                  <View style={[styles.lawyerAvatar, { backgroundColor: 'rgba(255, 149, 0, 0.18)' }]}>
                    <Text style={styles.lawyerAvatarText}>{l.initials || 'ADV'}</Text>
                  </View>
                  <View style={styles.sbcPill}>
                    <Text style={styles.sbcPillText}>{l.sbc ? `SBC ${l.sbc}` : t('citizen.sbcVerified', 'SBC VERIFIED')}</Text>
                  </View>
                </View>

                <Text style={[styles.lawyerName, !isDarkMode && { color: theme.textPrimary }]} numberOfLines={1}>{translateLawyerName(l.name)}</Text>
                <Text style={[styles.lawyerSpec, !isDarkMode && { color: theme.textMuted }]} numberOfLines={1}>{translateCategory(l.spec) || t('citizen.legalCounsel', 'Legal Counsel')}</Text>

                <View style={styles.lawyerCardFooter}>
                  <Text style={styles.consultAction}>{t('citizen.requestConsultation', 'Request Legal Consultation →')}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyCard, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.emptyText, !isDarkMode && { color: theme.textMuted }]}>{t('common.loading', 'Loading verified advocates...')}</Text>
            </View>
          )}
        </ScrollView>

        {/* ACTIVE CASES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t('citizen.myActiveCases', 'My Active Cases')}</Text>
          {activeCases.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(citizen)/MyCases')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.seeAllText}>{t('common.allCases', 'All Cases')}</Text>
                <Image
                  source={require('../../assets/images/arrow.png')}
                  style={styles.inlineArrowImg}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {activeCases.length === 0 ? (
          <TouchableOpacity style={[styles.noCaseCard, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]} onPress={handleBuildCase} activeOpacity={0.8}>
            <View style={{ marginBottom: 8 }}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Rect x={4} y={3} width={16} height={18} rx={2} stroke="#FFB74D" strokeWidth={1.8} />
                <Path d="M8 8h8M8 12h8M8 16h5" stroke="#FFB74D" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={[styles.noCaseTitle, !isDarkMode && { color: theme.textPrimary }]}>{t('citizen.noActiveCases', 'No Active Cases Yet')}</Text>
            <Text style={[styles.noCaseSub, !isDarkMode && { color: theme.textMuted }]}>
              {t('citizen.noCaseSub', "Tap here or 'Build Your Case' above to start your first legal dossier.")}
            </Text>
          </TouchableOpacity>
        ) : (
          activeCases.slice(0, 3).map((c, i) => (
            <TouchableOpacity
              key={c.id || i}
              style={[styles.caseItem, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
              activeOpacity={0.84}
              onPress={() => handleCasePress(c)}
            >
              <View style={[styles.caseDot, { backgroundColor: c.status === 'Active' ? '#4ade80' : '#f59e0b' }]} />
              <View style={styles.caseInfo}>
                <Text style={[styles.caseTitle, !isDarkMode && { color: theme.textPrimary }]} numberOfLines={1}>{translateDynamic(c.title)}</Text>
                <Text style={[styles.caseSub, !isDarkMode && { color: theme.textMuted }]}>{translateCategory(c.type || 'Legal Matter')} · {translateDistrict(c.district || userData.district || 'Sindh')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: c.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={[styles.badgeText, { color: c.status === 'Active' ? '#4ade80' : '#f59e0b' }]}>
                  {t('common.' + (c.status || 'Active').toLowerCase(), c.status || 'Active')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* INSTITUTIONAL PARTNERS: NGO & MEDIA */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
          {t('citizen.institutionalSupport', 'Institutional Legal Aid & Media Support')}
        </Text>
        <View style={styles.partnerCardsContainer}>
          {/* NCHD Card */}
          <TouchableOpacity
            style={[styles.partnerCard, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
            activeOpacity={0.84}
            onPress={() => router.push({ pathname: '/NCHDInfo', params: { from: 'citizen' } })}
          >
            <View style={styles.partnerTop}>
              <View style={styles.partnerAvatar}>
                <Image
                  source={require('../../assets/images/ngo.png')}
                  style={{ width: 34, height: 34 }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.partnerPill}>
                  <Text style={styles.partnerPillText}>{t('citizen.govtNgoAid', 'GOVT / NGO LEGAL AID')}</Text>
                </View>
                <Text style={[styles.partnerTitle, !isDarkMode && { color: theme.textPrimary }]}>
                  {t('National Commission for Human Development (NCHD)')}
                </Text>
                <Text style={[styles.partnerSub, !isDarkMode && { color: theme.textMuted }]}>
                  {t('Grassroots legal aid, adult literacy & community relief')}
                </Text>
              </View>
            </View>
            <View style={styles.partnerBottomRow}>
              <Text style={styles.partnerActionText}>{t('lawyer.viewInfo', 'View Info, Mission & Contact Email')}</Text>
              <Image
                source={require('../../assets/images/arrow.png')}
                style={styles.inlineArrowImg}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          {/* KTN News Card */}
          <TouchableOpacity
            style={[styles.partnerCard, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
            activeOpacity={0.84}
            onPress={() => router.push({ pathname: '/KTNNewsInfo', params: { from: 'citizen' } })}
          >
            <View style={styles.partnerTop}>
              <View style={styles.partnerAvatar}>
                <Image
                  source={require('../../assets/images/media.png')}
                  style={{ width: 34, height: 34 }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.partnerPill, { backgroundColor: 'rgba(245, 158, 11, 0.18)', borderColor: 'rgba(245, 158, 11, 0.35)' }]}>
                  <Text style={[styles.partnerPillText, { color: '#F59E0B' }]}>{t('24/7 BROADCAST JOURNALISM')}</Text>
                </View>
                <Text style={[styles.partnerTitle, !isDarkMode && { color: theme.textPrimary }]}>
                  {t('KTN News (Kawish Television Network)')}
                </Text>
                <Text style={[styles.partnerSub, !isDarkMode && { color: theme.textMuted }]}>
                  {t('Court reporting, investigative journalism & public grievance desk')}
                </Text>
              </View>
            </View>
            <View style={styles.partnerBottomRow}>
              <Text style={styles.partnerActionText}>{t('lawyer.viewInfo', 'View Info, Mission & Contact Email')}</Text>
              <Image
                source={require('../../assets/images/arrow.png')}
                style={styles.inlineArrowImg}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Unified, civilized Bottom Navigation */}
      <BottomNavBar role="citizen" activeTab="home" />
    </SafeAreaView>
  );
}
