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

  const safeBg = isDarkMode ? '#13131A' : '#FAF8F5';

  const filteredCases = realCases.filter((c) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PROPERTY') return /property|land/i.test(c.type || '');
    if (activeFilter === 'FAMILY') return /family|custody|khula/i.test(c.type || '');
    if (activeFilter === 'LEADS') return !!c.mediaCoverageRequested;
    return true;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      <AppHeader
        title={t('nav.map', 'Sindh Case Geography')}
        showBack={true}
        homeRoute="/(media)/MediaHome"
        role="media"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={[styles.introCard, { backgroundColor: isDarkMode ? '#1B1C26' : '#FFFFFF', borderColor: isDarkMode ? '#282A3A' : 'rgba(234, 88, 12, 0.25)' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.introTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04', marginBottom: 0 }]}>
              {t('map.judicialMap', 'Sindh Judicial Reporting Map')}
            </Text>
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>LIVE HEATMAP API</Text>
            </View>
          </View>
          <Text style={[styles.introSub, { color: isDarkMode ? '#E5E7EB' : '#4A2A15' }]}>
            Geographic density of active dispute dockets across Sindh. Litigant identities remain 100% anonymized with zero CNIC or phone disclosures.
          </Text>

          {/* Quick Stats Chips */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: isDarkMode ? '#12131A' : '#F3EFEA', padding: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#FFA726', fontWeight: '900', fontSize: 14 }}>{summary.totalActiveCases || realCases.length}</Text>
              <Text style={{ color: isDarkMode ? '#9CA3AF' : '#664530', fontSize: 9.5, fontWeight: '700' }}>
                {t('map.activeDockets', 'Active Dockets')}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDarkMode ? '#12131A' : '#F3EFEA', padding: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#38BDF8', fontWeight: '900', fontSize: 14 }}>{summary.districtsCovered || 2}</Text>
              <Text style={{ color: isDarkMode ? '#9CA3AF' : '#664530', fontSize: 9.5, fontWeight: '700' }}>
                {t('analytics.districts', 'Districts')}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDarkMode ? '#12131A' : '#F3EFEA', padding: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#EF4444', fontWeight: '900', fontSize: 14 }}>
                {translateDistrict(summary.topHotspotDistrict || 'Karachi')}
              </Text>
              <Text style={{ color: isDarkMode ? '#9CA3AF' : '#664530', fontSize: 9.5, fontWeight: '700' }}>
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
              { id: 'LEADS', label: t('map.mediaLeads', '🚨 Media Leads') },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  backgroundColor: activeFilter === f.id ? '#FF9500' : (isDarkMode ? '#232534' : '#E8E4DF'),
                }}
              >
                <Text style={{
                  color: activeFilter === f.id ? '#000000' : (isDarkMode ? '#D1D5DB' : '#573D2C'),
                  fontSize: 10,
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
