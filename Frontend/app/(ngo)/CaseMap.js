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
import api from '../../constants/api';

export default function NGOCaseMap() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  useAppNavigation({ isHome: false, homeRoute: '/(ngo)/NGOHome' });

  const [realCases, setRealCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalActiveCases: 0, districtsCovered: 0, topHotspotDistrict: 'Sindh' });
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;

    async function loadMapData() {
      try {
        setLoading(true);
        // Connect directly to live NGO Heatmap API
        const res = await api.get('/ngo/analytics/heatmap');
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
        console.warn('[NGO_CASE_MAP] API error, falling back:', err.message);
        const fallback = await fetchRealSindhCases();
        if (isMounted) setRealCases(fallback);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMapData();
    return () => { isMounted = false; };
  }, []);

  const safeBg = isDarkMode ? '#080402' : '#FAF8F5';

  const filteredCases = realCases.filter((c) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PROPERTY') return /property|land/i.test(c.type || '');
    if (activeFilter === 'FAMILY') return /family|custody|khula/i.test(c.type || '');
    if (activeFilter === 'AID') return !!c.ngoAidRequested || !!c.ngoAssistanceOffered;
    return true;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      <AppHeader
        title="Sindh Judicial Case Map"
        showBack={true}
        homeRoute="/(ngo)/NGOHome"
        role="ngo"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={[styles.introCard, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.94)' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.35)' : 'rgba(234, 88, 12, 0.25)' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.introTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04', marginBottom: 0 }]}>
              NCHD Vulnerability Radar Map
            </Text>
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>STATUTORY LIVE API</Text>
            </View>
          </View>
          <Text style={[styles.introSub, { color: isDarkMode ? 'rgba(255, 235, 215, 0.75)' : '#4A2A15' }]}>
            Geographic vulnerability tracking of active legal disputes across Sindh. Marginalized citizen privacy is strictly safeguarded with zero personal disclosures.
          </Text>

          {/* Quick Stats Chips */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: isDarkMode ? '#1B0E07' : '#F3EFEA', padding: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#FFA726', fontWeight: '900', fontSize: 14 }}>{summary.totalActiveCases || realCases.length}</Text>
              <Text style={{ color: isDarkMode ? 'rgba(255, 220, 180, 0.7)' : '#664530', fontSize: 9.5, fontWeight: '700' }}>Active Dockets</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDarkMode ? '#1B0E07' : '#F3EFEA', padding: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#00E5FF', fontWeight: '900', fontSize: 14 }}>{summary.districtsCovered || 2}</Text>
              <Text style={{ color: isDarkMode ? 'rgba(255, 220, 180, 0.7)' : '#664530', fontSize: 9.5, fontWeight: '700' }}>Districts</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDarkMode ? '#1B0E07' : '#F3EFEA', padding: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#EF4444', fontWeight: '900', fontSize: 14 }}>{summary.topHotspotDistrict || 'Karachi'}</Text>
              <Text style={{ color: isDarkMode ? 'rgba(255, 220, 180, 0.7)' : '#664530', fontSize: 9.5, fontWeight: '700' }}>Focal Hotspot</Text>
            </View>
          </View>

          {/* Category Filter Pills */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            {[
              { id: 'ALL', label: 'All Cases' },
              { id: 'PROPERTY', label: 'Land Rights' },
              { id: 'FAMILY', label: 'Family Aid' },
              { id: 'AID', label: '🏛️ Pro-Bono Aid' },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  backgroundColor: activeFilter === f.id ? '#FF9500' : (isDarkMode ? 'rgba(255, 149, 0, 0.15)' : '#E8E4DF'),
                }}
              >
                <Text style={{
                  color: activeFilter === f.id ? '#000000' : (isDarkMode ? '#FFEED6' : '#573D2C'),
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
              Querying Sindh District Database...
            </Text>
          </View>
        ) : (
          <SindhCasesMap cases={filteredCases} />
        )}
      </ScrollView>

      {/* Shared Bottom Nav */}
      <BottomNavBar role="ngo" activeTab="map" />
    </SafeAreaView>
  );
}
