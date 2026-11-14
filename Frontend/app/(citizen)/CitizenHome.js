import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './CitizenHome.styles';
import { useMockStore, userData, lawyers, activeCases } from './MockStore';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import LanguagePeekingTab from '../../components/LanguagePeekingTab';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function CitizenHome() {
  useMockStore();
  const router = useRouter();
  const [showCasePopup, setShowCasePopup] = useState(false);
  const [showLawyerProfile, setShowLawyerProfile] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [requestSent] = useState(false);

  // Enforce double-back to exit on Home, never fall back to login screen
  useAppNavigation({ isHome: true, homeRoute: '/(citizen)/CitizenHome' });

  const handleBuildCase = () => {
    setShowCasePopup(true);
  };

  const handleCaseTypeSelect = (type) => {
    setShowCasePopup(false);
    router.push({
      pathname: '/(citizen)/CaseForm',
      params: { caseType: type }
    });
  };

  const handleLawyerPress = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowLawyerProfile(true);
  };

  const handleCasePress = (caseItem) => {
    router.push({
      pathname: '/(citizen)/CaseDetail',
      params: { caseId: caseItem.id }
    });
  };

  // Filter lawyers by citizen's current district (fallback to all verified lawyers)
  const localLawyers = lawyers.filter(
    l => userData.district && l.district && l.district.toLowerCase() === userData.district.toLowerCase()
  );
  const displayLawyers = localLawyers.length > 0 ? localLawyers : lawyers;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#140803" />

      {/* HEADER - Main Dashboard (No Back Button) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>BI</Text>
            </View>
            <View style={styles.brand}>
              <Text style={styles.brandName}>Barq-e-Insaf</Text>
              <Text style={styles.brandSub}>Citizen Portal</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(citizen)/MyCases')}>
              <Text style={styles.notifBtnText}>Cases ({activeCases.length})</Text>
            </TouchableOpacity>

            {/* Top Right Dropdown Menu with Sign Out, Profile, Dark/Light Mode */}
            <TopHeaderMenu role="citizen" avatarText={userData.dp || 'AK'} />
          </View>
        </View>

        <Text style={styles.greeting}>Asalam-u-Alaikum{userData.name ? `, ${userData.name}` : ''}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BUILD A CASE LIQUID GLASS BUTTON */}
        <LiquidGlassButton
          title="⚡ BUILD YOUR CASE"
          onPress={handleBuildCase}
        />

        {/* VERIFIED LAWYERS NEAR YOU */}
        <Text style={styles.sectionLabel}>
          Verified Advocates Near You {localLawyers.length > 0 ? `(${userData.district})` : '(Sindh High Court)'}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.lawyerRow}
        >
          {displayLawyers.length > 0 ? (
            displayLawyers.map((l, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.lawyerBubble}
                onPress={() => handleLawyerPress(l)}
              >
                <View style={[styles.lawyerAvatar, { backgroundColor: l.color }]}>
                  <Text style={styles.lawyerAvatarText}>{l.initials}</Text>
                </View>
                <Text style={styles.lawyerName} numberOfLines={1}>{l.name}</Text>
                <Text style={styles.lawyerSpec}>{l.spec}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>Rating: {l.rating}</Text>
                </View>
                <Text style={styles.sbcBadge}>SBC Approved</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No lawyers found in this district.</Text>
          )}
        </ScrollView>

        {/* ACTIVE CASES */}
        <Text style={styles.sectionLabel}>My Active Cases</Text>
        {activeCases.length === 0 && (
          <Text style={styles.emptyText}>No active cases yet.</Text>
        )}
        {activeCases.map((c, i) => (
          <TouchableOpacity
            key={i}
            style={styles.caseItem}
            onPress={() => handleCasePress(c)}
          >
            <View style={[styles.caseDot, { backgroundColor: c.status === 'Active' ? '#4ade80' : '#f59e0b' }]} />
            <View style={styles.caseInfo}>
              <Text style={styles.caseTitle}>{c.title}</Text>
              <Text style={styles.caseSub}>{c.type} Law · Updated {c.lastUpdated}</Text>
            </View>
            <Text style={styles.badgeText}>{c.status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="home" />

      {/* CASE TYPE POPUP */}
      <Modal
        transparent={true}
        visible={showCasePopup}
        animationType="fade"
        onRequestClose={() => setShowCasePopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            <Text style={styles.popupTitle}>Choose Case Type</Text>
            <Text style={styles.popupSubtitle}>
              Select the type of case you want to build. Each type has specific requirements and documentation needs.
            </Text>
            
            <TouchableOpacity 
              style={styles.caseTypeOption}
              onPress={() => handleCaseTypeSelect('property')}
            >
              <View style={styles.caseTypeInfo}>
                <Text style={styles.caseTypeTitle}>🏠 Property & Land Dispute</Text>
                <Text style={styles.caseTypeDesc}>
                  Ownership, inheritance, illegal possession, tenancy disputes, and KMC/LDA registry matters.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.caseTypeOption}
              onPress={() => handleCaseTypeSelect('family')}
            >
              <View style={styles.caseTypeInfo}>
                <Text style={styles.caseTypeTitle}>👨‍👩‍👦 Family & Custody Case</Text>
                <Text style={styles.caseTypeDesc}>
                  Khula/Divorce, child custody, monthly maintenance, and dowry restitution under Family Courts Act.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.caseTypeOption}
              onPress={() => handleCaseTypeSelect('inheritance')}
            >
              <View style={styles.caseTypeInfo}>
                <Text style={styles.caseTypeTitle}>📜 Inheritance & Succession</Text>
                <Text style={styles.caseTypeDesc}>
                  Legal heirship certificates, succession certificates under Act 1925, and Shariat distribution.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.caseTypeOption}
              onPress={() => handleCaseTypeSelect('civil')}
            >
              <View style={styles.caseTypeInfo}>
                <Text style={styles.caseTypeTitle}>⚖️ Civil & Contract Breach</Text>
                <Text style={styles.caseTypeDesc}>
                  Breach of agreement, financial recovery, cheque bounce (PPC 489-F), and civil injunctions.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.popupCloseBtn}
              onPress={() => setShowCasePopup(false)}
            >
              <Text style={styles.popupCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
            >
              <Text style={styles.closeProfileText}>Close</Text>
            </TouchableOpacity>
            
            {selectedLawyer && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.profileAvatarLarge, { backgroundColor: selectedLawyer.color }]}>
                  <Text style={styles.profileAvatarText}>{selectedLawyer.initials}</Text>
                </View>
                
                <Text style={styles.profileName}>{selectedLawyer.name}</Text>
                <Text style={styles.profileSpec}>{selectedLawyer.spec}</Text>
                
                <View style={styles.profileDetails}>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>Location</Text>
                    <Text style={styles.profileDetailValue}>{selectedLawyer.location}</Text>
                  </View>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>Rating</Text>
                    <Text style={styles.profileDetailValue}>{selectedLawyer.rating}</Text>
                  </View>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>Successful Cases</Text>
                    <Text style={styles.profileDetailValue}>{selectedLawyer.cases}</Text>
                  </View>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>Experience</Text>
                    <Text style={styles.profileDetailValue}>{selectedLawyer.experience}</Text>
                  </View>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>SBC Number</Text>
                    <Text style={styles.profileDetailValue}>{selectedLawyer.sbc} (Approved)</Text>
                  </View>
                </View>
                
                <Text style={styles.profileAbout}>{selectedLawyer.about}</Text>
                
                {/* OFFICE SCHEDULE BUTTON */}
                <TouchableOpacity 
                  style={styles.scheduleBtn} 
                  onPress={() => setShowScheduleModal(true)}
                >
                  <Text style={styles.scheduleBtnText}>View Office Schedule</Text>
                </TouchableOpacity>

                {/* REVIEWS LIST */}
                <Text style={styles.reviewsTitle}>Client Reviews</Text>
                {selectedLawyer.reviews.map((r, ri) => (
                  <View key={ri} style={styles.reviewCard}>
                    <Text style={styles.reviewUser}>{r.user} (Rating: {r.rating})</Text>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                  </View>
                ))}
                
                {requestSent ? (
                  <View style={styles.requestSentContainer}>
                    <Text style={styles.requestSentText}>Request Sent Successfully</Text>
                  </View>
                ) : (
                  <View style={{ marginTop: 14, marginBottom: 8 }}>
                    <LiquidGlassButton
                      title="REQUEST CONSULTATION"
                      onPress={() => {
                        setShowLawyerProfile(false);
                        router.push({
                          pathname: '/(citizen)/RequestConsultation',
                          params: { lawyerId: selectedLawyer.id }
                        });
                      }}
                    />
                  </View>
                )}
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
            <Text style={styles.popupTitle}>Office Schedule</Text>
            {selectedLawyer && selectedLawyer.schedule.map((item, idx) => (
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
      {/* PEinterface: Sliding Language Card (Urdu/Sindhi/English) */}
      <LanguagePeekingTab />
    </SafeAreaView>
  );
}