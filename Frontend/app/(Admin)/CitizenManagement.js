import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StatusBar, StyleSheet,
  Dimensions, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const PER_PAGE = 5;

const CITIZENS = [
  { id: '1', fullName: 'Ahmed Khan', email: 'ahmed.khan@gmail.com', phone: '0300-1234567', city: 'Karachi', district: 'Karachi Central', status: 'Active', totalComplaints: 2, registeredOn: '10 Nov 2026' },
  { id: '2', fullName: 'Rezan Sohail', email: 'rezan.sohail01@gmail.com', phone: '0300-2167965', city: 'Karachi', district: 'Korangi', status: 'Active', totalComplaints: 1, registeredOn: '12 Nov 2026' },
  { id: '3', fullName: 'Bilal Mustafa', email: 'bilal.m@yahoo.com', phone: '0333-9876543', city: 'Hyderabad', district: 'Latifabad', status: 'Active', totalComplaints: 0, registeredOn: '04 Nov 2026' },
];

const STATUSES   = ['All', 'Active', 'Inactive', 'Suspended'];
const CITIES     = ['All', 'Karachi', 'Hyderabad', 'Sukkur', 'Larkana'];
const SORT_OPTIONS = ['Name ↑', 'Name ↓', 'Date ↑', 'Date ↓'];

export default function CitizenManagement() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const [data, setData]             = useState(CITIZENS);
  const [search, setSearch]         = useState('');
  const [status, setStatus]         = useState('All');
  const [city, setCity]             = useState('All');
  const [sort, setSort]             = useState('Name ↑');
  const [showSort, setShowSort]     = useState(false);
  const [showDetail, setShowDetail] = useState(null);

  // Hardware back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  // Filter - CNIC completely removed for citizens
  let filtered = data.filter(c => {
    const q = search.toLowerCase();
    const matchQ = (c.fullName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q);
    return matchQ &&
      (status === 'All' || c.status === status) &&
      (city   === 'All' || c.city   === city);
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'Name ↑') return (a.fullName || '').localeCompare(b.fullName || '');
    if (sort === 'Name ↓') return (b.fullName || '').localeCompare(a.fullName || '');
    if (sort === 'Date ↑') return new Date(a.registeredOn) - new Date(b.registeredOn);
    if (sort === 'Date ↓') return new Date(b.registeredOn) - new Date(a.registeredOn);
    return 0;
  });

  const bg = isDark ? '#060201' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(22, 10, 4, 0.78)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)';
  const textPrimary = isDark ? '#FFF5E8' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 220, 180, 0.65)' : '#6B5442';
  const inputBg = isDark ? 'rgba(25, 12, 5, 0.75)' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255, 160, 40, 0.25)' : 'rgba(255, 149, 0, 0.25)';

  if (showDetail) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor={isDark ? "#0A0402" : "#FAF7F2"} />
        <AppHeader
          title={showDetail.fullName}
          showBack={true}
          onBack={() => setShowDetail(null)}
          role="admin"
          subtitle="Citizen Record"
        />
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <View style={[s.detailCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[s.cardTitle, { color: textPrimary }]}>Basic Profile</Text>
            <View style={[s.infoRow, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.06)' }]}><Text style={[s.infoLabel, { color: textSecondary }]}>Full Name</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.fullName}</Text></View>
            <View style={[s.infoRow, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.06)' }]}><Text style={[s.infoLabel, { color: textSecondary }]}>Email</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.email}</Text></View>
            <View style={[s.infoRow, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.06)' }]}><Text style={[s.infoLabel, { color: textSecondary }]}>Phone</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.phone}</Text></View>
            <View style={[s.infoRow, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.06)' }]}><Text style={[s.infoLabel, { color: textSecondary }]}>District</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.district || showDetail.city}</Text></View>
            <View style={[s.infoRow, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.06)' }]}><Text style={[s.infoLabel, { color: textSecondary }]}>Status</Text><Text style={[s.infoVal, { color: '#4ade80' }]}>{showDetail.status}</Text></View>
            <View style={[s.infoRow, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.06)' }]}><Text style={[s.infoLabel, { color: textSecondary }]}>Registered On</Text><Text style={[s.infoVal, { color: textPrimary }]}>{showDetail.registeredOn}</Text></View>
          </View>

          <TouchableOpacity style={s.backToListBtn} onPress={() => setShowDetail(null)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Image
                source={require('../../assets/images/backarrow.png')}
                style={{ width: 16, height: 11 }}
                resizeMode="contain"
              />
              <Text style={s.backToListBtnTxt}>RETURN TO DIRECTORY</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        <BottomNavBar role="admin" activeTab="citizens" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor={isDark ? "#0A0402" : "#FAF7F2"} />

      {/* Modern '< Citizen Directory' Header */}
      <AppHeader
        title="Citizen Directory"
        showBack={true}
        homeRoute="/(Admin)"
        role="admin"
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
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
        {filtered.length === 0 ? (
          <Text style={[s.emptyTxt, { color: textSecondary }]}>No citizens found matching criteria.</Text>
        ) : (
          filtered.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
              onPress={() => setShowDetail(c)}
              activeOpacity={0.78}
            >
              <View style={s.cardTop}>
                <View style={s.avatar}>
                  <Text style={s.avatarTxt}>{c.fullName.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardName, { color: textPrimary }]}>{c.fullName}</Text>
                  <Text style={s.cardSub}>{c.phone} · {c.district || c.city}</Text>
                  <Text style={[s.cardEmail, { color: textSecondary }]}>{c.email}</Text>
                </View>
                <View style={s.statusBadge}>
                  <Text style={s.statusTxt}>{c.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="admin" activeTab="citizens" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
  avatarTxt: { fontSize: 15, fontWeight: '800', color: '#FFEED6' },
  cardName: { fontSize: 15, fontWeight: '800', color: '#FFF5E8' },
  cardSub: { fontSize: 12, color: '#FFB74D', marginTop: 2, fontWeight: '600' },
  cardEmail: { fontSize: 11, color: 'rgba(255, 220, 180, 0.5)', marginTop: 2 },
  statusBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusTxt: { fontSize: 10, fontWeight: '700', color: '#4ade80' },
  emptyTxt: { color: 'rgba(255, 220, 180, 0.5)', textAlign: 'center', marginTop: 30 },
  detailCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.85)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#FFF5E8', marginBottom: 14 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoLabel: { fontSize: 12, color: 'rgba(255, 220, 180, 0.6)' },
  infoVal: { fontSize: 12, color: '#FFF5E8', fontWeight: '700' },
  backToListBtn: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backToListBtnTxt: { color: '#FFEED6', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
});
