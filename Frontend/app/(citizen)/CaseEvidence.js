import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import styles from './CaseEvidence.styles';
import { useMockStore, activeCases, addEvidenceToCase, removeEvidenceFromCase } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function CaseEvidence() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = params.caseId;

  const caseData = activeCases.find(c => c.id === caseId);
  const [loading, setLoading] = useState(false);

  // Hardware back returns to cases tab
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/MyCases' });

  const handlePickDocument = async () => {
    if (!caseData) return;
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const formattedSize = file.size
          ? (file.size > 1048576
              ? (file.size / 1048576).toFixed(1) + ' MB'
              : Math.round(file.size / 1024) + ' KB')
          : 'File';
        const isPdf = file.mimeType?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf');

        const newDoc = {
          id: 'doc-' + Date.now(),
          name: file.name || 'Document.pdf',
          type: isPdf ? 'PDF' : 'Document',
          size: formattedSize,
          uri: file.uri,
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        };

        addEvidenceToCase(caseData.id, newDoc);
        Alert.alert('Evidence Added', `"${newDoc.name}" has been uploaded to case vault.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick file: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (!caseData) return;
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery access is needed to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'Evidence_Photo_' + Date.now() + '.jpg';
        const newDoc = {
          id: 'img-' + Date.now(),
          name: fileName,
          type: 'IMAGE',
          size: 'Photo Asset',
          uri: asset.uri,
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        };

        addEvidenceToCase(caseData.id, newDoc);
        Alert.alert('Photo Uploaded', `Photo "${fileName}" added to evidence vault.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick photo: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (evidenceItem) => {
    Alert.alert(
      'Remove File',
      `Are you sure you want to remove "${evidenceItem.name || evidenceItem}" from this case?`,
      [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const evId = evidenceItem.id || evidenceItem;
            removeEvidenceFromCase(caseData.id, evId);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (!caseData) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
        <AppHeader title="Evidence Vault" showBack={true} homeRoute="/(citizen)/MyCases" role="citizen" />
        <View style={styles.content}>
          <Text style={styles.emptyText}>Case record not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const evidenceList = Array.isArray(caseData.evidence) ? caseData.evidence : [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Evidence Vault' Header */}
      <AppHeader
        title="Evidence Vault"
        showBack={true}
        homeRoute="/(citizen)/MyCases"
        role="citizen"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Secure Case Documents</Text>
        <Text style={styles.caseName}>Matter: {caseData.title}</Text>
        <Text style={styles.info}>
          These are verified documents and media uploaded for your advocate consultation. All records are protected under client-attorney privilege.
        </Text>

        {/* Quick Upload Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 149, 0, 0.15)',
              borderWidth: 1,
              borderColor: '#FF9500',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickDocument}
            activeOpacity={0.75}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FF9500" size="small" />
            ) : (
              <Text style={{ color: '#FFEED6', fontSize: 12, fontWeight: '800' }}>📄 UPLOAD DOC</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255, 200, 120, 0.25)',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickImage}
            activeOpacity={0.75}
            disabled={loading}
          >
            <Text style={{ color: '#FFE5C4', fontSize: 12, fontWeight: '800' }}>📷 ADD PHOTO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.evidenceContainer}>
          {evidenceList.length === 0 ? (
            <Text style={styles.emptyText}>No documents uploaded yet. Tap "Upload Doc" or "Add Photo" above.</Text>
          ) : (
            evidenceList.map((item, index) => {
              const name = typeof item === 'object' ? item.name : item;
              const type = typeof item === 'object' ? item.type : 'DOC';
              const size = typeof item === 'object' ? item.size : '';
              const date = typeof item === 'object' ? item.date : '';

              return (
                <View key={index} style={styles.evidenceCard}>
                  <View style={styles.bulletBox} />
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.evidenceText} numberOfLines={1}>{name}</Text>
                    {(size || date) ? (
                      <Text style={{ fontSize: 11, color: 'rgba(255, 220, 180, 0.5)', marginTop: 2 }}>
                        {type} • {size} {date ? `• ${date}` : ''}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDeleteItem(item)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '700' }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}
