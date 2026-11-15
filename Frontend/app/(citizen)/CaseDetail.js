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
    </SafeAreaView>
  );
}
