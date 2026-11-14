import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './MyCases.styles';
import { useMockStore, activeCases } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function MyCases() {
  useMockStore();
  const router = useRouter();

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  const handleCasePress = (caseId) => {
    router.push({
      pathname: '/(lawyer)/CaseDetail',
      params: { caseId: caseId }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      {/* Modern '< My Active Cases' Header */}
      <AppHeader
        title="My Active Cases"
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeCases.length === 0 && (
          <Text style={styles.emptyText}>No active cases currently represented.</Text>
        )}
        {activeCases.map((c, i) => (
          <TouchableOpacity 
            key={i} 
            style={styles.caseCard} 
            onPress={() => handleCasePress(c.id)}
            activeOpacity={0.78}
          >
            <View style={styles.caseTop}>
              <Text style={styles.caseTitle}>{c.title}</Text>
              <Text style={styles.activeBadge}>Active</Text>
            </View>
            <Text style={styles.caseMeta}>Client: {c.clientName || 'Assigned Citizen'}</Text>
            
            <View style={styles.problemBox}>
              <Text style={styles.problemLabel}>Problem Statement:</Text>
              <Text style={styles.caseDescription} numberOfLines={2}>{c.problemStatement || c.description}</Text>
            </View>
            
            <View style={styles.caseFooter}>
              <Text style={styles.caseFooterText}>Tap to review case evidence & updates &gt;</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="lawyer" activeTab="cases" />
    </SafeAreaView>
  );
}
