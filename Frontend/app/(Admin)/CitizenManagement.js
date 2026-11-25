import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StatusBar, StyleSheet,
  Dimensions, Alert, Image, ActivityIndicator, RefreshControl,
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

const STATUSES = ['All', 'Active', 'Suspended', 'Restricted'];

export default function CitizenManagement() {
  const router = useRouter();
  const { theme, isDark } = useAppTheme();
  const { bg, cardBg, cardBorder, textPrimary, textSecondary, inputBg, inputBorder } = theme;
  
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [showDetail, setShowDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Hardware back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  // Load real citizens from backend
  const fetchCitizens = useCallback(async () => {
    try {
      const statusParam = status === 'All' ? 'all' : status.toLowerCase();
      const res = await api.get(`/admin/citizens?search=${encodeURIComponent(search)}&status=${statusParam}&limit=50`);
      if (res.data?.citizens) {
        setCitizens(res.data.citizens);
      }
    } catch (err) {
      console.warn('Failed to fetch citizens:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchCitizens();
  }, [fetchCitizens]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCitizens();
  }, [fetchCitizens]);

  // Load single citizen detailed profile
  const handleOpenDetail = async (citizen) => {
    try {
      const res = await api.get(`/admin/citizens/${citizen.id}`);
      if (res.data?.citizen) {
        setShowDetail(res.data.citizen);
      } else {
        setShowDetail(citizen);
      }
    } catch (err) {
      setShowDetail(citizen);
    }
  };

  // Change account status (Suspend, Restrict, Activate)
  const handleUpdateStatus = (citizenId, newStatus) => {
    const actionName = newStatus === 'suspended' ? 'Suspend' : newStatus === 'restricted' ? 'Restrict' : 'Activate';
    Alert.alert(
      `${actionName} Citizen Account`,
      `Are you sure you want to change this citizen's account status to '${newStatus}'?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Confirm ${actionName}`,
          style: newStatus === 'suspended' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await api.put(`/admin/citizens/${citizenId}/status`, {
                status: newStatus,
                reason: `Administrative action: ${actionName} citizen account`,
              });
              Alert.alert('Status Updated', res.data?.message || 'Status successfully saved to database.');
              fetchCitizens();
              if (showDetail && showDetail.id === citizenId) {
                setShowDetail(prev => ({ ...prev, status: newStatus }));
              }
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

  // Delete/Deactivate Citizen
  const handleDeleteCitizen = (citizenId, citizenName) => {
    Alert.alert(
      'Remove Citizen Account',
      `Are you sure you want to remove citizen account '${citizenName}' from the database?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await api.delete(`/admin/citizens/${citizenId}`, {
                data: { reason: 'Account removed by Sindh Bar Council administrator' },
              });
              Alert.alert('Account Removed', res.data?.message || 'Citizen account successfully removed.');
              setShowDetail(null);
              fetchCitizens();
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


  if (showDetail) {
    const currentStatus = (showDetail.status || 'active').toLowerCase();
    const isSuspended = currentStatus === 'suspended';
    const isRestricted = currentStatus === 'restricted';
    const statusColor = isSuspended ? '#ef4444' : isRestricted ? '#f59e0b' : '#4ade80';

    return (
      <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
        <StatusBar barStyle={theme.statusBarStyle} translucent backgroundColor={theme.statusBarBg} />
        <AppHeader
          title={showDetail.full_name || showDetail.fullName || 'Citizen Profile'}
          showBack={true}
          onBack={() => setShowDetail(null)}
          role="admin"
          subtitle="Citizen Record"
        />
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <View style={[s.detailCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[s.cardTitle, { color: textPrimary }]}>Basic Profile</Text>
            <View style={s.infoRow}><Text style={[s.infoLabel, { color: textSecondary }]}>Full Name</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.full_name || showDetail.fullName}</Text></View>
            <View style={s.infoRow}><Text style={[s.infoLabel, { color: textSecondary }]}>Email</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.email || '—'}</Text></View>
            <View style={s.infoRow}><Text style={[s.infoLabel, { color: textSecondary }]}>Phone</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.phone || '—'}</Text></View>
            <View style={s.infoRow}><Text style={[s.infoLabel, { color: textSecondary }]}>District</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.district || showDetail.city || 'Sindh'}</Text></View>
            <View style={s.infoRow}><Text style={[s.infoLabel, { color: textSecondary }]}>Account Status</Text><Text style={[s.infoVal, { color: statusColor, fontWeight: '800', textTransform: 'uppercase' }]}>{showDetail.status || 'active'}</Text></View>
            <View style={s.infoRow}><Text style={[s.infoLabel, { color: textSecondary }]}>Cases Filed</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.cases?.length ?? showDetail.cases_count ?? 0}</Text></View>
            <View style={s.infoRow}><Text style={[s.infoLabel, { color: textSecondary }]}>Vault Documents</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.evidenceVault?.length ?? showDetail.vault_files_count ?? 0}</Text></View>
            <View style={s.infoRow}><Text style={[s.infoLabel, { color: textSecondary }]}>Registered Date</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.created_at ? new Date(showDetail.created_at).toLocaleDateString() : '—'}</Text></View>
          </View>

          {/* Account Management Actions */}
          <View style={[s.detailCard, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 16 }]}>
            <Text style={[s.cardTitle, { color: textPrimary }]}>Administrative Actions</Text>
            <Text style={{ fontSize: 11, color: textSecondary, marginBottom: 14 }}>
              Modify this citizen's account status or revoke access in case of platform violation. All actions are logged.
            </Text>

            <View style={{ gap: 10 }}>
              {!isSuspended ? (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }]}
                  onPress={() => handleUpdateStatus(showDetail.id, 'suspended')}
                  disabled={actionLoading}
                >
                  <Text style={[s.actionBtnTxt, { color: '#ef4444' }]}>SUSPEND CITIZEN ACCOUNT</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: '#4ade80' }]}
                  onPress={() => handleUpdateStatus(showDetail.id, 'active')}
                  disabled={actionLoading}
                >
                  <Text style={[s.actionBtnTxt, { color: '#4ade80' }]}>RE-ACTIVATE CITIZEN ACCOUNT</Text>
                </TouchableOpacity>
              )}

              {!isRestricted ? (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b' }]}
                  onPress={() => handleUpdateStatus(showDetail.id, 'restricted')}
                  disabled={actionLoading}
                >
                  <Text style={[s.actionBtnTxt, { color: '#f59e0b' }]}>RESTRICT ACCOUNT PRIVILEGES</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: '#4ade80' }]}
                  onPress={() => handleUpdateStatus(showDetail.id, 'active')}
                  disabled={actionLoading}
                >
                  <Text style={[s.actionBtnTxt, { color: '#4ade80' }]}>REMOVE RESTRICTIONS</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: 'rgba(239, 68, 68, 0.5)' }]}
                onPress={() => handleDeleteCitizen(showDetail.id, showDetail.full_name || showDetail.fullName)}
                disabled={actionLoading}
              >
                <Text style={[s.actionBtnTxt, { color: '#ef4444' }]}>DELETE / REMOVE ACCOUNT</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={s.backToListBtn} onPress={() => setShowDetail(null)}>
            <Text style={s.backToListBtnTxt}>← RETURN TO CITIZEN LIST</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNavBar role="admin" activeTab="citizens" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
      <StatusBar barStyle={theme.statusBarStyle} translucent backgroundColor={theme.statusBarBg} />

      <AppHeader
        title="Citizen Directory"
        showBack={true}
        homeRoute="/(Admin)"
        role="admin"
      />

      <ScrollView 
        style={s.scroll} 
        contentContainerStyle={s.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />
        }
      >
        {/* Search */}
        <View style={[s.searchBox, { backgroundColor: inputBg, borderColor: inputBorder }]}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="#FF9500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <TextInput
            style={[s.searchInput, { color: textPrimary }]}
            placeholder="Search by citizen name, phone, district..."
            placeholderTextColor={isDark ? "rgba(255, 220, 180, 0.35)" : "#9C8E84"}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
          {STATUSES.map(st => (
            <TouchableOpacity
              key={st}
              style={[
                s.chip,
                {
                  backgroundColor: status === st ? '#FF9500' : isDark ? 'rgba(25, 12, 5, 0.72)' : '#F0E8DD',
                  borderColor: status === st ? '#FFA726' : isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)',
                },
              ]}
              onPress={() => setStatus(st)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  s.chipTxt,
                  { color: status === st ? '#0A0301' : isDark ? 'rgba(255, 220, 180, 0.65)' : '#6B5442' },
                  status === st && s.chipTxtActive,
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Citizen Cards */}
        {loading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={{ marginTop: 10, color: textSecondary, fontSize: 13 }}>Loading registered citizens...</Text>
          </View>
        ) : citizens.length === 0 ? (
          <Text style={[s.emptyTxt, { color: textSecondary }]}>No citizens found matching criteria.</Text>
        ) : (
          citizens.map(c => {
            const isSuspended = (c.status || '').toLowerCase() === 'suspended';
            const isRestricted = (c.status || '').toLowerCase() === 'restricted';
            const badgeColor = isSuspended ? '#ef4444' : isRestricted ? '#f59e0b' : '#4ade80';

            return (
              <TouchableOpacity
                key={c.id}
                style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => handleOpenDetail(c)}
                activeOpacity={0.78}
              >
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarTxt}>{(c.full_name || 'Citizen').slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardName, { color: textPrimary }]}>{c.full_name}</Text>
                    <Text style={s.cardSub}>{c.phone || 'No phone'} · {c.district || c.city || 'Sindh'}</Text>
                    <Text style={[s.cardEmail, { color: textSecondary }]}>{c.email || '—'}</Text>
                    <Text style={{ fontSize: 10, color: '#FF9500', marginTop: 3 }}>
                      {c.cases_count ?? 0} Cases Filed · {c.vault_files_count ?? 0} Vault Documents
                    </Text>
                  </View>
                  <View style={[s.statusBadge, { borderColor: badgeColor, backgroundColor: badgeColor + '22' }]}>
                    <Text style={[s.statusTxt, { color: badgeColor }]}>{c.status || 'Active'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="admin" activeTab="citizens" />
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
  cardEmail: {
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
  detailCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.1)',
  },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoVal: { fontSize: 12, fontWeight: '700' },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  backToListBtn: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  backToListBtnTxt: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '800',
  },
});
