import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './FindLawyer.styles';
import { useMockStore, lawyers, fetchLawyersList } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';

const TYPE_OPTIONS = ['All Types', 'Property Law', 'Family Law'];
const DISTRICT_OPTIONS = ['All Districts', 'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Thatta', 'Mirpur Khas'];

const getBriefExperience = (exp) => {
  if (!exp) return '8+ Years';
  const match = String(exp).match(/(\d+\+?\s*(?:years?|yrs?))/i);
  if (match) return `${match[1]} Practice`;
  if (String(exp).length > 20) return String(exp).slice(0, 18) + '...';
  return String(exp);
};

export default function FindLawyer() {
  useMockStore();
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const { t, currentLang, translateCategory, translateDistrict, translateCourt, translateLawyerName } = useAppTranslation();
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [search, setSearch] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showLawyerProfile, setShowLawyerProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLawyersList();
    setRefreshing(false);
  };

  // Hardware back returns to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  useEffect(() => {
    fetchLawyersList();
  }, []);

  const filtered = lawyers.filter(l => {
    // 1. Legal Type filter (Property / Family)
    let matchType = true;
    if (selectedType === 'Property Law') {
      matchType = /property|land|real estate|tenancy/i.test(l.spec || '');
    } else if (selectedType === 'Family Law') {
      matchType = /family|custody|khula|divorce/i.test(l.spec || '');
    }

    // 2. District filter
    let matchDistrict = true;
    if (selectedDistrict !== 'All Districts') {
      matchDistrict = (l.district || l.location || '').toLowerCase().includes(selectedDistrict.toLowerCase());
    }

    // 3. Search query
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      (l.name || '').toLowerCase().includes(q) ||
      (l.district && l.district.toLowerCase().includes(q)) ||
      (l.spec && l.spec.toLowerCase().includes(q));

    return matchType && matchDistrict && matchSearch;
  });

  const handleBookConsultation = (lawyer) => {
    setShowLawyerProfile(false);
    router.push({
      pathname: '/(citizen)/RequestConsultation',
      params: { lawyerId: lawyer.id }
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBarStyle} translucent backgroundColor={theme.statusBarBg} />

      {/* Top Header matching app standard */}
      <AppHeader
        title={t('citizen.findLawyers', 'Find Lawyers')}
        showBack={true}
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" colors={['#FF9500']} />
        }
      >
        {/* SEARCH BAR */}
        <View style={[
          styles.searchBar,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
          }
        ]}>
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t('citizen.searchLawyersPlaceholder', 'Search by advocate name, specialty, district...')}
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* FILTER 1: CASE TYPE (FAMILY / PROPERTY) */}
        <Text style={styles.filterSectionLabel}>Legal Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {TYPE_OPTIONS.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
                selectedType === type && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.textSecondary },
                  selectedType === type && styles.filterTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FILTER 2: SINDH DISTRICT */}
        <Text style={styles.filterSectionLabel}>Sindh District</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filterRow, { marginBottom: 16 }]}
        >
          {DISTRICT_OPTIONS.map((dist) => (
            <TouchableOpacity
              key={dist}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
                selectedDistrict === dist && styles.filterChipActive,
              ]}
              onPress={() => setSelectedDistrict(dist)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.textSecondary },
                  selectedDistrict === dist && styles.filterChipActive,
                ]}
              >
                {dist}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ADVOCATE CARDS (Mirrors MyCases card structure) */}
        {filtered.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No verified advocates match your criteria.
          </Text>
        ) : (
          filtered.map((l, i) => (
            <TouchableOpacity
              key={l.id || i}
              style={[
                styles.caseCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                }
              ]}
              activeOpacity={0.84}
              onPress={() => {
                setSelectedLawyer(l);
                setShowLawyerProfile(true);
              }}
            >
              <View style={styles.caseCardTop}>
                <View style={styles.caseType}>
                  <Text
                    style={[styles.caseTitle, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {translateLawyerName(l.name) || l.name || 'Advocate'}
                  </Text>
                  <Text style={[styles.caseMeta, { color: theme.textMuted }]}>
                    {translateCategory(l.spec) || l.spec || 'Legal Counsel'} · {translateDistrict(l.district || l.location) || l.district || l.location || 'Sindh'}
                  </Text>
                </View>
                <Text style={[
                  styles.badgeText,
                  !isDarkMode && { color: '#B45309', backgroundColor: 'rgba(217, 119, 6, 0.12)', borderColor: 'rgba(217, 119, 6, 0.35)' }
                ]}>
                  {l.sbc ? `SBC ${l.sbc}` : 'SBC VERIFIED'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: theme.divider,
                  paddingTop: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedLawyer(l);
                    setShowLawyerProfile(true);
                  }}
                  activeOpacity={0.7}
                  style={{ flex: 1, marginRight: 8, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Text
                    style={{ fontSize: 11, color: theme.textSecondary }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {getBriefExperience(l.experience)} · <Text style={{ textDecorationLine: 'underline', color: '#FF9500', fontWeight: '700' }}>{t('common.profile', 'View Profile')}</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleBookConsultation(l)}
                  activeOpacity={0.75}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF9500' }}>
                    {t('citizen.requestConsultation', 'Request Consult')}
                  </Text>
                  <Image
                    source={require('../../assets/images/arrow.png')}
                    style={{ width: 14, height: 10 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* LAWYER PROFILE MODAL */}
      <Modal
        visible={showLawyerProfile}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLawyerProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            {
              backgroundColor: theme.headerBg,
              borderColor: theme.cardBorder,
            }
          ]}>
            {selectedLawyer && (
              <>
                <View style={[
                  styles.modalHeader,
                  { borderBottomColor: theme.divider }
                ]}>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    {t('lawyer.advocateProfile', 'Advocate Profile')}
                  </Text>
                  <TouchableOpacity onPress={() => setShowLawyerProfile(false)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>X</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <View style={[
                    styles.profileHero,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.surfaceBorder,
                    }
                  ]}>
                    <View style={[styles.lawyerAvatar, { width: 64, height: 64, borderRadius: 32, backgroundColor: selectedLawyer.color || '#FF9500' }]}>
                      <Text style={[styles.lawyerAvatarText, { fontSize: 22 }]}>
                        {selectedLawyer.initials || (selectedLawyer.name ? selectedLawyer.name.replace(/^(Adv\.?|Advocate)\s+/i, '').slice(0, 2).toUpperCase() : 'ADV')}
                      </Text>
                    </View>
                    <Text style={[styles.profileModalName, { color: theme.textPrimary }]}>
                      {translateLawyerName(selectedLawyer.name) || selectedLawyer.name}
                    </Text>
                    <Text style={styles.profileModalSpec}>
                      {translateCategory(selectedLawyer.spec) || selectedLawyer.spec}
                    </Text>
                    <Text style={[styles.profileModalLoc, { color: theme.textMuted }]}>
                      Chamber Jurisdiction: {translateDistrict(selectedLawyer.location || selectedLawyer.district) || selectedLawyer.location || selectedLawyer.district || 'Sindh'}
                    </Text>
                  </View>

                  <View style={[
                    styles.modalSection,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.surfaceBorder,
                    }
                  ]}>
                    <Text style={styles.sectionHeading}>Credentials & SBC Status</Text>
                    <Text style={[styles.modalDetailText, { color: theme.textPrimary }]}>
                      Sindh Bar Council: {selectedLawyer.sbc || 'Verified'}
                    </Text>
                    <Text style={[styles.modalDetailText, { color: theme.textPrimary }]}>
                      Experience: {selectedLawyer.fullBio || selectedLawyer.experience || '8+ Years'}
                    </Text>
                    <Text style={[styles.modalDetailText, { color: theme.textPrimary }]}>
                      Chamber: {translateCourt(selectedLawyer.chamber || selectedLawyer.court) || selectedLawyer.chamber || selectedLawyer.court || 'High Court of Sindh'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.consultBtn, { marginTop: 14, paddingVertical: 12 }]}
                    onPress={() => handleBookConsultation(selectedLawyer)}
                    activeOpacity={0.85}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Text style={[styles.consultBtnText, { fontSize: 13 }]}>
                        {t('citizen.requestConsultation', 'Proceed to Consultation Booking')}
                      </Text>
                      <Image
                        source={require('../../assets/images/arrow.png')}
                        style={{ width: 16, height: 11 }}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Unified Bottom Navigation */}
      <BottomNavBar role="citizen" activeTab="lawyers" />
    </SafeAreaView>
  );
}
