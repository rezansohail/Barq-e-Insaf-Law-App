import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function NGOAnalytics() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [selectedRange, setSelectedRange] = useState('This Month');

  // Hardware back returns to NGOHome
  useAppNavigation({ isHome: false, homeRoute: '/(ngo)/NGOHome' });

  const ranges = ['This Week', 'This Month', 'Q4 2026', 'Full Year'];

  const districtMetrics = [
    { district: 'Karachi Central', reported: 142, resolved: 118, rate: '83%' },
    { district: 'Karachi East',    reported: 98,  resolved: 79,  rate: '80%' },
    { district: 'Hyderabad',       reported: 76,  resolved: 58,  rate: '76%' },
    { district: 'Sukkur',          reported: 52,  resolved: 39,  rate: '75%' },
    { district: 'Larkana',         reported: 44,  resolved: 31,  rate: '70%' },
  ];

  const categoryBreakdown = [
    { label: 'Property & Land Rights', percentage: 42, color: '#FF9500' },
    { label: 'Family & Custody',       percentage: 28, color: '#FFA726' },
    { label: 'Criminal PPC Defense',   percentage: 18, color: '#FF7043' },
    { label: 'Labor & Civil Disputes', percentage: 12, color: '#FFCA28' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Obsidian Background */}
      <LinearGradient
        colors={['#0A0402', '#060201', '#020101']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient halos */}
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
        {/* Modern '< Legal Trends' Header */}
        <AppHeader
          title="Legal Trends"
          showBack={true}
          homeRoute="/(ngo)/NGOHome"
          role="ngo"
          subtitle="Observatory"
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Time range selector */}
          <View style={styles.rangesRow}>
            {ranges.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.rangePill, selectedRange === r && styles.rangePillActive]}
                onPress={() => setSelectedRange(r)}
              >
                <Text style={[styles.rangeText, selectedRange === r && styles.rangeTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Top Key Performance Cards */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>412</Text>
              <Text style={styles.kpiLabel}>Total Cases Reported</Text>
              <Text style={styles.kpiSub}>+14% vs last period</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>78.4%</Text>
              <Text style={styles.kpiLabel}>Resolution Rate</Text>
              <Text style={styles.kpiSub}>High Court verified</Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Case Categories Across Sindh</Text>
            {categoryBreakdown.map((cat, i) => (
              <View key={i} style={styles.catRow}>
                <View style={styles.catLabelRow}>
                  <Text style={styles.catName}>{cat.label}</Text>
                  <Text style={styles.catPct}>{cat.percentage}%</Text>
                </View>
                <View style={styles.catBarTrack}>
                  <View
                    style={[
                      styles.catBarFill,
                      { width: `${cat.percentage}%`, backgroundColor: cat.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* District Breakdown Table */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>District Legal Accessibility</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableColHeader, { flex: 2 }]}>District</Text>
              <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>Reported</Text>
              <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>Resolved</Text>
              <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>Rate</Text>
            </View>

            {districtMetrics.map((dm, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableDistrict, { flex: 2 }]}>{dm.district}</Text>
                <Text style={[styles.tableVal, { flex: 1, textAlign: 'center' }]}>{dm.reported}</Text>
                <Text style={[styles.tableVal, { flex: 1, textAlign: 'center', color: '#4ADE80' }]}>{dm.resolved}</Text>
                <Text style={[styles.tableRate, { flex: 1, textAlign: 'right' }]}>{dm.rate}</Text>
              </View>
            ))}
          </View>

          {/* Export Action */}
          <View style={styles.actionBox}>
            <LiquidGlassButton
              title="📄 EXPORT COMPLETE REPORT"
              onPress={() => router.push('/(ngo)/ExportReports')}
            />
          </View>
        </ScrollView>

        {/* Consistent Bottom Nav */}
        <BottomNavBar role="ngo" activeTab="analytics" />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.15)',
  },
  simpleBackBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  simpleBackText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFB74D',
    lineHeight: 26,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFEED6',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 10.5,
    color: 'rgba(255, 180, 80, 0.65)',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  rangesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  rangePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.18)',
    alignItems: 'center',
  },
  rangePillActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.22)',
    borderColor: '#FF9500',
  },
  rangeText: {
    fontSize: 10.5,
    color: 'rgba(255, 235, 215, 0.65)',
    fontWeight: '600',
  },
  rangeTextActive: {
    color: '#FFEED6',
    fontWeight: '800',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: 'rgba(24, 12, 5, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.22)',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFEED6',
  },
  kpiLabel: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.75)',
    fontWeight: '600',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: '#FFB74D',
    marginTop: 4,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: 'rgba(24, 12, 5, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.22)',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFEED6',
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  catRow: {
    marginBottom: 12,
  },
  catLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catName: {
    fontSize: 11.5,
    color: 'rgba(255, 235, 215, 0.85)',
    fontWeight: '600',
  },
  catPct: {
    fontSize: 11.5,
    color: '#FFB74D',
    fontWeight: '700',
  },
  catBarTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.15)',
    marginBottom: 8,
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 180, 80, 0.65)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.08)',
    alignItems: 'center',
  },
  tableDistrict: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFEED6',
  },
  tableVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255, 235, 215, 0.75)',
  },
  tableRate: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFB74D',
  },
  actionBox: {
    marginTop: 8,
    marginBottom: 20,
  },
});
