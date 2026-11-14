import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './FindLawyer.styles';
import { useMockStore, lawyers } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const specialties = ['All', 'Property', 'Family', 'Civil', 'Criminal'];

export default function FindLawyer() {
  useMockStore();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showLawyerProfile, setShowLawyerProfile] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Hardware back button returns to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const filtered = lawyers.filter(l => {
    const matchSpec = activeFilter === 'All' || (l.spec && l.spec.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || (l.district && l.district.toLowerCase().includes(search.toLowerCase()));
    return matchSpec && matchSearch;
  });

  const handleLawyerPress = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowLawyerProfile(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Find Lawyers' Header */}
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
            placeholder="Search by advocate name or district..."
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {specialties.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, activeFilter === s && styles.filterChipActive]}
              onPress={() => setActiveFilter(s)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, activeFilter === s && styles.filterTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LAWYER CARDS */}
        {filtered.length === 0 && (
          <Text style={[styles.lawyerSpec, { textAlign: 'center', marginTop: 30 }]}>
            No advocates found matching your query.
          </Text>
        )}

        {filtered.map((l, i) => (
          <View key={i} style={styles.lawyerCard}>
            <View style={[styles.lawyerAvatar, { backgroundColor: l.color || '#2A1206' }]}>
              <Text style={styles.lawyerAvatarText}>{l.initials || l.name?.slice(0, 2).toUpperCase()}</Text>
            </View>

            <View style={styles.lawyerInfo}>
              <Text style={styles.lawyerName}>{l.name}</Text>
              <Text style={styles.lawyerSpec}>{l.spec}</Text>

              <View style={styles.lawyerMeta}>
                <Text style={styles.sbcBadge}>{l.sbc || 'SBC Verified'}</Text>
                <Text style={styles.ratingText}>★ {l.rating || '4.9'}</Text>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.profileBtn]}
                  onPress={() => handleLawyerPress(l)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.profileBtnText}>VIEW PROFILE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.requestBtn]}
                  onPress={() => {
                    router.push({
                      pathname: '/(citizen)/RequestConsultation',
                      params: { lawyerId: l.id }
                    });
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.requestBtnText}>CONSULT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="lawyers" />

      {/* LAWYER PROFILE MODAL */}
      <Modal
        transparent={true}
        visible={showLawyerProfile}
        animationType="slide"
        onRequestClose={() => setShowLawyerProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.lawyerProfileContainer}>
            <TouchableOpacity 
              style={styles.closeProfileBtn}
              onPress={() => setShowLawyerProfile(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeProfileText}>✕ Close</Text>
            </TouchableOpacity>
            
            {selectedLawyer && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.profileAvatarLarge, { backgroundColor: selectedLawyer.color || '#2A1206' }]}>
                  <Text style={styles.profileAvatarText}>{selectedLawyer.initials || selectedLawyer.name?.slice(0, 2).toUpperCase()}</Text>
                </View>
                
                <Text style={styles.profileName}>{selectedLawyer.name}</Text>
                <Text style={styles.profileSpec}>{selectedLawyer.spec}</Text>
                
                <View style={styles.profileDetails}>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>District / Court</Text>
                    <Text style={styles.profileDetailValue}>{selectedLawyer.location || selectedLawyer.district}</Text>
                  </View>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>Client Rating</Text>
                    <Text style={styles.profileDetailValue}>★ {selectedLawyer.rating} / 5.0</Text>
                  </View>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>Successful Cases</Text>
                    <Text style={styles.profileDetailValue}>{selectedLawyer.cases || selectedLawyer.casesWon || '150+'}</Text>
                  </View>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>SBC Bar License</Text>
                    <Text style={styles.profileDetailValue}>{selectedLawyer.sbc || 'Verified SBC Advocate'}</Text>
                  </View>
                </View>
                
                <Text style={styles.profileAbout}>{selectedLawyer.about || 'Certified advocate authorized by the Sindh Bar Council to practice across high courts and district civil/criminal benches.'}</Text>
                
                {/* OFFICE SCHEDULE BUTTON */}
                <TouchableOpacity 
                  style={styles.scheduleBtn} 
                  onPress={() => setShowScheduleModal(true)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.scheduleBtnText}>View Office Availability</Text>
                </TouchableOpacity>

                {/* REVIEWS */}
                <Text style={styles.reviewsHeader}>Client Reviews</Text>
                {(selectedLawyer.reviews || [
                  { user: 'Rezan S.', rating: '5.0', comment: 'Very professional, resolved our land matter with prompt court filings.' },
                  { user: 'Bilal A.', rating: '4.8', comment: 'Thorough guidance on civil disputes.' },
                ]).map((r, ri) => (
                  <View key={ri} style={styles.reviewCard}>
                    <Text style={styles.reviewUser}>{r.user} · ★ {r.rating}</Text>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                  </View>
                ))}

                <View style={{ marginTop: 14, marginBottom: 12 }}>
                  <LiquidGlassButton
                    title="BOOK CONSULTATION"
                    onPress={() => {
                      setShowLawyerProfile(false);
                      router.push({
                        pathname: '/(citizen)/RequestConsultation',
                        params: { lawyerId: selectedLawyer.id }
                      });
                    }}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* SCHEDULE MODAL */}
      <Modal
        transparent={true}
        visible={showScheduleModal}
        animationType="fade"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            <Text style={styles.popupTitle}>Office Availability</Text>
            {(selectedLawyer?.schedule || [
              { day: 'Mon - Thu', time: '10:00 AM - 02:00 PM' },
              { day: 'Friday',    time: '10:00 AM - 12:30 PM' },
              { day: 'Saturday',  time: '11:00 AM - 01:00 PM' },
            ]).map((item, idx) => (
              <View key={idx} style={styles.scheduleItemRow}>
                <Text style={styles.scheduleDay}>{item.day}</Text>
                <Text style={styles.scheduleTime}>{item.time}</Text>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.popupCloseBtn}
              onPress={() => setShowScheduleModal(false)}
            >
              <Text style={styles.popupCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
