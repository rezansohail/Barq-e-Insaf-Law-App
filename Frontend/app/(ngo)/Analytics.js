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

import { useAppTheme } from '../../context/ThemeContext';

export default function NGOAnalytics() {
  const router = useRouter();
  const { isDark } = useAppTheme();
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
    { label: 'Property & Land Rights', percentage: 42, color: '#10B981' },
    { label: 'Family & Custody',       percentage: 28, color: '#34D399' },
    { label: 'Criminal PPC Defense',   percentage: 18, color: '#F59E0B' },
    { label: 'Labor & Civil Disputes', percentage: 12, color: '#06B6D4' },
  ];

  const safeBg = isDark ? '#080402' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(20, 32, 24, 0.95)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(16, 185, 129, 0.40)' : 'rgba(16, 185, 129, 0.20)';
  const textPrimary = isDark ? '#FFF5E8' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(230, 255, 245, 0.75)' : '#1B3B2B';
  const pillBg = isDark ? 'rgba(20, 32, 24, 0.85)' : '#EBF5EE';
  const pillBorder = isDark ? 'rgba(16, 185, 129, 0.30)' : 'rgba(16, 185, 129, 0.20)';

  return (
    <View style={[styles.container, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ['#0A0402', '#07150E', '#020604'] : ['#FAF7F2', '#F1F7F4', '#E6EFE9']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient halos */}
      {isDark && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.ambientHalo,
              {
                top: -height * 0.05,
                left: -width * 0.12,
                width: width * 0.75,
                height: width * 0.75,
                backgroundColor: 'rgba(16, 185, 129, 0.09)',
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
                backgroundColor: 'rgba(5, 150, 105, 0.07)',
              },
            ]}
          />
        </>
      )}

      <SafeAreaView style={styles.safeArea}>
        {/* Modern Header */}
        <AppHeader
          title="Legal Aid Trends"
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
                style={[
                  styles.rangePill,
                  { backgroundColor: selectedRange === r ? '#10B981' : pillBg, borderColor: selectedRange === r ? '#059669' : pillBorder },
                ]}
                onPress={() => setSelectedRange(r)}
              >
                <Text style={[styles.rangeText, { color: selectedRange === r ? '#FFFFFF' : textSecondary, fontWeight: selectedRange === r ? '800' : '600' }]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Top Key Performance Cards */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.kpiValue, { color: textPrimary }]}>412</Text>
              <Text style={[styles.kpiLabel, { color: textSecondary }]}>Total Cases Reported</Text>
              <Text style={[styles.kpiSub, { color: '#10B981' }]}>+14% vs last period</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[styles.kpiValue, { color: textPrimary }]}>78.4%</Text>
              <Text style={[styles.kpiLabel, { color: textSecondary }]}>Resolution Rate</Text>
              <Text style={[styles.kpiSub, { color: '#34D399' }]}>High Court verified</Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.sectionHeader, { color: textPrimary }]}>Case Categories Across Sindh</Text>
            {categoryBreakdown.map((cat, i) => (
              <View key={i} style={styles.catRow}>
                <View style={styles.catLabelRow}>
                  <Text style={[styles.catName, { color: textPrimary }]}>{cat.label}</Text>
                  <Text style={[styles.catPct, { color: '#10B981' }]}>{cat.percentage}%</Text>
                </View>
                <View style={[styles.catBarTrack, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)' }]}>
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
          <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.sectionHeader, { color: textPrimary }]}>District Legal Accessibility</Text>
            <View style={[styles.tableHeaderRow, { borderBottomColor: isDark ? 'rgba(16, 185, 129, 0.20)' : 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.tableColHeader, { flex: 2, color: '#10B981' }]}>District</Text>
              <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center', color: '#10B981' }]}>Reported</Text>
              <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center', color: '#10B981' }]}>Resolved</Text>
              <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right', color: '#10B981' }]}>Rate</Text>
            </View>

            {districtMetrics.map((dm, idx) => (
              <View key={idx} style={[styles.tableRow, { borderBottomColor: isDark ? 'rgba(16, 185, 129, 0.10)' : 'rgba(16, 185, 129, 0.08)' }]}>
                <Text style={[styles.tableDistrict, { flex: 2, color: textPrimary }]}>{dm.district}</Text>
                <Text style={[styles.tableVal, { flex: 1, textAlign: 'center', color: textSecondary }]}>{dm.reported}</Text>
                <Text style={[styles.tableVal, { flex: 1, textAlign: 'center', color: '#10B981', fontWeight: '800' }]}>{dm.resolved}</Text>
                <Text style={[styles.tableRate, { flex: 1, textAlign: 'right', color: '#10B981' }]}>{dm.rate}</Text>
              </View>
            ))}
          </View>

          {/* Export Action */}
          <View style={styles.actionBox}>
            <LiquidGlassButton
              title="EXPORT COMPLETE REPORT"
              onPress={() => router.push('/(ngo)/ExportReports')}
              variant="emerald"
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
