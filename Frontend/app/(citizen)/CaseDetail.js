import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
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

  // Intercept hardware back button to return to MyCases
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/MyCases' });

  const caseData = activeCases.find((c) => c.id === caseId);

  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(caseData ? caseData.title : '');
  const [editedDesc, setEditedDesc] = useState(caseData ? caseData.description : '');

  const handleSaveChanges = () => {
    if (!editedTitle || !editedDesc) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    updateCase(caseData.id, {
      title: editedTitle,
      description: editedDesc,
    });
    setEditMode(false);
    Alert.alert('Success', 'Case updated successfully!');
  };

  const handleCallLawyer = (phone) => {
    Alert.alert(
      'Contact Advocate',
      `Calling Advocate at ${phone} to arrange consultation meeting.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Alert.alert('Dialer', `Calling ${phone}...`) },
      ]
    );
  };

  if (!caseData) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
        <AppHeader
          title="Case Details"
          showBack={true}
          homeRoute="/(citizen)/MyCases"
          role="citizen"
        />
        <View style={[styles.scrollContent, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
          <Text style={styles.descriptionText}>Case record not found.</Text>
        </View>
        <BottomNavBar role="citizen" activeTab="cases" />
      </SafeAreaView>
    );
  }

  const sig = caseData.digitalSignature;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Case Details' Header */}
      <AppHeader
        title="Case Details"
        showBack={true}
        homeRoute="/(citizen)/MyCases"
        role="citizen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* CASE HEADER */}
        <View style={styles.caseHeader}>
          {editMode ? (
            <View>
              <Text style={{ color: '#FFE2B8', fontSize: 11, marginBottom: 4 }}>Edit Case Title</Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(32, 14, 5, 0.7)',
                  color: '#fff',
                  padding: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 149, 0, 0.3)',
                }}
                value={editedTitle}
                onChangeText={setEditedTitle}
              />
            </View>
          ) : (
            <Text style={styles.caseTitle}>{caseData.title}</Text>
          )}

          <View style={styles.caseStatusRow}>
            <View
              style={[
                styles.statusBadge,
                caseData.status === 'Active' ? styles.statusActive : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  caseData.status === 'Active'
                    ? styles.statusTextActive
                    : styles.statusTextPending,
                ]}
              >
                {caseData.status}
              </Text>
            </View>
            <Text style={styles.caseType}>{caseData.type || 'Legal Matter'}</Text>
          </View>
        </View>

        {/* ⚖️ ADVOCATE DIGITAL SIGNATURE & CONSULTANCY APPOINTMENT CARD */}
        {sig && (
          <View style={styles.consultancyCard}>
            <View style={styles.consultancyHeader}>
              <View style={styles.sealIcon}>
                <Text style={styles.sealIconText}>SBC</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.consultancyTitle}>
                  Consultancy Scheduled & Digitally Signed
                </Text>
                <Text style={styles.consultancyCert}>
                  Signed by {sig.signedName} · #{sig.certificateId}
                </Text>
              </View>
            </View>

            {/* Highlighted Visit Time */}
            <View style={styles.visitHighlightBox}>
              <Text style={styles.visitHighlightLabel}>SCHEDULED CONSULTATION VISIT</Text>
              <Text style={styles.visitHighlightTime}>{sig.consultancyTime}</Text>
              <Text style={styles.visitHighlightChamber}>
                📍 {sig.chamberAddress}
              </Text>
            </View>

            {/* Signature Stamp Display */}
            <View style={styles.lawyerSignatureDisplay}>
              {sig.signatureType === 'drawn' && sig.drawnPaths && sig.drawnPaths.length > 0 ? (
                <View style={{ width: '100%', height: 60, marginVertical: 4 }}>
                  <Svg width="100%" height={60}>
                    {sig.drawnPaths.map((p, idx) => (
                      <Path
                        key={idx}
                        d={p}
                        stroke="#FFA726"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </Svg>
                </View>
              ) : (
                <Text style={styles.lawyerCursiveName}>{sig.signedName}</Text>
              )}
              <Text style={styles.lawyerStampFooter}>
                Licence: {sig.sbcLicense} · Signed: {sig.signedAt}
              </Text>
            </View>

            {/* Direct Contact Actions to arrange meeting */}
            <View style={styles.contactActionRow}>
              <TouchableOpacity
                style={styles.callLawyerBtn}
                onPress={() => handleCallLawyer(sig.lawyerPhone)}
                activeOpacity={0.84}
              >
                <Text style={styles.callLawyerBtnText}>
                  📞 Call Advocate: {sig.lawyerPhone}
                </Text>
              </TouchableOpacity>
              {sig.notes && (
                <Text style={styles.notesBoxText}>
                  Advocate Note: "{sig.notes}"
                </Text>
              )}
            </View>
          </View>
        )}

        {/* CASE DESCRIPTION CARD */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Case Description & Facts</Text>
          <Text style={styles.descriptionText}>{caseData.description}</Text>
        </View>

        {/* EVIDENCE DOCUMENTS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Evidence & Supporting Files</Text>
          {caseData.evidence && caseData.evidence.length > 0 ? (
            <View style={styles.evidenceList}>
              {caseData.evidence.map((ev, index) => (
                <View key={ev.id || index} style={styles.evidenceItem}>
                  <View>
                    <Text style={styles.evidenceName}>{ev.name}</Text>
                    <Text style={styles.evidenceMeta}>
                      {ev.type} · {ev.size}
                    </Text>
                  </View>
                  <View style={styles.evidenceBadge}>
                    <Text style={styles.evidenceBadgeText}>Verified</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ color: 'rgba(255, 220, 180, 0.5)', fontSize: 12 }}>
              No evidence files attached.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}
