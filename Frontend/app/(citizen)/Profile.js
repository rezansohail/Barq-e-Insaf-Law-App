import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './Profile.styles';
import { useMockStore, userData, updateProfile, fetchCitizenDashboard } from './MockStore';
import { getCurrentCitizenId, clearSession } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';

export default function Profile() {
  useMockStore();
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const params = useLocalSearchParams();
  const currentCitizenId = params.citizenId || params.id || getCurrentCitizenId();

  // Hardware back returns to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Barq-e-Insaf?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearSession();
            router.replace('/RoleSelectScreen');
          },
        },
      ]
    );
  };

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [inputName, setInputName] = useState(userData.name || userData.fullName || '');
  const [inputEmail, setInputEmail] = useState(userData.email || '');
  const [inputPhone, setInputPhone] = useState(userData.phone || '');
  const [inputDistrict, setInputDistrict] = useState(userData.district || '');
  const [inputAddress, setInputAddress] = useState(userData.address || '');

  useEffect(() => {
    if (currentCitizenId) {
      fetchCitizenDashboard(currentCitizenId);
    }
  }, [currentCitizenId]);

  useEffect(() => {
    setInputName(userData.name || userData.fullName || '');
    setInputEmail(userData.email || '');
    setInputPhone(userData.phone || '');
    setInputDistrict(userData.district || '');
    setInputAddress(userData.address || '');
  }, [userData.name, userData.email, userData.phone, userData.district, userData.address]);

  const nameInitials = (userData.name || userData.fullName || 'C')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join('')
    .substring(0, 2);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(userData.id || currentCitizenId, {
        fullName: inputName.trim(),
        name: inputName.trim(),
        email: inputEmail.trim(),
        phone: inputPhone.trim(),
        district: inputDistrict.trim(),
        city: inputDistrict.trim(),
        address: inputAddress.trim(),
      });
      setSaving(false);
      setEditMode(false);
      Alert.alert('Profile Saved', 'Your profile information has been updated successfully.');
    } catch (e) {
      setSaving(false);
      Alert.alert('Notice', 'Profile updated locally.');
      setEditMode(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={theme.bg} />

      {/* Modern '< My Profile' Header */}
      <AppHeader
        title="My Profile"
        showBack={true}
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE CARD */}
        <View style={[styles.profileCard, { backgroundColor: isDarkMode ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(255, 170, 60, 0.28)' : 'rgba(217, 119, 6, 0.25)' }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarLarge, !isDarkMode && { backgroundColor: '#FFF7ED', borderColor: '#F59E0B' }]}>
              <Text style={[styles.avatarLargeText, !isDarkMode && { color: '#B45309' }]}>{nameInitials}</Text>
            </View>
            <Text style={[styles.userName, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>{userData.fullName || userData.name || 'Citizen'}</Text>
            <Text style={[styles.userRole, { color: isDarkMode ? '#FF9500' : '#D97706' }]}>Verified Citizen · Sindh, Pakistan</Text>
          </View>

          {/* EDIT / SAVE BUTTON */}
          <TouchableOpacity
            style={[
              editMode ? styles.saveProfileBtn : styles.editProfileBtn,
              !isDarkMode && {
                backgroundColor: editMode ? '#10B981' : '#F59E0B',
                borderColor: editMode ? '#059669' : '#D97706',
              },
            ]}
            onPress={editMode ? handleSave : () => setEditMode(true)}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={isDarkMode ? '#0A0301' : '#FFFFFF'} size="small" />
            ) : (
              <Text
                style={[
                  editMode ? styles.saveProfileBtnText : styles.editProfileBtnText,
                  !isDarkMode && { color: editMode ? '#FFFFFF' : '#000000', fontWeight: '900' },
                ]}
              >
                {editMode ? 'SAVE PROFILE' : 'EDIT PROFILE'}
              </Text>
            )}
          </TouchableOpacity>

          {/* CONTACT INFO GRID */}
          <View
            style={[
              styles.infoGrid,
              {
                backgroundColor: isDarkMode ? 'rgba(15, 7, 3, 0.65)' : '#FAF5F0',
                borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.18)' : 'rgba(217, 119, 6, 0.20)',
              },
            ]}
          >
            <View style={[styles.infoGridItem, { borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <Text style={[styles.infoGridLabel, !isDarkMode && { color: '#9A5B32' }]}>Full Name</Text>
              {editMode ? (
                <TextInput
                  style={[styles.infoInput, !isDarkMode && { backgroundColor: '#FFFFFF', borderColor: 'rgba(217, 119, 6, 0.35)', color: '#1A0C04' }]}
                  value={inputName}
                  onChangeText={setInputName}
                  placeholder="Your Full Name"
                  placeholderTextColor={isDarkMode ? 'rgba(255, 220, 180, 0.4)' : '#A3704C'}
                />
              ) : (
                <Text style={[styles.infoGridValue, !isDarkMode && { color: '#1A0C04' }]}>{userData.fullName || userData.name || '—'}</Text>
              )}
            </View>

            <View style={[styles.infoGridItem, { borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <Text style={[styles.infoGridLabel, !isDarkMode && { color: '#9A5B32' }]}>Email Address</Text>
              {editMode ? (
                <TextInput
                  style={[styles.infoInput, !isDarkMode && { backgroundColor: '#FFFFFF', borderColor: 'rgba(217, 119, 6, 0.35)', color: '#1A0C04' }]}
                  value={inputEmail}
                  onChangeText={setInputEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={isDarkMode ? 'rgba(255, 220, 180, 0.4)' : '#A3704C'}
                  keyboardType="email-address"
                />
              ) : (
                <Text style={[styles.infoGridValue, !isDarkMode && { color: '#1A0C04' }]}>{userData.email || '—'}</Text>
              )}
            </View>

            <View style={[styles.infoGridItem, { borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <Text style={[styles.infoGridLabel, !isDarkMode && { color: '#9A5B32' }]}>Phone Number</Text>
              {editMode ? (
                <TextInput
                  style={[styles.infoInput, !isDarkMode && { backgroundColor: '#FFFFFF', borderColor: 'rgba(217, 119, 6, 0.35)', color: '#1A0C04' }]}
                  value={inputPhone}
                  onChangeText={setInputPhone}
                  placeholder="03001234567"
                  placeholderTextColor={isDarkMode ? 'rgba(255, 220, 180, 0.4)' : '#A3704C'}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.infoGridValue, !isDarkMode && { color: '#1A0C04' }]}>{userData.phone || '—'}</Text>
              )}
            </View>

            <View style={[styles.infoGridItem, { borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <Text style={[styles.infoGridLabel, !isDarkMode && { color: '#9A5B32' }]}>District (Sindh)</Text>
              {editMode ? (
                <TextInput
                  style={[styles.infoInput, !isDarkMode && { backgroundColor: '#FFFFFF', borderColor: 'rgba(217, 119, 6, 0.35)', color: '#1A0C04' }]}
                  value={inputDistrict}
                  onChangeText={setInputDistrict}
                  placeholder="e.g. Korangi, Karachi Central"
                  placeholderTextColor={isDarkMode ? 'rgba(255, 220, 180, 0.4)' : '#A3704C'}
                />
              ) : (
                <Text style={[styles.infoGridValue, !isDarkMode && { color: '#1A0C04' }]}>{userData.district || userData.city || 'Sindh'}</Text>
              )}
            </View>

            <View style={[styles.infoGridItem, { borderBottomWidth: 0 }]}>
              <Text style={[styles.infoGridLabel, !isDarkMode && { color: '#9A5B32' }]}>Residential Address</Text>
              {editMode ? (
                <TextInput
                  style={[styles.infoInput, !isDarkMode && { backgroundColor: '#FFFFFF', borderColor: 'rgba(217, 119, 6, 0.35)', color: '#1A0C04' }]}
                  value={inputAddress}
                  onChangeText={setInputAddress}
                  placeholder="Address or Mohalla"
                  placeholderTextColor={isDarkMode ? 'rgba(255, 220, 180, 0.4)' : '#A3704C'}
                />
              ) : (
                <Text style={[styles.infoGridValue, !isDarkMode && { color: '#1A0C04' }]}>{userData.address || 'Sindh, Pakistan'}</Text>
              )}
            </View>
          </View>

          {/* TELEMETRY METRICS */}
          <View
            style={[
              styles.statsRow,
              {
                backgroundColor: isDarkMode ? 'rgba(26, 12, 5, 0.85)' : '#FAF5F0',
                borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.22)' : 'rgba(217, 119, 6, 0.20)',
              },
            ]}
          >
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{userData.activeCasesCount || 0}</Text>
              <Text style={[styles.statLbl, !isDarkMode && { color: '#7C4A28' }]}>Active Cases</Text>
            </View>
            <View style={[styles.statDiv, !isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.08)' }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#38BDF8' }]}>{userData.consultationsCount || 0}</Text>
              <Text style={[styles.statLbl, !isDarkMode && { color: '#7C4A28' }]}>Consultations</Text>
            </View>
            <View style={[styles.statDiv, !isDarkMode && { backgroundColor: 'rgba(0, 0, 0, 0.08)' }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#4ADE80' }]}>{userData.totalVaultItems || 0}</Text>
              <Text style={[styles.statLbl, !isDarkMode && { color: '#7C4A28' }]}>Vault Items</Text>
            </View>
          </View>

          {/* APP THEME APPEARANCE TOGGLE */}
          <TouchableOpacity
            style={[
              styles.termsBtn,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: isDarkMode ? 'rgba(38, 20, 10, 0.94)' : '#FAF5F0',
                borderColor: isDarkMode ? 'rgba(255, 170, 60, 0.28)' : 'rgba(217, 119, 6, 0.22)',
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <View>
              <Text style={[styles.termsBtnText, { color: isDarkMode ? '#FFFFFF' : '#1A0C04', textAlign: 'left', fontWeight: '700' }]}>
                App Appearance
              </Text>
              <Text style={{ fontSize: 11, color: isDarkMode ? '#C8A892' : '#7C6859', marginTop: 2 }}>
                Current mode: {isDarkMode ? 'Dark (Night Obsidian)' : 'Light (Day White)'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : '#F59E0B',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? '#FF9500' : '#D97706',
              }}
            >
              <Text style={{ color: isDarkMode ? '#FF9500' : '#000000', fontWeight: '900', fontSize: 11 }}>
                {isDarkMode ? 'SWITCH TO LIGHT' : 'SWITCH TO DARK'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* TERMS AND CONDITIONS LINK */}
          <TouchableOpacity
            style={[
              styles.termsBtn,
              {
                backgroundColor: isDarkMode ? '#1E202C' : '#FAF5F0',
                borderColor: isDarkMode ? '#2F3144' : 'rgba(217, 119, 6, 0.22)',
              },
            ]}
            onPress={() => router.push('/TermsScreen')}
            activeOpacity={0.8}
          >
            <Text style={[styles.termsBtnText, { color: isDarkMode ? '#FFA726' : '#B45309' }]}>
              View Terms & Conditions
            </Text>
          </TouchableOpacity>

          {/* SIGN OUT BUTTON BELOW PROFILE CONTENT */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Text style={styles.signOutBtnText}>Sign Out of Citizen Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Unified Bottom Navigation */}
      <BottomNavBar role="citizen" activeTab="profile" />
    </SafeAreaView>
  );
}
