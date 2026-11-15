import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './MyCases.styles';
import { useMockStore, activeCases, fetchCases } from './MockStore';
import { getCurrentLawyerId } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function MyCases() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  useEffect(() => {
    if (currentLawyerId) {
      fetchCases(currentLawyerId);
    }
  }, [currentLawyerId]);

  const handleCasePress = (caseId) => {
    router.push({
      pathname: '/(lawyer)/CaseDetail',
      params: { caseId: caseId }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      {/* Top Header */}
      <AppHeader
        title={`Active Matters (${activeCases.length})`}
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {activeCases.length === 0 ? (
          <View style={[styles.caseCard, { paddingVertical: 30, alignItems: 'center' }]}>
            <Text style={[styles.caseMeta, { textAlign: 'center' }]}>No active cases currently.</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255, 220, 180, 0.6)', marginTop: 6, textAlign: 'center' }}>
              When you accept consultation requests, they will automatically be created here as active cases.
            </Text>
          </View>
        ) : (
          activeCases.map((c, i) => (
            <TouchableOpacity 
              key={c.id || i} 
              style={styles.caseCard} 
              activeOpacity={0.84}
              onPress={() => handleCasePress(c.id)}
            >
              <View style={styles.caseTop}>
                <Text style={styles.caseTitle}>{c.title}</Text>
                <Text style={styles.activeBadge}>{c.status ? c.status.toUpperCase() : 'ACTIVE'}</Text>
              </View>
              <Text style={styles.caseMeta}>Client Name: {c.clientName || 'Private Client'}</Text>
              {c.contact ? <Text style={styles.caseMeta}>Phone: {c.contact}</Text> : null}
              {c.district ? <Text style={styles.caseMeta}>Court / District: {c.court || 'District Court'} ({c.district})</Text> : null}
              
              <View style={styles.problemBox}>
                <Text style={styles.problemLabel}>Problem Statement / Summary:</Text>
                <Text style={styles.caseDescription} numberOfLines={3}>
                  {c.description || c.problemStatement || 'Case details recorded.'}
                </Text>
              </View>
              
              <View style={styles.caseFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                  <Text style={styles.caseFooterText}>Tap to view case details</Text>
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
      <BottomNavBar role="lawyer" activeTab="cases" />
    </SafeAreaView>
  );
}
