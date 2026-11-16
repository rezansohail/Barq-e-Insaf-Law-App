import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './NGOHome.styles';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { fetchRealSindhCases } from '../../constants/realCasesStore';
import { useAppTheme } from '../../context/ThemeContext';
import SindhCasesMap from '../../components/SindhCasesMap';
import { clearSession } from '../../constants/authStore';
import { getNGOProfile, updateNGOProfile, subscribeToStore } from '../../constants/ngoMediaStore';

export default function NGOHome() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  useAppNavigation({ isHome: true, homeRoute: '/(ngo)/NGOHome' });

  const [realCases, setRealCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoProfile, setNgoProfile] = useState(getNGOProfile());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDesc, setEditDesc] = useState(ngoProfile.description);
  const [editEmail, setEditEmail] = useState(ngoProfile.email);
  const [editPhone, setEditPhone] = useState(ngoProfile.phone);
  const [editHelpline, setEditHelpline] = useState(ngoProfile.helpline);
  const [editAddress, setEditAddress] = useState(ngoProfile.officeAddress);

  useEffect(() => {
    return subscribeToStore(() => {
      const p = getNGOProfile();
      setNgoProfile(p);
      setEditDesc(p.description);
      setEditEmail(p.email);
      setEditPhone(p.phone);
      setEditHelpline(p.helpline);
      setEditAddress(p.officeAddress);
    });
  }, []);

  const handleSaveProfile = () => {
    updateNGOProfile({
      description: editDesc,
      email: editEmail,
      phone: editPhone,
      helpline: editHelpline,
      officeAddress: editAddress,
    });
    setShowEditModal(false);
    Alert.alert('Profile Updated', 'Your organization info is now updated for Citizens and Advocates.');
  };

  useEffect(() => {
    let isMounted = true;
    fetchRealSindhCases().then((cases) => {
      if (isMounted) {
        setRealCases(cases);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const totalCases = realCases.length;
  const uniqueDistricts = new Set(realCases.map((c) => c.district)).size;
  const propertyCount = realCases.filter((c) => /property|land/i.test(c.type)).length;
  const familyCount = realCases.filter((c) => /family|custody|khula/i.test(c.type)).length;
  const otherCount = Math.max(0, totalCases - propertyCount - familyCount);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out of NGO Portal',
      'Are you sure you want to end your NGO session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearSession();
            router.replace('/LoginScreen');
          },
        },
      ]
    );
  };

  const safeBg = isDarkMode ? '#080402' : '#FAF8F5';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      {/* HEADER - Main Dashboard (No Back Button) */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#120703' : '#FFFFFF', borderBottomColor: isDarkMode ? 'rgba(255, 149, 0, 0.20)' : 'rgba(234, 88, 12, 0.15)' }]}>
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <Text style={[styles.brandName, { color: '#FF9500' }]}>Barq-e-Insaf</Text>
            <Text style={[styles.brandSub, { color: isDarkMode ? 'rgba(255, 235, 215, 0.65)' : '#664530' }]}>
              Institutional Analytics Portal
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TopHeaderMenu role="ngo" avatarText="NCHD" />
          </View>
        </View>

        <Text style={[styles.orgName, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
          National Commission for Human Development (NCHD)
        </Text>
        <Text style={[styles.orgSub, { color: isDarkMode ? 'rgba(255, 220, 180, 0.7)' : '#7C5238' }]}>
          Institutional Portal · Verified Public Interest & Case Analytics
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.85)' : '#F3EFEA', borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.35)' : 'rgba(234, 88, 12, 0.2)' }]}>
            <Text style={[styles.statNum, { color: '#FFB74D' }]}>{totalCases}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255, 220, 180, 0.65)' : '#664530' }]}>Active Cases</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.85)' : '#F3EFEA', borderColor: 'transparent' }]}>
            <Text style={[styles.statNum, { color: '#00E5FF' }]}>{uniqueDistricts}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255, 220, 180, 0.65)' : '#664530' }]}>Districts</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.85)' : '#F3EFEA', borderColor: 'transparent' }]}>
            <Text style={[styles.statNum, { color: '#4ade80' }]}>Live</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255, 220, 180, 0.65)' : '#664530' }]}>Database</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFB74D' : '#C2410C' }]}>
            Sindh Real-Time Case Map
          </Text>
          <TouchableOpacity onPress={() => router.push('/(ngo)/CaseMap')}>
            <Text style={styles.seeAllText}>Fullscreen View</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#FF9500" />
          </View>
        ) : (
          <SindhCasesMap cases={realCases} />
        )}

        {/* Case Type Breakdown */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFB74D' : '#C2410C' }]}>
            Dispute Classification
          </Text>
          <TouchableOpacity onPress={() => router.push('/(ngo)/Analytics')}>
            <Text style={styles.seeAllText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.breakdownCard, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.94)' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.35)' : 'rgba(234, 88, 12, 0.25)' }]}>
          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Property & Land</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: totalCases > 0 ? `${(propertyCount / totalCases) * 100}%` : '0%', backgroundColor: '#FF9100' }]} />
            </View>
            <Text style={[styles.barVal, { color: '#FFB74D' }]}>{propertyCount}</Text>
          </View>

          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Family & Custody</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: totalCases > 0 ? `${(familyCount / totalCases) * 100}%` : '0%', backgroundColor: '#00E5FF' }]} />
            </View>
            <Text style={[styles.barVal, { color: '#00E5FF' }]}>{familyCount}</Text>
          </View>

          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Civil & Contract</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: totalCases > 0 ? `${(otherCount / totalCases) * 100}%` : '0%', backgroundColor: '#C084FC' }]} />
            </View>
            <Text style={[styles.barVal, { color: '#C084FC' }]}>{otherCount}</Text>
          </View>
        </View>

        {/* Key Indicators */}
        <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFB74D' : '#C2410C', marginTop: 14 }]}>
          Public Interest Metrics
        </Text>
        <View style={styles.insightGrid}>
          <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(22, 11, 5, 0.92)' : '#F3EFEA', borderColor: 'transparent' }]}>
            <Text style={[styles.insightNum, { color: '#FF9500' }]}>{totalCases}</Text>
            <Text style={[styles.insightLabel, { color: isDarkMode ? 'rgba(255, 235, 215, 0.7)' : '#664530' }]}>Verified Filings</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(22, 11, 5, 0.92)' : '#F3EFEA', borderColor: 'transparent' }]}>
            <Text style={[styles.insightNum, { color: '#00E5FF' }]}>{uniqueDistricts}</Text>
            <Text style={[styles.insightLabel, { color: isDarkMode ? 'rgba(255, 235, 215, 0.7)' : '#664530' }]}>Sindh Coverage</Text>
          </View>
        </View>

        {/* EDIT ORGANIZATION INFO (LIVE FOR CITIZENS & ADVOCATES) */}
        <TouchableOpacity
          style={[styles.termsBtn, { backgroundColor: 'rgba(255, 149, 0, 0.15)', borderColor: '#FF9500' }]}
          onPress={() => setShowEditModal(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.termsBtnText, { color: '#FFB74D' }]}>Edit Organization Public Profile</Text>
        </TouchableOpacity>

        {/* TERMS AND CONDITIONS LINK */}
        <TouchableOpacity
          style={styles.termsBtn}
          onPress={() => router.push('/TermsScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.termsBtnText}>View Terms & Conditions</Text>
        </TouchableOpacity>

        {/* SIGN OUT BUTTON BELOW PAGE CONTENT */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Text style={styles.signOutBtnText}>Sign Out of NGO Portal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: isDarkMode ? '#170905' : '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 149, 0, 0.35)', maxHeight: '85%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: isDarkMode ? '#FFFFFF' : '#1A0C04', marginBottom: 6 }}>
                Edit Organization Profile
              </Text>
              <Text style={{ fontSize: 12, color: isDarkMode ? 'rgba(255, 220, 180, 0.7)' : '#7C5238', marginBottom: 16 }}>
                Updates will be visible live to citizens and lawyers on NCHD Overview screen.
              </Text>

              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF9500', marginBottom: 4 }}>MISSION / MANDATE</Text>
              <TextInput
                style={{ backgroundColor: isDarkMode ? 'rgba(30, 15, 8, 0.9)' : '#F5EBE1', borderRadius: 10, padding: 12, color: isDarkMode ? '#FFF' : '#000', fontSize: 13, marginBottom: 12, minHeight: 70, textAlignVertical: 'top' }}
                value={editDesc}
                onChangeText={setEditDesc}
                multiline
              />

              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF9500', marginBottom: 4 }}>OFFICIAL DESK EMAIL</Text>
              <TextInput
                style={{ backgroundColor: isDarkMode ? 'rgba(30, 15, 8, 0.9)' : '#F5EBE1', borderRadius: 10, padding: 12, color: isDarkMode ? '#FFF' : '#000', fontSize: 13, marginBottom: 12 }}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF9500', marginBottom: 4 }}>PHONE NUMBER</Text>
              <TextInput
                style={{ backgroundColor: isDarkMode ? 'rgba(30, 15, 8, 0.9)' : '#F5EBE1', borderRadius: 10, padding: 12, color: isDarkMode ? '#FFF' : '#000', fontSize: 13, marginBottom: 12 }}
                value={editPhone}
                onChangeText={setEditPhone}
              />

              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF9500', marginBottom: 4 }}>HELPLINE</Text>
              <TextInput
                style={{ backgroundColor: isDarkMode ? 'rgba(30, 15, 8, 0.9)' : '#F5EBE1', borderRadius: 10, padding: 12, color: isDarkMode ? '#FFF' : '#000', fontSize: 13, marginBottom: 12 }}
                value={editHelpline}
                onChangeText={setEditHelpline}
              />

              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF9500', marginBottom: 4 }}>OFFICE ADDRESS</Text>
              <TextInput
                style={{ backgroundColor: isDarkMode ? 'rgba(30, 15, 8, 0.9)' : '#F5EBE1', borderRadius: 10, padding: 12, color: isDarkMode ? '#FFF' : '#000', fontSize: 13, marginBottom: 18 }}
                value={editAddress}
                onChangeText={setEditAddress}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={{ color: isDarkMode ? '#FFF' : '#333', fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#FF9500', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                  onPress={handleSaveProfile}
                >
                  <Text style={{ color: '#000', fontWeight: '800' }}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="ngo" activeTab="home" />
    </SafeAreaView>
  );
}
