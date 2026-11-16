import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const INITIAL_MEDIA = [
  {
    id: 'MED-001',
    name: 'KTN News (Kawish Television Network)',
    accreditationNo: 'PEMRA-SND-2007',
    registeredOn: '12 Oct 2022',
    type: 'Broadcast Television',
    status: 'Active',
    verificationStatus: 'Verified',
    city: 'Karachi',
    district: 'Karachi South',
    email: 'newsdesk@ktnnews.tv',
    phone: '+92 21 35643001',
    officeAddress: 'Kawish Television Network, Technology Park, Shahrah-e-Faisal, Karachi',
    bureauChief: 'Mustafa Jamali',
    broadcastBureaus: '30 Sindh Districts',
    coverageBeats: 'High Court, Public Injustice, Land Encroachments, Civil Rights',
    activeReporters: 45,
    investigationsPublished: 118,
  },
  {
    id: 'MED-002',
    name: 'Sindh TV News Desk',
    accreditationNo: 'PEMRA-SND-2004',
    registeredOn: '18 Nov 2022',
    type: 'Broadcast Television',
    status: 'Active',
    verificationStatus: 'Verified',
    city: 'Hyderabad',
    district: 'Hyderabad City',
    email: 'editorial@sindhtvnews.tv',
    phone: '+92 22 2785501',
    officeAddress: 'Sindh TV Media Complex, Saddar, Hyderabad',
    bureauChief: 'Ghulam Rasool',
    broadcastBureaus: '24 Sindh Districts',
    coverageBeats: 'District Sessions Courts, Rural Agrarian Disputes, Human Rights',
    activeReporters: 32,
    investigationsPublished: 84,
  },
  {
    id: 'MED-003',
    name: 'Daily Kawish Investigative Cell',
    accreditationNo: 'CPNE-SND-1990',
    registeredOn: '05 Jan 2023',
    type: 'Print & Digital Press',
    status: 'Active',
    verificationStatus: 'Verified',
    city: 'Hyderabad',
    district: 'Hyderabad City',
    email: 'kawishinvestigates@gmail.com',
    phone: '+92 22 2780100',
    officeAddress: 'Kawish Building, Station Road, Hyderabad',
    bureauChief: 'Ali Qazi',
    broadcastBureaus: 'All Sindh Talukas',
    coverageBeats: 'In-Depth Judicial Investigation, Revenue Department Records',
    activeReporters: 28,
    investigationsPublished: 62,
  },
  {
    id: 'MED-004',
    name: 'Awami Awaz Digital Bureau',
    accreditationNo: 'PEMRA-DIG-2024',
    registeredOn: '14 Feb 2024',
    type: 'Digital Streaming',
    status: 'Pending',
    verificationStatus: 'Pending Review',
    city: 'Sukkur',
    district: 'Sukkur',
    email: 'desk@awamiawaz.pk',
    phone: '+92 71 5621100',
    officeAddress: 'Press Club Road, Sukkur',
    bureauChief: 'Naveed Soomro',
    broadcastBureaus: 'Sukkur & Larkana Divisions',
    coverageBeats: 'Tribal Jirga Mediation, Rural Land Grabbing',
    activeReporters: 12,
    investigationsPublished: 14,
  },
];

const STATUSES = ['All', 'Active', 'Pending'];

export default function MediaManagement() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const [data, setData] = useState(INITIAL_MEDIA);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  // Hardware back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

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

  const handleApprove = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Active', verificationStatus: 'Verified' }
          : item
      )
    );
    Alert.alert('Accreditation Approved', 'The media outlet has been verified for broadcast access.');
  };

  const handleRemove = (id) => {
    Alert.alert('Remove Media Outlet', 'Are you sure you want to remove this media accreditation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setData((prev) => prev.filter((item) => item.id !== id)),
      },
    ]);
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
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
        </ScrollView>

        {/* Media Outlets List */}
        {filtered.map((item) => (
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
                        : 'rgba(245, 158, 11, 0.15)',
                    borderColor:
                      item.status === 'Active'
                        ? 'rgba(74, 222, 128, 0.4)'
                        : 'rgba(245, 158, 11, 0.4)',
                  },
                ]}
              >
                <Text
                  style={[
                    s.statusText,
                    { color: item.status === 'Active' ? '#4ade80' : '#f59e0b' },
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
              {item.status !== 'Active' && (
                <TouchableOpacity
                  style={s.approveBtn}
                  onPress={() => handleApprove(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={s.approveBtnText}>APPROVE ACCREDITATION</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => handleRemove(item.id)}
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
  filterRow: { marginBottom: 14 },
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
  approveBtn: {
    flex: 1,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#0A0301',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.4,
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
