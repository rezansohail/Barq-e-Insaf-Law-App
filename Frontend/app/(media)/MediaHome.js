import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './MediaHome.styles';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { fetchRealSindhCases } from '../../constants/realCasesStore';
import { useAppTheme } from '../../context/ThemeContext';
import SindhCasesMap from '../../components/SindhCasesMap';

export default function MediaHome() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  useAppNavigation({ isHome: true, homeRoute: '/(media)/MediaHome' });

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

  const totalCases = realCases.length;
  const uniqueDistricts = new Set(realCases.map((c) => c.district)).size;
  const propertyCount = realCases.filter((c) => /property|land/i.test(c.type)).length;
  const familyCount = realCases.filter((c) => /family|custody|khula/i.test(c.type)).length;
  const otherCount = Math.max(0, totalCases - propertyCount - familyCount);

  const safeBg = isDarkMode ? '#080402' : '#FAF8F5';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      {/* HEADER - Media Newsroom Desk */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#120703' : '#FFFFFF', borderBottomColor: isDarkMode ? 'rgba(255, 149, 0, 0.20)' : 'rgba(234, 88, 12, 0.15)' }]}>
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <Text style={[styles.brandName, { color: '#FF9500' }]}>Barq-e-Insaf</Text>
            <Text style={[styles.brandSub, { color: isDarkMode ? 'rgba(255, 235, 215, 0.65)' : '#664530' }]}>
              Court Reporting & Broadcast Journalism Desk
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TopHeaderMenu role="media" avatarText="KTN" />
          </View>
        </View>

        <Text style={[styles.orgName, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
          KTN News · Legal Affairs & Judicial Bureau
        </Text>
        <Text style={[styles.orgSub, { color: isDarkMode ? 'rgba(255, 220, 180, 0.7)' : '#7C5238' }]}>
          Verified Public Interest Coverage · Sindh Court Beat & Dispute Registry
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.85)' : '#F3EFEA', borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.35)' : 'rgba(234, 88, 12, 0.2)' }]}>
            <Text style={[styles.statNum, { color: '#FFB74D' }]}>{totalCases}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255, 220, 180, 0.65)' : '#664530' }]}>Active Disputes</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.85)' : '#F3EFEA', borderColor: 'transparent' }]}>
            <Text style={[styles.statNum, { color: '#00E5FF' }]}>{uniqueDistricts}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255, 220, 180, 0.65)' : '#664530' }]}>Districts Covered</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.85)' : '#F3EFEA', borderColor: 'transparent' }]}>
            <Text style={[styles.statNum, { color: '#4ade80' }]}>Verified</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255, 220, 180, 0.65)' : '#664530' }]}>Court Docket</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {/* Sindh Map Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFB74D' : '#C2410C' }]}>
            Sindh Judicial Case Map (Live)
          </Text>
          <TouchableOpacity onPress={() => router.push('/(media)/CaseMap')}>
            <Text style={styles.seeAllText}>Fullscreen Map</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#FF9500" />
          </View>
        ) : (
          <SindhCasesMap cases={realCases} />
        )}

        {/* Dispute Classification for Newsroom Coverage */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFB74D' : '#C2410C' }]}>
            Newsroom Beat Breakdown
          </Text>
          <TouchableOpacity onPress={() => router.push('/(media)/Analytics')}>
            <Text style={styles.seeAllText}>Detailed Beat</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.breakdownCard, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.94)' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.35)' : 'rgba(234, 88, 12, 0.25)' }]}>
          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Property & Land</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: totalCases > 0 ? `${(propertyCount / totalCases) * 100}%` : '0%', backgroundColor: '#FF9100' }]} />
            </View>
            <Text style={[styles.barVal, { color: '#FFB74D' }]}>{propertyCount}</Text>
          </View>

          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Family & Custody</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: totalCases > 0 ? `${(familyCount / totalCases) * 100}%` : '0%', backgroundColor: '#00E5FF' }]} />
            </View>
            <Text style={[styles.barVal, { color: '#00E5FF' }]}>{familyCount}</Text>
          </View>

          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Civil & Contract</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: totalCases > 0 ? `${(otherCount / totalCases) * 100}%` : '0%', backgroundColor: '#C084FC' }]} />
            </View>
            <Text style={[styles.barVal, { color: '#C084FC' }]}>{otherCount}</Text>
          </View>
        </View>

        {/* Media Desk Coverage Priorities */}
        <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFB74D' : '#C2410C', marginTop: 14 }]}>
          Broadcast Journalistic Standards
        </Text>
        <View style={styles.insightGrid}>
          <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(22, 11, 5, 0.92)' : '#F3EFEA', borderColor: 'transparent' }]}>
            <Text style={[styles.insightNum, { color: '#FF9500' }]}>100%</Text>
            <Text style={[styles.insightLabel, { color: isDarkMode ? 'rgba(255, 235, 215, 0.7)' : '#664530' }]}>Court Record Fact-Checked</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(22, 11, 5, 0.92)' : '#F3EFEA', borderColor: 'transparent' }]}>
            <Text style={[styles.insightNum, { color: '#00E5FF' }]}>Sindh</Text>
            <Text style={[styles.insightLabel, { color: isDarkMode ? 'rgba(255, 235, 215, 0.7)' : '#664530' }]}>Provincial Jurisdiction</Text>
          </View>
        </View>
      </ScrollView>

      {/* Shared Bottom Nav */}
      <BottomNavBar role="media" activeTab="home" />
    </SafeAreaView>
  );
}
