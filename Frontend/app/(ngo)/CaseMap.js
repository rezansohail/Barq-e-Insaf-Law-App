import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './CaseMap.styles';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const sampleDistricts = [
  { name: 'Karachi Central', cases: 42, lawyers: 38, sev: 'Covered', style: 'sevCovered' },
  { name: 'Malir & Korangi', cases: 68, lawyers: 12, sev: 'High', style: 'sevHigh' },
  { name: 'Hyderabad Rural', cases: 84, lawyers: 6, sev: 'Critical', style: 'sevCritical' },
  { name: 'Sukkur City', cases: 31, lawyers: 18, sev: 'Covered', style: 'sevCovered' },
  { name: 'Larkana & Thatta', cases: 72, lawyers: 8, sev: 'High', style: 'sevHigh' },
];

export default function CaseMap() {
  const router = useRouter();

  // Hardware back returns to NGOHome
  useAppNavigation({ isHome: false, homeRoute: '/(ngo)/NGOHome' });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Sindh Case Hotspots' Header */}
      <AppHeader
        title="Sindh Case Hotspots"
        showBack={true}
        homeRoute="/(ngo)/NGOHome"
        role="ngo"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Critical Gap</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>High Need</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4ade80' }]} />
            <Text style={styles.legendText}>Adequately Covered</Text>
          </View>
        </View>

        {sampleDistricts.map((d, i) => (
          <View key={i} style={styles.districtCard}>
            <Text style={styles.districtIcon}>📍</Text>
            <View style={styles.districtInfo}>
              <Text style={styles.districtName}>{d.name}</Text>
              <Text style={styles.districtMeta}>{d.cases} active disputes · {d.lawyers} certified advocates</Text>
            </View>
            <Text style={[styles.severityBadge, styles[d.style]]}>{d.sev}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="ngo" activeTab="map" />
    </SafeAreaView>
  );
}
