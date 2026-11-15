import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './CaseMap.styles';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import SindhCasesMap from '../../components/SindhCasesMap';
import { fetchRealSindhCases } from '../../constants/realCasesStore';
import { useAppTheme } from '../../context/ThemeContext';

export default function CaseMap() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  useAppNavigation({ isHome: false, homeRoute: '/(ngo)/NGOHome' });

  const [realCases, setRealCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchRealSindhCases().then((cases) => {
      if (isMounted) {
        setRealCases(cases);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const safeBg = isDarkMode ? '#080402' : '#FAF8F5';

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
          <Text style={[styles.introTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
            Sindh Real-Time Dispute Map
          </Text>
          <Text style={[styles.introSub, { color: isDarkMode ? 'rgba(255, 235, 215, 0.75)' : '#4A2A15' }]}>
            Live geographic distribution of disputes currently registered across Sindh districts. Pointers reflect dispute category and age without citizen personal identifiers.
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color="#FF9500" size="large" />
            <Text style={{ marginTop: 12, fontSize: 12, color: isDarkMode ? '#FFB74D' : '#C2410C', fontWeight: '700' }}>
              Querying Sindh District Database...
            </Text>
          </View>
        ) : (
          <SindhCasesMap cases={realCases} />
        )}
      </ScrollView>

      {/* Shared Bottom Nav */}
      <BottomNavBar role="ngo" activeTab="map" />
    </SafeAreaView>
  );
}
