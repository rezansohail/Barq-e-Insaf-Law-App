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
import styles from './Profile.styles';
import { useMockStore, userData, updateProfile } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function Profile() {
  useMockStore();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showDpModal, setShowDpModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [inputName, setInputName] = useState(userData.name);
  const [inputEmail, setInputEmail] = useState(userData.email);
  const [inputPhone, setInputPhone] = useState(userData.phone);
  const [inputDistrict, setInputDistrict] = useState(userData.district);

  // Hardware back button takes user to CitizenHome without stacking
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const nameInitials = (userData.name || '')
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase())
    .join('')
    .slice(0, 2);
  const avatarOptions = nameInitials ? [nameInitials, 'AK', 'BI'] : ['AK', 'BI'];

  const handleSaveProfile = () => {
    updateProfile({
      name: inputName,
      email: inputEmail,
      phone: inputPhone,
      district: inputDistrict,
    });
    setEditMode(false);
  };

  const handleSelectAvatar = (avatar) => {
    updateProfile({ dp: avatar });
    setShowDpModal(false);
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
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{userData.dp || 'AK'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() => setShowDpModal(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.editAvatarText}>Change Avatar</Text>
            </TouchableOpacity>
          </View>

          {editMode ? (
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Full Name</Text>
              <TextInput
                style={styles.editInput}
                value={inputName}
                onChangeText={setInputName}
                placeholderTextColor="rgba(255, 220, 180, 0.35)"
              />

              <Text style={styles.editLabel}>Email</Text>
              <TextInput
                style={styles.editInput}
                value={inputEmail}
                onChangeText={setInputEmail}
                placeholderTextColor="rgba(255, 220, 180, 0.35)"
                keyboardType="email-address"
              />

              <Text style={styles.editLabel}>Phone</Text>
              <TextInput
                style={styles.editInput}
                value={inputPhone}
                onChangeText={setInputPhone}
                placeholderTextColor="rgba(255, 220, 180, 0.35)"
                keyboardType="phone-pad"
              />

              <Text style={styles.editLabel}>District</Text>
              <TextInput
                style={styles.editInput}
                value={inputDistrict}
                onChangeText={setInputDistrict}
                placeholderTextColor="rgba(255, 220, 180, 0.35)"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayForm}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userRole}>{userData.role} Account</Text>

              {/* Info Grid - CNIC removed entirely for citizens */}
              <View style={styles.infoGrid}>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Email Address</Text>
                  <Text style={styles.infoGridValue}>{userData.email}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Phone Number</Text>
                  <Text style={styles.infoGridValue}>{userData.phone}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Jurisdiction / District</Text>
                  <Text style={styles.infoGridValue}>{userData.district}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Member Since</Text>
                  <Text style={styles.infoGridValue}>{userData.joinedDate}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.editProfileBtn}
                onPress={() => setEditMode(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.editProfileBtnText}>EDIT PROFILE</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.replace('/(citizen)/MyCases')}
            activeOpacity={0.75}
          >
            <Text style={styles.menuItemText}>My Legal Matters</Text>
            <Text style={styles.menuItemArrow}>View &gt;</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.replace('/(citizen)/FindLawyer')}
            activeOpacity={0.75}
          >
            <Text style={styles.menuItemText}>Find SBC Advocates</Text>
            <Text style={styles.menuItemArrow}>Search &gt;</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.menuItemText}>Preferences & Security</Text>
            <Text style={styles.menuItemArrow}>Open &gt;</Text>
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
              <Text style={styles.settingsTitle}>Preferences & Support</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={styles.settingsClose}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemLabel}>Instant Case Alerts</Text>
              <Text style={styles.settingsItemValue}>Active</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemLabel}>App Interface Language</Text>
              <Text style={styles.settingsItemValue}>English (Urdu/Sindhi available)</Text>
            </View>
            <View style={[styles.settingsItem, styles.settingsItemLast]}>
              <Text style={styles.settingsItemLabel}>Citizen Support Hotline</Text>
              <Text style={styles.settingsItemValue}>0800-BARQ (Free)</Text>
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
            <Text style={styles.popupTitle}>Select Initials Badge</Text>
            <View style={styles.avatarRow}>
              {avatarOptions.map((av, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.avatarSelectBubble}
                  onPress={() => handleSelectAvatar(av)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.avatarSelectText}>{av}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.popupCloseBtn}
              onPress={() => setShowDpModal(false)}
            >
              <Text style={styles.popupCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="profile" />
    </SafeAreaView>
  );
}
