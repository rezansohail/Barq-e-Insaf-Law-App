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
import styles from './LawyerHome.styles';
import { useMockStore, lawyerProfile, caseRequests } from './MockStore';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import LanguagePeekingTab from '../../components/LanguagePeekingTab';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const quickActions = [
  { title: 'Case Requests', route: '/(lawyer)/CaseRequests' },
  { title: 'My Schedule',   route: '/(lawyer)/Schedule'     },
  { title: 'My Cases',      route: '/(lawyer)/MyCases'      },
  { title: 'Other Lawyers', route: '/(lawyer)/OtherLawyers'  },
];

export default function LawyerHome() {
  useMockStore();
  const router = useRouter();

  // Enforce double-back to exit on Home, never fall back to login screen
  useAppNavigation({ isHome: true, homeRoute: '/(lawyer)/LawyerHome' });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#140803" />

      {/* HEADER - Main Dashboard (No Back Button) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>BI</Text>
            </View>
            <View style={styles.brand}>
              <Text style={styles.brandName}>Barq-e-Insaf</Text>
              <Text style={styles.brandSub}>Lawyer Portal</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(lawyer)/CaseRequests')}>
              <Text style={styles.notifText}>Requests ({caseRequests.length})</Text>
            </TouchableOpacity>

            {/* Top Right Dropdown Menu with Sign Out, Profile, Dark/Light Mode */}
            <TopHeaderMenu role="lawyer" avatarText={lawyerProfile.initials || 'TM'} />
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.lawyerName}>{lawyerProfile.name ? `${lawyerProfile.name} - Advocate` : 'Advocate'}</Text>
          <Text style={styles.licenseNo}>Licence: {lawyerProfile.sbc}</Text>
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedText}>SBC Verified</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{lawyerProfile.successfulCasesCount}</Text>
            <Text style={styles.statLabel}>Successful Cases</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{caseRequests.length}</Text>
            <Text style={styles.statLabel}>New Requests</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{lawyerProfile.rating}</Text>
            <Text style={styles.statLabel}>Client Rating</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* NEW CLIENT REQUESTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>New Client Requests</Text>
          <TouchableOpacity onPress={() => router.push('/(lawyer)/CaseRequests')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {caseRequests.length === 0 && (
          <Text style={styles.reqDesc}>No case requests</Text>
        )}
        {caseRequests.slice(0, 2).map((r, i) => (
          <TouchableOpacity
            key={i}
            style={styles.reqCard}
            onPress={() => router.push('/(lawyer)/CaseRequests')}
          >
            <View style={styles.reqTop}>
              <Text style={styles.reqName}>{r.name} - {r.spec}</Text>
              <Text style={styles.badgeNew}>New</Text>
            </View>
            <Text style={styles.reqDesc} numberOfLines={2}>{r.desc}</Text>
          </TouchableOpacity>
        ))}

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((q, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickCard}
              onPress={() => router.push(q.route)}
            >
              <Text style={styles.quickTitle}>{q.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="lawyer" activeTab="home" />
      {/* Sliding Language Card */}
      <LanguagePeekingTab />
    </SafeAreaView>
  );
}