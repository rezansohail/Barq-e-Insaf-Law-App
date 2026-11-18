import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, StyleSheet, Dimensions, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import LanguagePeekingTab from '../../components/LanguagePeekingTab';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { clearSession } from '../../constants/authStore';
import { getAdminUnreadNotificationStatus, subscribeToStore } from '../../constants/ngoMediaStore';

const { width } = Dimensions.get('window');

const STATS = [
  { label: 'Total Citizens Registered', value: '24', delta: 'Sindh Jurisdictions', color: '#FFA726', tag: 'CIT' },
  { label: 'Total Lawyers Registered',  value: '12', delta: 'Sindh Bar Council',   color: '#FF9500', tag: 'LAW' },
  { label: 'Total Cases Registered',    value: '24', delta: '8 Active · 16 Disposed', color: '#FF7043', tag: 'CAS' },
  { label: 'Total NGOs & Media',        value: '6',  delta: 'Accredited Portals',  color: '#38BDF8', tag: 'ORG' },
];

export default function AdminHome() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const [hasUnread, setHasUnread] = useState(getAdminUnreadNotificationStatus());

  useEffect(() => {
    return subscribeToStore(() => {
      setHasUnread(getAdminUnreadNotificationStatus());
    });
  }, []);

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

  const handleSystemHealthCheck = () => {
    Alert.alert(
      'Cloud Infrastructure Health',
      '• Neon PostgreSQL: Connected & Healthy\n• Node.js REST API Server: Port 5000 Active\n• Auth Middleware: JWT Stateless Token Active\n• Citizen & Lawyer Modules: Synchronized\n• SBC Bar Verification: Online',
      [{ text: 'OK' }]
    );
  };

  const dynamicStyles = {
    safe: {
      flex: 1,
      backgroundColor: isDark ? '#090302' : '#FAF7F2',
    },
    header: {
      backgroundColor: isDark ? '#140704' : '#FFFFFF',
      borderBottomColor: isDark ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 149, 0, 0.2)',
    },
    headerSub: {
      color: isDark ? 'rgba(255, 180, 80, 0.65)' : '#886644',
    },
    secTitle: {
      color: isDark ? '#FFEED6' : '#1A0F07',
    },
    statCard: {
      backgroundColor: isDark ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 149, 0, 0.22)' : 'rgba(255, 149, 0, 0.20)',
    },
    statValue: {
      color: isDark ? '#FFEED6' : '#1A0F07',
    },
    statLabel: {
      color: isDark ? 'rgba(255, 235, 215, 0.75)' : '#554433',
    },
    quickCard: {
      backgroundColor: isDark ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 149, 0, 0.22)' : 'rgba(255, 149, 0, 0.20)',
    },
    quickLabel: {
      color: isDark ? '#FFEED6' : '#1A0F07',
    },
    quickSub: {
      color: isDark ? 'rgba(255, 235, 215, 0.65)' : '#665544',
    },
    section: {
      backgroundColor: isDark ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 149, 0, 0.22)' : 'rgba(255, 149, 0, 0.20)',
    },
    sectionTitle: {
      color: isDark ? '#FFEED6' : '#1A0F07',
    },
    activityTitle: {
      color: isDark ? '#FFEED6' : '#1A0F07',
    },
    activitySub: {
      color: isDark ? 'rgba(255, 235, 215, 0.65)' : '#665544',
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor={isDark ? "#0A0402" : "#FAF7F2"} />

      {/* HEADER WITH LOGO AND HI, ADMIN */}
      <View style={[s.header, dynamicStyles.header]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image
            source={require('../../assets/images/logo1.png')}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <View>
            <Text style={[s.adminNavTitle, { color: isDark ? '#FFF5E8' : '#1A0F07' }]}>Admin Control Panel</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#FFF2DF' : '#1A0F07' }}>
            Admin
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
            {hasUnread && <View style={s.unreadGreenDot} />}
          </TouchableOpacity>
          <TopHeaderMenu role="admin" avatarText="AD" />
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── STATS GRID (ONLY 4 COUNTS) ── */}
        <Text style={[s.secTitle, dynamicStyles.secTitle]}>App Ecosystem Overview</Text>
        <View style={s.statsGrid}>
          {STATS.map((st, i) => (
            <View key={i} style={[s.statCard, dynamicStyles.statCard]}>
              <View style={[s.statAccent, { backgroundColor: st.color }]} />
              <Text style={s.statIcon}>{st.tag}</Text>
              <Text style={[s.statValue, dynamicStyles.statValue]}>{st.value}</Text>
              <Text style={[s.statLabel, dynamicStyles.statLabel]}>{st.label}</Text>
              <Text style={s.statDelta}>{st.delta}</Text>
            </View>
          ))}
        </View>

        {/* ── REAL APP AUTHORITY QUICK ACTIONS ── */}
        <Text style={[s.secTitle, dynamicStyles.secTitle]}>Administrative Governance</Text>
        <View style={s.quickGrid}>
          {[
            { tag: 'LAW', label: 'Lawyer Management', sub: 'Verify SBC licenses', screen: 'LawyerManagement', color: '#FF9500' },
            { tag: 'CIT', label: 'Citizen Management', sub: 'Manage vaults & cases', screen: 'CitizenManagement', color: '#FFA726' },
            { tag: 'NGO', label: 'NGO Management', sub: 'NCHD & Relief Organizations', screen: 'NGOManagement', color: '#FF7043' },
            { tag: 'MED', label: 'Media Management', sub: 'KTN News & Journalism Desk', screen: 'MediaManagement', color: '#38BDF8' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i} style={[s.quickCard, dynamicStyles.quickCard]}
              activeOpacity={0.82}
              onPress={() => {
                if (item.screen) {
                  goTo(item.screen);
                } else if (item.isAction) {
                  handleSystemHealthCheck();
                }
              }}
            >
              <View style={[s.quickIconBox, { backgroundColor: item.color + '22' }]}>
                <Text style={[s.quickTagText, { color: item.color }]}>{item.tag}</Text>
              </View>
              <Text style={[s.quickLabel, dynamicStyles.quickLabel]}>{item.label}</Text>
              <Text style={[s.quickSub, dynamicStyles.quickSub]}>{item.sub}</Text>
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
          activeOpacity={0.85}
        >
          <Text style={s.signOutBtnText}>SIGN OUT OF ADMINISTRATIVE CONSOLE</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="admin" activeTab="home" />
      {/* Sliding Language Card */}
      <LanguagePeekingTab />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#090302' },
  header:        { backgroundColor: '#140704', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255, 149, 0, 0.15)' },
  adminNavTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: '#FFEED6', letterSpacing: -0.3 },
  headerSub:     { fontSize: 11, color: 'rgba(255, 180, 80, 0.65)', marginTop: 2, fontWeight: '500' },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBellBtn:    { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  unreadGreenDot:{ position: 'absolute', top: 5, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', borderWidth: 1.5, borderColor: '#0A0402' },
  liveDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80' },
  liveText:      { fontSize: 11, color: '#4ade80', fontWeight: '700' },
  avatar:        { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255, 149, 0, 0.15)', borderWidth: 1.5, borderColor: 'rgba(255, 170, 60, 0.3)', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  avatarText:    { fontSize: 12, fontWeight: '800', color: '#FFB74D' },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },
  alertRow:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
  alertBadge:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  alertText:     { fontSize: 12, fontWeight: '700' },
  secTitle:      { fontSize: 13, fontWeight: '800', color: '#FFEED6', marginBottom: 12, marginTop: 4 },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard:      { backgroundColor: '#170905', borderRadius: 16, padding: 14, width: (width - 42) / 2, borderWidth: 1, borderColor: 'rgba(255, 149, 0, 0.18)', overflow: 'hidden' },
  statAccent:    { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  statIcon:      { fontSize: 11, fontWeight: '800', color: '#FF9500', marginTop: 8, marginBottom: 4, letterSpacing: 0.5 },
  statValue:     { fontSize: 22, fontWeight: '800', color: '#FFEED6', letterSpacing: -0.5 },
  statLabel:     { fontSize: 10, color: 'rgba(255, 235, 215, 0.65)', marginTop: 4, fontWeight: '500' },
  statDelta:     { fontSize: 10, color: '#FF9500', marginTop: 4, fontWeight: '700' },
  quickGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quickCard:     { backgroundColor: '#170905', borderRadius: 16, padding: 14, width: (width - 42) / 2, borderWidth: 1, borderColor: 'rgba(255, 149, 0, 0.18)' },
  quickIconBox:  { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickTagText:  { fontSize: 12, fontWeight: '800' },
  quickLabel:    { fontSize: 12, fontWeight: '800', color: '#FFEED6' },
  quickSub:      { fontSize: 10, color: 'rgba(255, 235, 215, 0.55)', marginTop: 2 },
  quickArrow:    { fontSize: 16, fontWeight: '800', marginTop: 8 },
  quickArrowImg: { width: 18, height: 13, marginTop: 8 },
  seeAllArrowImg: { width: 14, height: 10 },
  section:       { backgroundColor: '#170905', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255, 149, 0, 0.18)' },
  sectionTitle:  { fontSize: 13, fontWeight: '800', color: '#FFEED6', marginBottom: 12 },
  secRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll:        { fontSize: 12, color: '#FF9500', fontWeight: '700' },
  notifRow:      { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 10, marginBottom: 8, gap: 10 },
  notifDot:      { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  notifText:     { fontSize: 12, fontWeight: '600' },
  notifTime:     { fontSize: 10, fontWeight: '500' },
  rowItem:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 149, 0, 0.1)' },
  rowLeft:       { flex: 1 },
  rowId:         { fontSize: 10, color: 'rgba(255, 235, 215, 0.45)', fontWeight: '600', marginBottom: 2 },
  rowMain:       { fontSize: 13, fontWeight: '700', color: '#FFEED6' },
  rowSub:        { fontSize: 11, color: 'rgba(255, 235, 215, 0.55)', marginTop: 2 },
  pill:          { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  pillTxt:       { fontSize: 10, fontWeight: '700' },
  activityItem:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 149, 0, 0.1)' },
  activityDot:   { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  activityTitle: { fontSize: 13, fontWeight: '600', color: '#FFEED6' },
  activitySub:   { fontSize: 11, color: 'rgba(255, 235, 215, 0.55)', marginTop: 2 },
  emptyText:     { fontSize: 12, color: 'rgba(255, 235, 215, 0.5)', textAlign: 'center', paddingVertical: 12 },
  bottomNav:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#140704', borderTopWidth: 1, borderTopColor: 'rgba(255, 149, 0, 0.18)', flexDirection: 'row', height: 68, paddingBottom: 8 },
  navItem:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  navIcon:       { fontSize: 20 },
  navLabel:      { fontSize: 9, fontWeight: '600', color: 'rgba(255, 235, 215, 0.45)', letterSpacing: 0.2 },
  navLabelActive:{ color: '#FF9500' },
  navDot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF9500', marginTop: 1 },
  termsBtn: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 175, 50, 0.35)',
    marginBottom: 10,
  },
  termsBtnText: {
    color: '#FFB74D',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signOutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.45)',
    marginBottom: 10,
  },
  signOutBtnText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
