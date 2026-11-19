import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './MyCases.styles';
import { useMockStore, activeCases, fetchCitizenCases, userData } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';

const filters = ['All', 'Active', 'Pending', 'Closed'];

export default function MyCases() {
  useMockStore();
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const { t, currentLang, translateCategory, translateDistrict } = useAppTranslation();
  const [activeFilter, setActiveFilter] = useState('All');

  // Back returns to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  useEffect(() => {
    if (userData.id) {
      fetchCitizenCases(userData.id);
    }
  }, [userData.id]);

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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={theme.bg} />

      {/* Top Header matching app standard with '<' Chevron */}
      <AppHeader
        title={t('citizen.myActiveCases', 'My Cases')}
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
              style={[
                styles.filterChip,
                activeFilter === f && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CASE CARDS */}
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No cases found in this category.</Text>
        ) : (
          filtered.map((c, i) => (
            <TouchableOpacity
              key={c.id || i}
              style={styles.caseCard}
              activeOpacity={0.84}
              onPress={() => handleCasePress(c)}
            >
              <View style={styles.caseCardTop}>
                <View style={styles.caseType}>
                  <Text style={styles.caseTitle} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.caseMeta}>{c.type || 'Legal Matter'} · {c.district || userData.district || 'Sindh'}</Text>
                </View>
                <Text style={styles.badgeText}>{c.status || 'Active'}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', paddingTop: 8 }}>
                <Text style={{ fontSize: 11, color: 'rgba(255, 220, 180, 0.6)' }}>
                  Filed: {c.filingDate || c.date || 'Recent'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF9500' }}>
                    {t('citizen.caseDetails', 'View Matter Details')}
                  </Text>
                  <Image
                    source={require('../../assets/images/arrow.png')}
                    style={{ width: 14, height: 10 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Unified Bottom Navigation */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}
