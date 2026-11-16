import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Switch, 
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMockStore, lawyerProfile, updateLawyerProfile, fetchLawyerDashboard } from './MockStore';
import { getCurrentLawyerId, clearSession } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';

export default function LawyerProfile() {
  useMockStore();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const params = useLocalSearchParams();
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  const [editMode, setEditMode] = useState(false);
  const [showDPMenu, setShowDPMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your advocate account?',
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

  // Local state for editing
  const [editedData, setEditedData] = useState({
    name: lawyerProfile.name || '',
    spec: lawyerProfile.spec || '',
    address: lawyerProfile.address || '',
    bio: lawyerProfile.about || '',
    email: lawyerProfile.email || '',
    phone: lawyerProfile.phone || '',
    district: lawyerProfile.district || '',
    isAvailable: lawyerProfile.isAvailable !== undefined ? lawyerProfile.isAvailable : true,
    experience: lawyerProfile.experience || '',
    education: lawyerProfile.education || '',
  });

  useEffect(() => {
    if (currentLawyerId) {
      fetchLawyerDashboard(currentLawyerId);
    }
  }, [currentLawyerId]);

  useEffect(() => {
    setEditedData({
      name: lawyerProfile.name || '',
      spec: lawyerProfile.spec || '',
      address: lawyerProfile.address || '',
      bio: lawyerProfile.about || '',
      email: lawyerProfile.email || '',
      phone: lawyerProfile.phone || '',
      district: lawyerProfile.district || '',
      isAvailable: lawyerProfile.isAvailable !== undefined ? lawyerProfile.isAvailable : true,
      experience: lawyerProfile.experience || '',
      education: lawyerProfile.education || '',
    });
  }, [lawyerProfile.name, lawyerProfile.spec, lawyerProfile.about, lawyerProfile.address, lawyerProfile.isAvailable]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateLawyerProfile({
        name: editedData.name,
        spec: editedData.spec,
        address: editedData.address,
        about: editedData.bio,
        email: editedData.email,
        phone: editedData.phone,
        district: editedData.district,
        isAvailable: editedData.isAvailable,
        experience: editedData.experience,
        education: editedData.education,
      }, currentLawyerId);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully and saved to database!');
    } catch (err) {
      Alert.alert('Update Failed', err.response?.data?.message || err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeDP = () => {
    setShowDPMenu(false);
    Alert.alert('Change Profile Picture', 'Profile picture upload will be available in a future update.');
  };

  const handleRemoveDP = () => {
    setShowDPMenu(false);
    Alert.alert('Success', 'Profile picture reset to initials.');
  };

  const dynamicStyles = {
    safe: {
      flex: 1,
      backgroundColor: isDark ? '#080402' : '#FAF7F2',
    },
    scroll: {
      flex: 1,
      backgroundColor: isDark ? '#080402' : '#FAF7F2',
    },
    actionBar: {
      backgroundColor: isDark ? 'rgba(28, 14, 6, 0.9)' : '#F0E5D8',
      borderBottomColor: isDark ? 'rgba(255, 160, 40, 0.25)' : 'rgba(255, 149, 0, 0.2)',
    },
    actionBarTitle: {
      color: isDark ? 'rgba(255, 235, 215, 0.75)' : '#443322',
    },
    profileHeaderCard: {
      backgroundColor: isDark ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 160, 40, 0.35)' : 'rgba(255, 149, 0, 0.2)',
    },
    profileName: {
      color: isDark ? '#FFFFFF' : '#1A0F07',
    },
    card: {
      backgroundColor: isDark ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 160, 40, 0.35)' : 'rgba(255, 149, 0, 0.2)',
    },
    cardTitle: {
      color: isDark ? '#FFFFFF' : '#1A0F07',
    },
    cardSub: {
      color: isDark ? 'rgba(255, 235, 215, 0.65)' : '#665544',
    },
    detailCard: {
      backgroundColor: isDark ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 160, 40, 0.3)' : 'rgba(255, 149, 0, 0.2)',
    },
    detailValue: {
      color: isDark ? '#FFFFFF' : '#1A0F07',
    },
    input: {
      backgroundColor: isDark ? 'rgba(20, 9, 4, 0.95)' : '#FFFFFF',
      color: isDark ? '#FFFFFF' : '#1A0F07',
      borderColor: isDark ? 'rgba(255, 160, 40, 0.4)' : 'rgba(255, 149, 0, 0.25)',
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#080402" : "#FAF7F2"} />
      
      <AppHeader 
        title="Advocate Profile" 
        showBack={true} 
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      {/* Edit Mode Toggle Header Bar */}
      <View style={[styles.actionBar, dynamicStyles.actionBar]}>
        <Text style={[styles.actionBarTitle, dynamicStyles.actionBarTitle]}>
          {editMode ? 'Editing Profile Details' : 'Advocate Registry Information'}
        </Text>
        <TouchableOpacity 
          style={[styles.editToggle, editMode && styles.editToggleActive]} 
          onPress={() => setEditMode(!editMode)}
        >
          <Text style={styles.editToggleText}>{editMode ? 'Cancel' : 'Edit Profile'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.scroll} contentContainerStyle={styles.content}>
        
        {/* Profile Header Card */}
        <View style={[styles.profileHeaderCard, dynamicStyles.profileHeaderCard]}>
          <TouchableOpacity 
            style={styles.profilePicContainer}
            onPress={() => setShowDPMenu(true)}
          >
            <View style={[styles.profilePic, { backgroundColor: lawyerProfile.color || '#E65100' }]}>
              <Text style={styles.profilePicText}>{lawyerProfile.initials || 'L'}</Text>
            </View>
            <View style={styles.dpBadge}>
              <Text style={styles.dpBadgeText}>EDIT</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileName, dynamicStyles.profileName]}>{lawyerProfile.name || 'Advocate'}</Text>
          <Text style={styles.profileSpec}>
            {lawyerProfile.spec || 'Advocate High Court'} · SBC {lawyerProfile.sbc || 'Verified'}
          </Text>
          <View style={[
            styles.statusPill,
            !lawyerProfile.isVerified && { backgroundColor: 'rgba(217, 119, 6, 0.25)', borderColor: '#f59e0b' }
          ]}>
            <Text style={styles.statusPillText}>
              {lawyerProfile.isVerified ? 'SBC Verified Advocate' : 'Bar Verification Pending'}
            </Text>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Accepting New Clients</Text>
              <Text style={[styles.cardSub, dynamicStyles.cardSub]}>Enable to appear active to citizens seeking counsel</Text>
            </View>
            <Switch
              value={editMode ? editedData.isAvailable : lawyerProfile.isAvailable}
              onValueChange={async (value) => {
                if (editMode) {
                  setEditedData({...editedData, isAvailable: value});
                } else {
                  try {
                    await updateLawyerProfile({ isAvailable: value }, currentLawyerId);
                  } catch (e) {
                    console.error('Toggle error:', e);
                  }
                }
              }}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#E65100' }}
              thumbColor={editMode ? (editedData.isAvailable ? '#FF9100' : '#f4f3f4') : (lawyerProfile.isAvailable ? '#FF9100' : '#f4f3f4')}
            />
          </View>
        </View>

        {/* Profile Fields */}
        <Text style={styles.label}>Full Name</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={editedData.name}
            onChangeText={(text) => setEditedData({...editedData, name: text})}
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.name || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Specialty Practice Areas</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={editedData.spec}
            onChangeText={(text) => setEditedData({...editedData, spec: text})}
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.spec || 'General Practice'}</Text>
          </View>
        )}

        <Text style={styles.label}>SBC License Number (Official)</Text>
        <View style={[styles.detailCard, styles.verifiedCard]}>
          <Text style={[styles.detailValue, { fontWeight: '700', color: '#FFB74D' }]}>
            {lawyerProfile.sbc || 'SBC-KHI-0921'}
          </Text>
        </View>

        {/* CNIC kept strictly for Lawyer Sindh Bar Council verification */}
        <Text style={styles.label}>CNIC Number (Bar Verification)</Text>
        <View style={[styles.detailCard, styles.verifiedCard, dynamicStyles.detailCard]}>
          <Text style={[styles.detailValue, dynamicStyles.detailValue]}>
            {lawyerProfile.cnic || '42101-9876543-1'}
          </Text>
        </View>

        <Text style={styles.label}>District / High Court Jurisdiction</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={editedData.district}
            onChangeText={(text) => setEditedData({...editedData, district: text})}
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.district || 'Sindh'}</Text>
          </View>
        )}

        <Text style={styles.label}>Chamber Email Address</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={editedData.email}
            onChangeText={(text) => setEditedData({...editedData, email: text})}
            keyboardType="email-address"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.email || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Chamber Direct Phone</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={editedData.phone}
            onChangeText={(text) => setEditedData({...editedData, phone: text})}
            keyboardType="phone-pad"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.phone || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Past Court Experience</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea, dynamicStyles.input]}
            value={editedData.experience}
            onChangeText={(text) => setEditedData({...editedData, experience: text})}
            multiline
            numberOfLines={3}
            placeholder="e.g. 14 Years practice in High Court and District Courts"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.experience || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Education & Bar Credentials</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea, dynamicStyles.input]}
            value={editedData.education}
            onChangeText={(text) => setEditedData({...editedData, education: text})}
            multiline
            numberOfLines={2}
            placeholder="e.g. LL.B (SM Law College), LL.M"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.education || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Office / Chamber Address</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea, dynamicStyles.input]}
            value={editedData.address}
            onChangeText={(text) => setEditedData({...editedData, address: text})}
            multiline
            numberOfLines={3}
            placeholder="e.g. Chamber 402, Lawyers Court Building, Karachi"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.address || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Professional Biography</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea, dynamicStyles.input]}
            value={editedData.bio}
            onChangeText={(text) => setEditedData({...editedData, bio: text})}
            multiline
            numberOfLines={4}
            placeholder="Brief biography about your legal practice..."
            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        ) : (
          <View style={[styles.detailCard, dynamicStyles.detailCard]}>
            <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{lawyerProfile.about || 'Not provided'}</Text>
          </View>
        )}

        {/* Save Button - Only show in edit mode */}
        {editMode && (
          <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>SAVE CHANGES TO DATABASE</Text>
            )}
          </TouchableOpacity>
        )}

        {/* TERMS AND CONDITIONS LINK */}
        <TouchableOpacity
          style={styles.termsBtn}
          onPress={() => router.push('/TermsScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.termsBtnText}>View Terms & Conditions</Text>
        </TouchableOpacity>

        {/* SIGN OUT BUTTON ON PAGE BELOW WHOLE PROFILE CONTENT */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Text style={styles.signOutBtnText}>Sign Out of Advocate Account</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* DP Change Modal */}
      <Modal
        transparent={true}
        visible={showDPMenu}
        animationType="fade"
        onRequestClose={() => setShowDPMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDPMenu(false)}
        >
          <View style={styles.dpMenu}>
            <TouchableOpacity style={styles.dpMenuItem} onPress={handleChangeDP}>
              <Text style={styles.dpMenuItemText}>Change Profile Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dpMenuItem, styles.dpMenuItemDanger]} onPress={handleRemoveDP}>
              <Text style={styles.dpMenuItemDangerText}>Reset to Initials</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dpMenuItem} onPress={() => setShowDPMenu(false)}>
              <Text style={styles.dpMenuItemCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Shared bottom navigation */}
      <BottomNavBar role="lawyer" activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080402' },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(28, 14, 6, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 160, 40, 0.25)',
  },
  actionBarTitle: {
    color: 'rgba(255, 235, 215, 0.75)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  editToggle: {
    backgroundColor: 'rgba(255, 140, 0, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.45)',
  },
  editToggleActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  editToggleText: { color: '#FFB74D', fontSize: 12, fontWeight: '700' },
  scroll: { flex: 1, backgroundColor: '#080402' },
  content: { padding: 16, paddingBottom: 110 },
  
  profileHeaderCard: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(32, 16, 7, 0.94)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.35)',
  },
  profilePicContainer: {
    position: 'relative',
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FF9100',
  },
  profilePicText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  dpBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E65100',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  dpBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
  },
  profileSpec: {
    fontSize: 13,
    color: '#FFB74D',
    marginTop: 2,
    fontWeight: '600',
  },
  statusPill: {
    marginTop: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusPillText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  
  card: {
    backgroundColor: 'rgba(32, 16, 7, 0.94)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.35)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  cardSub: { fontSize: 12, color: 'rgba(255, 235, 215, 0.65)', marginTop: 2 },
  
  label: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#FFB74D', 
    textTransform: 'uppercase', 
    letterSpacing: 0.6, 
    marginTop: 10, 
    marginBottom: 4 
  },
  input: {
    backgroundColor: 'rgba(20, 9, 4, 0.95)',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.4)',
    marginBottom: 8,
  },
  textArea: { textAlignVertical: 'top', minHeight: 80 },
  detailCard: {
    backgroundColor: 'rgba(32, 16, 7, 0.94)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.3)',
    marginBottom: 8,
  },
  verifiedCard: {
    backgroundColor: 'rgba(40, 20, 8, 0.95)',
    borderColor: 'rgba(255, 160, 40, 0.5)',
  },
  detailValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  
  saveBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpMenu: {
    backgroundColor: 'rgba(32, 16, 7, 0.98)',
    borderRadius: 16,
    width: '80%',
    maxWidth: 320,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.4)',
  },
  dpMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 160, 40, 0.15)',
  },
  dpMenuItemDanger: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 160, 40, 0.15)',
  },
  dpMenuItemText: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  dpMenuItemDangerText: {
    fontSize: 15,
    color: '#f87171',
    textAlign: 'center',
    fontWeight: '600',
  },
  dpMenuItemCancel: {
    fontSize: 15,
    color: '#FFB74D',
    textAlign: 'center',
    fontWeight: '600',
  },
  termsBtn: {
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 175, 50, 0.35)',
  },
  termsBtnText: {
    color: '#FFB74D',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signOutBtn: {
    marginBottom: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  signOutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
