import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import styles from './CaseMap.styles';

const districts = [];

export default function CaseMap() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sindh Case Hotspots</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>Critical</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} /><Text style={styles.legendText}>High</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#4ade80' }]} /><Text style={styles.legendText}>Covered</Text></View>
        </View>

        {districts.length === 0 && <Text style={styles.districtMeta}>No district data yet</Text>}
        {districts.map((d, i) => (
          <View key={i} style={styles.districtCard}>
            <Text style={styles.districtIcon}>📍</Text>
            <View style={styles.districtInfo}>
              <Text style={styles.districtName}>{d.name}</Text>
              <Text style={styles.districtMeta}>{d.cases} cases · {d.lawyers} verified lawyers</Text>
            </View>
            <Text style={[styles.severityBadge, styles[d.style]]}>{d.sev}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}