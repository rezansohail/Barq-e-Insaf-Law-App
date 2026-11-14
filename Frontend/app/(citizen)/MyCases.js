import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './MyCases.styles';
import { useMockStore, activeCases } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const filters = ['All', 'Active', 'Pending', 'Closed'];

export default function MyCases() {
  useMockStore();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');

  // Enforces hardware back button goes back to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const filtered = activeFilter === 'All'
    ? activeCases
    : activeCases.filter(c => c.status === activeFilter);

  const handleCasePress = (caseItem) => {
    router.push({
      pathname: '/(citizen)/CaseDetail',
      params: { caseId: caseItem.id }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern Header: '< My Cases' */}
      <AppHeader
        title="My Cases"
        showBack={true}
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CASE CARDS */}
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No cases recorded yet.</Text>
        )}
        {filtered.map((c, i) => (
          <TouchableOpacity
            key={i}
            style={styles.caseCard}
            onPress={() => handleCasePress(c)}
            activeOpacity={0.78}
          >
            <View style={styles.caseCardTop}>
              <View style={styles.caseType}>
                <Text style={styles.caseTitle}>{c.title}</Text>
              </View>
              <Text style={styles.badgeText}>{c.status}</Text>
            </View>
            <Text style={styles.caseMeta}>Filing Date: {c.filingDate}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}
