import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './CaseMap.styles';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import SindhCasesMap from '../../components/SindhCasesMap';
import { fetchRealSindhCases } from '../../constants/realCasesStore';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';
import api from '../../constants/api';

export default function MediaCaseMap() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  const { t, currentLang, translateDistrict } = useAppTranslation();
  useAppNavigation({ isHome: false, homeRoute: '/(media)/MediaHome' });

  const [realCases, setRealCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalActiveCases: 0, districtsCovered: 0, topHotspotDistrict: 'Sindh' });
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;

    async function loadMapData() {
      try {
        setLoading(true);
        // Connect directly to live Media Heatmap API
        const res = await api.get('/media/analytics/heatmap');
        if (res.data?.livePointers && isMounted) {
          setRealCases(res.data.livePointers);
          if (res.data.summary) {
            setSummary(res.data.summary);
          }
        } else {
          const fallback = await fetchRealSindhCases();
          if (isMounted) setRealCases(fallback);
        }
      } catch (err) {
        console.warn('[CASE_MAP] Falling back to real cases store:', err.message);
        const fallback = await fetchRealSindhCases();
        if (isMounted) setRealCases(fallback);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMapData();
    return () => { isMounted = false; };
  }, []);

  const { isDark } = useAppTheme();
  const safeBg = isDark ? '#080402' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(34, 16, 12, 0.95)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(245, 158, 11, 0.40)' : 'rgba(255, 149, 0, 0.20)';
  const textPrimary = isDark ? '#FFF5E8' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 230, 215, 0.75)' : '#664530';
  const chipBg = isDark ? 'rgba(26, 12, 5, 0.85)' : '#F2ECE4';

  const filteredCases = realCases.filter((c) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PROPERTY') return /property|land/i.test(c.type || '');
    if (activeFilter === 'FAMILY') return /family|custody|khula/i.test(c.type || '');
    if (activeFilter === 'LEADS') return !!c.mediaCoverageRequested;
    return true;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      <AppHeader
        title={t('nav.map', 'Sindh Case Geography')}
        showBack={true}
        homeRoute="/(media)/MediaHome"
        role="media"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={[styles.introCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.introTitle, { color: textPrimary, marginBottom: 0 }]}>
              {t('map.judicialMap', 'Sindh Judicial Reporting Map')}
            </Text>
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>LIVE HEATMAP API</Text>
            </View>
          </View>
          <Text style={[styles.introSub, { color: textSecondary }]}>
            Geographic density of active dispute dockets across Sindh. Litigant identities remain 100% anonymized with zero CNIC or phone disclosures.
          </Text>

          {/* Quick Stats Chips */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: chipBg, padding: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: isDark ? 'rgba(245, 158, 11, 0.20)' : 'rgba(245, 158, 11, 0.12)' }}>
              <Text style={{ color: '#FFA726', fontWeight: '900', fontSize: 14 }}>{summary.totalActiveCases || realCases.length}</Text>
              <Text style={{ color: textSecondary, fontSize: 9.5, fontWeight: '700' }}>
                {t('map.activeDockets', 'Active Dockets')}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: chipBg, padding: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: isDark ? 'rgba(245, 158, 11, 0.20)' : 'rgba(245, 158, 11, 0.12)' }}>
              <Text style={{ color: '#38BDF8', fontWeight: '900', fontSize: 14 }}>{summary.districtsCovered || 2}</Text>
              <Text style={{ color: textSecondary, fontSize: 9.5, fontWeight: '700' }}>
                {t('analytics.districts', 'Districts')}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: chipBg, padding: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: isDark ? 'rgba(245, 158, 11, 0.20)' : 'rgba(245, 158, 11, 0.12)' }}>
              <Text style={{ color: '#EF4444', fontWeight: '900', fontSize: 14 }}>
                {translateDistrict(summary.topHotspotDistrict || 'Karachi')}
              </Text>
              <Text style={{ color: textSecondary, fontSize: 9.5, fontWeight: '700' }}>
                {t('media.hotspotDistrict', 'Top Hotspot')}
              </Text>
            </View>
          </View>

          {/* Category Filter Pills */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            {[
              { id: 'ALL', label: t('map.allDockets', 'All Dockets') },
              { id: 'PROPERTY', label: t('map.propertyLand', 'Property & Land') },
              { id: 'FAMILY', label: t('map.family', 'Family') },
              { id: 'LEADS', label: t('map.mediaLeads', 'Media Leads') },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  backgroundColor: activeFilter === f.id ? '#F59E0B' : chipBg,
                  borderWidth: 1,
                  borderColor: activeFilter === f.id ? '#D97706' : (isDark ? 'rgba(245, 158, 11, 0.20)' : 'rgba(245, 158, 11, 0.15)'),
                }}
              >
                <Text style={{
                  color: activeFilter === f.id ? '#000000' : textSecondary,
                  fontSize: 10.5,
                  fontWeight: '700',
                }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color="#FF9500" size="large" />
            <Text style={{ marginTop: 12, fontSize: 12, color: isDarkMode ? '#FFB74D' : '#C2410C', fontWeight: '700' }}>
              Querying Sindh Judicial Docket...
            </Text>
          </View>
        ) : (
          <SindhCasesMap cases={filteredCases} />
        )}
      </ScrollView>

      {/* Shared Bottom Nav */}
      <BottomNavBar role="media" activeTab="map" />
    </SafeAreaView>
  );
}
