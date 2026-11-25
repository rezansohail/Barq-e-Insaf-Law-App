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

  const { isDark } = useAppTheme();
  const safeBg = isDark ? '#080402' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(20, 32, 24, 0.95)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(16, 185, 129, 0.40)' : 'rgba(16, 185, 129, 0.20)';
  const textPrimary = isDark ? '#FFF5E8' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(230, 255, 245, 0.75)' : '#1B3B2B';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      <AppHeader
        title="Sindh Judicial Case Map"
        showBack={true}
        homeRoute="/(ngo)/NGOHome"
        role="ngo"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={[styles.introCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.introTitle, { color: textPrimary }]}>
            Sindh Real-Time Dispute Map
          </Text>
          <Text style={[styles.introSub, { color: textSecondary }]}>
            Live geographic distribution of disputes currently registered across Sindh districts. Pointers reflect dispute category and age without citizen personal identifiers.
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color="#10B981" size="large" />
            <Text style={{ marginTop: 12, fontSize: 12, color: isDark ? '#34D399' : '#059669', fontWeight: '700' }}>
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
