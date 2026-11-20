import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  Switch,
  Image,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import styles from './CaseDetail.styles';
import {
  useMockStore,
  activeCases,
  updateCase,
  addEvidenceToCase,
  removeEvidenceFromCase,
  lawyers,
  consultationRequests,
  requestConsultation,
  signConsultationAgreement,
  requestNgoAidForCase,
  requestMediaCoverageForCase,
  userData,
} from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTranslation } from '../../utils/translationHelper';
import { useAppTheme } from '../../context/ThemeContext';

const SINDH_CITIES_LIST = [
  'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas',
  'Shaheed Benazirabad', 'Khairpur', 'Ghotki', 'Jacobabad',
  'Kashmore', 'Shikarpur', 'Dadu', 'Jamshoro', 'Matiari',
  'Tando Allahyar', 'Badin', 'Thatta', 'Sanghar', 'Tharparkar'
];

export default function CaseDetail() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = params.caseId;
  const { isDarkMode, theme } = useAppTheme();
  const { t, currentLang, translateDistrict, translateCategory, translateLawyerName } = useAppTranslation();
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const caseData = activeCases.find((c) => String(c.id) === String(caseId));

  // Edit Mode States
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(caseData ? caseData.title : '');
  const [editedDesc, setEditedDesc] = useState(caseData ? caseData.description : '');
  const [editedDistrict, setEditedDistrict] = useState(caseData ? caseData.district || 'Karachi' : 'Karachi');
  const [editedType, setEditedType] = useState(caseData ? caseData.type || 'Property & Land' : 'Property & Land');
  const [isSavingCase, setIsSavingCase] = useState(false);

  // Evidence states
  const [evidenceList, setEvidenceList] = useState(caseData && Array.isArray(caseData.evidence) ? caseData.evidence : []);
  const [previewImageUri, setPreviewImageUri] = useState(null);
  const [isAddingEvidence, setIsAddingEvidence] = useState(false);

  // Synchronize case data when store updates
  useEffect(() => {
    if (caseData) {
      if (!editMode) {
        setEditedTitle(caseData.title || '');
        setEditedDesc(caseData.description || '');
        setEditedDistrict(caseData.district || 'Karachi');
        setEditedType(caseData.type || 'Property & Land');
      }
      if (Array.isArray(caseData.evidence)) {
        setEvidenceList(caseData.evidence);
      }
    }
  }, [caseData, editMode]);

  // Find linked consultation (from consultationRequests or caseData.consultation)
  const activeConsultation = consultationRequests.find(
    (r) => String(r.caseId) === String(caseId) || (caseData?.consultation && String(r.id) === String(caseData.consultation.id))
  ) || caseData?.consultation;

  const assignedLawyer = activeConsultation?.lawyerId
    ? lawyers.find((l) => String(l.id) === String(activeConsultation.lawyerId))
    : (caseData?.lawyerId ? lawyers.find((l) => String(l.id) === String(caseData.lawyerId)) : null);

  // Digital Agreement Modal states
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [citizenSignature, setCitizenSignature] = useState(userData.name || 'Citizen Signed');
  const [isSigningAgreement, setIsSigningAgreement] = useState(false);

  // Advocate Selector Modal states (to request consultation for this case)
  const [showLawyerSelectModal, setShowLawyerSelectModal] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [consultProblem, setConsultProblem] = useState('');
  const [isSubmittingConsult, setIsSubmittingConsult] = useState(false);

  // NGO Legal Aid Request Modal states
  const [showNgoModal, setShowNgoModal] = useState(false);
  const [ngoNotes, setNgoNotes] = useState('');
  const [allowNgoContact, setAllowNgoContact] = useState(true);
  const [isSubmittingNgo, setIsSubmittingNgo] = useState(false);

  // Media coverage request modal states
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [allowAnonymousRelay, setAllowAnonymousRelay] = useState(true);
  const [mediaNotes, setMediaNotes] = useState('');
  const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);

  // ── EVIDENCE PICKERS ──
  const handlePickImage = async () => {
    try {
      setIsAddingEvidence(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to attach photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newEv = {
          id: 'ev-' + Date.now(),
          title: asset.fileName || 'Evidence Photo ' + (evidenceList.length + 1),
          name: asset.fileName || 'Evidence Photo',
          fileType: 'Photo',
          type: 'Photo',
          uri: asset.uri,
          fileUri: asset.uri,
          fileSize: '1.2 MB',
          size: '1.2 MB',
          category: 'Visual Proof',
          caseId: caseData.id,
        };

        const updated = [...evidenceList, newEv];
        setEvidenceList(updated);
        await addEvidenceToCase(caseData.id, newEv);
        await updateCase(caseData.id, { evidence: updated });
        Alert.alert('Evidence Added', 'Photo has been attached and encrypted in your vault.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not attach image: ' + err.message);
    } finally {
      setIsAddingEvidence(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      setIsAddingEvidence(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const doc = result.assets[0];
        const isPdf = doc.mimeType?.includes('pdf') || doc.name?.toLowerCase().endsWith('.pdf');
        const formattedSize = doc.size
          ? doc.size > 1048576
            ? (doc.size / 1048576).toFixed(1) + ' MB'
            : Math.round(doc.size / 1024) + ' KB'
          : '1.0 MB';

        const newEv = {
          id: 'ev-' + Date.now(),
          title: doc.name || 'Legal Document',
          name: doc.name || 'Legal Document',
          fileType: isPdf ? 'PDF' : 'Document',
          type: isPdf ? 'PDF' : 'Document',
          uri: doc.uri,
          fileUri: doc.uri,
          fileSize: formattedSize,
          size: formattedSize,
          category: 'Official Document',
          caseId: caseData.id,
        };

        const updated = [...evidenceList, newEv];
        setEvidenceList(updated);
        await addEvidenceToCase(caseData.id, newEv);
        await updateCase(caseData.id, { evidence: updated });
        Alert.alert('Document Attached', 'PDF document saved securely to your case dossier.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not attach document: ' + err.message);
    } finally {
      setIsAddingEvidence(false);
    }
  };

  const handleRemoveEvidence = async (index) => {
    Alert.alert(
      'Remove Evidence',
      'Are you sure you want to remove this evidence file from your case?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = [...evidenceList];
            updated.splice(index, 1);
            setEvidenceList(updated);
            await removeEvidenceFromCase(caseData.id, index);
            await updateCase(caseData.id, { evidence: updated });
          },
        },
      ]
    );
  };

  // ── SAVE CASE CHANGES (EDIT CASE) ──
  const handleSaveChanges = async () => {
    if (!editedTitle.trim() || !editedDesc.trim()) {
      Alert.alert('Error', 'Please provide a valid case title and description.');
      return;
    }
    try {
      setIsSavingCase(true);
      await updateCase(caseData.id, {
        title: editedTitle.trim(),
        description: editedDesc.trim(),
        district: editedDistrict,
        type: editedType,
        evidence: evidenceList,
      });
      setEditMode(false);
      Alert.alert('Success', 'Case details and evidence updated successfully in database!');
    } catch (e) {
      Alert.alert('Error', 'Failed to update case: ' + e.message);
    } finally {
      setIsSavingCase(false);
    }
  };

  // ── LEGAL CONSULTATION ACTIONS ──
  const handleOpenLawyerModal = () => {
    setConsultProblem(caseData?.title || '');
    if (lawyers.length > 0) setSelectedLawyer(lawyers[0]);
    setShowLawyerSelectModal(true);
  };

  const handleSubmitConsultationRequest = async () => {
    if (!selectedLawyer) {
      Alert.alert('Selection Required', 'Please select an advocate for legal consultation.');
      return;
    }
    try {
      setIsSubmittingConsult(true);
      await requestConsultation({
        lawyerId: selectedLawyer.id,
        caseId: caseData.id,
        problemStatement: consultProblem.trim() || caseData.title,
        caseSummary: caseData.description,
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00 AM - 01:00 PM',
      });
      setShowLawyerSelectModal(false);
      Alert.alert(
        'Consultation Requested',
        `Your case dossier and evidence have been sent to ${selectedLawyer.name}. The advocate will review the files and send you a digital agreement.`
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to submit consultation request: ' + e.message);
    } finally {
      setIsSubmittingConsult(false);
    }
  };

  // ── DIGITAL AGREEMENT SIGNING ──
  const handleOpenAgreementModal = () => {
    const slots = activeConsultation?.timeSlots || ['Tomorrow 10:30 AM', 'Tomorrow 02:30 PM', 'Next Working Day 11:00 AM'];
    setSelectedTimeSlot(slots[0]);
    setCitizenSignature(userData.name || 'Citizen Signed');
    setShowAgreementModal(true);
  };

  const handleConfirmSignAgreement = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Slot Required', 'Please choose your preferred consultation time slot.');
      return;
    }
    if (!citizenSignature.trim()) {
      Alert.alert('Signature Required', 'Please enter your digital signature to confirm booking.');
      return;
    }

    try {
      setIsSigningAgreement(true);
      await signConsultationAgreement(activeConsultation.id, selectedTimeSlot, citizenSignature.trim());
      setShowAgreementModal(false);
      Alert.alert(
        'Agreement Confirmed & Booked! ⚖️',
        `Your legal consultation with ${assignedLawyer?.name || 'your Advocate'} is officially booked for ${selectedTimeSlot}. Contact details are now unlocked!`
      );
    } catch (e) {
      Alert.alert('Error', 'Could not sign agreement: ' + e.message);
    } finally {
      setIsSigningAgreement(false);
    }
  };

  // ── NGO AID REQUEST ──
  const handleSubmitNgoRequest = async () => {
    try {
      setIsSubmittingNgo(true);
      await requestNgoAidForCase(caseData.id, ngoNotes.trim(), allowNgoContact);
      setShowNgoModal(false);
      Alert.alert(
        'Legal Aid Requested',
        'Your case dossier has been forwarded to NCHD Sindh Legal Aid Cell. An accredited legal counselor will review your grievance.'
      );
    } catch (e) {
      Alert.alert('Notice', 'NCHD Legal Aid request saved.');
      setShowNgoModal(false);
    } finally {
      setIsSubmittingNgo(false);
    }
  };

  // ── MEDIA COVERAGE REQUEST ──
  const handleSubmitMediaRequest = async () => {
    try {
      setIsSubmittingMedia(true);
      await requestMediaCoverageForCase(caseData.id, mediaNotes.trim(), allowAnonymousRelay);
      setShowMediaModal(false);
      Alert.alert(
        'Coverage Requested',
        'Your case details have been securely submitted to the KTN News Judicial Bureau under 100% identity protection.'
      );
    } catch (e) {
      Alert.alert('Notice', 'Coverage request saved locally.');
      setShowMediaModal(false);
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  const handleCallLawyer = (phone) => {
    if (!phone) {
      Alert.alert('Notice', 'Advocate direct contact line is active. Official chamber connection in progress.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call', `Advocate phone line: ${phone}`);
    });
  };

  if (!caseData) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#080402" />
        <AppHeader title="Case Details" showBack={true} homeRoute="/(citizen)/CitizenHome" role="citizen" />
        <View style={[styles.scrollContent, { alignItems: 'center', marginTop: 40 }]}>
          <Text style={[styles.descriptionText, { color: 'rgba(255,255,255,0.7)' }]}>Case not found.</Text>
        </View>
        <BottomNavBar role="citizen" activeTab="cases" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#080402" />

      <AppHeader
        title={t('case.detailTitle', 'Case Details')}
        showBack={true}
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* CASE HEADER / TITLE & STATUS */}
        <View style={styles.caseHeader}>
          {editMode ? (
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Case Title *</Text>
              <TextInput
                style={styles.editInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Enter case title"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />

              <Text style={[styles.editLabel, { marginTop: 10 }]}>Dispute Category</Text>
              <TextInput
                style={styles.editInput}
                value={editedType}
                onChangeText={setEditedType}
                placeholder="e.g. Property & Land / Family Law"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />

              <Text style={[styles.editLabel, { marginTop: 10 }]}>Sindh City / District</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                {SINDH_CITIES_LIST.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.timeSlotChip,
                      editedDistrict === city && styles.timeSlotChipActive,
                    ]}
                    onPress={() => setEditedDistrict(city)}
                  >
                    <Text style={[styles.timeSlotChipText, editedDistrict === city && styles.timeSlotChipTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.caseTitle}>{caseData.title}</Text>
          )}

          <View style={styles.caseStatusRow}>
            <View style={[styles.statusBadge, caseData.status === 'Active' ? styles.statusActive : styles.statusPending]}>
              <Text style={caseData.status === 'Active' ? styles.statusTextActive : styles.statusTextPending}>
                {caseData.status || 'Pending'}
              </Text>
            </View>
            <Text style={styles.caseType}>{translateCategory(caseData.type || 'Legal Case')} Law</Text>

            {caseData.mediaRequested && (
              <View style={caseData.mediaStatus === 'under_investigation' ? styles.mediaBadgeInvestigating : styles.mediaBadgePending}>
                <Image
                  source={require('../../assets/images/speaker.png')}
                  style={{ width: 12, height: 12, tintColor: caseData.mediaStatus === 'under_investigation' ? '#E9D5FF' : '#FFA726' }}
                />
                <Text style={caseData.mediaStatus === 'under_investigation' ? styles.mediaBadgeTextInvestigating : styles.mediaBadgeTextPending}>
                  {caseData.mediaStatus === 'under_investigation' ? 'Under KTN Investigation' : 'Media: Pending'}
                </Text>
              </View>
            )}

            {caseData.ngoRequested && (
              <View style={[styles.mediaBadgePending, { borderColor: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.18)' }]}>
                <Text style={[styles.mediaBadgeTextPending, { color: '#38BDF8' }]}>NGO Aid Requested</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── LEGAL CONSULTATION & DIGITAL AGREEMENT BANNER / CARD ── */}
        {activeConsultation?.status === 'booked' ? (
          // STATE 1: OFFICIALLY BOOKED & CONFIRMED ADVOCATE REPRESENTATION CARD
          <View style={styles.confirmedAdvocateCard}>
            <View style={styles.confirmedBadgeRow}>
              <View style={styles.verifiedShield}>
                <Text style={styles.verifiedShieldText}>✓ Official Legal Representation</Text>
              </View>
              <Text style={{ color: '#4ADE80', fontSize: 11, fontWeight: '700' }}>Confirmed & Sealed</Text>
            </View>

            <Text style={styles.confirmedAdvocateName}>
              {assignedLawyer ? translateLawyerName(assignedLawyer.name) : 'Verified Advocate (SBC)'}
            </Text>
            <Text style={styles.confirmedAdvocateSpec}>
              {assignedLawyer?.spec || 'High Court Advocate'} · {assignedLawyer?.sbc || 'SBC Enrolled'}
            </Text>

            <View style={styles.confirmedSlotBox}>
              <Text style={styles.confirmedSlotLabel}>Confirmed Consultation Window</Text>
              <Text style={styles.confirmedSlotValue}>
                🗓️ {activeConsultation.appointmentTime || activeConsultation.appointmentDate || 'Tomorrow 10:30 AM'}
              </Text>
            </View>

            <View style={styles.confirmedPhoneRow}>
              <View>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Direct Advocate Line</Text>
                <Text style={styles.confirmedPhoneText}>
                  {assignedLawyer?.phone || activeConsultation.lawyerPhone || '+92 300 1234567'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.callBtnSmall}
                onPress={() => handleCallLawyer(assignedLawyer?.phone || activeConsultation.lawyerPhone || '+923001234567')}
              >
                <Text style={styles.callBtnSmallText}>📞 Call Advocate</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                📍 Chamber: {assignedLawyer?.district || caseData.district || 'Karachi'} Bar Association Chambers
              </Text>
            </View>
          </View>
        ) : activeConsultation?.status === 'agreement_sent' ? (
          // STATE 2: LAWYER SIGNED & SENT AGREEMENT TO CITIZEN -> CITIZEN MUST REVIEW & SIGN
          <View style={styles.agreementNoticeBanner}>
            <Text style={styles.agreementNoticeTitle}>
              📜 Advocate Has Accepted & Sent Digital Agreement!
            </Text>
            <Text style={styles.agreementNoticeText}>
              {assignedLawyer ? translateLawyerName(assignedLawyer.name) : 'Your selected Advocate'} has reviewed your case dossier, signed the representation retainer, and offered consultation time slots.
            </Text>
            <TouchableOpacity
              style={styles.reviewAgreementBtn}
              onPress={handleOpenAgreementModal}
              activeOpacity={0.85}
            >
              <Text style={styles.reviewAgreementBtnText}>Review & Sign Agreement ✍️</Text>
            </TouchableOpacity>
          </View>
        ) : activeConsultation?.status === 'pending' ? (
          // STATE 3: CONSULTATION REQUEST PENDING REVIEW BY LAWYER
          <View style={[styles.consultBanner, { borderColor: 'rgba(255, 149, 0, 0.40)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFA726' }}>⏳ Consultation Dossier Under Review</Text>
            </View>
            <Text style={{ fontSize: 12, color: 'rgba(255,235,215,0.85)', lineHeight: 17 }}>
              Your case details and evidence have been sent to {assignedLawyer ? translateLawyerName(assignedLawyer.name) : 'the advocate'}. Waiting for counsel to review your evidence and send the digital agreement.
            </Text>
          </View>
        ) : (
          // STATE 4: NO CONSULTATION REQUESTED YET -> "REQUEST LEGAL CONSULTATION" BUTTON
          <View style={styles.consultBanner}>
            <Text style={{ fontSize: 14.5, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 }}>
              ⚖️ Request Legal Consultation
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255, 235, 215, 0.85)', lineHeight: 17, marginBottom: 12 }}>
              Send this case dossier and attached evidence to an accredited Sindh Bar Council advocate for official legal representation.
            </Text>
            <TouchableOpacity
              style={styles.reviewAgreementBtn}
              onPress={handleOpenLawyerModal}
              activeOpacity={0.85}
            >
              <Text style={styles.reviewAgreementBtnText}>Select Advocate & Send Dossier →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CASE SUMMARY PROFILE ── */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Case Summary</Text>
          {editMode ? (
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Summary Description *</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                multiline
                numberOfLines={4}
                value={editedDesc}
                onChangeText={setEditedDesc}
                placeholder="Describe case facts, dispute history, and relief sought..."
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
          ) : (
            <Text style={styles.descriptionText}>{caseData.description}</Text>
          )}
        </View>

        {/* ── PROMINENT ATTACHED EVIDENCE & DOCUMENTS ── */}
        <View style={styles.evidenceSection}>
          <View style={styles.evidenceSectionHeader}>
            <Text style={styles.sectionTitle}>
              Attached Evidence ({evidenceList.length} {evidenceList.length === 1 ? 'file' : 'files'})
            </Text>
            <TouchableOpacity
              style={styles.addEvidenceSmallBtn}
              onPress={handlePickImage}
              disabled={isAddingEvidence}
            >
              <Text style={styles.addEvidenceSmallBtnText}>+ Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addEvidenceSmallBtn, { borderColor: '#38BDF8' }]}
              onPress={handlePickDocument}
              disabled={isAddingEvidence}
            >
              <Text style={[styles.addEvidenceSmallBtnText, { color: '#38BDF8' }]}>+ PDF / Doc</Text>
            </TouchableOpacity>
          </View>

          {evidenceList && evidenceList.length > 0 ? (
            <View style={styles.evidenceGrid}>
              {evidenceList.map((ev, index) => {
                const isPhoto = ev.fileType === 'Photo' || ev.type === 'Photo' || (ev.uri && !ev.uri.toLowerCase().endsWith('.pdf'));
                const fileUri = ev.uri || ev.fileUri;

                return (
                  <View key={ev.id || index} style={styles.evidenceCard}>
                    {editMode && (
                      <TouchableOpacity
                        style={styles.deleteEvidenceBtn}
                        onPress={() => handleRemoveEvidence(index)}
                      >
                        <Text style={styles.deleteEvidenceBtnText}>✕</Text>
                      </TouchableOpacity>
                    )}

                    {isPhoto && fileUri ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setPreviewImageUri(fileUri)}
                      >
                        <Image
                          source={{ uri: fileUri }}
                          style={styles.evidenceImageThumb}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.evidenceDocThumb}
                        activeOpacity={0.85}
                        onPress={() => {
                          if (fileUri) {
                            Linking.openURL(fileUri).catch(() => {
                              Alert.alert('Evidence Document', `Encrypted Vault Document: ${ev.title || 'Document'}`);
                            });
                          } else {
                            Alert.alert('Evidence Document', `Vault Document: ${ev.title || 'Document'}`);
                          }
                        }}
                      >
                        <View style={styles.pdfBadgeIcon}>
                          <Text style={styles.pdfBadgeText}>PDF</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Tap to Open</Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.evidenceCardBody}>
                      <Text style={styles.evidenceCardTitle} numberOfLines={1}>
                        {ev.title || ev.name || 'Evidence Item'}
                      </Text>
                      <Text style={styles.evidenceCardMeta}>
                        {ev.fileType || ev.type || 'Document'} · {ev.fileSize || ev.size || '1.0 MB'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noEvidenceBox}>
              <Text style={styles.noEvidenceText}>
                No evidence attached yet. Tap "+ Photo" or "+ PDF / Doc" above to attach documents or photos directly from your phone.
              </Text>
            </View>
          )}
        </View>

        {/* ── METADATA INFO ── */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Filing Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Filing Date</Text>
            <Text style={styles.infoValue}>{caseData.filingDate || 'November 20, 2026'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jurisdiction</Text>
            <Text style={styles.infoValue}>{translateDistrict(caseData.district || 'Sindh')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Court</Text>
            <Text style={styles.infoValue}>{caseData.court || 'District Court'}</Text>
          </View>
        </View>

        {/* ── INSTITUTIONAL ASSISTANCE BUTTONS (NGO & MEDIA) ── */}
        <View style={styles.institutionActionRow}>
          {/* 1. Request NGO Legal Aid (NCHD) */}
          <TouchableOpacity
            style={[
              styles.ngoRequestBtn,
              caseData.ngoRequested && styles.ngoRequestBtnRequested,
            ]}
            onPress={() => setShowNgoModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.ngoRequestBtnText}>
              {caseData.ngoRequested ? '✓ NCHD Legal Aid Requested' : '🛡️ Request NCHD Legal Aid'}
            </Text>
          </TouchableOpacity>

          {/* 2. Request KTN News Coverage */}
          <TouchableOpacity
            style={[
              styles.mediaRequestBtn,
              caseData.mediaRequested && styles.mediaRequestBtnRequested,
            ]}
            onPress={() => setShowMediaModal(true)}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/images/speaker.png')}
              style={[
                styles.mediaRequestBtnIcon,
                caseData.mediaRequested && { tintColor: '#FFA726' },
              ]}
            />
            <Text style={[
              styles.mediaRequestBtnText,
              caseData.mediaRequested && styles.mediaRequestBtnTextRequested,
            ]}>
              {caseData.mediaRequested ? 'KTN Coverage Requested' : 'Request KTN News Coverage'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── EDIT / SAVE CONTROLS ── */}
        {editMode ? (
          <View style={styles.editActionRow}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveChanges}
              disabled={isSavingCase}
            >
              {isSavingCase ? (
                <ActivityIndicator color="#0A0502" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setEditedTitle(caseData.title);
                setEditedDesc(caseData.description);
                setEditedDistrict(caseData.district || 'Karachi');
                setEditedType(caseData.type || 'Property & Land');
                setEvidenceList(caseData.evidence || []);
                setEditMode(false);
              }}
              disabled={isSavingCase}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => setEditMode(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.updateBtnText}>Edit Case Details & Evidence</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Shared bottom navigation */}
      <BottomNavBar role="citizen" activeTab="cases" />

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

      {/* ── MODAL 1: SELECT ADVOCATE & SEND CONSULTATION DOSSIER ── */}
      <Modal
        visible={showLawyerSelectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLawyerSelectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Advocate for Case</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
              Choose a verified advocate to review your case dossier ({caseData.title}) and evidence ({evidenceList.length} files).
            </Text>

            <ScrollView style={{ maxHeight: 220, marginBottom: 14 }}>
              {lawyers.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={[
                    styles.timeSlotChip,
                    selectedLawyer?.id === l.id && styles.timeSlotChipActive,
                    { width: '100%', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
                  ]}
                  onPress={() => setSelectedLawyer(l)}
                >
                  <View>
                    <Text style={[styles.timeSlotChipText, selectedLawyer?.id === l.id && styles.timeSlotChipTextActive]}>
                      {translateLawyerName(l.name)}
                    </Text>
                    <Text style={{ fontSize: 10, color: selectedLawyer?.id === l.id ? '#1A0800' : 'rgba(255,255,255,0.6)' }}>
                      {translateCategory(l.spec)} · {l.district || 'Sindh'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: selectedLawyer?.id === l.id ? '#1A0800' : '#FFA726' }}>
                    {l.sbc || 'SBC Verified'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Subject / Legal Relief Sought</Text>
            <TextInput
              style={[styles.notesInput, { minHeight: 60 }]}
              value={consultProblem}
              onChangeText={setConsultProblem}
              placeholder="e.g. Urgent court stay order against illegal encroachment..."
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLawyerSelectModal(false)}
                disabled={isSubmittingConsult}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitConsultationRequest}
                disabled={isSubmittingConsult}
              >
                {isSubmittingConsult ? (
                  <ActivityIndicator color="#0A0502" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Send Dossier to Counsel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: REVIEW & SIGN DIGITAL AGREEMENT (VAKALATNAMA) ── */}
      <Modal
        visible={showAgreementModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAgreementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Digital Representation Retainer</Text>
            <Text style={{ fontSize: 11.5, color: '#4ADE80', fontWeight: '800', marginBottom: 8 }}>
              Sindh Bar Council (SBC) Legal Standards
            </Text>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeLabel}>Agreement Terms</Text>
              <Text style={styles.noticeText}>
                {activeConsultation?.agreementTerms ||
                  'Advocate agrees to provide professional legal consultation, inspect court records and case evidence, and maintain strict advocate-client privilege.'}
              </Text>
            </View>

            <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 10, marginBottom: 12 }}>
              <Text style={{ fontSize: 10.5, color: '#FFA726', fontWeight: '800' }}>Advocate Digital Seal:</Text>
              <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#FFFFFF', marginTop: 2 }}>
                ✍️ {activeConsultation?.lawyerSignature || assignedLawyer?.name || 'Advocate Signed (SBC)'}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Choose Your Preferred Time Slot *</Text>
            <View style={styles.slotSelectionRow}>
              {(activeConsultation?.timeSlots || ['Tomorrow 10:30 AM', 'Tomorrow 02:30 PM', 'Next Working Day 11:00 AM']).map((slot, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.timeSlotChip,
                    selectedTimeSlot === slot && styles.timeSlotChipActive,
                  ]}
                  onPress={() => setSelectedTimeSlot(slot)}
                >
                  <Text style={[styles.timeSlotChipText, selectedTimeSlot === slot && styles.timeSlotChipTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Citizen Digital Signature (Full Name) *</Text>
            <TextInput
              style={[styles.notesInput, { minHeight: 45 }]}
              value={citizenSignature}
              onChangeText={setCitizenSignature}
              placeholder="Type your full legal name as signature"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAgreementModal(false)}
                disabled={isSigningAgreement}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleConfirmSignAgreement}
                disabled={isSigningAgreement}
              >
                {isSigningAgreement ? (
                  <ActivityIndicator color="#0A0502" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Sign & Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: REQUEST NGO LEGAL AID (NCHD) ── */}
      <Modal
        visible={showNgoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNgoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request NCHD Legal Aid</Text>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeLabel}>Free Legal Aid Service</Text>
              <Text style={styles.noticeText}>
                The National Commission for Human Development (NCHD) provides free legal assistance, mediation, and courtroom defense for citizens facing injustice.
              </Text>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                Allow NCHD Legal Officers to contact me via phone
              </Text>
              <Switch
                value={allowNgoContact}
                onValueChange={setAllowNgoContact}
                trackColor={{ false: '#3E3E4A', true: '#38BDF8' }}
                thumbColor={allowNgoContact ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <Text style={styles.inputLabel}>Grievance Notes for Legal Aid Cell</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              placeholder="Explain why you need legal aid assistance..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={ngoNotes}
              onChangeText={setNgoNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowNgoModal(false)}
                disabled={isSubmittingNgo}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#38BDF8' }]}
                onPress={handleSubmitNgoRequest}
                disabled={isSubmittingNgo}
              >
                <Text style={[styles.modalSubmitText, { color: '#031726' }]}>
                  {isSubmittingNgo ? 'Submitting...' : 'Submit to NCHD Aid'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 4: REQUEST KTN NEWS MEDIA COVERAGE ── */}
      <Modal
        visible={showMediaModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMediaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Image source={require('../../assets/images/speaker.png')} style={styles.modalSpeakerIcon} />
              <Text style={styles.modalTitle}>Request Broadcast Journalism Coverage</Text>
            </View>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeLabel}>100% Identity Protection</Text>
              <Text style={styles.noticeText}>
                Your identity (Name & CNIC) will be strictly protected and anonymized. Only case facts and district will be visible to journalists.
              </Text>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                Allow KTN News Bureau to contact me via secure anonymous relay
              </Text>
              <Switch
                value={allowAnonymousRelay}
                onValueChange={setAllowAnonymousRelay}
                trackColor={{ false: '#3E3E4A', true: '#FF9500' }}
                thumbColor={allowAnonymousRelay ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <Text style={styles.inputLabel}>Grievance Summary for Newsroom</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              placeholder="Briefly describe what happened (e.g., land grabbing syndicate ignoring court stay order)..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={mediaNotes}
              onChangeText={setMediaNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowMediaModal(false)}
                disabled={isSubmittingMedia}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitMediaRequest}
                disabled={isSubmittingMedia}
              >
                <Text style={styles.modalSubmitText}>
                  {isSubmittingMedia ? 'Submitting...' : 'Submit to News Bureau'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
