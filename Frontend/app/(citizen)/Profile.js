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
import { getCurrentCitizenId } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function Profile() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentCitizenId = params.citizenId || params.id || getCurrentCitizenId();

  // Hardware back returns to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

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
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

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
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{nameInitials}</Text>
            </View>
            <Text style={styles.userName}>{userData.fullName || userData.name || 'Citizen'}</Text>
            <Text style={styles.userRole}>Verified Citizen · Sindh, Pakistan</Text>
          </View>

          {/* EDIT / SAVE BUTTON */}
          <TouchableOpacity
            style={editMode ? styles.saveProfileBtn : styles.editProfileBtn}
            onPress={editMode ? handleSave : () => setEditMode(true)}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#0A0301" size="small" />
            ) : (
              <Text style={editMode ? styles.saveProfileBtnText : styles.editProfileBtnText}>
                {editMode ? 'SAVE PROFILE' : 'EDIT PROFILE'}
              </Text>
            )}
          </TouchableOpacity>

          {/* CONTACT INFO GRID (CNIC STRICTLY REMOVED) */}
          <View style={styles.infoGrid}>
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Full Name</Text>
              {editMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={inputName}
                  onChangeText={setInputName}
                  placeholder="Your Full Name"
                  placeholderTextColor="rgba(255, 220, 180, 0.4)"
                />
              ) : (
                <Text style={styles.infoGridValue}>{userData.fullName || userData.name || '—'}</Text>
              )}
            </View>

            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Email Address</Text>
              {editMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={inputEmail}
                  onChangeText={setInputEmail}
                  placeholder="email@example.com"
                  placeholderTextColor="rgba(255, 220, 180, 0.4)"
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.infoGridValue}>{userData.email || '—'}</Text>
              )}
            </View>

            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Phone Number</Text>
              {editMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={inputPhone}
                  onChangeText={setInputPhone}
                  placeholder="03001234567"
                  placeholderTextColor="rgba(255, 220, 180, 0.4)"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoGridValue}>{userData.phone || '—'}</Text>
              )}
            </View>

            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>District (Sindh)</Text>
              {editMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={inputDistrict}
                  onChangeText={setInputDistrict}
                  placeholder="e.g. Korangi, Karachi Central"
                  placeholderTextColor="rgba(255, 220, 180, 0.4)"
                />
              ) : (
                <Text style={styles.infoGridValue}>{userData.district || userData.city || 'Sindh'}</Text>
              )}
            </View>

            <View style={[styles.infoGridItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoGridLabel}>Residential Address</Text>
              {editMode ? (
                <TextInput
                  style={styles.infoInput}
                  value={inputAddress}
                  onChangeText={setInputAddress}
                  placeholder="Address or Mohalla"
                  placeholderTextColor="rgba(255, 220, 180, 0.4)"
                />
              ) : (
                <Text style={styles.infoGridValue}>{userData.address || 'Sindh, Pakistan'}</Text>
              )}
            </View>
          </View>

          {/* TELEMETRY METRICS */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{userData.activeCasesCount || 0}</Text>
              <Text style={styles.statLbl}>Active Cases</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{userData.consultationsCount || 0}</Text>
              <Text style={styles.statLbl}>Consultations</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{userData.totalVaultItems || 0}</Text>
              <Text style={styles.statLbl}>Vault Items</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Unified Bottom Navigation */}
      <BottomNavBar role="citizen" activeTab="profile" />
    </SafeAreaView>
  );
}
