import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StatusBar, StyleSheet, Dimensions, Image, Alert, ActivityIndicator, RefreshControl,
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
const PER_PAGE = 5;

// Dynamic data loaded from api.get('/admin/ngos')

const STATUSES = ['All', 'Active', 'Pending', 'Suspended'];
const TYPES    = ['All', 'Legal Aid', 'Human Rights', 'Women Rights', 'Welfare'];

const statusColors = {
  Active:    { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(74, 222, 128, 0.4)', text: '#4ade80' },
  Pending:   { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b' },
  Suspended: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444' },
  Verified:  { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(96, 165, 250, 0.4)', text: '#60a5fa' },
};

const DETAIL_TABS = ['Organization', 'Verification', 'Statistics', 'Account'];

// ─── DETAIL VIEW ──────────────────────────────────────────────────────────────
function NGODetail({ ngo: n, onBack }) {
  const [tab, setTab] = useState('Organization');
  const { isDark } = useAppTheme();
  const sc = statusColors[n.status] || statusColors['Pending'];
  const initials = (n.name || '').split(' ').map(w => w[0]).join('').slice(0, 2);

  const bg = isDark ? '#060201' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(22, 10, 4, 0.78)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)';
  const textPrimary = isDark ? '#FFF5E8' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 220, 180, 0.65)' : '#6B5442';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor={isDark ? "#0A0402" : "#FAF7F2"} />

      {/* Modern Header */}
      <AppHeader
        title="NGO Profile"
        showBack={true}
        onBackPress={onBack}
        role="admin"
        rightElement={
          <View style={[s.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Text style={[s.statusTxt, { color: sc.text }]}>{n.status}</Text>
          </View>
        }
      />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <View style={[s.heroCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={s.heroAvatar}>
            <Text style={s.heroAvatarTxt}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.heroName, { color: textPrimary }]}>{n.name}</Text>
            <Text style={s.heroSub}>{n.id} · {n.type}</Text>
            <Text style={[s.heroSubMuted, { color: textSecondary }]}>{n.city} · Reg: {n.registrationNo}</Text>
          </View>
        </View>

        {/* Tab Pills */}
        <View style={s.tabBar}>
          {DETAIL_TABS.map(t => {
            const isActive = tab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[s.tabItem, isActive && s.tabActive]}
                onPress={() => setTab(t)}
                activeOpacity={0.75}
              >
                <Text style={[s.tabTxt, isActive && s.tabTxtActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {tab === 'Organization' && (
          <>
            <DSec title="Organization Details">
              <IR label="NGO ID"           value={n.id} />
              <IR label="Registration No." value={n.registrationNo} />
              <IR label="Registered On"    value={n.registeredOn} />
              <IR label="NGO Type"         value={n.type} />
              <IR label="Founder / Board"  value={n.founder} />
              <IR label="Contact Person"   value={n.contactPerson} />
            </DSec>

            <DSec title="Contact & Headquarters">
              <IR label="Official Email"   value={n.email} />
              <IR label="Phone"            value={n.phone} />
              <IR label="Office Address"   value={n.officeAddress} />
              <IR label="City"             value={n.city} />
              <IR label="Country"          value={n.country} />
            </DSec>

            <DSec title="Mission & Scope">
              <IR label="Areas of Work"     value={n.areasOfWork} />
              <IR label="Operating Regions" value={n.operatingRegions} />
              <Text style={s.missionLabel}>Mission Statement:</Text>
              <Text style={s.missionTxt}>{n.mission}</Text>
            </DSec>
          </>
        )}

        {tab === 'Verification' && (
          <DSec title="Accreditation & Documents">
            <IR label="Verification Status" value={n.verificationStatus} highlight />
            <Text style={s.docTitle}>Uploaded Compliance Documents</Text>
            {(n.documents || []).map((d, i) => (
              <View key={i} style={s.docRow}>
                <View style={s.docIcon}>
                  <Text style={{ fontSize: 10, color: '#FF9500', fontWeight: '800' }}>DOC</Text>
                </View>
                <Text style={s.docText}>{d}</Text>
              </View>
            ))}
          </DSec>
        )}

        {tab === 'Statistics' && (
          <DSec title="Impact Metrics">
            <View style={s.perfGrid}>
              {[
                { l: 'Cases Assisted',     v: n.totalCases },
                { l: 'Beneficiaries',      v: n.totalBeneficiaries },
                { l: 'Active Lawyers',     v: n.totalLawyers },
                { l: 'Programs Run',       v: n.activePrograms },
              ].map(item => (
                <View key={item.l} style={s.perfCard}>
                  <Text style={s.perfVal}>{item.v}</Text>
                  <Text style={s.perfLbl}>{item.l}</Text>
                </View>
              ))}
            </View>
          </DSec>
        )}

        {tab === 'Account' && (
          <>
            <DSec title="Account Status">
              <IR label="Current Status"  value={n.status} highlight />
              <IR label="Registered On"   value={n.registeredOn} />
              <IR label="Last Active"     value={n.lastLogin} />
            </DSec>

            <DSec title="Administrative Actions">
              <TouchableOpacity style={s.actPrimary} activeOpacity={0.8}>
                <Text style={s.actPrimaryTxt}>VERIFY & APPROVE NGO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actWarn} activeOpacity={0.8}>
                <Text style={s.actWarnTxt}>Suspend Operations</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actDanger} activeOpacity={0.8}>
                <Text style={s.actDangerTxt}>Delete Registry Entry</Text>
              </TouchableOpacity>
            </DSec>
          </>
        )}

      </ScrollView>

      <BottomNavBar role="admin" activeTab="ngos" />
    </SafeAreaView>
  );
}

function DSec({ title, children }) {
  return (
    <View style={s.dSec}>
      <Text style={s.dSecTitle}>{title}</Text>
      {children}
    </View>
  );
}

function IR({ label, value, highlight }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, highlight && s.infoHighlight]}>{String(value ?? '—')}</Text>
    </View>
  );
}

// ─── MAIN LIST VIEW ──────────────────────────────────────────────────────────
export default function NGOManagement() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('All');
  const [type, setType]         = useState('All');
  const [page, setPage]         = useState(1);
  const [detail, setDetail]     = useState(null);

  // Back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  const fetchNgos = useCallback(async () => {
    try {
      const res = await api.get('/admin/ngos?limit=50');
      const list = res.data?.ngos || [];
      const mapped = list.map(n => ({
        id: n.id,
        name: n.full_name,
        registrationNo: n.registration_number || `REG-${n.id}`,
        registeredOn: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Active',
        type: n.organization_type || 'Human Rights',
        status: n.status || 'Active',
        verificationStatus: n.is_verified ? 'Verified' : 'Pending',
        city: n.district || 'Sindh',
        country: 'Pakistan',
        email: n.email || '—',
        phone: n.phone || '—',
        officeAddress: `${n.district || 'Sindh'}, Pakistan`,
        founder: 'Board of Trustees / Council',
        contactPerson: n.resource_person || 'Director Legal Aid',
        areasOfWork: 'Civil Rights, Free Defense, Legal Aid & Outreach',
        operatingRegions: `${n.district || 'Sindh'} & Division`,
        mission: 'Advancing access to legal representation and pro-bono aid across Sindh.',
        totalCases: n.cases_assisted_count || 0,
        totalBeneficiaries: (n.cases_assisted_count || 1) * 6,
        totalLawyers: 8,
        activePrograms: 2,
        lastLogin: 'Active Today',
        documents: ['Charter_Document.pdf', 'Legal_Aid_MOU.pdf'],
      }));
      setData(mapped);
    } catch (err) {
      console.warn('Failed to fetch NGOs:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNgos();
  }, [fetchNgos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNgos();
  }, [fetchNgos]);

  let filtered = data.filter(n => {
    const q = search.toLowerCase();
    const matchQ =
      (n.name || '').toLowerCase().includes(q) ||
      (n.registrationNo || '').toLowerCase().includes(q) ||
      (n.city || '').toLowerCase().includes(q) ||
      String(n.id ?? '').toLowerCase().includes(q);
    return matchQ && (status === 'All' || n.status === status) && (type === 'All' || n.type === type);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const reset      = () => setPage(1);

  const handleDelete = (id) => {
    showConfirm(
      'Remove NGO',
      'Are you sure you want to permanently remove this NGO from accredited organizations? All audit logs will record this.',
      async () => {
        try {
          await api.delete(`/admin/ngos/${id}`, {
            data: { reason: 'Accreditation permanently revoked by Sindh Bar Council' },
          });
          showMessage('NGO Removed', 'Organization was permanently removed from database.');
          setData(prev => prev.filter(n => n.id !== id));
          fetchNgos();
        } catch (err) {
          showMessage('Error', err.response?.data?.message || err.message);
        }
      },
      { confirmText: 'Remove', destructive: true }
    );
  };

  const handleVerify = (id) => {
    showConfirm(
      'Verify NGO Accreditation',
      'Verify this organization and set status to Active on the Sindh Bar Council register?',
      async () => {
        try {
          await api.put(`/admin/ngos/${id}/status`, {
            status: 'Active',
            reason: 'SBC Administrator verified organization credentials',
          });
          showMessage('NGO Verified', 'Organization status set to Active and verified.');
          setData(prev => prev.map(n => n.id === id ? { ...n, status: 'Active', verificationStatus: 'Verified' } : n));
          fetchNgos();
        } catch (err) {
          showMessage('Error', err.response?.data?.message || err.message);
        }
      },
      { confirmText: 'Verify NGO' }
    );
  };

  const bg = isDark ? '#060201' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(22, 10, 4, 0.78)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)';
  const textPrimary = isDark ? '#FFF5E8' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 220, 180, 0.65)' : '#6B5442';
  const inputBg = isDark ? 'rgba(25, 12, 5, 0.75)' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255, 160, 40, 0.25)' : 'rgba(255, 149, 0, 0.25)';

  if (detail) {
    return <NGODetail ngo={detail} onBack={() => setDetail(null)} />;
  }

  const pendingCount = data.filter(n => n.verificationStatus === 'Pending').length;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor={isDark ? "#0A0402" : "#FAF7F2"} />

      {/* Modern '< NGO Directory' Header */}
      <AppHeader
        title="NGO Directory"
        showBack={true}
        homeRoute="/(Admin)"
        role="admin"
        rightElement={
          pendingCount > 0 ? (
            <View style={s.pendingPill}>
              <Text style={s.pendingPillTxt}>{pendingCount} Pending</Text>
            </View>
          ) : null
        }
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
            placeholder="Search NGO name, ID, city..."
            placeholderTextColor={isDark ? "rgba(255, 220, 180, 0.35)" : "#9C8E84"}
            value={search}
            onChangeText={t => { setSearch(t); reset(); }}
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(''); reset(); }}>
              <Text style={s.clearX}>X</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter */}
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
              onPress={() => { setStatus(st); reset(); }}
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

        {/* Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.filterRow, { marginTop: -4 }]}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[
                s.chip,
                {
                  backgroundColor: type === t ? '#FF9500' : isDark ? 'rgba(25, 12, 5, 0.72)' : '#F0E8DD',
                  borderColor: type === t ? '#FFA726' : isDark ? 'rgba(255, 160, 40, 0.22)' : 'rgba(255, 149, 0, 0.20)',
                },
              ]}
              onPress={() => { setType(t); reset(); }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  s.chipTxt,
                  { color: type === t ? '#0A0301' : isDark ? 'rgba(255, 220, 180, 0.65)' : '#6B5442' },
                  type === t && s.chipTxtActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* NGO List */}
        {paginated.length === 0 ? (
          <View style={s.empty}>
            <Text style={[s.emptyTxt, { color: textSecondary }]}>No organizations found matching criteria.</Text>
          </View>
        ) : (
          paginated.map(n => {
            const sc = statusColors[n.status] || statusColors['Pending'];
            const initials = (n.name || '').split(' ').map(w => w[0]).join('').slice(0, 2);
            return (
              <View key={n.id} style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarTxt}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardName, { color: textPrimary }]}>{n.name}</Text>
                    <Text style={s.cardSub}>{n.type} · {n.city}</Text>
                    <Text style={[s.cardReg, { color: textSecondary }]}>Reg: {n.registrationNo}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Text style={[s.statusTxt, { color: sc.text }]}>{n.status}</Text>
                  </View>
                </View>

                {/* Metrics */}
                <View style={[s.statsRow, { backgroundColor: isDark ? 'rgba(15, 7, 2, 0.85)' : '#F7F3EE', borderColor: isDark ? 'rgba(255, 160, 40, 0.15)' : 'rgba(0,0,0,0.06)' }]}>
                  <View style={s.statItem}>
                    <Text style={[s.statVal, { color: textPrimary }]}>{n.totalCases}</Text>
                    <Text style={[s.statLbl, { color: textSecondary }]}>Cases</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.statItem}>
                    <Text style={[s.statVal, { color: textPrimary }]}>{n.totalBeneficiaries}</Text>
                    <Text style={[s.statLbl, { color: textSecondary }]}>Beneficiaries</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.statItem}>
                    <Text style={[s.statVal, { color: textPrimary }]}>{n.totalLawyers}</Text>
                    <Text style={[s.statLbl, { color: textSecondary }]}>Advocates</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={s.actions}>
                  <TouchableOpacity
                    style={s.actView}
                    onPress={() => setDetail(n)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.actViewTxt}>View Profile</Text>
                  </TouchableOpacity>

                  {n.verificationStatus === 'Pending' && (
                    <TouchableOpacity
                      style={s.actVerify}
                      onPress={() => handleVerify(n.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.actVerifyTxt}>Verify</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={s.actDel}
                    onPress={() => handleDelete(n.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.actDelTxt}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {totalPages > 1 && (
          <View style={s.pager}>
            <TouchableOpacity
              style={[s.pageBtn, page === 1 && s.pageDis]}
              disabled={page === 1}
              onPress={() => setPage(p => p - 1)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Image
                  source={require('../../assets/images/backarrow.png')}
                  style={{ width: 14, height: 10 }}
                  resizeMode="contain"
                />
                <Text style={s.pageBtnTxt}>Prev</Text>
              </View>
            </TouchableOpacity>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
              <TouchableOpacity
                key={pg}
                style={[s.pageNum, page === pg && s.pageNumAct]}
                onPress={() => setPage(pg)}
              >
                <Text style={[s.pageNumTxt, page === pg && s.pageNumActTxt]}>{pg}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.pageBtn, page === totalPages && s.pageDis]}
              disabled={page === totalPages}
              onPress={() => setPage(p => p + 1)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={s.pageBtnTxt}>Next</Text>
                <Image
                  source={require('../../assets/images/arrow.png')}
                  style={{ width: 14, height: 10 }}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="admin" activeTab="ngos" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060201' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },
  pendingPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pendingPillTxt: { fontSize: 10, fontWeight: '800', color: '#f59e0b' },
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
  clearX: { fontSize: 14, color: 'rgba(255, 220, 180, 0.5)', paddingLeft: 8 },
  filterRow: { marginBottom: 12 },
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
  empty: { alignItems: 'center', padding: 40 },
  emptyTxt: { color: 'rgba(255, 220, 180, 0.5)', fontSize: 14 },
  card: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
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
    borderWidth: 1.5,
    borderColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTxt: { fontSize: 14, fontWeight: '800', color: '#FFEED6' },
  cardName: { fontSize: 14, fontWeight: '800', color: '#FFF5E8' },
  cardSub: { fontSize: 11, color: '#FFB74D', marginTop: 2, fontWeight: '600' },
  cardReg: { fontSize: 10, color: 'rgba(255, 220, 180, 0.5)', marginTop: 2 },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 7, 2, 0.85)',
    borderRadius: 12,
    padding: 10,
    marginVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.15)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '800', color: '#FFF5E8' },
  statLbl: { fontSize: 10, color: 'rgba(255, 220, 180, 0.5)', marginTop: 2 },
  statDiv: { width: 1, height: 20, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  actions: { flexDirection: 'row', gap: 8 },
  actView: {
    flex: 2,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  actViewTxt: { fontSize: 11, fontWeight: '800', color: '#FFB74D' },
  actVerify: {
    flex: 1.5,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actVerifyTxt: { fontSize: 11, fontWeight: '900', color: '#0A0301' },
  actDel: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  actDelTxt: { fontSize: 11, fontWeight: '700', color: '#ef4444' },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 16 },
  pageBtn: {
    backgroundColor: 'rgba(25, 12, 5, 0.75)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  pageDis: { opacity: 0.3 },
  pageBtnTxt: { fontSize: 12, fontWeight: '600', color: '#FFB74D' },
  pageNum: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 12, 5, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  pageNumAct: { backgroundColor: '#FF9500', borderColor: '#FFA726' },
  pageNumTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(255, 220, 180, 0.65)' },
  pageNumActTxt: { color: '#0A0301', fontWeight: '900' },
  heroCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.82)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  heroAvatarTxt: { fontSize: 17, fontWeight: '900', color: '#FFEED6' },
  heroName: { fontSize: 15, fontWeight: '800', color: '#FFF5E8' },
  heroSub: { fontSize: 12, color: '#FFB74D', marginTop: 2, fontWeight: '600' },
  heroSubMuted: { fontSize: 11, color: 'rgba(255, 220, 180, 0.55)', marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(25, 12, 5, 0.72)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.2)',
  },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FF9500' },
  tabTxt: { fontSize: 11, fontWeight: '700', color: 'rgba(255, 220, 180, 0.6)' },
  tabTxtActive: { color: '#0A0301', fontWeight: '900' },
  dSec: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
  },
  dSecTitle: { fontSize: 13, fontWeight: '800', color: '#FFB74D', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: { fontSize: 12, color: 'rgba(255, 220, 180, 0.6)', fontWeight: '600', flex: 1 },
  infoValue: { fontSize: 12, color: '#FFF5E8', fontWeight: '700', flex: 1.4, textAlign: 'right' },
  infoHighlight: { color: '#FF9500', fontWeight: '800' },
  missionLabel: { fontSize: 12, color: '#FFB74D', marginTop: 12, fontWeight: '700' },
  missionTxt: { fontSize: 13, color: 'rgba(255, 235, 215, 0.8)', lineHeight: 20, marginTop: 4 },
  docTitle: { fontSize: 12, color: '#FFB74D', marginTop: 14, marginBottom: 8, fontWeight: '700' },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  docIcon: { marginRight: 8, fontSize: 14 },
  docText: { fontSize: 13, color: '#FFF5E8', fontWeight: '600' },
  perfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  perfCard: {
    backgroundColor: 'rgba(15, 7, 2, 0.85)',
    borderRadius: 14,
    padding: 14,
    width: (width - 64) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.2)',
  },
  perfVal: { fontSize: 20, fontWeight: '900', color: '#FFF5E8' },
  perfLbl: { fontSize: 11, color: 'rgba(255, 220, 180, 0.55)', marginTop: 4, fontWeight: '600' },
  actPrimary: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actPrimaryTxt: { fontSize: 12, fontWeight: '900', color: '#0A0301', letterSpacing: 0.5 },
  actWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  actWarnTxt: { fontSize: 12, fontWeight: '800', color: '#f59e0b' },
  actDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  actDangerTxt: { fontSize: 12, fontWeight: '800', color: '#ef4444' },
});
