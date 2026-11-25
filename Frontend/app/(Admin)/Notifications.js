import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import LanguagePeekingTab from '../../components/LanguagePeekingTab';
import api from '../../constants/api';

const { width } = Dimensions.get('window');

const AVATAR_COLORS = ['#FF9500', '#0EA5E9', '#A855F7', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#38BDF8'];

function getInitials(title = '', message = '') {
  const clean = title.replace(/^(New|Advocate|Citizen|NGO|Media)\s+/i, '').trim();
  const words = clean.split(' ').filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1 && words[0].length >= 2) return words[0].slice(0, 2).toUpperCase();
  return 'AD';
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24 && d.getDate() === now.getDate()) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1 || (diffHours < 48 && d.getDate() === now.getDate() - 1)) {
    return `Yesterday at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function AdminNotifications() {
  const router = useRouter();
  const { theme, isDark } = useAppTheme();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hardware back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/admin/notifications?limit=50');
      const list = res.data?.notifications || [];

      // Group into Today, Yesterday, Earlier
      const now = new Date();
      const todayList = [];
      const yesterdayList = [];
      const earlierList = [];

      list.forEach((item, index) => {
        const itemDate = new Date(item.created_at);
        const diffMs = now - itemDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
        const initials = getInitials(item.title, item.message);

        const cardData = {
          id: item.id,
          title: item.title,
          message: item.message,
          initials,
          time: formatRelativeTime(item.created_at),
          avatarColor: color,
          isRead: item.is_read,
        };

        if (diffDays === 0 && itemDate.getDate() === now.getDate()) {
          todayList.push(cardData);
        } else if (diffDays <= 1 || itemDate.getDate() === now.getDate() - 1) {
          yesterdayList.push(cardData);
        } else {
          earlierList.push(cardData);
        }
      });

      const grouped = [];
      if (todayList.length > 0) grouped.push({ section: 'Today', data: todayList });
      if (yesterdayList.length > 0) grouped.push({ section: 'Yesterday', data: yesterdayList });
      if (earlierList.length > 0) grouped.push({ section: 'Earlier', data: earlierList });

      setSections(grouped);

      // Automatically mark all as read in PostgreSQL database
      api.put('/admin/notifications/mark-all-read').catch(() => {});
    } catch (err) {
      console.warn('Failed to fetch admin notifications:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleBack = () => {
    router.replace('/(Admin)');
  };

  const bg = theme.bg;
  const textPrimary = theme.textPrimary;
  const textSecondary = theme.textSecondary;
  const textMuted = theme.textMuted;
  const dividerColor = theme.divider;
  const sectionHeaderColor = isDark ? '#FFA726' : '#1A0F07';
  const headerBg = theme.headerBg;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        translucent
        backgroundColor={theme.statusBarBg}
      />

      {/* Modern Top Header matching user's exact mockup */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityLabel="Back to Admin Dashboard"
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="#FFA726"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Notification</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF9500" />
          <Text style={[styles.loadingTxt, { color: textSecondary }]}>Loading notifications...</Text>
        </View>
      ) : sections.length === 0 ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />
          }
        >
          <Text style={[styles.emptyTitle, { color: textPrimary }]}>No notifications yet</Text>
          <Text style={[styles.emptySubtitle, { color: textMuted }]}>
            All system activities and real-time alerts will appear here.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />
          }
        >
          {sections.map((sec, sIdx) => (
            <View key={sIdx} style={styles.sectionWrap}>
              <Text style={[styles.sectionTitle, { color: sectionHeaderColor }]}>
                {sec.section}
              </Text>
              {sec.data.map((item, idx) => (
                <View
                  key={item.id || idx}
                  style={[
                    styles.notifRow,
                    idx < sec.data.length - 1 && { borderBottomColor: dividerColor, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: item.avatarColor + '22', borderColor: item.avatarColor }]}>
                    <Text style={[styles.avatarText, { color: item.avatarColor }]}>{item.initials}</Text>
                  </View>
                  <View style={styles.contentWrap}>
                    <Text style={[styles.messageText, { color: textSecondary }]}>
                      <Text style={[styles.nameBold, { color: textPrimary }]}>{item.title} </Text>
                      {item.message}
                    </Text>
                    <Text style={[styles.timeText, { color: textMuted }]}>{item.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Floating Language Peeking Pill matching user screenshot */}
      <LanguagePeekingTab />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.12)',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTxt: {
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contentWrap: {
    flex: 1,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  nameBold: {
    fontWeight: '800',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});
