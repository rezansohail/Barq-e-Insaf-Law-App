import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './LawyerHome.styles';
import { useMockStore, lawyerProfile, caseRequests, fetchLawyerDashboard } from './MockStore';
import { getCurrentLawyerId } from '../../constants/authStore';

const quickActions = [
  { title: 'Case Requests', route: '/(lawyer)/CaseRequests' },
  { title: 'My Schedule',   route: '/(lawyer)/Schedule'     },
  { title: 'My Cases',      route: '/(lawyer)/MyCases'      },
  { title: 'Other Lawyers', route: '/(lawyer)/OtherLawyers'  },
];

const navItems = [
  { id: 'home',     label: 'Dashboard', route: null                       },
  { id: 'requests', label: 'Requests',  route: '/(lawyer)/CaseRequests'   },
  { id: 'cases',    label: 'Cases',     route: '/(lawyer)/MyCases'        },
  { id: 'schedule', label: 'Schedule',  route: '/(lawyer)/Schedule'       },
  { id: 'profile',  label: 'Profile',   route: '/(lawyer)/LawyerProfile'  },
];

export default function LawyerHome() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeNav, setActiveNav] = useState('home');

  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

  useEffect(() => {
    if (currentLawyerId) {
      fetchLawyerDashboard(currentLawyerId);
    }
  }, [currentLawyerId]);

  const handleNav = (item) => {
    setActiveNav(item.id);
    if (item.route) router.push(item.route);
  };

  const getDisplayName = () => {
    const raw = (lawyerProfile.name || '').trim();
    if (!raw || raw.toLowerCase() === 'advocate') {
      return lawyerProfile.sbc ? `Advocate (${lawyerProfile.sbc})` : 'Advocate';
    }
    if (/^adv(\.|ocate)?\s+/i.test(raw)) {
      return raw;
    }
    return `Adv. ${raw}`;
  };

  const pendingRequests = caseRequests.filter((r) => r.status === 'pending');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2744" />

      {/* HEADER */}
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
              <Text style={styles.notifText}>Requests {pendingRequests.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(lawyer)/LawyerProfile')}>
              <Text style={styles.avatarText}>{lawyerProfile.initials || 'L'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.lawyerName}>
            {getDisplayName()}
          </Text>
          <Text style={styles.licenseNo}>
            Licence: {lawyerProfile.sbc || (lawyerProfile.loading ? 'Loading...' : 'SBC Pending')}
          </Text>
          <View style={[
            styles.verifiedPill,
            !lawyerProfile.isVerified && { backgroundColor: '#B45309' }
          ]}>
            <Text style={styles.verifiedText}>
              {lawyerProfile.isVerified ? 'SBC Verified' : (lawyerProfile.verificationStatus === 'rejected' ? 'Rejected' : 'Verification Pending')}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{lawyerProfile.activeCasesCount || lawyerProfile.successfulCasesCount || 0}</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{pendingRequests.length}</Text>
            <Text style={styles.statLabel}>New Requests</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{lawyerProfile.rating || 5.0}</Text>
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

        {pendingRequests.length === 0 ? (
          <View style={[styles.reqCard, { paddingVertical: 20, alignItems: 'center' }]}>
            <Text style={[styles.reqDesc, { textAlign: 'center' }]}>No pending case requests.</Text>
          </View>
        ) : (
          pendingRequests.slice(0, 3).map((r, i) => (
            <TouchableOpacity
              key={r.id || i}
              style={styles.reqCard}
              onPress={() => router.push('/(lawyer)/CaseRequests')}
            >
              <View style={styles.reqTop}>
                <Text style={styles.reqName}>{r.name} - {r.spec}</Text>
                <Text style={styles.badgeNew}>New</Text>
              </View>
              <Text style={styles.reqDesc} numberOfLines={2}>
                {r.desc || r.problemStatement || 'Consultation requested'}
              </Text>
            </TouchableOpacity>
          ))
        )}

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

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => handleNav(item)}
          >
            <Text style={[
              styles.navLabel,
              activeNav === item.id && styles.navLabelActive,
            ]}>
              {item.label}
            </Text>
            {activeNav === item.id && <View style={styles.navActiveDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
