import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StatusBar, StyleSheet, Dimensions, Alert, ActivityIndicator, RefreshControl,
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

const { width } = Dimensions.get('window');

const STATUSES = ['All', 'Active', 'Suspended'];

export default function LawyerManagement() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);

  // Hardware back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  const fetchLawyers = useCallback(async () => {
    try {
      const statusParam = selectedStatus === 'All' ? 'all' : selectedStatus.toLowerCase();
      const res = await api.get(`/admin/lawyers?search=${encodeURIComponent(search)}&status=${statusParam}&limit=50`);
      if (res.data?.lawyers) {
        setLawyers(res.data.lawyers);
      }
    } catch (err) {
      console.warn('Failed to fetch lawyers:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedStatus]);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLawyers();
  }, [fetchLawyers]);

  // Update Advocate Status (Suspend or Activate)
  const handleUpdateStatus = (lawyerId, lawyerName, newStatus) => {
    const isSuspending = newStatus === 'suspended';
    Alert.alert(
      `${isSuspending ? 'Suspend' : 'Activate'} Advocate Account`,
      `Are you sure you want to ${isSuspending ? 'suspend' : 'activate'} Advocate ${lawyerName} on the Sindh Bar Council roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Confirm ${isSuspending ? 'Suspend' : 'Activate'}`,
          style: isSuspending ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await api.put(`/admin/lawyers/${lawyerId}/status`, {
                status: newStatus,
                reason: `Administrative oversight: advocate status set to ${newStatus}`,
              });
              Alert.alert('Status Updated', res.data?.message || 'Advocate status updated successfully.');
              fetchLawyers();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || err.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // Remove Advocate
  const handleRemove = (lawyerId, lawyerName) => {
    Alert.alert(
      'Remove Advocate',
      `Are you sure you want to remove Advocate ${lawyerName} from the Sindh Bar Council roster? This action is logged.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await api.delete(`/admin/lawyers/${lawyerId}`, {
                data: { reason: 'Advocate removed by Sindh Bar Council administrator' },
              });
              Alert.alert('Advocate Removed', res.data?.message || 'Advocate successfully removed.');
              fetchLawyers();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || err.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const bg = isDark ? '#060201' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(22, 10, 4, 0.78)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)';
  const textPrimary = isDark ? '#FFF5E8' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 220, 180, 0.65)' : '#6B5442';
  const inputBg = isDark ? 'rgba(25, 12, 5, 0.75)' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255, 160, 40, 0.25)' : 'rgba(255, 149, 0, 0.25)';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor={isDark ? "#0A0402" : "#FAF7F2"} />

      <AppHeader
        title="Lawyer Registry"
        showBack={true}
        homeRoute="/(Admin)"
        role="admin"
      />

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />
        }
      >
        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: inputBg, borderColor: inputBorder }]}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="#FF9500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <TextInput
            style={[styles.searchInput, { color: textPrimary }]}
            placeholder="Search by advocate name, SBC license, district..."
            placeholderTextColor={isDark ? "rgba(255, 220, 180, 0.35)" : "#9C8E84"}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {STATUSES.map(st => (
            <TouchableOpacity
              key={st}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedStatus === st ? '#FF9500' : isDark ? 'rgba(25, 12, 5, 0.72)' : '#F0E8DD',
                  borderColor: selectedStatus === st ? '#FFA726' : isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)',
                },
              ]}
              onPress={() => setSelectedStatus(st)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipTxt,
                  { color: selectedStatus === st ? '#0A0301' : isDark ? 'rgba(255, 220, 180, 0.65)' : '#6B5442' },
                  selectedStatus === st && styles.chipTxtActive,
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lawyer Cards */}
        {loading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={{ marginTop: 10, color: textSecondary, fontSize: 13 }}>Loading advocates...</Text>
          </View>
        ) : lawyers.length === 0 ? (
          <Text style={[styles.emptyTxt, { color: textSecondary }]}>No advocates found matching criteria.</Text>
        ) : (
          lawyers.map(l => {
            const isSuspended = (l.status || '').toLowerCase() === 'suspended';
            const badgeColor = isSuspended ? '#ef4444' : '#4ade80';

            return (
              <TouchableOpacity
                key={l.id}
                style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => router.push({
                  pathname: '/(Admin)/LawyerDetail',
                  params: { id: l.id, data: JSON.stringify(l) },
                })}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTxt}>{(l.name || 'Advocate').slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardName, { color: textPrimary }]}>{l.name}</Text>
                    <Text style={styles.cardSub}>{l.sbc_number || 'SBC-Advocate'} · {l.specialty || 'General Practice'}</Text>
                    <Text style={[styles.cardDistrict, { color: textSecondary }]}>
                      {l.district || l.city || 'Sindh'} · {l.experience_years ? `${l.experience_years} yrs exp` : 'Verified Advocate'}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#FF9500', marginTop: 3 }}>
                      {l.cases_count ?? 0} Cases Assigned · SBC Verified Advocate
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: badgeColor, backgroundColor: badgeColor + '22' }]}>
                    <Text style={[styles.statusTxt, { color: badgeColor }]}>
                      {isSuspended ? 'Suspended' : 'Active'}
                    </Text>
                  </View>
                </View>

                {/* Account Actions: Suspend / Activate / Remove */}
                <View style={styles.actionRow}>
                  {isSuspended ? (
                    <TouchableOpacity 
                      style={[styles.statusBtn, { borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.15)' }]} 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(l.id, l.name, 'active');
                      }}
                      activeOpacity={0.8}
                      disabled={actionLoading}
                    >
                      <Text style={[styles.statusBtnTxt, { color: '#4ade80' }]}>ACTIVATE ADVOCATE</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.statusBtn, { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(l.id, l.name, 'suspended');
                      }}
                      activeOpacity={0.8}
                      disabled={actionLoading}
                    >
                      <Text style={[styles.statusBtnTxt, { color: '#ef4444' }]}>SUSPEND ACCOUNT</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.removeBtn} 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemove(l.id, l.name);
                    }}
                    activeOpacity={0.8}
                    disabled={actionLoading}
                  >
                    <Text style={styles.removeBtnTxt}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="admin" activeTab="lawyers" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060201' },
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
  filterRow: { marginBottom: 14 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  chipTxt: { fontSize: 11, fontWeight: '700' },
  chipTxtActive: { fontWeight: '900' },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '800',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 11,
    color: '#FF9500',
    marginBottom: 2,
    fontWeight: '600',
  },
  cardDistrict: {
    fontSize: 11,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusTxt: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyTxt: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 149, 0, 0.1)',
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBtnTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  removeBtnTxt: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '700',
  },
});
