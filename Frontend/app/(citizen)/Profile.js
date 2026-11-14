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
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './Profile.styles';
import { useMockStore, userData, updateProfile, fetchCitizenDashboard } from './MockStore';
import { getCurrentCitizenId } from '../../constants/authStore';

export default function Profile() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentCitizenId = params.citizenId || params.id || getCurrentCitizenId();

  const [showSettings, setShowSettings] = useState(false);
  const [showDpModal, setShowDpModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [inputName, setInputName] = useState(userData.name || userData.fullName || '');
  const [inputEmail, setInputEmail] = useState(userData.email || '');
  const [inputPhone, setInputPhone] = useState(userData.phone || '');
  const [inputDistrict, setInputDistrict] = useState(userData.district || '');
  const [inputCnic, setInputCnic] = useState(userData.cnic || '');
  const [inputAddress, setInputAddress] = useState(userData.address || '');
  const [sections, setSections] = useState(userData.customSections || []);

  // Sync inputs with userData when loaded
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
    setInputCnic(userData.cnic || '');
    setInputAddress(userData.address || '');
    setSections(userData.customSections || []);
  }, [userData.name, userData.email, userData.phone, userData.district, userData.cnic, userData.address, userData.customSections]);

  const nameInitials = (userData.name || userData.fullName || 'C')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join('')
    .slice(0, 2);
  const avatarOptions = nameInitials ? [nameInitials] : ['C'];

  const handleNav = (id) => {
    if (id === 'home')    router.push('/(citizen)/CitizenHome');
    if (id === 'cases')   router.push('/(citizen)/MyCases');
    if (id === 'lawyers') router.push('/(citizen)/FindLawyer');
    if (id === 'profile') router.push('/(citizen)/Profile');
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      { id: `sec-${Date.now()}`, title: 'New Detail', content: '' },
    ]);
  };

  const handleUpdateSection = (index, field, value) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleRemoveSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(
        {
          name: inputName.trim(),
          phone: inputPhone.trim(),
          district: inputDistrict.trim(),
          cnic: inputCnic.trim(),
          address: inputAddress.trim(),
          customSections: sections,
        },
        currentCitizenId
      );
      setEditMode(false);
      const msg = 'Profile updated and saved successfully!';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Saved', msg);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAvatar = async (avatar) => {
    await updateProfile({ dp: avatar }, currentCitizenId);
    setShowDpModal(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#5C1A1A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>BI</Text>
          </View>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{userData.dp || nameInitials}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setShowDpModal(true)}>
              <Text style={styles.editAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {editMode ? (
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Full Name</Text>
              <TextInput
                style={styles.editInput}
                value={inputName}
                onChangeText={setInputName}
                placeholder="Enter Full Name"
                placeholderTextColor="#999"
              />

              <Text style={styles.editLabel}>Email Address (Read-only)</Text>
              <TextInput
                style={[styles.editInput, { opacity: 0.6 }]}
                value={inputEmail}
                editable={false}
              />

              <Text style={styles.editLabel}>Phone Number</Text>
              <TextInput
                style={styles.editInput}
                value={inputPhone}
                onChangeText={setInputPhone}
                placeholder="0300-1234567"
                placeholderTextColor="#999"
              />

              <Text style={styles.editLabel}>National ID (CNIC)</Text>
              <TextInput
                style={styles.editInput}
                value={inputCnic}
                onChangeText={setInputCnic}
                placeholder="42101-1234567-1"
                placeholderTextColor="#999"
              />

              <Text style={styles.editLabel}>District (Sindh)</Text>
              <TextInput
                style={styles.editInput}
                value={inputDistrict}
                onChangeText={setInputDistrict}
                placeholder="e.g. Karachi Central / Sukkur / Hyderabad"
                placeholderTextColor="#999"
              />

              <Text style={styles.editLabel}>Residential / Office Address</Text>
              <TextInput
                style={styles.editInput}
                value={inputAddress}
                onChangeText={setInputAddress}
                placeholder="Street address, block, area..."
                placeholderTextColor="#999"
              />

              {/* Dynamic Custom Sections */}
              <View style={{ marginTop: 14, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.editLabel, { marginTop: 0 }]}>Additional Custom Sections</Text>
                  <TouchableOpacity onPress={handleAddSection}>
                    <Text style={{ color: '#5C1A1A', fontWeight: '800', fontSize: 13 }}>+ Add Section</Text>
                  </TouchableOpacity>
                </View>

                {sections.map((sec, idx) => (
                  <View key={sec.id || idx} style={{ marginTop: 8, padding: 10, backgroundColor: '#fcfbfa', borderRadius: 8, borderWidth: 1, borderColor: '#eee' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <TextInput
                        style={[styles.editInput, { fontWeight: '700', flex: 1, marginRight: 8, marginBottom: 6 }]}
                        value={sec.title}
                        onChangeText={(val) => handleUpdateSection(idx, 'title', val)}
                        placeholder="Section Title (e.g. Emergency Contact)"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity onPress={() => handleRemoveSection(idx)}>
                        <Text style={{ color: '#b91c1c', fontWeight: '700', fontSize: 12 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.editInput}
                      value={sec.content}
                      onChangeText={(val) => handleUpdateSection(idx, 'content', val)}
                      placeholder="Section Content / Info..."
                      placeholderTextColor="#999"
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayForm}>
              <Text style={styles.userName}>{userData.name || userData.fullName || 'Citizen Member'}</Text>
              <Text style={styles.userRole}>{userData.role} · Barq-e-Insaf</Text>

              <View style={styles.infoGrid}>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Email</Text>
                  <Text style={styles.infoGridValue}>{userData.email || 'N/A'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Phone</Text>
                  <Text style={styles.infoGridValue}>{userData.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>CNIC</Text>
                  <Text style={styles.infoGridValue}>{userData.cnic || 'Pending verification'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>District</Text>
                  <Text style={styles.infoGridValue}>{userData.district || 'Sindh'}</Text>
                </View>
                {userData.address ? (
                  <View style={styles.infoGridItem}>
                    <Text style={styles.infoGridLabel}>Address</Text>
                    <Text style={styles.infoGridValue}>{userData.address}</Text>
                  </View>
                ) : null}
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Member Since</Text>
                  <Text style={styles.infoGridValue}>{userData.joinedDate || '2026'}</Text>
                </View>
              </View>

              {/* Display Custom Sections */}
              {Array.isArray(userData.customSections) && userData.customSections.length > 0 && (
                <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1ede7', paddingTop: 10 }}>
                  {userData.customSections.map((sec, idx) => (
                    <View key={sec.id || idx} style={{ marginTop: 8 }}>
                      <Text style={styles.infoGridLabel}>{sec.title}</Text>
                      <Text style={styles.infoGridValue}>{sec.content}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                style={styles.editProfileBtn}
                onPress={() => setEditMode(true)}
              >
                <Text style={styles.editProfileBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(citizen)/MyCases')}
          >
            <Text style={styles.menuItemText}>My Active Cases ({userData.activeCasesCount || 0})</Text>
            <Text style={styles.menuItemArrow}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(citizen)/FindLawyer')}
          >
            <Text style={styles.menuItemText}>Find Verified Advocates</Text>
            <Text style={styles.menuItemArrow}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(citizen)/CaseEvidence')}
          >
            <Text style={styles.menuItemText}>Private Evidence Vault ({userData.totalVaultItems || 0})</Text>
            <Text style={styles.menuItemArrow}>Open</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.menuItemText}>Settings</Text>
            <Text style={styles.menuItemArrow}>Open</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        transparent={true}
        visible={showSettings}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.settingsContainer}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={styles.settingsClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemLabel}>Notifications</Text>
              <Text style={styles.settingsItemValue}>Enabled</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemLabel}>End-to-End Encryption</Text>
              <Text style={styles.settingsItemValue}>AES-256 Active</Text>
            </View>
            <View style={[styles.settingsItem, styles.settingsItemLast]}>
              <Text style={styles.settingsItemLabel}>Help & Support</Text>
              <Text style={styles.settingsItemValue}>Barq-e-Insaf Care</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar Change Modal */}
      <Modal
        transparent={true}
        visible={showDpModal}
        animationType="fade"
        onRequestClose={() => setShowDpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            <Text style={styles.popupTitle}>Select Profile Initials</Text>
            <View style={styles.avatarRow}>
              {avatarOptions.map((av, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.avatarSelectBubble}
                  onPress={() => handleSelectAvatar(av)}
                >
                  <Text style={styles.avatarSelectText}>{av}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.popupCloseBtn}
              onPress={() => setShowDpModal(false)}
            >
              <Text style={styles.popupCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        {['Home', 'Cases', 'Lawyers', 'Profile'].map((lbl) => (
          <TouchableOpacity
            key={lbl}
            style={styles.navItem}
            onPress={() => handleNav(lbl.toLowerCase())}
          >
            <Text style={[styles.navLabel, lbl === 'Profile' && styles.navLabelActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
