import React, { useState } from 'react';
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
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMockStore, lawyerProfile, updateLawyerProfile } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function LawyerProfile() {
  useMockStore();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [showDPMenu, setShowDPMenu] = useState(false);
  
  // Local state for editing
  const [editedData, setEditedData] = useState({
    name: lawyerProfile.name,
    spec: lawyerProfile.spec,
    address: lawyerProfile.address,
    bio: lawyerProfile.about,
    email: lawyerProfile.email,
    phone: lawyerProfile.phone,
    isAvailable: lawyerProfile.isAvailable,
    experience: lawyerProfile.experience,
    education: lawyerProfile.education,
  });

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  const handleSave = () => {
    updateLawyerProfile({
      name: editedData.name,
      spec: editedData.spec,
      address: editedData.address,
      about: editedData.bio,
      email: editedData.email,
      phone: editedData.phone,
      isAvailable: editedData.isAvailable,
      experience: editedData.experience,
      education: editedData.education,
    });
    setEditMode(false);
    Alert.alert('Success', 'Advocate profile updated successfully!');
  };

  const handleChangeDP = () => {
    setShowDPMenu(false);
    Alert.alert('Profile Avatar', 'Avatar selection updated for chamber profile.');
  };

  const handleRemoveDP = () => {
    setShowDPMenu(false);
    updateLawyerProfile({ dp: null });
    Alert.alert('Success', 'Profile photo reset to initials');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      {/* Modern '< Advocate Profile' Header */}
      <AppHeader
        title="Advocate Profile"
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
        rightElement={
          <TouchableOpacity 
            style={styles.editToggle} 
            onPress={() => setEditMode(!editMode)}
            activeOpacity={0.8}
          >
            <Text style={styles.editToggleText}>{editMode ? 'CANCEL' : 'EDIT'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture & Badges */}
        <View style={styles.profilePicSection}>
          <TouchableOpacity 
            style={styles.profilePicContainer}
            onPress={() => setShowDPMenu(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.profilePic, { backgroundColor: lawyerProfile.color || '#2A1206' }]}>
              <Text style={styles.profilePicText}>{lawyerProfile.initials || 'ADV'}</Text>
            </View>
            <View style={styles.dpBadge}>
              <Text style={styles.dpBadgeText}>EDIT</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{lawyerProfile.name}</Text>
          <Text style={styles.profileSpec}>{lawyerProfile.spec} · SBC {lawyerProfile.sbc || 'Verified'}</Text>
        </View>

        {/* Availability Toggle */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Accepting New Consultations</Text>
              <Text style={styles.cardSub}>Toggle whether citizens can book your chamber</Text>
            </View>
            <Switch
              value={editMode ? editedData.isAvailable : lawyerProfile.isAvailable}
              onValueChange={(value) => {
                if (editMode) {
                  setEditedData({...editedData, isAvailable: value});
                } else {
                  updateLawyerProfile({ isAvailable: value });
                }
              }}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#FF9500' }}
              thumbColor={editMode ? (editedData.isAvailable ? '#FFF' : '#888') : (lawyerProfile.isAvailable ? '#FFF' : '#888')}
            />
          </View>
        </View>

        {/* CNIC (Retained for Lawyer SBC Verification as required) */}
        <Text style={styles.label}>SBC Verification CNIC</Text>
        <View style={styles.detailCard}>
          <Text style={styles.detailValue}>{lawyerProfile.cnic || '42101-7788990-1 (Verified)'}</Text>
        </View>

        {/* Profile Fields */}
        <Text style={styles.label}>Full Name</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.name}
            onChangeText={(text) => setEditedData({...editedData, name: text})}
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.name}</Text>
          </View>
        )}

        <Text style={styles.label}>Legal Specialty</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.spec}
            onChangeText={(text) => setEditedData({...editedData, spec: text})}
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.spec}</Text>
          </View>
        )}

        <Text style={styles.label}>Chamber Email</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.email}
            onChangeText={(text) => setEditedData({...editedData, email: text})}
            keyboardType="email-address"
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.email}</Text>
          </View>
        )}

        <Text style={styles.label}>Chamber Phone</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.phone}
            onChangeText={(text) => setEditedData({...editedData, phone: text})}
            keyboardType="phone-pad"
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.phone}</Text>
          </View>
        )}

        <Text style={styles.label}>Bar Experience</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.experience}
            onChangeText={(text) => setEditedData({...editedData, experience: text})}
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.experience}</Text>
          </View>
        )}

        <Text style={styles.label}>Chamber Address</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editedData.address}
            onChangeText={(text) => setEditedData({...editedData, address: text})}
            multiline
            numberOfLines={3}
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.address}</Text>
          </View>
        )}

        <Text style={styles.label}>Advocate Bio</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editedData.bio}
            onChangeText={(text) => setEditedData({...editedData, bio: text})}
            multiline
            numberOfLines={4}
            placeholderTextColor="rgba(255, 220, 180, 0.35)"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.about}</Text>
          </View>
        )}

        {/* Save Button - Only show in edit mode */}
        {editMode && (
          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveText}>SAVE CHANGES</Text>
          </TouchableOpacity>
        )}
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
              <Text style={styles.dpMenuItemText}>Change Chamber Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dpMenuItem, styles.dpMenuItemDanger]} onPress={handleRemoveDP}>
              <Text style={styles.dpMenuItemDangerText}>Reset to Initials Badge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dpMenuItem} onPress={() => setShowDPMenu(false)}>
              <Text style={styles.dpMenuItemCancel}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="lawyer" activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060201' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },
  editToggle: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  editToggleText: { color: '#0A0301', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  profilePicSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 6,
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
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  profilePicText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF5E8',
  },
  dpBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#060201',
  },
  dpBadgeText: {
    color: '#0A0301',
    fontSize: 9,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF5E8',
    marginTop: 10,
  },
  profileSpec: {
    fontSize: 13,
    color: '#FFB74D',
    marginTop: 2,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    marginBottom: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#FFF5E8' },
  cardSub: { fontSize: 12, color: 'rgba(255, 220, 180, 0.6)', marginTop: 2 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFB74D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 8,
  },
  detailCard: {
    backgroundColor: 'rgba(25, 12, 5, 0.75)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.2)',
    marginBottom: 8,
  },
  detailValue: { fontSize: 14, color: '#FFF5E8', fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(25, 12, 5, 0.75)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.3)',
    color: '#FFF5E8',
    fontSize: 14,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  saveText: { color: '#0A0301', fontSize: 14, fontWeight: '900', letterSpacing: 0.8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dpMenu: {
    backgroundColor: '#0E0603',
    borderRadius: 20,
    width: '85%',
    maxWidth: 320,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  dpMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  dpMenuItemDanger: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  dpMenuItemText: { fontSize: 14, color: '#FFF5E8', textAlign: 'center', fontWeight: '600' },
  dpMenuItemDangerText: { fontSize: 14, color: '#ef4444', textAlign: 'center', fontWeight: '700' },
  dpMenuItemCancel: { fontSize: 14, color: '#FFB74D', textAlign: 'center', fontWeight: '700' },
});
