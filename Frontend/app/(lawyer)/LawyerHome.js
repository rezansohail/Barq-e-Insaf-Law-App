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
import styles from './LawyerHome.styles';
import { useMockStore, lawyerProfile, caseRequests, fetchLawyerDashboard } from './MockStore';
import { getCurrentLawyerId } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';

const quickActions = [
  { title: 'Case Requests', route: '/(lawyer)/CaseRequests' },
  { title: 'My Schedule',   route: '/(lawyer)/Schedule'     },
  { title: 'My Cases',      route: '/(lawyer)/MyCases'      },
  { title: 'Other Lawyers', route: '/(lawyer)/OtherLawyers'  },
];

export default function LawyerHome() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, isDarkMode } = useAppTheme();
  const { t, currentLang, translateCategory, translateDynamic } = useAppTranslation();
  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

  // Root screen: back button confirms exit, does not back to login screen
  useAppNavigation({ isHome: true, homeRoute: '/(lawyer)/LawyerHome' });

  useEffect(() => {
    if (currentLawyerId) {
      fetchLawyerDashboard(currentLawyerId);
    }
  }, [currentLawyerId]);

  const getDisplayName = () => {
    const raw = (lawyerProfile.name || '').trim();
    if (!raw || raw.toLowerCase() === 'advocate') {
      return lawyerProfile.sbc ? `Advocate (${lawyerProfile.sbc})` : (currentLang === 'ur' ? 'ایڈووکیٹ' : currentLang === 'sd' ? 'ايڊووڪيٽ' : 'Advocate');
    }
    if (/^adv(\.|ocate)?\s+/i.test(raw)) {
      return raw;
    }
    return `Adv. ${raw}`;
  };

  const pendingRequests = React.useMemo(() => {
    const map = new Map();
    (caseRequests || []).filter((r) => r.status === 'pending').forEach((r, idx) => {
      const key = r?.id ? String(r.id) : `req-${idx}`;
      if (!map.has(key)) map.set(key, r);
    });
    return Array.from(map.values());
  }, [caseRequests]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={theme.bg} />

      {/* Top Header matching app standard - Logo on top right, hi with name */}
      <AppHeader
        showBack={false}
        role="lawyer"
        userName={getDisplayName()}
        avatarText={lawyerProfile.initials || 'L'}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* LAWYER STATUS BANNER */}
        <View style={[styles.nameRow, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#FF9500', letterSpacing: 1, marginBottom: 2 }}>
              {t('lawyer.sbcAdvocate', 'SINDH BAR COUNCIL ADVOCATE')}
            </Text>
            <Text style={[styles.lawyerName, !isDarkMode && { color: theme.textPrimary }]}>
              {getDisplayName()}
            </Text>
            <Text style={[styles.licenseNo, !isDarkMode && { color: theme.textSecondary }]}>
              {t('lawyer.licence', 'Licence:')} {lawyerProfile.sbc || (lawyerProfile.loading ? t('common.loading', 'Loading...') : t('lawyer.sbcVerified', 'SBC Verified'))}
            </Text>
          </View>

          <View style={[
            styles.verifiedPill,
            !lawyerProfile.isVerified && { backgroundColor: 'rgba(245, 158, 11, 0.18)', borderColor: 'rgba(245, 158, 11, 0.4)' }
          ]}>
            <Text style={[styles.verifiedText, !lawyerProfile.isVerified && { color: '#f59e0b' }]}>
              {lawyerProfile.isVerified ? t('lawyer.sbcVerified', 'SBC Verified') : t('lawyer.pendingVerification', 'Pending Verification')}
            </Text>
          </View>
        </View>

        {/* STATS METRICS ROW */}
        <View style={styles.statsRow}>
          <View style={[styles.statChip, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statNum, !isDarkMode && { color: theme.textPrimary }]}>{lawyerProfile.activeCasesCount || lawyerProfile.successfulCasesCount || 0}</Text>
            <Text style={styles.statLabel}>{t('lawyer.activeCases', 'Active Cases')}</Text>
          </View>
          <View style={[styles.statChip, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statNum, !isDarkMode && { color: theme.textPrimary }]}>{pendingRequests.length}</Text>
            <Text style={styles.statLabel}>{t('lawyer.newRequests', 'New Requests')}</Text>
          </View>
          <View style={[styles.statChip, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statNum, !isDarkMode && { color: theme.textPrimary }]}>{lawyerProfile.completedCasesCount || 14}</Text>
            <Text style={styles.statLabel}>{t('lawyer.completed', 'Completed')}</Text>
          </View>
        </View>

        {/* NEW CLIENT REQUESTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{t('lawyer.newClientRequests', 'New Client Requests')} ({pendingRequests.length})</Text>
          <TouchableOpacity onPress={() => router.push('/(lawyer)/CaseRequests')}>
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

        {pendingRequests.length === 0 ? (
          <View style={[styles.reqCard, { paddingVertical: 20, alignItems: 'center' }]}>
            <Text style={[styles.reqDesc, { textAlign: 'center' }]}>{t('lawyer.noPendingRequests', 'No pending case requests at this time.')}</Text>
          </View>
        ) : (
          pendingRequests.slice(0, 3).map((r, i) => (
            <TouchableOpacity
              key={r.id || i}
              style={styles.reqCard}
              activeOpacity={0.84}
              onPress={() => router.push('/(lawyer)/CaseRequests')}
            >
              <View style={styles.reqTop}>
                <Text style={styles.reqName}>{r.name} - {translateCategory(r.spec) || r.spec}</Text>
                <Text style={styles.badgeNew}>{t('common.new', 'New')}</Text>
              </View>
              <Text style={styles.reqDesc} numberOfLines={2}>
                {translateDynamic(r.desc || r.problemStatement || 'Consultation requested')}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {/* QUICK ACTIONS */}
        <Text style={[styles.sectionLabel, { marginTop: 14 }]}>{t('lawyer.chamberQuickActions', 'Chamber Quick Actions')}</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((q, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickCard}
              activeOpacity={0.82}
              onPress={() => router.push(q.route)}
            >
              <Text style={styles.quickTitle}>{t(q.title)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INSTITUTIONAL PARTNERS: NGO & MEDIA */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
          {t('lawyer.institutionalPartners', 'Institutional Partners: Legal Aid & Media')}
        </Text>
        <View style={styles.partnerCardsContainer}>
          {/* NCHD Card */}
          <TouchableOpacity
            style={styles.partnerCard}
            activeOpacity={0.84}
            onPress={() => router.push({ pathname: '/NCHDInfo', params: { from: 'lawyer' } })}
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
                  <Text style={styles.partnerPillText}>{t('COMMUNITY LEGAL AID & EDUCATION')}</Text>
                </View>
                <Text style={styles.partnerTitle}>
                  {t('National Commission for Human Development (NCHD)')}
                </Text>
                <Text style={styles.partnerSub}>
                  {t('Pro-bono advocate coordination, grassroots litigation & literacy')}
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
            style={styles.partnerCard}
            activeOpacity={0.84}
            onPress={() => router.push({ pathname: '/KTNNewsInfo', params: { from: 'lawyer' } })}
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
                  <Text style={[styles.partnerPillText, { color: '#F59E0B' }]}>{t('COURT & LEGAL BROADCAST DESK')}</Text>
                </View>
                <Text style={styles.partnerTitle}>
                  {t('KTN News (Kawish Television Network)')}
                </Text>
                <Text style={styles.partnerSub}>
                  {t('Sindh court reporting, investigative media & legal grievance desk')}
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

      {/* Unified Bottom Navigation for Lawyer */}
      <BottomNavBar role="lawyer" activeTab="home" />
    </SafeAreaView>
  );
}
