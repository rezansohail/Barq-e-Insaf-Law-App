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

const { width } = Dimensions.get('window');

const STATS = [
  { label: 'Total Lawyers',       value: '0', delta: '',             color: '#5C1A1A', tag: 'LAW' },
  { label: 'Verified Lawyers',    value: '0', delta: '',             color: '#0F2744', tag: 'VER' },
  { label: 'Pending Verifications', value: '0', delta: 'Needs review', color: '#92400e', tag: 'PND' },
  { label: 'Total Citizens',      value: '0', delta: '',             color: '#1B4332', tag: 'CIT' },
  { label: 'Total NGOs',          value: '0', delta: '',             color: '#1e40af', tag: 'NGO' },
  { label: 'Active Cases',        value: '0', delta: '',             color: '#166534', tag: 'ACT' },
  { label: 'Resolved Cases',      value: '0', delta: 'All time',     color: '#FF9500', tag: 'RES' },
  { label: 'Pending Cases',       value: '0', delta: 'Needs action', color: '#7c3aed', tag: 'PEN' },
  { label: 'Total Appointments',  value: '0', delta: '',             color: '#0e7490', tag: 'APT' },
  { label: 'Monthly Registrations', value: '0', delta: '',           color: '#065f46', tag: 'REG' },
];

const RECENT_ACTIVITIES = [];

const LATEST_COMPLAINTS = [];

const LATEST_APPOINTMENTS = [];

const NOTIFICATIONS = [];

const BOTTOM_NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users',     label: 'Users'     },
  { id: 'lawyers',   label: 'Lawyers'   },
  { id: 'reports',   label: 'Reports'   },
  { id: 'settings',  label: 'Settings'  },
];

const notifColors = {
  red:   { bg: '#fee2e2', dot: '#ef4444', text: '#991b1b' },
  amber: { bg: '#fef3c7', dot: '#f59e0b', text: '#92400e' },
  blue:  { bg: '#dbeafe', dot: '#3b82f6', text: '#1e40af' },
  green: { bg: '#dcfce7', dot: '#22c55e', text: '#166534' },
};

const cmpColors = {
  Active:   { bg: '#dcfce7', text: '#166534' },
  Pending:  { bg: '#fef3c7', text: '#92400e' },
  Resolved: { bg: '#f3f4f6', text: '#374151' },
};

const aptColors = {
  Confirmed: { bg: '#dbeafe', text: '#1e40af' },
  Pending:   { bg: '#fef3c7', text: '#92400e' },
};

export default function AdminHome() {
  const router = useRouter();

  // Enforce double-back to exit on Home, never fall back to login screen
  useAppNavigation({ isHome: true, homeRoute: '/(Admin)' });

  const goTo = (screen) => router.push(`/(Admin)/${screen}`);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Barq-e-Insaf</Text>
          <Text style={s.headerSub}>Admin Control Panel</Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>Live</Text>
          <TopHeaderMenu role="admin" avatarText="AD" />
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ALERT BADGES */}
        <View style={s.alertRow}>
          <View style={[s.alertBadge, { backgroundColor: '#fee2e2' }]}>
            <Text style={[s.alertText, { color: '#991b1b' }]}>0 Flagged</Text>
          </View>
          <View style={[s.alertBadge, { backgroundColor: '#fef3c7' }]}>
            <Text style={[s.alertText, { color: '#92400e' }]}>0 Pending</Text>
          </View>
          <View style={[s.alertBadge, { backgroundColor: '#dbeafe' }]}>
            <Text style={[s.alertText, { color: '#1e40af' }]}>0 NGOs</Text>
          </View>
        </View>

        {/* ── STATS GRID ── */}
        <Text style={s.secTitle}>Dashboard Overview</Text>
        <View style={s.statsGrid}>
          {STATS.map((st, i) => (
            <View key={i} style={s.statCard}>
              <View style={[s.statAccent, { backgroundColor: st.color }]} />
              <Text style={s.statIcon}>{st.tag}</Text>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
              <Text style={s.statDelta}>{st.delta}</Text>
            </View>
          ))}
        </View>

        {/* ── QUICK ACTIONS ── */}
        <Text style={s.secTitle}>Quick Actions</Text>
        <View style={s.quickGrid}>
          {[
            { tag: 'LAW', label: 'Lawyer Management',  sub: 'Verify & manage',  screen: 'LawyerManagement',  color: '#FF9500' },
            { tag: 'CIT', label: 'Citizen Management', sub: 'View & manage',    screen: 'CitizenManagement', color: '#FFA726' },
            { tag: 'NGO', label: 'NGO Management',     sub: 'Verify & manage',  screen: 'NGOManagement',     color: '#FF7043' },
            { tag: 'MOD', label: 'Reports Queue',      sub: 'Review flags',     screen: null, info: '0 flagged reports in moderation queue. System healthy.', color: '#FFB74D' },
            { tag: 'LAW', label: 'Legal Database',     sub: 'Update laws',      screen: null, info: '4,280 PPC sections & Sindh High Court precedents synchronized.', color: '#FF9800' },
            { tag: 'SYS', label: 'System Config',      sub: 'App settings',     screen: null, info: 'Barq-e-Insaf v2.4 Live. Cloud DB connected.', color: '#FFA000' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i} style={s.quickCard}
              activeOpacity={0.82}
              onPress={() => {
                if (item.screen) {
                  goTo(item.screen);
                } else if (item.info) {
                  Alert.alert(item.label, item.info);
                }
              }}
            >
              <View style={[s.quickIconBox, { backgroundColor: item.color + '22' }]}>
                <Text style={[s.quickTagText, { color: item.color }]}>{item.tag}</Text>
              </View>
              <Text style={s.quickLabel}>{item.label}</Text>
              <Text style={s.quickSub}>{item.sub}</Text>
              <Image
                source={require('../../assets/images/arrow.png')}
                style={s.quickArrowImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── NOTIFICATIONS ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notifications</Text>
          {NOTIFICATIONS.length === 0 && <Text style={s.emptyText}>No notifications</Text>}
          {NOTIFICATIONS.map((n, i) => {
            const c = notifColors[n.type];
            return (
              <View key={i} style={[s.notifRow, { backgroundColor: c.bg }]}>
                <View style={[s.notifDot, { backgroundColor: c.dot }]} />
                <Text style={[s.notifText, { color: c.text, flex: 1 }]}>{n.text}</Text>
                <Text style={[s.notifTime, { color: c.text }]}>{n.time}</Text>
              </View>
            );
          })}
        </View>

        {/* ── LATEST COMPLAINTS ── */}
        <View style={s.section}>
          <View style={s.secRow}>
            <Text style={s.sectionTitle}>Latest Complaints</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.seeAll}>See All</Text>
              <Image
                source={require('../../assets/images/arrow.png')}
                style={s.seeAllArrowImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {LATEST_COMPLAINTS.length === 0 && <Text style={s.emptyText}>No complaints yet</Text>}
          {LATEST_COMPLAINTS.map((c, i) => {
            const sc = cmpColors[c.status];
            return (
              <View key={i} style={s.rowItem}>
                <View style={s.rowLeft}>
                  <Text style={s.rowId}>{c.id}</Text>
                  <Text style={s.rowMain}>{c.citizen}</Text>
                  <Text style={s.rowSub}>{c.type} · {c.time}</Text>
                </View>
                <View style={[s.pill, { backgroundColor: sc.bg }]}>
                  <Text style={[s.pillTxt, { color: sc.text }]}>{c.status}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── LATEST APPOINTMENTS ── */}
        <View style={s.section}>
          <View style={s.secRow}>
            <Text style={s.sectionTitle}>Latest Appointments</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.seeAll}>See All</Text>
              <Image
                source={require('../../assets/images/arrow.png')}
                style={s.seeAllArrowImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {LATEST_APPOINTMENTS.length === 0 && <Text style={s.emptyText}>No appointments yet</Text>}
          {LATEST_APPOINTMENTS.map((a, i) => {
            const sc = aptColors[a.status];
            return (
              <View key={i} style={s.rowItem}>
                <View style={s.rowLeft}>
                  <Text style={s.rowId}>{a.id}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.rowMain}>{a.citizen}</Text>
                    <Image
                      source={require('../../assets/images/arrow.png')}
                      style={{ width: 12, height: 8 }}
                      resizeMode="contain"
                    />
                    <Text style={s.rowMain}>{a.lawyer}</Text>
                  </View>
                  <Text style={s.rowSub}>{a.date}</Text>
                </View>
                <View style={[s.pill, { backgroundColor: sc?.bg || '#f3f4f6' }]}>
                  <Text style={[s.pillTxt, { color: sc?.text || '#374151' }]}>{a.status}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── RECENT ACTIVITY ── */}
        <View style={[s.section, { marginBottom: 100 }]}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          {RECENT_ACTIVITIES.length === 0 && <Text style={s.emptyText}>No recent activity</Text>}
          {RECENT_ACTIVITIES.map((item, i) => (
            <View key={i} style={s.activityItem}>
              <View style={[s.activityDot, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.activityTitle}>{item.title}</Text>
                <Text style={s.activitySub}>{item.sub}</Text>
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
