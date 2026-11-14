import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './MyCases.styles';
import { useMockStore, activeCases, fetchCases } from './MockStore';
import { getCurrentLawyerId } from '../../constants/authStore';

export default function MyCases() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

  useEffect(() => {
    if (currentLawyerId) {
      fetchCases(currentLawyerId);
    }
  }, [currentLawyerId]);

  const handleNav = (lbl) => {
    if (lbl === 'home') router.push('/(lawyer)/LawyerHome');
    if (lbl === 'requests') router.push('/(lawyer)/CaseRequests');
    if (lbl === 'cases') router.push('/(lawyer)/MyCases');
    if (lbl === 'schedule') router.push('/(lawyer)/Schedule');
    if (lbl === 'profile') router.push('/(lawyer)/LawyerProfile');
  };

  const handleCasePress = (caseId) => {
    router.push({
      pathname: '/(lawyer)/CaseDetail',
      params: { caseId: caseId }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2744" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>BI</Text>
          </View>
          <Text style={styles.headerTitle}>My Active Cases ({activeCases.length})</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeCases.length === 0 ? (
          <View style={[styles.caseCard, { paddingVertical: 30, alignItems: 'center' }]}>
            <Text style={[styles.caseMeta, { textAlign: 'center' }]}>No active cases currently.</Text>
            <Text style={{ fontSize: 12, color: '#888', marginTop: 6, textAlign: 'center' }}>
              When you accept consultation requests, they will automatically be created here as active cases.
            </Text>
          </View>
        ) : (
          activeCases.map((c, i) => (
            <TouchableOpacity 
              key={c.id || i} 
              style={styles.caseCard} 
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
                <Text style={styles.caseFooterText}>Tap to view case details</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.bottomNav}>
        {['Dashboard', 'Requests', 'Cases', 'Schedule', 'Profile'].map((lbl, idx) => {
          const ids = ['home', 'requests', 'cases', 'schedule', 'profile'];
          return (
            <TouchableOpacity
              key={lbl}
              style={styles.navItem}
              onPress={() => handleNav(ids[idx])}
            >
              <Text style={[styles.navLabel, ids[idx] === 'cases' && styles.navLabelActive]}>{lbl}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
