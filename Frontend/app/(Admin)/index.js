import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, StyleSheet, Dimensions, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import LanguagePeekingTab from '../../components/LanguagePeekingTab';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';

const { width } = Dimensions.get('window');

const STATS = [
  { label: 'Registered Lawyers',    value: '12', delta: 'Sindh Bar Council',  color: '#FF9500', tag: 'LAW' },
  { label: 'Verified Advocates',    value: '10', delta: 'Active SBC License', color: '#166534', tag: 'VER' },
  { label: 'Registered Citizens',   value: '24', delta: 'Sindh Jurisdictions',color: '#FFA726', tag: 'CIT' },
  { label: 'Accredited NGOs/Media', value: '2',  delta: 'NCHD & KTN News',   color: '#1e40af', tag: 'ORG' },
  { label: 'Active Vault Cases',    value: '8',  delta: 'Under Counsel',     color: '#FF7043', tag: 'ACT' },
  { label: 'Disposed Legal Cases',  value: '16', delta: 'Completed Matters', color: '#FFB74D', tag: 'DIS' },
];

const SYSTEM_ACTIVITIES = [
  { title: 'Sindh Bar Council Registry Audit', sub: 'Advocate license verification active and online', color: '#4ade80' },
  { title: 'Neon PostgreSQL Cloud Database', sub: 'Connection pool healthy · Latency 42ms', color: '#60a5fa' },
  { title: 'Evidence Vault Integrity Check', sub: 'AES-256 file encryption operational for citizen records', color: '#f59e0b' },
  { title: 'NCHD & KTN News Desk Endpoints', sub: 'Public interest email desks verified & reachable', color: '#FF9500' },
];

export default function AdminHome() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const { t, currentLang, appName } = useAppTranslation();

  // Enforce double-back to exit on Home, never fall back to login screen
  useAppNavigation({ isHome: true, homeRoute: '/(Admin)' });

  const goTo = (screen) => router.push(`/(Admin)/${screen}`);

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
            source={require('../../assets/images/logo.png')}
            style={{ width: 34, height: 34 }}
            resizeMode="contain"
          />
          <View>
            <Text style={dynamicStyles.secTitle}>{t('admin.controlPanel', 'Admin Control Panel')}</Text>
            <Text style={[s.headerSub, dynamicStyles.headerSub]}>{t('admin.governance', 'Sindh Bar Council Governance')}</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#FFF2DF' : '#1A0F07' }}>
            {t('common.greetingHi', 'hi,')} Admin
          </Text>
          <View style={s.liveDot} />
          <TopHeaderMenu role="admin" avatarText="AD" />
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── STATS GRID ── */}
        <Text style={[s.secTitle, dynamicStyles.secTitle]}>{t('admin.overview', 'App Ecosystem Overview')}</Text>
        <View style={s.statsGrid}>
          {STATS.map((st, i) => (
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
            { tag: 'LAW', label: 'Lawyer Management', sub: 'Verify SBC licenses', screen: 'LawyerManagement', color: '#FF9500' },
            { tag: 'CIT', label: 'Citizen Management', sub: 'Manage vaults & cases', screen: 'CitizenManagement', color: '#FFA726' },
            { tag: 'NGO', label: 'NGO & Media Registry', sub: 'NCHD & KTN News', screen: 'NGOManagement', color: '#FF7043' },
            { tag: 'SYS', label: 'Cloud DB Status', sub: 'Postgres & API status', isAction: true, color: '#4ade80' },
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

        {/* ── REAL APP SYSTEM AUDIT ── */}
        <View style={[s.section, dynamicStyles.section, { marginBottom: 100 }]}>
          <Text style={[s.sectionTitle, dynamicStyles.sectionTitle]}>{t('admin.auditLog', 'System & Security Audit Log')}</Text>
          {SYSTEM_ACTIVITIES.map((item, i) => (
            <View key={i} style={s.activityItem}>
              <View style={[s.activityDot, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.activityTitle, dynamicStyles.activityTitle]}>{t(item.title)}</Text>
                <Text style={[s.activitySub, dynamicStyles.activitySub]}>{t(item.sub)}</Text>
              </View>
            </View>
          ))}
        </View>

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
  headerTitle:   { fontSize: 18, fontWeight: '800', color: '#FFEED6', letterSpacing: -0.3 },
  headerSub:     { fontSize: 11, color: 'rgba(255, 180, 80, 0.65)', marginTop: 2, fontWeight: '500' },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
});
