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
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './CaseRequests.styles';
import {
  useMockStore,
  caseRequests,
  declineRequest,
  acceptRequest,
  fetchRequests,
  lawyerProfile,
} from './MockStore';
import { getCurrentLawyerId } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';

const QUICK_REASONS = [
  'Schedule is currently full for new consultations.',
  'Case dispute type is outside my primary legal jurisdiction.',
  'Conflict of interest with existing active client.',
  'Requires urgent High Court representation outside district.',
];

const DEFAULT_TIME_SLOTS = [
  'Tomorrow 10:30 AM',
  'Tomorrow 02:30 PM',
  'Next Working Day 11:00 AM',
];

export default function CaseRequests() {
  useMockStore();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const { t, currentLang, translateDistrict, translateCategory } = useAppTranslation();
  const params = useLocalSearchParams();
  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

  const [selectedReq, setSelectedReq] = useState(null);
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Digital Agreement Modal States
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [agreementTargetReq, setAgreementTargetReq] = useState(null);
  const [agreementTerms, setAgreementTerms] = useState(
    'Digital Legal Representation Agreement under Sindh Bar Council (SBC) Rules. Counsel agrees to review the case dossier, maintain strict advocate-client confidentiality, and provide formal legal counsel during the selected consultation window.'
  );
  const [slot1, setSlot1] = useState(DEFAULT_TIME_SLOTS[0]);
  const [slot2, setSlot2] = useState(DEFAULT_TIME_SLOTS[1]);
  const [slot3, setSlot3] = useState(DEFAULT_TIME_SLOTS[2]);
  const [lawyerSig, setLawyerSig] = useState(lawyerProfile.name ? `${lawyerProfile.name} (Advocate SBC)` : 'Advocate Signed (SBC)');

  // Full Screen Image Preview
  const [previewImageUri, setPreviewImageUri] = useState(null);

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  useEffect(() => {
    if (currentLawyerId) {
      fetchRequests(currentLawyerId);
    }
  }, [currentLawyerId]);

  // Open the Digital Representation Agreement Modal
  const openAcceptAgreementModal = (req) => {
    setAgreementTargetReq(req);
    setLawyerSig(lawyerProfile.name ? `${lawyerProfile.name} (Advocate SBC)` : 'Advocate Signed (SBC)');
    setSlot1(DEFAULT_TIME_SLOTS[0]);
    setSlot2(DEFAULT_TIME_SLOTS[1]);
    setSlot3(DEFAULT_TIME_SLOTS[2]);
    setAgreementModalVisible(true);
  };

  const handleConfirmSendAgreement = async () => {
    if (!agreementTargetReq) return;
    const slots = [slot1.trim(), slot2.trim(), slot3.trim()].filter(Boolean);
    if (slots.length === 0) {
      Alert.alert('Time Slots Required', 'Please provide at least one consultation time slot for the client.');
      return;
    }
    if (!lawyerSig.trim()) {
      Alert.alert('Signature Required', 'Please enter your advocate digital signature.');
      return;
    }

    try {
      setActionInProgress(true);
      await acceptRequest(
        agreementTargetReq.id,
        {
          agreementTerms: agreementTerms.trim(),
          timeSlots: slots,
          lawyerSignature: lawyerSig.trim(),
        },
        currentLawyerId
      );
      setAgreementModalVisible(false);
      setAgreementTargetReq(null);
      Alert.alert(
        'Agreement Sent 📜',
        'Your Digital Legal Representation Agreement and proposed time slots have been sent to the client. Once the client signs, your mutual contact details will be unlocked and booked!'
      );
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Could not send agreement');
    } finally {
      setActionInProgress(false);
    }
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

  const handleCallClient = (phone) => {
    if (!phone) {
      Alert.alert('Notice', 'Client direct phone line is registered in database.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call', `Client phone line: ${phone}`);
    });
  };

  const dynamicStyles = {
    safe: {
      flex: 1,
      backgroundColor: isDark ? '#060201' : '#FAF7F2',
    },
    reqCard: {
      backgroundColor: isDark ? 'rgba(38, 20, 10, 0.94)' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 149, 0, 0.32)' : 'rgba(255, 149, 0, 0.20)',
    },
    reqName: {
      color: isDark ? '#FFFFFF' : '#1A0F07',
    },
    reqMeta: {
      color: isDark ? 'rgba(255, 235, 215, 0.7)' : '#665544',
    },
    problemBox: {
      backgroundColor: isDark ? 'rgba(28, 14, 6, 0.85)' : '#F5EBE1',
      borderColor: isDark ? 'rgba(255, 149, 0, 0.20)' : 'rgba(255, 149, 0, 0.15)',
    },
    reqDesc: {
      color: isDark ? '#FFFFFF' : '#1A0F07',
    },
    emptyText: {
      color: isDark ? '#FFFFFF' : '#1A0F07',
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#060201' : '#FAF7F2'} />

      {/* Top Header */}
      <AppHeader
        title={`Requests (${caseRequests.length})`}
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {caseRequests.length > 0 ? (
          caseRequests.map((r) => {
            const evidence = Array.isArray(r.evidence) ? r.evidence : (Array.isArray(r.sharedEvidence) ? r.sharedEvidence : []);
            const isBooked = r.status === 'booked';
            const isAgreementSent = r.status === 'agreement_sent';
            const isPending = r.status === 'pending';

            return (
              <View key={r.id} style={[styles.reqCard, dynamicStyles.reqCard]}>
                <View style={styles.reqTop}>
                  <Text style={[styles.reqName, dynamicStyles.reqName]}>
                    {r.citizenName || r.name} - {translateCategory(r.spec || 'Legal Case')}
                  </Text>
                  <Text
                    style={[
                      styles.badgeNew,
                      isBooked && { backgroundColor: 'rgba(34,197,94,0.2)', borderColor: '#22C55E', color: '#4ADE80' },
                      isAgreementSent && { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: '#F59E0B', color: '#FBBF24' },
                    ]}
                  >
                    {isBooked ? '✓ Booked' : isAgreementSent ? 'Agreement Sent' : 'Pending Review'}
                  </Text>
                </View>

                <Text style={[styles.reqMeta, dynamicStyles.reqMeta]}>
                  District: {translateDistrict(r.district || r.location || 'Sindh')} · {r.time || 'Recent'}
                </Text>

                {/* Problem & Background */}
                <View style={[styles.problemBox, dynamicStyles.problemBox]}>
                  <Text style={styles.problemLabel}>Case Matter / Grievance:</Text>
                  <Text style={[styles.reqDesc, dynamicStyles.reqDesc]}>
                    {r.problemStatement || r.desc}
                  </Text>
                </View>

                {/* Attached Evidence Photos / PDFs */}
                {evidence.length > 0 && (
                  <View style={styles.evidenceContainer}>
                    <Text style={styles.evidenceLabel}>
                      Attached Evidence Dossier ({evidence.length} {evidence.length === 1 ? 'item' : 'items'}):
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceThumbRow}>
                      {evidence.map((ev, idx) => {
                        const fileUri = ev.uri || ev.fileUri;
                        const isPhoto = ev.fileType === 'Photo' || ev.type === 'Photo' || (fileUri && !fileUri.toLowerCase().endsWith('.pdf'));

                        return (
                          <TouchableOpacity
                            key={ev.id || idx}
                            style={styles.evidenceThumbCard}
                            onPress={() => {
                              if (isPhoto && fileUri) {
                                setPreviewImageUri(fileUri);
                              } else if (fileUri) {
                                Linking.openURL(fileUri).catch(() => {
                                  Alert.alert('Evidence File', ev.title || 'Document');
                                });
                              } else {
                                Alert.alert('Evidence File', ev.title || 'Document');
                              }
                            }}
                          >
                            {isPhoto && fileUri ? (
                              <Image source={{ uri: fileUri }} style={styles.evidenceThumbImg} resizeMode="cover" />
                            ) : (
                              <View style={{ alignItems: 'center' }}>
                                <View style={styles.evidencePdfBadge}>
                                  <Text style={styles.evidencePdfText}>PDF</Text>
                                </View>
                                <Text style={styles.evidenceThumbTitle} numberOfLines={1}>
                                  {ev.title || 'Doc'}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* ── STATE 1: BOOKED -> DISPLAY MUTUAL CLIENT CONTACT CARD ── */}
                {isBooked ? (
                  <View style={styles.confirmedClientCard}>
                    <View style={styles.confirmedClientHeader}>
                      <View style={styles.confirmedClientBadge}>
                        <Text style={styles.confirmedClientBadgeText}>✓ Consultation Confirmed</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: '#4ADE80', fontWeight: '700' }}>
                        Retainer Signed & Sealed
                      </Text>
                    </View>

                    <Text style={styles.confirmedClientName}>Client: {r.citizenName || r.name}</Text>
                    <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>
                      🗓️ Consultation Slot: {r.appointmentTime || '10:30 AM'}
                    </Text>

                    <View style={styles.confirmedClientPhoneRow}>
                      <View>
                        <Text style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                          Direct Phone Line
                        </Text>
                        <Text style={styles.confirmedPhoneText}>
                          {r.contact || r.citizenPhone || '+92 300 0000000'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.callClientBtn}
                        onPress={() => handleCallClient(r.contact || r.citizenPhone)}
                      >
                        <Text style={styles.callClientBtnText}>📞 Call Client</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : isAgreementSent ? (
                  /* ── STATE 2: AGREEMENT SENT BANNER ── */
                  <View style={styles.agreementSentBanner}>
                    <Text style={styles.agreementSentTitle}>📜 Digital Agreement Sent to Client</Text>
                    <Text style={styles.agreementSentText}>
                      You have proposed {r.timeSlots && r.timeSlots.length > 0 ? r.timeSlots.join(', ') : 'consultation slots'}. Awaiting client digital signature to confirm booking and unlock direct phone line.
                    </Text>
                  </View>
                ) : (
                  /* ── STATE 3: PENDING -> SHOW NOTICE & ACTION BUTTONS ── */
                  <>
                    <View style={styles.securedNotice}>
                      <Text style={styles.securedNoticeText}>
                        Review client case facts and attached evidence. To accept, propose consultation slots and sign the digital agreement.
                      </Text>
                    </View>

                    <View style={styles.btnRow}>
                      <TouchableOpacity
                        style={[styles.acceptBtn, actionInProgress && { opacity: 0.6 }]}
                        onPress={() => openAcceptAgreementModal(r)}
                        disabled={actionInProgress}
                      >
                        <Text style={styles.acceptText}>Accept & Propose Agreement ⚖️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.declineBtn, actionInProgress && { opacity: 0.6 }]}
                        onPress={() => openDeclineModal(r)}
                        disabled={actionInProgress}
                      >
                        <Text style={styles.declineText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            );
          })
        ) : (
          <View style={[styles.reqCard, dynamicStyles.reqCard, { paddingVertical: 35, alignItems: 'center' }]}>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No pending consultation requests.</Text>
            <Text
              style={{
                fontSize: 12,
                color: isDark ? 'rgba(255, 235, 215, 0.6)' : '#665544',
                marginTop: 6,
                textAlign: 'center',
                paddingHorizontal: 20,
              }}
            >
              When citizens request a consultation with your profile from their case details, they will appear here in real time.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── MODAL 1: PROPOSE DIGITAL AGREEMENT & AVAILABLE TIME SLOTS ── */}
      <Modal
        visible={agreementModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAgreementModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>Digital Representation Agreement</Text>
            <Text style={modalStyles.subtitle}>
              Propose appointment slots and apply your digital signature for client {agreementTargetReq?.citizenName || agreementTargetReq?.name}.
            </Text>

            <Text style={modalStyles.sectionLabel}>Sindh Bar Council Retainer Terms:</Text>
            <TextInput
              style={[modalStyles.input, { minHeight: 65 }]}
              value={agreementTerms}
              onChangeText={setAgreementTerms}
              multiline
              numberOfLines={3}
            />

            <Text style={modalStyles.sectionLabel}>Offer 3 Consultation Time Slots:</Text>
            <TextInput
              style={[modalStyles.input, { minHeight: 38, marginBottom: 6 }]}
              value={slot1}
              onChangeText={setSlot1}
              placeholder="Slot 1 (e.g. Tomorrow 10:30 AM)"
            />
            <TextInput
              style={[modalStyles.input, { minHeight: 38, marginBottom: 6 }]}
              value={slot2}
              onChangeText={setSlot2}
              placeholder="Slot 2 (e.g. Tomorrow 02:30 PM)"
            />
            <TextInput
              style={[modalStyles.input, { minHeight: 38, marginBottom: 12 }]}
              value={slot3}
              onChangeText={setSlot3}
              placeholder="Slot 3 (e.g. Next Working Day 11:00 AM)"
            />

            <Text style={modalStyles.sectionLabel}>Advocate Digital Signature *</Text>
            <TextInput
              style={[modalStyles.input, { minHeight: 38, marginBottom: 16 }]}
              value={lawyerSig}
              onChangeText={setLawyerSig}
              placeholder="e.g. Advocate Tariq Hassan (SBC Verified)"
            />

            <View style={modalStyles.btnRow}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={() => setAgreementModalVisible(false)}
                disabled={actionInProgress}
              >
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyles.confirmDeclineBtn, { backgroundColor: '#FF9500' }]}
                onPress={handleConfirmSendAgreement}
                disabled={actionInProgress}
              >
                {actionInProgress ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[modalStyles.confirmDeclineText, { color: '#0A0502' }]}>
                    Sign & Send Agreement ✍️
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: DECLINE REASON MODAL ── */}
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

      {/* ── FULL SCREEN PHOTO PREVIEW MODAL ── */}
      <Modal
        visible={Boolean(previewImageUri)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}
      >
        <View style={styles.fullImageOverlay}>
          <TouchableOpacity
            style={styles.fullImageCloseBtn}
            onPress={() => setPreviewImageUri(null)}
          >
            <Text style={styles.fullImageCloseText}>✕ Close</Text>
          </TouchableOpacity>
          {previewImageUri && (
            <Image source={{ uri: previewImageUri }} style={styles.fullImage} />
          )}
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavBar role="lawyer" activeTab="requests" />
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1E1611',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1.5,
    borderColor: 'rgba(255,149,0,0.4)',
    elevation: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,235,215,0.75)',
    marginBottom: 12,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFA726',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  reasonChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.2)',
  },
  reasonChipSelected: {
    backgroundColor: 'rgba(255,149,0,0.22)',
    borderColor: '#FF9500',
  },
  reasonChipText: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.8)',
  },
  reasonChipTextSelected: {
    color: '#FFB74D',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#2A1A10',
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.35)',
    borderRadius: 8,
    padding: 9,
    fontSize: 12,
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtnText: {
    color: '#D1D5DB',
    fontSize: 12.5,
    fontWeight: '700',
  },
  confirmDeclineBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmDeclineText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
