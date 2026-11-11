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
import { getCurrentLawyerId } from '../../constants/authStore';

export default function LawyerProfile() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [editMode, setEditMode] = useState(false);
  const [showDPMenu, setShowDPMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

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

  const handleNav = (lbl) => {
    if (lbl === 'home') router.push('/(lawyer)/LawyerHome');
    if (lbl === 'requests') router.push('/(lawyer)/CaseRequests');
    if (lbl === 'cases') router.push('/(lawyer)/MyCases');
    if (lbl === 'schedule') router.push('/(lawyer)/Schedule');
    if (lbl === 'profile') router.push('/(lawyer)/LawyerProfile');
  };

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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2744" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editToggle} onPress={() => setEditMode(!editMode)}>
          <Text style={styles.editToggleText}>{editMode ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        {/* Profile Picture */}
        <View style={styles.profilePicSection}>
          <TouchableOpacity 
            style={styles.profilePicContainer}
            onPress={() => setShowDPMenu(true)}
          >
            <View style={[styles.profilePic, { backgroundColor: lawyerProfile.color || '#0F2744' }]}>
              <Text style={styles.profilePicText}>{lawyerProfile.initials || 'L'}</Text>
            </View>
            <View style={styles.dpBadge}>
              <Text style={styles.dpBadgeText}>Edit</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{lawyerProfile.name || 'Advocate'}</Text>
          <Text style={styles.profileSpec}>
            {lawyerProfile.spec} · SBC {lawyerProfile.sbc || 'Pending'}
          </Text>
          <View style={[
            styles.statusPill,
            !lawyerProfile.isVerified && { backgroundColor: '#B45309' }
          ]}>
            <Text style={styles.statusPillText}>
              {lawyerProfile.isVerified ? 'SBC Verified Advocate' : 'Verification Pending'}
            </Text>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.cardTitle}>Accepting New Clients</Text>
              <Text style={styles.cardSub}>Toggle whether clients can hire you</Text>
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
              trackColor={{ false: '#767577', true: '#1B4332' }}
              thumbColor={editMode ? (editedData.isAvailable ? '#4ade80' : '#f4f3f4') : (lawyerProfile.isAvailable ? '#4ade80' : '#f4f3f4')}
            />
          </View>
        </View>

        {/* Profile Fields */}
        <Text style={styles.label}>Full Name</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.name}
            onChangeText={(text) => setEditedData({...editedData, name: text})}
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.name || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Specialty</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.spec}
            onChangeText={(text) => setEditedData({...editedData, spec: text})}
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.spec || 'General Practice'}</Text>
          </View>
        )}

        <Text style={styles.label}>SBC License Number (Registered)</Text>
        <View style={[styles.detailCard, { backgroundColor: '#f0ede6' }]}>
          <Text style={[styles.detailValue, { fontWeight: '700', color: '#0F2744' }]}>
            {lawyerProfile.sbc || 'Pending Bar Verification'}
          </Text>
        </View>

        <Text style={styles.label}>CNIC Number (Registered)</Text>
        <View style={[styles.detailCard, { backgroundColor: '#f0ede6' }]}>
          <Text style={[styles.detailValue, { color: '#555' }]}>
            {lawyerProfile.cnic || 'Not provided'}
          </Text>
        </View>

        <Text style={styles.label}>District / City</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.district}
            onChangeText={(text) => setEditedData({...editedData, district: text})}
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.district || 'Sindh'}</Text>
          </View>
        )}

        <Text style={styles.label}>Email</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.email}
            onChangeText={(text) => setEditedData({...editedData, email: text})}
            keyboardType="email-address"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.email || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Phone</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.phone}
            onChangeText={(text) => setEditedData({...editedData, phone: text})}
            keyboardType="phone-pad"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.phone || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Past Experience</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editedData.experience}
            onChangeText={(text) => setEditedData({...editedData, experience: text})}
            multiline
            numberOfLines={3}
            placeholder="e.g. 14 Years practice in High Court and District Courts"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.experience || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Education / Credentials</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editedData.education}
            onChangeText={(text) => setEditedData({...editedData, education: text})}
            multiline
            numberOfLines={2}
            placeholder="e.g. LL.B (SM Law College), LL.M"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.education || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Office / Chamber Address</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editedData.address}
            onChangeText={(text) => setEditedData({...editedData, address: text})}
            multiline
            numberOfLines={3}
            placeholder="e.g. Chamber 402, Lawyers Court Building, Karachi"
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.address || 'Not provided'}</Text>
          </View>
        )}

        <Text style={styles.label}>Professional Biography</Text>
        {editMode ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editedData.bio}
            onChangeText={(text) => setEditedData({...editedData, bio: text})}
            multiline
            numberOfLines={4}
            placeholder="Brief biography about your legal practice..."
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailValue}>{lawyerProfile.about || 'Not provided'}</Text>
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

      {/* FOOTER */}
      <View style={styles.bottomNav}>
        {['Dashboard', 'Requests', 'Cases', 'Schedule', 'Profile'].map((lbl, idx) => {
          const ids = ['home', 'requests', 'cases', 'schedule', 'profile'];
          return (
            <TouchableOpacity
              key={lbl}
              style={styles.navItem}
              onPress={() => handleNav(ids[idx])}
            >
              <Text style={[styles.navLabel, ids[idx] === 'profile' && styles.navLabelActive]}>{lbl}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F2744' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#0F2744',
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#fff', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  editToggle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editToggleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  scroll: { flex: 1, backgroundColor: '#F5F3EF' },
  content: { padding: 20, paddingBottom: 100 },
  
  profilePicSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicContainer: {
    position: 'relative',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F2744',
  },
  profilePicText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  dpBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0F2744',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  dpBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  profileSpec: {
    fontSize: 14,
    color: '#888',
  },
  statusPill: {
    marginTop: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  cardSub: { fontSize: 12, color: '#888', marginTop: 2 },
  
  label: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  textArea: { textAlignVertical: 'top', minHeight: 80 },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  detailValue: { fontSize: 14, color: '#1a1a1a' },
  
  saveBtn: {
    backgroundColor: '#0F2744',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpMenu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '80%',
    maxWidth: 320,
    padding: 8,
  },
  dpMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f3f0',
  },
  dpMenuItemDanger: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f3f0',
  },
  dpMenuItemText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  dpMenuItemDangerText: {
    fontSize: 15,
    color: '#ef4444',
    textAlign: 'center',
  },
  dpMenuItemCancel: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ece9e4',
    flexDirection: 'row',
    height: 80,
    paddingBottom: 24,
    paddingTop: 10,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 11, fontWeight: '600', color: '#bbb' },
  navLabelActive: { color: '#0F2744' },
});
