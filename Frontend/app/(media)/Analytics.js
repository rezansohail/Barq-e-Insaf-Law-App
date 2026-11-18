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
<<<<<<< HEAD
import { useAppTranslation } from '../../utils/translationHelper';
import api from '../../constants/api';
=======
>>>>>>> 2f0fafeb8c8aae19704bfcb258be0756f36f51aa

export default function MediaAnalytics() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  const { t, currentLang, translateDistrict, translateCategory } = useAppTranslation();
  const { width, height } = useWindowDimensions();
  const [selectedRange, setSelectedRange] = useState('This Month');

  useAppNavigation({ isHome: false, homeRoute: '/(media)/MediaHome' });

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
    { label: 'Family & Custody',       percentage: 28, color: '#00E5FF' },
    { label: 'Criminal PPC Defense',   percentage: 18, color: '#FF7043' },
    { label: 'Labor & Civil Disputes', percentage: 12, color: '#C084FC' },
  ];

  const safeBg = isDarkMode ? '#13131A' : '#FAF8F5';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      <AppHeader
        title={t('analytics.title', 'Journalism Beat Analytics')}
        showBack={true}
        homeRoute="/(media)/MediaHome"
        role="media"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Time range selector */}
        <View style={styles.rangeRow}>
          {ranges.map((r) => {
            let label = r;
            if (r === 'This Week') label = t('analytics.thisWeek', 'This Week');
            else if (r === 'This Month') label = t('analytics.thisMonth', 'This Month');
            else if (r === 'Q4 2026') label = t('analytics.q4', 'Q4 2026');
            else if (r === 'Full Year') label = t('analytics.fullYear', 'Full Year');

            return (
              <TouchableOpacity
                key={r}
                style={[
                  styles.rangeTab,
                  selectedRange === r && styles.rangeTabActive,
                ]}
                onPress={() => setSelectedRange(r)}
              >
                <Text
                  style={[
                    styles.rangeText,
                    selectedRange === r && styles.rangeTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

<<<<<<< HEAD
        {/* Live Summary Strip */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#1B1C26' : '#FFFFFF', borderColor: isDarkMode ? '#282A3A' : 'rgba(234, 88, 12, 0.25)' }]}>
            <Text style={{ color: '#FFA726', fontSize: 16, fontWeight: '900' }}>{summary.totalActiveCases}</Text>
            <Text style={{ color: isDarkMode ? '#9CA3AF' : '#664530', fontSize: 9.5, fontWeight: '700' }}>
              {t('analytics.totalCases', 'TOTAL CASES')}
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#1B1C26' : '#FFFFFF', borderColor: isDarkMode ? '#282A3A' : 'rgba(234, 88, 12, 0.25)' }]}>
            <Text style={{ color: '#38BDF8', fontSize: 16, fontWeight: '900' }}>{summary.districtsCovered}</Text>
            <Text style={{ color: isDarkMode ? '#9CA3AF' : '#664530', fontSize: 9.5, fontWeight: '700' }}>
              {t('analytics.districts', 'DISTRICTS')}
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#1B1C26' : '#FFFFFF', borderColor: isDarkMode ? '#282A3A' : 'rgba(234, 88, 12, 0.25)' }]}>
            <Text style={{ color: '#4ADE80', fontSize: 16, fontWeight: '900' }}>{summary.verifiedCourtDocketRate || '100%'}</Text>
            <Text style={{ color: isDarkMode ? '#9CA3AF' : '#664530', fontSize: 9.5, fontWeight: '700' }}>
              {t('analytics.docketVerified', 'DOCKET VERIFIED')}
            </Text>
          </View>
=======
        {/* Category Breakdown Card */}
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1B1C26' : '#FFFFFF', borderColor: isDarkMode ? '#282A3A' : 'rgba(234, 88, 12, 0.25)' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Sindh Case Beat Coverage</Text>
          <Text style={[styles.cardSub, { color: isDarkMode ? '#9CA3AF' : '#664530' }]}>
            Verified distribution by legal category
          </Text>

          {categoryBreakdown.map((cat) => (
            <View key={cat.label} style={styles.breakdownRow}>
              <View style={styles.breakdownMeta}>
                <Text style={[styles.catLabel, { color: isDarkMode ? '#E5E7EB' : '#1A0C04' }]}>{cat.label}</Text>
                <Text style={[styles.catPercent, { color: cat.color }]}>
                  {cat.percentage}%
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${cat.percentage}%`, backgroundColor: cat.color },
                  ]}
                />
              </View>
            </View>
          ))}
>>>>>>> 2f0fafeb8c8aae19704bfcb258be0756f36f51aa
        </View>

        {/* District Metrics Table */}
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1B1C26' : '#FFFFFF', borderColor: isDarkMode ? '#282A3A' : 'rgba(234, 88, 12, 0.25)' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>District Resolution Ratios</Text>
          <Text style={[styles.cardSub, { color: isDarkMode ? '#9CA3AF' : '#664530' }]}>
            Court case filings vs counsel resolution
          </Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.thText, { flex: 2 }]}>District</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Reported</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Resolved</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Rate</Text>
          </View>
<<<<<<< HEAD
        ) : (
          <>
            {/* Category Breakdown Card */}
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1B1C26' : '#FFFFFF', borderColor: isDarkMode ? '#282A3A' : 'rgba(234, 88, 12, 0.25)' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
                  {t('analytics.beatCoverage', 'Sindh Case Beat Coverage')}
                </Text>
                <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38BDF8', borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#38BDF8', fontSize: 9, fontWeight: '800' }}>
                    {t('analytics.apiSynced', 'API SYNCED')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardSub, { color: isDarkMode ? '#9CA3AF' : '#664530' }]}>
                {t('analytics.categoryDistDesc', 'Verified distribution by legal category')}
              </Text>

              {categoryBreakdown.map((cat) => (
                <View key={cat.label} style={styles.breakdownRow}>
                  <View style={styles.breakdownMeta}>
                    <Text style={[styles.catLabel, { color: isDarkMode ? '#E5E7EB' : '#1A0C04' }]}>
                      {translateCategory(cat.label)}
                    </Text>
                    <Text style={[styles.catPercent, { color: cat.color }]}>
                      {cat.percentage}% ({cat.count || 0})
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${cat.percentage}%`, backgroundColor: cat.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* District Metrics Table */}
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1B1C26' : '#FFFFFF', borderColor: isDarkMode ? '#282A3A' : 'rgba(234, 88, 12, 0.25)' }]}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
                {t('analytics.districtRatios', 'District Resolution Ratios')}
              </Text>
              <Text style={[styles.cardSub, { color: isDarkMode ? '#9CA3AF' : '#664530' }]}>
                {t('analytics.courtFilingDesc', 'Court case filings vs counsel resolution by jurisdiction')}
              </Text>

              <View style={styles.tableHeader}>
                <Text style={[styles.thText, { flex: 2 }]}>{t('analytics.thDistrict', 'District')}</Text>
                <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>{t('analytics.thActive', 'Active')}</Text>
                <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>{t('analytics.thRate', 'Rate')}</Text>
                <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>{t('analytics.thSeverity', 'Severity')}</Text>
              </View>

              {districtMetrics.map((dm) => (
                <View key={dm.district} style={styles.tableRow}>
                  <Text style={[styles.tableDistrict, { flex: 2, color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
                    {translateDistrict(dm.district)}
                  </Text>
                  <Text style={[styles.tableNum, { flex: 1, textAlign: 'center', color: isDarkMode ? '#D1D5DB' : '#664530' }]}>{dm.reported}</Text>
                  <Text style={[styles.tableNum, { flex: 1, textAlign: 'center', color: isDarkMode ? '#D1D5DB' : '#664530' }]}>{dm.rate}</Text>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <View style={{ backgroundColor: dm.badge === 'HOTSPOT' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)', borderColor: dm.badge === 'HOTSPOT' ? '#EF4444' : '#10B981', borderWidth: 1, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 }}>
                      <Text style={{ color: dm.badge === 'HOTSPOT' ? '#EF4444' : '#10B981', fontSize: 9, fontWeight: '800' }}>{dm.badge}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
=======

          {districtMetrics.map((dm) => (
            <View key={dm.district} style={styles.tableRow}>
              <Text style={[styles.tableDistrict, { flex: 2, color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
                {dm.district}
              </Text>
              <Text style={[styles.tableNum, { flex: 1, textAlign: 'center', color: isDarkMode ? '#D1D5DB' : '#664530' }]}>{dm.reported}</Text>
              <Text style={[styles.tableNum, { flex: 1, textAlign: 'center', color: isDarkMode ? '#D1D5DB' : '#664530' }]}>{dm.resolved}</Text>
              <Text style={[styles.tableRate, { flex: 1, textAlign: 'right' }]}>{dm.rate}</Text>
            </View>
          ))}
        </View>
>>>>>>> 2f0fafeb8c8aae19704bfcb258be0756f36f51aa

        {/* Export Action */}
        <View style={styles.actionBox}>
          <LiquidGlassButton
            title={t('analytics.exportBrief', 'EXPORT PRESS BRIEF')}
            onPress={() => router.push('/(media)/ExportReports')}
          />
        </View>
      </ScrollView>

      {/* Shared Bottom Nav */}
      <BottomNavBar role="media" activeTab="analytics" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080402' },
  scrollContent: { padding: 16, paddingBottom: 110 },
  rangeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(25, 12, 5, 0.85)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  rangeTabActive: {
    backgroundColor: '#FF7A00',
  },
  rangeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 235, 215, 0.65)',
  },
  rangeTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 11,
    marginBottom: 14,
  },
  breakdownRow: {
    marginBottom: 12,
  },
  breakdownMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  catPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  barTrack: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 160, 40, 0.2)',
    marginBottom: 6,
  },
  thText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFB74D',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableDistrict: {
    fontSize: 12,
    fontWeight: '700',
  },
  tableNum: {
    fontSize: 12,
    color: 'rgba(255, 220, 180, 0.8)',
    fontWeight: '600',
  },
  tableRate: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '800',
  },
  actionBox: {
    marginTop: 8,
    marginBottom: 12,
  },
});
