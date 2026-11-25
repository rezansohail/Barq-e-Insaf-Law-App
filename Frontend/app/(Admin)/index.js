import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, StyleSheet, Dimensions, Alert, Image,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import LanguagePeekingTab from '../../components/LanguagePeekingTab';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';
import { clearSession, getSession } from '../../constants/authStore';
import api from '../../constants/api';

const { width } = Dimensions.get('window');

export default function AdminHome() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const { t, currentLang, appName } = useAppTranslation();
  
  const [stats, setStats] = useState({
    citizens: { total: 0, label: 'Total Citizens Registered', subtitle: 'Sindh Jurisdictions' },
    lawyers: { total: 0, label: 'Total Lawyers Registered', subtitle: 'Sindh Bar Council' },
    cases: { total: 0, active: 0, disposed: 0, label: 'Total Cases Registered', subtitle: 'Active vs Disposed' },
    organizations: { total: 0, ngos: 0, media: 0, label: 'Total NGOs & Media', subtitle: 'Accredited Portals' },
    unreadNotificationsCount: 0,
    recentAuditLogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  // Load real admin stats from backend API
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data) {
        setStats({
          citizens: res.data.citizens || { total: res.data.totalUsers || 0, label: 'Total Citizens Registered', subtitle: 'Sindh Jurisdictions' },
          lawyers: res.data.lawyers || { total: res.data.totalLawyers || 0, label: 'Total Lawyers Registered', subtitle: 'Sindh Bar Council' },
          cases: res.data.cases || { total: res.data.totalCases || 0, active: 0, disposed: 0, label: 'Total Cases Registered', subtitle: 'Active vs Disposed' },
          organizations: res.data.organizations || { total: 0, ngos: 0, media: 0, label: 'Total NGOs & Media', subtitle: 'Accredited Portals' },
          unreadNotificationsCount: res.data.unreadNotificationsCount || 0,
          recentAuditLogs: res.data.recentAuditLogs || [],
        });
      }
    } catch (err) {
      console.warn('Could not fetch admin stats:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (session?.user?.fullName || session?.user?.name) {
      setAdminName(session.user.fullName || session.user.name);
    }
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  // Enforce double-back to exit on Home, never fall back to login screen
  useAppNavigation({ isHome: true, homeRoute: '/(Admin)' });

  const goTo = (screen) => router.push(`/(Admin)/${screen}`);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out of Admin',
      'Are you sure you want to end your administrative session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearSession();
            router.replace('/LoginScreen');
          },
        },
      ]
    );
  };

  const dynamicStyles = {
    safe: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    header: {
      backgroundColor: theme.headerBg,
      borderBottomColor: theme.cardBorder,
    },
    headerSub: {
      color: theme.textMuted,
    },
    secTitle: {
      color: theme.textPrimary,
    },
    statCard: {
      backgroundColor: theme.card,
      borderColor: theme.cardBorder,
    },
    statValue: {
      color: theme.textPrimary,
    },
    statLabel: {
      color: theme.textSecondary,
    },
    quickCard: {
      backgroundColor: theme.card,
      borderColor: theme.cardBorder,
    },
    quickLabel: {
      color: theme.textPrimary,
    },
    quickSub: {
      color: theme.textMuted,
    },
    section: {
      backgroundColor: theme.card,
      borderColor: theme.cardBorder,
    },
    sectionTitle: {
      color: theme.textPrimary,
    },
    activityTitle: {
      color: theme.textPrimary,
    },
    activitySub: {
      color: theme.textMuted,
    },
  };

  const statCardsData = [
    { label: stats.citizens.label, value: String(stats.citizens.total), delta: stats.citizens.subtitle, color: '#FFA726', tag: 'CIT' },
    { label: stats.lawyers.label,  value: String(stats.lawyers.total), delta: stats.lawyers.subtitle, color: '#FF9500', tag: 'LAW' },
    { label: stats.cases.label,    value: String(stats.cases.total), delta: stats.cases.subtitle, color: '#FF7043', tag: 'CAS' },
    { label: stats.organizations.label, value: String(stats.organizations.total), delta: stats.organizations.subtitle, color: '#38BDF8', tag: 'ORG' },
  ];

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <StatusBar barStyle={theme.statusBarStyle} translucent backgroundColor={theme.statusBarBg} />

      {/* HEADER WITH LOGO AND HI, ADMIN */}
      <View style={[s.header, dynamicStyles.header]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image
            source={require('../../assets/images/logo1.png')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <View>
            <Text style={[s.adminNavTitle, { color: isDark ? '#FFF5E8' : '#1A0F07' }]}>
              {t('admin.controlPanel', 'Admin Control Panel')}
            </Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#FFF2DF' : '#1A0F07' }}>
            {adminName}
          </Text>
          <TouchableOpacity
            style={[
              s.topBellBtn,
              {
                backgroundColor: isDark ? 'rgba(38, 20, 10, 0.94)' : 'rgba(245, 240, 235, 0.9)',
                borderColor: isDark ? 'rgba(255, 170, 60, 0.35)' : 'rgba(234, 88, 12, 0.35)',
              },
            ]}
            onPress={() => router.push('/(Admin)/Notifications')}
            activeOpacity={0.75}
            accessibilityLabel="Notifications"
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                stroke={isDark ? '#FFE4C4' : '#1A0F07'}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            {stats.unreadNotificationsCount > 0 && <View style={s.unreadGreenDot} />}
          </TouchableOpacity>
          <TopHeaderMenu role="admin" avatarText="AD" />
        </View>
      </View>

      <ScrollView 
        style={s.scroll} 
        contentContainerStyle={s.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />
        }
      >

        {/* ── STATS GRID (REAL DATABASE COUNTS) ── */}
        <Text style={[s.secTitle, dynamicStyles.secTitle]}>{t('admin.overview', 'App Ecosystem Overview')}</Text>
        <View style={s.statsGrid}>
          {statCardsData.map((st, i) => (
            <View key={i} style={[s.statCard, dynamicStyles.statCard]}>
              <View style={[s.statAccent, { backgroundColor: st.color }]} />
              <Text style={s.statIcon}>{st.tag}</Text>
              <Text style={[s.statValue, dynamicStyles.statValue]}>{st.value}</Text>
              <Text style={[s.statLabel, dynamicStyles.statLabel]}>{t(st.label)}</Text>
              <Text style={s.statDelta}>{t(st.delta)}</Text>
            </View>
          ))}
        </View>

        {/* ── REAL APP AUTHORITY QUICK ACTIONS ── */}
        <Text style={[s.secTitle, dynamicStyles.secTitle]}>{t('admin.adminGovernance', 'Administrative Governance')}</Text>
        <View style={s.quickGrid}>
          {[
            { tag: 'LAW', label: 'Lawyer Management', sub: 'Verify SBC licenses & roster', screen: 'LawyerManagement', color: '#FF9500' },
            { tag: 'CIT', label: 'Citizen Management', sub: 'Manage vaults & cases', screen: 'CitizenManagement', color: '#FFA726' },
            { tag: 'NGO', label: 'NGO Management', sub: 'NCHD & Relief Organizations', screen: 'NGOManagement', color: '#FF7043' },
            { tag: 'MED', label: 'Media Management', sub: 'KTN News & Journalism Desk', screen: 'MediaManagement', color: '#38BDF8' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i} style={[s.quickCard, dynamicStyles.quickCard]}
              activeOpacity={0.82}
              onPress={() => goTo(item.screen)}
            >
              <View style={[s.quickIconBox, { backgroundColor: item.color + '22' }]}>
                <Text style={[s.quickTagText, { color: item.color }]}>{item.tag}</Text>
              </View>
              <Text style={[s.quickLabel, dynamicStyles.quickLabel]}>{t(item.label)}</Text>
              <Text style={[s.quickSub, dynamicStyles.quickSub]}>{t(item.sub)}</Text>
              <Image
                source={require('../../assets/images/arrow.png')}
                style={s.quickArrowImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── TERMS & CONDITIONS LINK ── */}
        <TouchableOpacity
          style={s.termsBtn}
          onPress={() => router.push('/TermsScreen')}
          activeOpacity={0.8}
        >
          <Text style={s.termsBtnText}>View Platform Terms & Conditions</Text>
        </TouchableOpacity>

        {/* ── SIGN OUT BUTTON BELOW PAGE CONTENT ── */}
        <TouchableOpacity
          style={s.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={s.signOutBtnText}>Log Out of Admin Panel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modern Floating Bottom Nav Bar */}
      <BottomNavBar role="admin" activeTab="overview" />

      {/* Floating Language Peeking Pill */}
      <LanguagePeekingTab />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  adminNavTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  unreadGreenDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    borderWidth: 1.5,
    borderColor: '#0A0402',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  secTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 42) / 2,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  statAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  statIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF9500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  statDelta: {
    fontSize: 9,
    color: '#FF9500',
    marginTop: 4,
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickCard: {
    width: (width - 42) / 2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    position: 'relative',
  },
  quickIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickTagText: {
    fontSize: 11,
    fontWeight: '900',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  quickSub: {
    fontSize: 10,
    lineHeight: 13,
  },
  quickArrowImg: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 14,
    height: 14,
    tintColor: '#FF9500',
    transform: [{ rotate: '-90deg' }],
  },
  section: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 0.4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  activityTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  activitySub: {
    fontSize: 10,
    marginTop: 1,
    lineHeight: 14,
  },
  termsBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.35)',
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFA726',
    letterSpacing: 0.3,
  },
  signOutBtn: {
    marginHorizontal: 16,
    marginBottom: 36,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.4,
  },
});
