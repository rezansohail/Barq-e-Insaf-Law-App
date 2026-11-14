import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StatusBar, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const { width } = Dimensions.get('window');
const PER_PAGE = 5;

const INITIAL_NGOS = [
  {
    id: 'NGO-001',
    name: 'National Commission for Human Development (NCHD)',
    registrationNo: 'NCHD-FED-2002',
    registeredOn: '15 Jan 2022',
    type: 'Human Rights',
    status: 'Active',
    verificationStatus: 'Verified',
    city: 'Karachi',
    country: 'Pakistan',
    email: 'info@nchd.org.pk',
    phone: '+92 21 99201234',
    officeAddress: 'Sindh Provincial Office, Saddar, Karachi',
    founder: 'Federal Govt / Board of Trustees',
    contactPerson: 'Director Legal Affairs',
    areasOfWork: 'Literacy, Legal Literacy, Civil Rights & Empowerment',
    operatingRegions: 'Karachi, Hyderabad, Larkana, Sukkur',
    mission: 'Empowering communities through grassroots human development and free legal support.',
    totalCases: 284,
    totalBeneficiaries: 1420,
    totalLawyers: 38,
    activePrograms: 6,
    lastLogin: 'Today, 11:20 AM',
    documents: ['NCHD_Charter.pdf', 'Sindh_Govt_MOU.pdf', 'Tax_Exemption_Cert.pdf'],
  },
  {
    id: 'NGO-002',
    name: 'Legal Aid Society (LAS) Sindh',
    registrationNo: 'LAS-SND-1998',
    registeredOn: '10 Mar 2022',
    type: 'Legal Aid',
    status: 'Active',
    verificationStatus: 'Verified',
    city: 'Karachi',
    country: 'Pakistan',
    email: 'contact@legalaidsociety.com.pk',
    phone: '+92 21 35839900',
    officeAddress: 'Clifton Block 5, Karachi',
    founder: 'Justice (R) Nasir Aslam Zahid',
    contactPerson: 'Adv. Mehmood Alam',
    areasOfWork: 'Prisoner Support, Free Defense, Legal Awareness',
    operatingRegions: 'All Sindh Districts',
    mission: 'Ensuring equitable access to justice for the marginalized and undertrial prisoners.',
    totalCases: 512,
    totalBeneficiaries: 3100,
    totalLawyers: 64,
    activePrograms: 8,
    lastLogin: 'Yesterday, 04:15 PM',
    documents: ['LAS_Registration_Doc.pdf', 'High_Court_Permission.pdf'],
  },
  {
    id: 'NGO-003',
    name: 'Aurat Foundation Sindh Chapter',
    registrationNo: 'AF-KHI-2005',
    registeredOn: '22 Aug 2023',
    type: 'Women Rights',
    status: 'Active',
    verificationStatus: 'Verified',
    city: 'Hyderabad',
    country: 'Pakistan',
    email: 'sindh@auratfoundation.org',
    phone: '+92 22 2781190',
    officeAddress: 'Civil Lines, Hyderabad',
    founder: 'Nigar Ahmad',
    contactPerson: 'Regional Coordinator',
    areasOfWork: 'Women Legal Aid, Domestic Violence Relief, Inheritance Rights',
    operatingRegions: 'Hyderabad, Mirpurkhas, Badin',
    mission: 'Promoting gender equity, combating discrimination, and offering shelter and legal advocacy.',
    totalCases: 198,
    totalBeneficiaries: 890,
    totalLawyers: 22,
    activePrograms: 4,
    lastLogin: '3 days ago',
    documents: ['Societies_Act_Cert.pdf', 'Audit_Report_2023.pdf'],
  },
  {
    id: 'NGO-004',
    name: 'Sindh Rural Support Organization (SRSO)',
    registrationNo: 'SRSO-SUK-2009',
    registeredOn: '04 Feb 2024',
    type: 'Welfare',
    status: 'Pending',
    verificationStatus: 'Pending',
    city: 'Sukkur',
    country: 'Pakistan',
    email: 'info@srso.org.pk',
    phone: '+92 71 5627181',
    officeAddress: 'SRSO Complex, Shikarpur Road, Sukkur',
    founder: 'Community Board',
    contactPerson: 'Project Lead',
    areasOfWork: 'Rural Land Rights, Community Mediation, Legal Aid',
    operatingRegions: 'Northern Sindh',
    mission: 'Fostering grassroots community institutions and access to justice in rural Sindh.',
    totalCases: 64,
    totalBeneficiaries: 340,
    totalLawyers: 12,
    activePrograms: 3,
    lastLogin: '1 week ago',
    documents: ['Registration_Pending_Review.pdf'],
  },
];

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
  const sc = statusColors[n.status] || statusColors['Pending'];
  const initials = (n.name || '').split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

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
        <View style={s.heroCard}>
          <View style={s.heroAvatar}>
            <Text style={s.heroAvatarTxt}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroName}>{n.name}</Text>
            <Text style={s.heroSub}>{n.id} · {n.type}</Text>
            <Text style={s.heroSubMuted}>📍 {n.city} · Reg: {n.registrationNo}</Text>
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
            <DSec title="🏢 Organization Details">
              <IR label="NGO ID"           value={n.id} />
              <IR label="Registration No." value={n.registrationNo} />
              <IR label="Registered On"    value={n.registeredOn} />
              <IR label="NGO Type"         value={n.type} />
              <IR label="Founder / Board"  value={n.founder} />
              <IR label="Contact Person"   value={n.contactPerson} />
            </DSec>

            <DSec title="📞 Contact & Headquarters">
              <IR label="Official Email"   value={n.email} />
              <IR label="Phone"            value={n.phone} />
              <IR label="Office Address"   value={n.officeAddress} />
              <IR label="City"             value={n.city} />
              <IR label="Country"          value={n.country} />
            </DSec>

            <DSec title="🎯 Mission & Scope">
              <IR label="Areas of Work"     value={n.areasOfWork} />
              <IR label="Operating Regions" value={n.operatingRegions} />
              <Text style={s.missionLabel}>Mission Statement:</Text>
              <Text style={s.missionTxt}>{n.mission}</Text>
            </DSec>
          </>
        )}

        {tab === 'Verification' && (
          <DSec title="✅ Accreditation & Documents">
            <IR label="Verification Status" value={n.verificationStatus} highlight />
            <Text style={s.docTitle}>Uploaded Compliance Documents</Text>
            {(n.documents || []).map((d, i) => (
              <View key={i} style={s.docRow}>
                <Text style={s.docIcon}>📄</Text>
                <Text style={s.docText}>{d}</Text>
              </View>
            ))}
          </DSec>
        )}

        {tab === 'Statistics' && (
          <DSec title="📊 Impact Metrics">
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
            <DSec title="🔐 Account Status">
              <IR label="Current Status"  value={n.status} highlight />
              <IR label="Registered On"   value={n.registeredOn} />
              <IR label="Last Active"     value={n.lastLogin} />
            </DSec>

            <DSec title="🛡️ Administrative Actions">
              <TouchableOpacity style={s.actPrimary} activeOpacity={0.8}>
                <Text style={s.actPrimaryTxt}>✓ VERIFY & APPROVE NGO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actWarn} activeOpacity={0.8}>
                <Text style={s.actWarnTxt}>⏸ Suspend Operations</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actDanger} activeOpacity={0.8}>
                <Text style={s.actDangerTxt}>✕ Delete Registry Entry</Text>
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
  const [data, setData]         = useState(INITIAL_NGOS);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('All');
  const [type, setType]         = useState('All');
  const [page, setPage]         = useState(1);
  const [detail, setDetail]     = useState(null);

  // Back returns to Admin Overview
  useAppNavigation({ isHome: false, homeRoute: '/(Admin)' });

  let filtered = data.filter(n => {
    const q = search.toLowerCase();
    const matchQ =
      (n.name || '').toLowerCase().includes(q) ||
      (n.registrationNo || '').toLowerCase().includes(q) ||
      (n.city || '').toLowerCase().includes(q) ||
      String(n.id ?? '').toLowerCase().includes(q);
    return matchQ && (status === 'All' || n.status === status) && (type === 'All' || n.type === type);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const reset      = () => setPage(1);

  const handleDelete  = id => setData(p => p.filter(n => n.id !== id));
  const handleVerify  = id => setData(p => p.map(n => n.id === id ? { ...n, verificationStatus: 'Verified', status: 'Active' } : n));

  if (detail) {
    return <NGODetail ngo={detail} onBack={() => setDetail(null)} />;
  }

  const pendingCount = data.filter(n => n.verificationStatus === 'Pending').length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

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

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={s.searchBox}>
          <Text style={{ color: '#FF9500', fontSize: 16 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search NGO name, ID, city..."
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
            value={search}
            onChangeText={t => { setSearch(t); reset(); }}
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(''); reset(); }}>
              <Text style={s.clearX}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
          {STATUSES.map(st => (
            <TouchableOpacity
              key={st}
              style={[s.chip, status === st && s.chipActive]}
              onPress={() => { setStatus(st); reset(); }}
              activeOpacity={0.75}
            >
              <Text style={[s.chipTxt, status === st && s.chipTxtActive]}>{st}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.filterRow, { marginTop: -4 }]}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.chip, type === t && s.chipActive]}
              onPress={() => { setType(t); reset(); }}
              activeOpacity={0.75}
            >
              <Text style={[s.chipTxt, type === t && s.chipTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* NGO List */}
        {paginated.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>No organizations found matching criteria.</Text>
          </View>
        ) : (
          paginated.map(n => {
            const sc = statusColors[n.status] || statusColors['Pending'];
            const initials = (n.name || '').split(' ').map(w => w[0]).join('').slice(0, 2);
            return (
              <View key={n.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarTxt}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardName}>{n.name}</Text>
                    <Text style={s.cardSub}>{n.type} · {n.city}</Text>
                    <Text style={s.cardReg}>Reg: {n.registrationNo}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Text style={[s.statusTxt, { color: sc.text }]}>{n.status}</Text>
                  </View>
                </View>

                {/* Metrics */}
                <View style={s.statsRow}>
                  <View style={s.statItem}>
                    <Text style={s.statVal}>{n.totalCases}</Text>
                    <Text style={s.statLbl}>Cases</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.statItem}>
                    <Text style={s.statVal}>{n.totalBeneficiaries}</Text>
                    <Text style={s.statLbl}>Beneficiaries</Text>
                  </View>
                  <View style={s.statDiv} />
                  <View style={s.statItem}>
                    <Text style={s.statVal}>{n.totalLawyers}</Text>
                    <Text style={s.statLbl}>Advocates</Text>
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
              <Text style={s.pageBtnTxt}>← Prev</Text>
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
              <Text style={s.pageBtnTxt}>Next →</Text>
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
