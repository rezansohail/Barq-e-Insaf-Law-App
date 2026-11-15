import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from './CaseDetail.styles';
import { useMockStore, activeCases, updateCase } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function CaseDetail() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = params.caseId;
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const caseData = activeCases.find(c => c.id === caseId);

  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(caseData ? caseData.title : '');
  const [editedDesc, setEditedDesc] = useState(caseData ? caseData.description : '');

  // Media coverage request modal states
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [allowAnonymousRelay, setAllowAnonymousRelay] = useState(true);
  const [mediaNotes, setMediaNotes] = useState('');
  const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);

  const handleOpenMediaModal = () => {
    setMediaNotes(caseData?.mediaNotes || '');
    setShowMediaModal(true);
  };

  const handleSubmitMediaRequest = async () => {
    setIsSubmittingMedia(true);
    try {
      await updateCase(caseData.id, {
        mediaRequested: true,
        mediaStatus: caseData.mediaStatus || 'pending',
        mediaNotes: mediaNotes.trim(),
        anonymousRelayConsent: allowAnonymousRelay,
        mediaRequestedAt: new Date().toISOString(),
      });
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

  const handleSaveChanges = async () => {
    if (!editedTitle.trim() || !editedDesc.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    await updateCase(caseData.id, {
      title: editedTitle.trim(),
      description: editedDesc.trim(),
    });
    setEditMode(false);
    Alert.alert('Success', 'Case updated successfully in database!');
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
        title="Case Details" 
        showBack={true} 
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.caseHeader}>
          {editMode ? (
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Edit Case Title</Text>
              <TextInput
                style={styles.editInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
              />
            </View>
          ) : (
            <Text style={styles.caseTitle}>{caseData.title}</Text>
          )}

          <View style={styles.caseStatusRow}>
            <View style={[styles.statusBadge, caseData.status === 'Active' ? styles.statusActive : styles.statusPending]}>
              <Text style={styles.statusText}>{caseData.status}</Text>
            </View>
            <Text style={styles.caseType}>{caseData.type} Law</Text>
            {caseData.mediaRequested && (
              <View style={caseData.mediaStatus === 'under_investigation' ? styles.mediaBadgeInvestigating : styles.mediaBadgePending}>
                <Image
                  source={require('../../assets/images/speaker.png')}
                  style={{ width: 13, height: 13, tintColor: caseData.mediaStatus === 'under_investigation' ? '#E9D5FF' : '#FFA726' }}
                />
                <Text style={caseData.mediaStatus === 'under_investigation' ? styles.mediaBadgeTextInvestigating : styles.mediaBadgeTextPending}>
                  {caseData.mediaStatus === 'under_investigation' ? 'Under KTN Investigation' : 'Media Review: Pending'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* CASE SUMMARY PROFILE */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Case Summary</Text>
          {editMode ? (
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Edit Summary Description</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                multiline
                numberOfLines={4}
                value={editedDesc}
                onChangeText={setEditedDesc}
              />
            </View>
          ) : (
            <Text style={styles.descriptionText}>{caseData.description}</Text>
          )}
        </View>

        {/* METADATA INFO */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Filing Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Filing Date</Text>
            <Text style={styles.infoValue}>{caseData.filingDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>{caseData.lastUpdated}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jurisdiction</Text>
            <Text style={styles.infoValue}>{caseData.district || 'Sindh'}</Text>
          </View>
        </View>

        {/* EVIDENCE BUTTON */}
        <TouchableOpacity 
          style={styles.evidenceVaultBtn}
          onPress={() => router.push({
            pathname: '/(citizen)/CaseEvidence',
            params: { caseId: caseData.id }
          })}
        >
          <Text style={styles.evidenceVaultBtnText}>
            Open Evidence Vault ({Array.isArray(caseData.evidence) ? caseData.evidence.length : 0} {Array.isArray(caseData.evidence) && caseData.evidence.length === 1 ? 'file' : 'files'})
          </Text>
        </TouchableOpacity>

        {/* REQUEST MEDIA COVERAGE BUTTON */}
        <TouchableOpacity 
          style={[
            styles.mediaRequestBtn,
            caseData.mediaRequested && styles.mediaRequestBtnRequested,
          ]}
          onPress={handleOpenMediaModal}
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

        {/* EDIT TOGGLE CONTROLS */}
        {editMode ? (
          <View style={styles.editActionRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => {
              setEditedTitle(caseData.title);
              setEditedDesc(caseData.description);
              setEditMode(false);
            }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.updateBtn} onPress={() => setEditMode(true)}>
            <Text style={styles.updateBtnText}>Edit Case Details</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Shared bottom navigation */}
      <BottomNavBar role="citizen" activeTab="cases" />

      {/* CONFIRMATION MODAL: REQUEST BROADCAST JOURNALISM COVERAGE */}
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
