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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './FindLawyer.styles';
import { useMockStore, lawyers, fetchLawyersList } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';

const specialties = ['All', 'Property', 'Family', 'Civil', 'Criminal'];

export default function FindLawyer() {
  useMockStore();
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showLawyerProfile, setShowLawyerProfile] = useState(false);

  // Hardware back returns to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  useEffect(() => {
    fetchLawyersList(activeFilter);
  }, [activeFilter]);

  const filtered = lawyers.filter(l => {
    const matchSpec = activeFilter === 'All' || (l.spec && l.spec.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchSearch = (l.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (l.district && l.district.toLowerCase().includes(search.toLowerCase())) ||
      (l.spec && l.spec.toLowerCase().includes(search.toLowerCase()));
    return matchSpec && matchSearch;
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
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={theme.bg} />

      {/* Top Header matching app standard */}
      <AppHeader
        title="Find Lawyers"
        showBack={true}
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by advocate name, specialty, district..."
            placeholderTextColor="rgba(255, 220, 180, 0.45)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {specialties.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[
                styles.filterChip,
                activeFilter === spec && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(spec)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === spec && styles.filterTextActive,
                ]}
              >
                {spec}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ADVOCATE CARDS */}
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No verified advocates match your criteria.</Text>
        ) : (
          filtered.map((l, i) => (
            <View key={l.id || i} style={styles.lawyerCard}>
              <View style={[styles.lawyerAvatar, { backgroundColor: l.color || 'rgba(255, 149, 0, 0.15)' }]}>
                <Text style={styles.lawyerAvatarText}>{l.initials || 'ADV'}</Text>
              </View>

              <View style={styles.lawyerInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.lawyerName}>{l.name}</Text>
                </View>

                <Text style={styles.lawyerSpec}>{l.spec} · {l.experience || 'Sindh Bar'}</Text>

                <View style={styles.lawyerMeta}>
                  <Text style={styles.sbcBadge}>{l.sbc ? `SBC ${l.sbc}` : 'SBC VERIFIED'}</Text>
                  <Text style={styles.courtBadge}>{l.court || 'Sindh High Court'}</Text>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.profileBtn]}
                    onPress={() => {
                      setSelectedLawyer(l);
                      setShowLawyerProfile(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.profileBtnText}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.consultBtn]}
                    onPress={() => handleBookConsultation(l)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.consultBtnText}>Request Consult</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
          <View style={styles.modalContainer}>
            {selectedLawyer && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Advocate Profile</Text>
                  <TouchableOpacity onPress={() => setShowLawyerProfile(false)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.profileHero}>
                    <View style={[styles.lawyerAvatar, { width: 64, height: 64, borderRadius: 32, backgroundColor: selectedLawyer.color || '#FF9500' }]}>
                      <Text style={[styles.lawyerAvatarText, { fontSize: 22 }]}>{selectedLawyer.initials || 'ADV'}</Text>
                    </View>
                    <Text style={styles.profileModalName}>{selectedLawyer.name}</Text>
                    <Text style={styles.profileModalSpec}>{selectedLawyer.spec}</Text>
                    <Text style={styles.profileModalLoc}>Chamber Jurisdiction: {selectedLawyer.location || selectedLawyer.district || 'Sindh'}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionHeading}>Credentials & SBC Status</Text>
                    <Text style={styles.modalDetailText}>Sindh Bar Council: {selectedLawyer.sbc || 'Verified'}</Text>
                    <Text style={styles.modalDetailText}>Experience: {selectedLawyer.experience || '8+ Years'}</Text>
                    <Text style={styles.modalDetailText}>Chamber: {selectedLawyer.chamber || 'High Court of Sindh'}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.consultBtn, { marginTop: 14, paddingVertical: 12 }]}
                    onPress={() => handleBookConsultation(selectedLawyer)}
                    activeOpacity={0.85}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Text style={[styles.consultBtnText, { fontSize: 13 }]}>Proceed to Consultation Booking</Text>
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
