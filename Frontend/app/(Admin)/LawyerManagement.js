import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StatusBar, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const ALL_LAWYERS = [
  { id: '1', name: 'Adv. Tariq Mansoor', specialty: 'Property & Civil', license: 'SBC-4421', cnic: '42101-7788990-1', city: 'Karachi', district: 'Karachi Central', status: 'Active', cases: 180 },
  { id: '2', name: 'Adv. Sarah Qureshi', specialty: 'Family & Custody', license: 'SBC-3389', cnic: '42201-3344556-2', city: 'Hyderabad', district: 'Qasimabad', status: 'Active', cases: 95 },
  { id: '3', name: 'Adv. Asad Mehmood', specialty: 'Criminal Defense', license: 'SBC-9912', cnic: '42101-9988776-1', city: 'Sukkur', district: 'Rohri', status: 'Pending', cases: 0 },
];

const SPECIALTIES = ['All', 'Property', 'Family', 'Criminal', 'Civil'];
const STATUSES = ['All', 'Active', 'Pending'];

export default function LawyerManagement() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState(ALL_LAWYERS);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Hardware back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  // Filter logic
  const filtered = lawyers.filter(l => {
    const matchSearch =
      (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.license || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.district || '').toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = selectedSpecialty === 'All' || (l.specialty || '').includes(selectedSpecialty);
    const matchStatus    = selectedStatus    === 'All' || l.status    === selectedStatus;
    return matchSearch && matchSpecialty && matchStatus;
  });

  const handleApprove = (id) => {
    setLawyers(prev => prev.map(l => l.id === id ? { ...l, status: 'Active' } : l));
  };

  const handleRemove = (id) => {
    setLawyers(prev => prev.filter(l => l.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Lawyer Registry' Header */}
      <AppHeader
        title="Lawyer Registry"
        showBack={true}
        homeRoute="/(Admin)"
        role="admin"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="#FF9500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by advocate name, SBC license, district..."
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {STATUSES.map(st => (
            <TouchableOpacity
              key={st}
              style={[styles.chip, selectedStatus === st && styles.chipActive]}
              onPress={() => setSelectedStatus(st)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipTxt, selectedStatus === st && styles.chipTxtActive]}>{st}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lawyer Cards */}
        {filtered.length === 0 ? (
          <Text style={styles.emptyTxt}>No advocates found matching criteria.</Text>
        ) : (
          filtered.map(l => (
            <View key={l.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTxt}>{l.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{l.name}</Text>
                  <Text style={styles.cardSub}>{l.license} · {l.specialty}</Text>
                  <Text style={styles.cardDistrict}>CNIC: {l.cnic} · {l.district || l.city}</Text>
                </View>
                <View style={[styles.statusBadge, l.status === 'Active' ? styles.statusActive : styles.statusPending]}>
                  <Text style={[styles.statusTxt, l.status === 'Active' ? styles.statusTxtActive : styles.statusTxtPending]}>
                    {l.status}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                {l.status === 'Pending' && (
                  <TouchableOpacity 
                    style={styles.approveBtn} 
                    onPress={() => handleApprove(l.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.approveBtnTxt}>✓ APPROVE SBC LICENSE</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.removeBtn} 
                  onPress={() => handleRemove(l.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeBtnTxt}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
    backgroundColor: 'rgba(25, 12, 5, 0.75)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFF5E8',
    paddingVertical: 12,
    marginLeft: 8,
  },
  filterRow: { marginBottom: 14 },
  chip: {
    backgroundColor: 'rgba(25, 12, 5, 0.72)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
  },
  chipActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FFA726',
  },
  chipTxt: { fontSize: 12, fontWeight: '600', color: 'rgba(255, 220, 180, 0.65)' },
  chipTxtActive: { color: '#0A0301', fontWeight: '800' },
  card: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTxt: { fontSize: 14, fontWeight: '800', color: '#FFEED6' },
  cardName: { fontSize: 15, fontWeight: '800', color: '#FFF5E8' },
  cardSub: { fontSize: 12, color: '#FFB74D', marginTop: 2, fontWeight: '600' },
  cardDistrict: { fontSize: 11, color: 'rgba(255, 220, 180, 0.5)', marginTop: 2 },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  statusTxtActive: { color: '#4ade80' },
  statusTxtPending: { color: '#f59e0b' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)', paddingTop: 10 },
  approveBtn: {
    flex: 2,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  approveBtnTxt: { color: '#0A0301', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  removeBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  removeBtnTxt: { color: '#ef4444', fontSize: 11, fontWeight: '700' },
  emptyTxt: { color: 'rgba(255, 220, 180, 0.5)', textAlign: 'center', marginTop: 30 },
});
