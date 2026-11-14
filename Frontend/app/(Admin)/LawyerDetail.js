import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const { width } = Dimensions.get('window');

const TABS = ['Personal', 'Professional', 'Performance', 'Account'];

const statusColors = {
  Active:    { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(74, 222, 128, 0.4)', text: '#4ade80' },
  Pending:   { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b' },
  Suspended: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444' },
};

function InfoRow({ label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoHighlight]}>{value || '—'}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function LawyerDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('Personal');

  // Back button returns to Lawyer Management or Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)/LawyerManagement' });

  // Get data passed from LawyerManagement
  let lawyer = null;
  try {
    lawyer = params.data ? JSON.parse(params.data) : null;
  } catch (_) {}

  const data = lawyer || {};

  if (!data.fullName && !data.name) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
        <AppHeader
          title="Lawyer Profile"
          showBack={true}
          homeRoute="/(Admin)/LawyerManagement"
          role="admin"
        />
        <View style={styles.center}>
          <Text style={styles.notFound}>Lawyer record not found.</Text>
          <TouchableOpacity
            style={styles.backBtnPill}
            onPress={() => router.replace('/(Admin)/LawyerManagement')}
          >
            <Text style={styles.backBtnPillText}>Return to Registry</Text>
          </TouchableOpacity>
        </View>
        <BottomNavBar role="admin" activeTab="lawyers" />
      </SafeAreaView>
    );
  }

  const displayName = data.fullName || data.name;
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const sc = statusColors[data.status] || statusColors['Pending'];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Lawyer Profile' Header */}
      <AppHeader
        title="Lawyer Profile"
        showBack={true}
        homeRoute="/(Admin)/LawyerManagement"
        role="admin"
        rightElement={
          <View style={[styles.statusPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[styles.statusPillText, { color: sc.text }]}>{data.status || 'Active'}</Text>
          </View>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* HERO CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileSub}>{data.licenseNumber || data.license || 'SBC Verified'} · {data.specialty || 'Advocate'}</Text>
            <Text style={styles.profileSubMuted}>{data.city || 'Karachi, Sindh'} · {data.experience ?? '8'} yrs exp</Text>
          </View>
          {data.rating > 0 && (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingVal}>{data.rating} / 5.0</Text>
              <Text style={styles.ratingCount}>{data.totalReviews || 0} reviews</Text>
            </View>
          )}
        </View>

        {/* TABS */}
        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── PERSONAL TAB ── */}
        {activeTab === 'Personal' && (
          <>
            <Section title="Personal Information">
              <InfoRow label="Full Name"          value={displayName} />
              <InfoRow label="Gender"             value={data.gender || 'Not specified'} />
              <InfoRow label="Date of Birth"      value={data.dob || '—'} />
              {/* CNIC kept strictly for Lawyer Sindh Bar Council verification */}
              <InfoRow label="CNIC (SBC Verify)"  value={data.cnic || '42101-*******-*'} highlight />
            </Section>

            <Section title="Contact Information">
              <InfoRow label="Email"          value={data.email || 'advocate@sindhbar.gov.pk'} />
              <InfoRow label="Phone"          value={data.phone || '+92 300 0000000'} />
              <InfoRow label="Office Address" value={data.officeAddress || 'High Court Chamber, Sindh'} />
              <InfoRow label="City"           value={data.city || 'Karachi'} />
              <InfoRow label="Province"       value="Sindh, Pakistan" />
            </Section>
          </>
        )}

        {/* ── PROFESSIONAL TAB ── */}
        {activeTab === 'Professional' && (
          <>
            <Section title="Professional Credentials">
              <InfoRow label="License Number"          value={data.licenseNumber || data.license || 'SBC-4421'} />
              <InfoRow label="Bar Council Reg. No."   value={data.barCouncil || 'SBC/KHI/2019'} />
              <InfoRow label="Specialization"          value={data.specialty || 'Constitutional & Civil'} />
              <InfoRow label="Years of Experience"     value={data.experience != null ? `${data.experience} years` : '8 years'} />
              <InfoRow label="Qualifications"          value={data.qualifications || 'LL.B (Hons), LL.M'} />
              <InfoRow label="University"              value={data.university || 'University of Karachi'} />
              <InfoRow label="Current Law Firm"        value={data.lawFirm || 'Independent Chamber'} />
              <InfoRow label="Languages"               value={data.languages || 'English, Urdu, Sindhi'} />
            </Section>

            <Section title="Practice Information">
              <InfoRow label="Consultation Fee"      value={data.fee || 'Pro Bono / Subsidized'} />
              <InfoRow label="Available Days"        value={data.availableDays || 'Mon – Fri'} />
              <InfoRow label="Courts of Practice"    value={data.courts || 'High Court of Sindh, City Courts'} />
            </Section>

            <Section title="Professional Bio">
              <Text style={styles.bioText}>{data.bio || 'Advocate High Court practicing constitutional, human rights, and civil litigation across Sindh tribunals.'}</Text>
            </Section>
          </>
        )}

        {/* ── PERFORMANCE TAB ── */}
        {activeTab === 'Performance' && (
          <>
            <Section title="Case Statistics">
              <View style={styles.perfGrid}>
                {[
                  { label: 'Total Cases',   value: data.totalCases || data.cases || 42 },
                  { label: 'Active Matters',value: data.activeCases || 11 },
                  { label: 'Disposed/Won',  value: data.completedCases || 31 },
                  { label: 'Rating',        value: data.rating > 0 ? `${data.rating} / 5.0` : '4.8 / 5.0' },
                  { label: 'Reviews',       value: data.totalReviews || 19 },
                ].map((item, i) => (
                  <View key={i} style={styles.perfCard}>
                    <Text style={styles.perfVal}>{item.value}</Text>
                    <Text style={styles.perfLbl}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </Section>
          </>
        )}

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'Account' && (
          <>
            <Section title="Account Management">
              <InfoRow label="Username"         value={data.username || (displayName.toLowerCase().replace(/\s+/g, '.') + '.sbc')} />
              <InfoRow label="Account Status"   value={data.status || 'Active'} highlight />
              <InfoRow label="Registered On"    value={data.registeredOn || '12 Oct 2024'} />
              <InfoRow label="Verification"     value="SBC Bar License Valid" />
            </Section>

            <Section title="Administrative Actions">
              <TouchableOpacity style={styles.actionBtnPrimary} activeOpacity={0.8}>
                <Text style={styles.actionBtnPrimaryTxt}>✓ VERIFY SBC CREDENTIALS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnWarn} activeOpacity={0.8}>
                <Text style={styles.actionBtnWarnTxt}>Suspend License</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnDanger} activeOpacity={0.8}>
                <Text style={styles.actionBtnDangerTxt}>✕ Revoke & Remove Record</Text>
              </TouchableOpacity>
            </Section>
          </>
        )}

      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="admin" activeTab="lawyers" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060201' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  notFound: { fontSize: 16, color: '#C8A892', marginBottom: 16 },
  backBtnPill: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnPillText: { color: '#0A0301', fontWeight: '800', fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },
  statusPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  profileCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.82)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileAvatarText: { fontSize: 18, fontWeight: '900', color: '#FFEED6' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800', color: '#FFF5E8' },
  profileSub: { fontSize: 12, color: '#FFB74D', marginTop: 2, fontWeight: '600' },
  profileSubMuted: { fontSize: 11, color: 'rgba(255, 220, 180, 0.55)', marginTop: 2 },
  ratingBox: { alignItems: 'center', paddingLeft: 8 },
  ratingVal: { fontSize: 14, fontWeight: '800', color: '#FFB74D' },
  ratingCount: { fontSize: 10, color: 'rgba(255, 220, 180, 0.45)', marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(25, 12, 5, 0.72)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FF9500',
  },
  tabText: { fontSize: 12, fontWeight: '700', color: 'rgba(255, 220, 180, 0.6)' },
  tabTextActive: { color: '#0A0301', fontWeight: '900' },
  section: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#FFB74D', marginBottom: 12, letterSpacing: 0.3 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: { fontSize: 12, color: 'rgba(255, 220, 180, 0.6)', fontWeight: '600', flex: 1 },
  infoValue: { fontSize: 12, color: '#FFF5E8', fontWeight: '700', flex: 1.4, textAlign: 'right' },
  infoHighlight: { color: '#FF9500', fontWeight: '800' },
  bioText: { fontSize: 13, color: 'rgba(255, 235, 215, 0.8)', lineHeight: 20 },
  perfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  perfCard: {
    backgroundColor: 'rgba(15, 7, 2, 0.85)',
    borderRadius: 14,
    padding: 14,
    width: (width - 64) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.2)',
  },
  perfVal: { fontSize: 20, fontWeight: '900', color: '#FFF5E8' },
  perfLbl: { fontSize: 11, color: 'rgba(255, 220, 180, 0.55)', marginTop: 4, fontWeight: '600' },
  actionBtnPrimary: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionBtnPrimaryTxt: { fontSize: 12, fontWeight: '900', color: '#0A0301', letterSpacing: 0.5 },
  actionBtnWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  actionBtnWarnTxt: { fontSize: 12, fontWeight: '800', color: '#f59e0b' },
  actionBtnDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  actionBtnDangerTxt: { fontSize: 12, fontWeight: '800', color: '#ef4444' },
});
