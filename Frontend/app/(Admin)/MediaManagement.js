import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import api from '../../constants/api';
import { showConfirm, showMessage } from '../../constants/dialog';

const STATUSES = ['All', 'Active', 'Suspended'];

export default function MediaManagement() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  // Hardware back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  const fetchMedia = useCallback(async () => {
    try {
      const res = await api.get('/admin/media?limit=50');
      const list = res.data?.media || [];
      const mapped = list.map((m) => ({
        id: m.id,
        name: m.channel_name || m.full_name || 'Media House',
        accreditationNo: m.registration_number || `PEMRA-SND-${m.id}`,
        registeredOn: m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Active',
        type: m.media_type || 'Broadcast Television',
        status: m.status || 'Active',
        verificationStatus: m.is_verified ? 'Verified' : 'Pending Review',
        city: m.district || 'Karachi',
        district: m.district || 'Karachi South',
        email: m.email || '—',
        phone: m.phone || '—',
        officeAddress: `${m.district || 'Sindh'}, Pakistan`,
        bureauChief: m.resource_person || 'Bureau Chief',
        broadcastBureaus: 'All Sindh Divisions',
        coverageBeats: 'High Court, Public Injustice, Land Encroachments, Civil Rights',
        activeReporters: 25,
        investigationsPublished: m.stories_published_count || 12,
      }));
      setData(mapped);
    } catch (err) {
      console.warn('Failed to fetch media outlets:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedia();
  }, [fetchMedia]);

  const filtered = data.filter((m) => {
    const q = search.toLowerCase();
    const matchQ =
      (m.name || '').toLowerCase().includes(q) ||
      (m.accreditationNo || '').toLowerCase().includes(q) ||
      (m.city || '').toLowerCase().includes(q) ||
      (m.district || '').toLowerCase().includes(q);
    const matchStatus = status === 'All' || m.status === status;
    return matchQ && matchStatus;
  });

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    Alert.alert(
      `${nextStatus === 'Suspended' ? 'Suspend' : 'Activate'} Media Outlet`,
      `Change media outlet status to ${nextStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: nextStatus === 'Suspended' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await api.put(`/admin/media/${id}/status`, {
                status: nextStatus,
                reason: `Admin updated status to ${nextStatus}`,
              });
              Alert.alert('Status Updated', `Media status set to ${nextStatus}.`);
              fetchMedia();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || err.message);
            }
          },
        },
      ]
    );
  };

  const handleRemove = (id, name) => {
    Alert.alert(
      'Remove Media Outlet',
      `Are you sure you want to remove '${name}' from accredited media?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/media/${id}`, {
                data: { reason: 'Accreditation revoked by Sindh Bar Council' },
              });
              Alert.alert('Media Removed', 'Media outlet was removed successfully.');
              fetchMedia();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || err.message);
            }
          },
        },
      ]
    );
  };

  const bg = isDark ? '#090302' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(26, 12, 5, 0.82)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)';
  const textPrimary = isDark ? '#FFEED6' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 235, 215, 0.65)' : '#665544';
  const inputBg = isDark ? 'rgba(25, 12, 5, 0.75)' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255, 160, 40, 0.25)' : 'rgba(255, 149, 0, 0.25)';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor={isDark ? '#0A0402' : '#FAF7F2'}
      />

      <AppHeader
        title="Media Registry"
        showBack={true}
        onBack={() => router.replace('/(Admin)')}
        homeRoute="/(Admin)"
        role="admin"
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF9500"
            colors={['#FF9500']}
          />
        }
      >
        {/* Search Input */}
        <View style={[s.searchBox, { backgroundColor: inputBg, borderColor: inputBorder }]}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              stroke={isDark ? '#FFA726' : '#EA580C'}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
          <TextInput
            style={[s.searchInput, { color: textPrimary }]}
            placeholder="Search media by outlet name, PEMRA license, city..."
            placeholderTextColor={isDark ? 'rgba(255, 200, 150, 0.45)' : '#9C8E84'}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Status Chips */}
        <View style={s.filterRow}>
          {STATUSES.map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                s.chip,
                {
                  backgroundColor: status === st ? '#FF9500' : isDark ? 'rgba(25, 12, 5, 0.72)' : '#F0E8DD',
                  borderColor: status === st ? '#FFA726' : isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.2)',
                },
              ]}
              onPress={() => setStatus(st)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  s.chipTxt,
                  { color: status === st ? '#0A0301' : isDark ? 'rgba(255, 220, 180, 0.65)' : '#6B5442' },
                  status === st && { fontWeight: '800' },
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading Spinner */}
        {loading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={{ marginTop: 12, color: textSecondary, fontSize: 13 }}>
              Loading accredited media outlets...
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ color: textSecondary, fontSize: 14 }}>
              No media outlets found matching criteria.
            </Text>
          </View>
        )}

        {/* Media Outlets List */}
        {!loading && filtered.map((item) => (
          <View
            key={item.id}
            style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
          >
            <View style={s.cardTop}>
              <View style={[s.avatar, { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38BDF8' }]}>
                <Text style={[s.avatarText, { color: '#38BDF8' }]}>
                  {item.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.outletName, { color: textPrimary }]}>{item.name}</Text>
                <Text style={[s.accredText, { color: textSecondary }]}>
                  {item.accreditationNo} · {item.type}
                </Text>
                <Text style={[s.locationText, { color: textSecondary }]}>
                  {item.officeAddress}
                </Text>
              </View>
              <View
                style={[
                  s.statusPill,
                  {
                    backgroundColor:
                      item.status === 'Active'
                        ? 'rgba(34, 197, 94, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                    borderColor:
                      item.status === 'Active'
                        ? 'rgba(74, 222, 128, 0.4)'
                        : 'rgba(239, 68, 68, 0.4)',
                  },
                ]}
              >
                <Text
                  style={[
                    s.statusText,
                    { color: item.status === 'Active' ? '#4ade80' : '#ef4444' },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={[s.statsRow, { borderTopColor: isDark ? 'rgba(255, 160, 40, 0.12)' : 'rgba(0,0,0,0.06)' }]}>
              <View style={s.statBox}>
                <Text style={[s.statVal, { color: textPrimary }]}>{item.activeReporters}</Text>
                <Text style={[s.statLbl, { color: textSecondary }]}>Field Journalists</Text>
              </View>
              <View style={s.statBox}>
                <Text style={[s.statVal, { color: textPrimary }]}>{item.investigationsPublished}</Text>
                <Text style={[s.statLbl, { color: textSecondary }]}>Exposés Broadcast</Text>
              </View>
              <View style={s.statBox}>
                <Text style={[s.statVal, { color: '#38BDF8' }]}>{item.broadcastBureaus.split(' ')[0]}</Text>
                <Text style={[s.statLbl, { color: textSecondary }]}>Districts Covered</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={s.actionRow}>
              <TouchableOpacity
                style={[
                  s.toggleBtn,
                  {
                    backgroundColor: item.status === 'Active' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    borderColor: item.status === 'Active' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(34, 197, 94, 0.5)',
                  },
                ]}
                onPress={() => handleToggleStatus(item.id, item.status)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.toggleBtnText,
                    { color: item.status === 'Active' ? '#f59e0b' : '#22c55e' },
                  ]}
                >
                  {item.status === 'Active' ? 'Suspend Media' : 'Activate Media'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => handleRemove(item.id, item.name)}
                activeOpacity={0.8}
              >
                <Text style={s.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomNavBar role="admin" activeTab="media" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },
  searchBox: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 12,
    marginLeft: 8,
  },
  filterRow: { flexDirection: 'row', marginBottom: 14 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  chipTxt: { fontSize: 12, fontWeight: '600' },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800' },
  outletName: { fontSize: 14.5, fontWeight: '800', marginBottom: 2 },
  accredText: { fontSize: 11.5, fontWeight: '600', marginBottom: 2 },
  locationText: { fontSize: 11, fontWeight: '400' },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '800' },
  statLbl: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  removeBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  removeBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
});
