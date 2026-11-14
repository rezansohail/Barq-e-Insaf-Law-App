import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './NGOHome.styles';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import LanguagePeekingTab from '../../components/LanguagePeekingTab';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const caseTypes = [
  { label: 'Property',    value: 0, pct: 0, color: '#FF9500' },
  { label: 'Family',      value: 0, pct: 0, color: '#FFA726' },
  { label: 'Inheritance', value: 0, pct: 0, color: '#FFB74D' },
  { label: 'Civil',       value: 0, pct: 0, color: '#FFD54F' },
];

const insights = [
  { num: '—', label: 'Avg. lawyer response' },
  { num: '—', label: 'Rural access rate' },
  { num: '—', label: 'Evidence uploaded' },
  { num: '—', label: 'Chatbot queries' },
];

const heatmap = [];

export default function NGOHome() {
  const router = useRouter();

  // Enforce double-back to exit on Home, never fall back to login screen
  useAppNavigation({ isHome: true, homeRoute: '/(ngo)/NGOHome' });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#140803" />

      {/* HEADER - Main Dashboard (No Back Button) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>Barq-e-Insaf ⚡</Text>
            <Text style={styles.brandSub}>Institutional Analytics Portal</Text>
          </View>
          <View style={styles.headerRight}>
            <TopHeaderMenu role="ngo" avatarText="NGO" />
          </View>
        </View>

        <Text style={styles.orgName}>National Commission for Human Development (NCHD) / Media</Text>
        <Text style={styles.orgSub}>Institutional Portal · Verified Public Interest & Case Analytics</Text>

        <View style={styles.statsRow}>
          <View style={styles.statChip}><Text style={styles.statNum}>0</Text><Text style={styles.statLabel}>Cases / Month</Text></View>
          <View style={styles.statChip}><Text style={styles.statNum}>0</Text><Text style={styles.statLabel}>Districts</Text></View>
          <View style={styles.statChip}><Text style={styles.statNum}>—</Text><Text style={styles.statLabel}>vs Last Month</Text></View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Sindh Case Heatmap</Text>
          <TouchableOpacity onPress={() => router.push('/(ngo)/CaseMap')}>
            <Text style={styles.seeAllText}>Expand →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mapCard} onPress={() => router.push('/(ngo)/CaseMap')}>
          <View style={styles.mapVisual}>
            {heatmap.length === 0 && <Text style={styles.mapSub}>No case data yet</Text>}
            {heatmap.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.mapDot,
                  {
                    width: 16,
                    height: h,
                    backgroundColor: i % 3 === 0 ? '#5C1A1A' : i % 3 === 1 ? '#1B4332' : '#f59e0b',
                    opacity: 0.4 + (h / 22) * 0.6,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.mapFooter}>
            <View>
              <Text style={styles.mapLabel}>Interactive Sindh Map</Text>
              <Text style={styles.mapSub}>Tap to explore district data</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Case Type Breakdown</Text>
          <TouchableOpacity onPress={() => router.push('/(ngo)/Analytics')}>
            <Text style={styles.seeAllText}>Full Report →</Text>
          </TouchableOpacity>
        </View>

        {caseTypes.map((c, i) => (
          <View key={i} style={styles.barRow}>
            <Text style={styles.barLabel}>{c.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${c.pct}%`, backgroundColor: c.color }]} />
            </View>
            <Text style={styles.barVal}>{c.value}</Text>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Key Insights</Text>
        <View style={styles.insightGrid}>
          {insights.map((ins, i) => (
            <View key={i} style={styles.insightCard}>
              <Text style={styles.insightNum}>{ins.num}</Text>
              <Text style={styles.insightLabel}>{ins.label}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="ngo" activeTab="home" />
      {/* Sliding Language Card */}
      <LanguagePeekingTab />
    </SafeAreaView>
  );
}