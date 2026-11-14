import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './CaseRequests.styles';
import { useMockStore, caseRequests, declineRequest, acceptRequest, fetchRequests } from './MockStore';
import { getCurrentLawyerId } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const QUICK_REASONS = [
  'Schedule is currently full for new consultations.',
  'Case dispute type is outside my primary legal jurisdiction.',
  'Conflict of interest with existing active client.',
  'Requires urgent High Court representation outside district.',
];

export default function CaseRequests() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

  const [loading, setLoading] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  useEffect(() => {
    if (currentLawyerId) {
      fetchRequests(currentLawyerId);
    }
  }, [currentLawyerId]);

  const handleAccept = async (id) => {
    Alert.alert(
      'Accept Case',
      'By accepting this case, you will be able to view the client\'s contact information and evidence. An active case will be created.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: async () => {
            try {
              setActionInProgress(true);
              await acceptRequest(id, currentLawyerId);
              Alert.alert('Case Accepted', 'Case has been moved to Active Cases. Client contact and evidence are now visible.');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || e.message || 'Could not accept case');
            } finally {
              setActionInProgress(false);
            }
          }
        }
      ]
    );
  };

  const openDeclineModal = (req) => {
    setSelectedReq(req);
    setDeclineReason(QUICK_REASONS[0]);
    setDeclineModalVisible(true);
  };

  const handleConfirmDecline = async () => {
    if (!declineReason.trim()) {
      Alert.alert('Reason Required', 'Please provide or select a reason for declining this request.');
      return;
    }

    try {
      setActionInProgress(true);
      await declineRequest(selectedReq.id, declineReason.trim(), currentLawyerId);
      setDeclineModalVisible(false);
      setSelectedReq(null);
      Alert.alert('Request Declined', 'The consultation request was declined and your reason has been recorded in the database.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Could not decline request');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleViewCase = (id) => {
    router.push({
      pathname: '/(lawyer)/CaseDetail',
      params: { caseId: id }
    });
  };

  const handleNav = (lbl) => {
    if (lbl === 'home') router.push('/(lawyer)/LawyerHome');
    if (lbl === 'requests') router.push('/(lawyer)/CaseRequests');
    if (lbl === 'cases') router.push('/(lawyer)/MyCases');
    if (lbl === 'schedule') router.push('/(lawyer)/Schedule');
    if (lbl === 'profile') router.push('/(lawyer)/LawyerProfile');
  };

  const pendingRequests = caseRequests.filter((r) => r.status === 'pending');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      {/* Top Header matching app standard */}
      <AppHeader
        title={`Requests (${pendingRequests.length})`}
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {pendingRequests.length > 0 ? (
          pendingRequests.map((r) => (
            <View key={r.id} style={styles.reqCard}>
              <TouchableOpacity onPress={() => handleViewCase(r.id)}>
                <View style={styles.reqTop}>
                  <Text style={styles.reqName}>{r.name} - {r.spec}</Text>
                  <Text style={styles.badgeNew}>Pending</Text>
                </View>
                <Text style={styles.reqMeta}>Location: {r.location} · {r.time}</Text>
                
                <View style={styles.problemBox}>
                  <Text style={styles.problemLabel}>Problem Statement:</Text>
                  <Text style={styles.reqDesc}>{r.problemStatement || r.desc}</Text>
                </View>
                
                {/* Note detailing that contact and evidence are hidden until acceptance */}
                <View style={styles.securedNotice}>
                  <Text style={styles.securedNoticeText}>
                    Contact and evidence are hidden until you accept this case.
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.btnRow}>
                <TouchableOpacity 
                  style={[styles.acceptBtn, actionInProgress && { opacity: 0.6 }]} 
                  onPress={() => handleAccept(r.id)}
                  disabled={actionInProgress}
                >
                  <Text style={styles.acceptText}>Accept Case</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.declineBtn, actionInProgress && { opacity: 0.6 }]} 
                  onPress={() => openDeclineModal(r)}
                  disabled={actionInProgress}
                >
                  <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.reqCard, { paddingVertical: 30, alignItems: 'center' }]}>
            <Text style={styles.emptyText}>No pending consultation requests.</Text>
            <Text style={{ fontSize: 12, color: '#888', marginTop: 6, textAlign: 'center' }}>
              When citizens request a consultation with your profile, they will appear here in real time.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* DECLINE REASON MODAL */}
      <Modal
        visible={declineModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDeclineModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>Decline Consultation</Text>
            <Text style={modalStyles.subtitle}>
              Please select or enter a reason for declining {selectedReq?.name}'s request:
            </Text>

            <Text style={modalStyles.sectionLabel}>Quick Reasons (Tap to select):</Text>
            {QUICK_REASONS.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  modalStyles.reasonChip,
                  declineReason === reason && modalStyles.reasonChipSelected,
                ]}
                onPress={() => setDeclineReason(reason)}
              >
                <Text
                  style={[
                    modalStyles.reasonChipText,
                    declineReason === reason && modalStyles.reasonChipTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={modalStyles.sectionLabel}>Or write custom reason:</Text>
            <TextInput
              style={modalStyles.input}
              value={declineReason}
              onChangeText={setDeclineReason}
              placeholder="Explain reason for declining..."
              multiline
              numberOfLines={3}
            />

            <View style={modalStyles.btnRow}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={() => setDeclineModalVisible(false)}
                disabled={actionInProgress}
              >
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={modalStyles.confirmDeclineBtn}
                onPress={handleConfirmDecline}
                disabled={actionInProgress}
              >
                {actionInProgress ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={modalStyles.confirmDeclineText}>Confirm Decline</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Unified Bottom Navigation */}
      <BottomNavBar role="lawyer" activeTab="requests" />
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2744',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
  },
  reasonChip: {
    backgroundColor: '#F5F3EF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E0D8',
  },
  reasonChipSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  reasonChipText: {
    fontSize: 12,
    color: '#333',
  },
  reasonChipTextSelected: {
    color: '#92400E',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 13,
  },
  confirmDeclineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  confirmDeclineText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
