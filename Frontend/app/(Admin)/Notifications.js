import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { markAdminNotificationsRead } from '../../constants/ngoMediaStore';

const { width } = Dimensions.get('window');

const NOTIFICATIONS_DATA = [
  {
    section: 'Today',
    data: [
      {
        id: 'n-1',
        name: 'Ahmed Khan',
        initials: 'AK',
        action: 'joined Barq-e-Insaf citizen portal from Karachi Central',
        time: '4 minutes ago',
        avatarColor: '#FF9500',
      },
      {
        id: 'n-2',
        name: 'Advocate Tariq Hassan',
        initials: 'TH',
        action: 'verified active status with Sindh Bar Council license SBC-7814',
        time: '18 minutes ago',
        avatarColor: '#0EA5E9',
      },
      {
        id: 'n-3',
        name: 'Fatima Noor and Legal Aid',
        initials: 'FN',
        action: 'filed urgent tenancy dispute under Sindh Rented Premises Ordinance',
        time: '35 minutes ago',
        avatarColor: '#A855F7',
      },
      {
        id: 'n-4',
        name: 'KTN Judicial Bureau',
        initials: 'KT',
        action: 'verified broadcast coverage for public encroachment investigation',
        time: '2 hours ago',
        avatarColor: '#F59E0B',
      },
    ],
  },
  {
    section: 'Yesterday',
    data: [
      {
        id: 'n-5',
        name: 'NCHD Legal Relief Desk',
        initials: 'NC',
        action: 'admitted 14 pro-bono citizen dispute defense matters across Sindh',
        time: 'Yesterday at 04:15 PM',
        avatarColor: '#10B981',
      },
      {
        id: 'n-6',
        name: 'Advocate Sarah Qureshi',
        initials: 'SQ',
        action: 'signed digital consultation certificate for family custody dispute',
        time: 'Yesterday at 02:30 PM',
        avatarColor: '#EC4899',
      },
      {
        id: 'n-7',
        name: 'Sindh Bar Council Portal',
        initials: 'SB',
        action: 'scheduled automated license verification integrity sync',
        time: 'Yesterday at 11:00 AM',
        avatarColor: '#6366F1',
      },
    ],
  },
];

export default function AdminNotifications() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();

  // Hardware back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  useEffect(() => {
    // Clear unread indicator when admin views notifications
    markAdminNotificationsRead();
  }, []);

  const handleBack = () => {
    router.replace('/(Admin)');
  };

  const bg = isDark ? '#090302' : '#FFFFFF';
  const textPrimary = isDark ? '#FFEED6' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 235, 215, 0.70)' : '#4A3B32';
  const textMuted = isDark ? 'rgba(255, 200, 150, 0.50)' : '#8C7B70';
  const dividerColor = isDark ? 'rgba(255, 149, 0, 0.12)' : 'rgba(0, 0, 0, 0.06)';
  const sectionHeaderColor = isDark ? '#FFA726' : '#1A0F07';
  const headerBg = isDark ? '#140704' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor={isDark ? '#0A0402' : '#FFFFFF'}
      />

      {/* Top Header matching Image 3 */}
      <View style={[styles.topHeader, { backgroundColor: headerBg, borderBottomColor: dividerColor }]}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              backgroundColor: isDark ? 'rgba(38, 20, 10, 0.85)' : '#F2EDE4',
              borderColor: isDark ? 'rgba(255, 170, 60, 0.35)' : 'rgba(0,0,0,0.08)',
            },
          ]}
          onPress={handleBack}
          activeOpacity={0.75}
          accessibilityLabel="Back"
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={textPrimary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textPrimary }]}>Notification</Text>

        <View style={styles.headerRightPlaceholder}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 6h18M6 12h12M10 18h4"
              stroke={isDark ? 'rgba(255, 180, 80, 0.8)' : '#6B5E55'}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </View>

      {/* Flat List matching Image 3 (No boxes / separate card containers) */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFICATIONS_DATA.map((sectionGroup, sIdx) => (
          <View key={sIdx} style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: sectionHeaderColor }]}>
              {sectionGroup.section}
            </Text>

            {sectionGroup.data.map((item, idx) => (
              <View key={item.id}>
                <View style={styles.notificationRow}>
                  {/* Left Circular Avatar with initials */}
                  <View style={[styles.avatarCircle, { backgroundColor: item.avatarColor + '20', borderColor: item.avatarColor + '55' }]}>
                    <Text style={[styles.avatarInitials, { color: item.avatarColor }]}>
                      {item.initials}
                    </Text>
                  </View>

                  {/* Notification Content */}
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowText, { color: textSecondary }]}>
                      <Text style={[styles.actorName, { color: textPrimary }]}>{item.name}</Text>{' '}
                      {item.action}
                    </Text>
                    <Text style={[styles.timeText, { color: textMuted }]}>{item.time}</Text>
                  </View>
                </View>

                {/* Thin divider line matching Image 3 */}
                {idx < sectionGroup.data.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerRightPlaceholder: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
  },
  rowContent: {
    flex: 1,
  },
  rowText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '400',
  },
  actorName: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11.5,
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginLeft: 58,
  },
});
