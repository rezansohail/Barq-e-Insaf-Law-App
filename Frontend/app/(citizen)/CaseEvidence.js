import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import styles from './CaseEvidence.styles';
import {
  useMockStore,
  activeCases,
  evidenceVault,
  addToVault,
  deleteFromVault,
  fetchCitizenVault,
  userData,
} from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function CaseEvidence() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = params.caseId;
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const caseData = caseId ? activeCases.find((c) => String(c.id) === String(caseId)) : null;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData.id) {
      fetchCitizenVault(userData.id);
    }
  }, [userData.id]);

  // 1. Pick Document (PDF / DOC) from Phone
  const handlePickDocument = async () => {
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
          title: file.name || 'Document.pdf',
          name: file.name || 'Document.pdf',
          category: isPdf ? 'Legal Document (PDF)' : 'Official Evidence',
          fileType: isPdf ? 'PDF' : 'Document',
          type: isPdf ? 'PDF' : 'Document',
          fileSize: formattedSize,
          size: formattedSize,
          fileUri: file.uri,
          uri: file.uri,
          caseId: caseId ? Number(caseId) : null,
        };

        await addToVault(newDoc);
        const msg = `"${newDoc.title}" has been saved to your secure vault.`;
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Evidence Saved', msg);
      }
    } catch (err) {
      const msg = 'Unable to pick document: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Pick Photo from Gallery
  const handlePickPhoto = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'Evidence_Photo_' + Date.now().toString().slice(-4) + '.jpg';
        const newPhoto = {
          title: fileName,
          name: fileName,
          category: 'Photo Evidence',
          fileType: 'Photo',
          type: 'Photo',
          fileSize: asset.fileSize ? Math.round(asset.fileSize / 1024) + ' KB' : 'Photo',
          size: asset.fileSize ? Math.round(asset.fileSize / 1024) + ' KB' : 'Photo',
          fileUri: asset.uri,
          uri: asset.uri,
          caseId: caseId ? Number(caseId) : null,
        };

        await addToVault(newPhoto);
        const msg = `"${newPhoto.title}" has been saved to your secure vault.`;
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Photo Added', msg);
      }
    } catch (err) {
      const msg = 'Unable to pick photo: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Snap Camera Photo
  const handleCaptureCamera = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'Camera permission is required to capture evidence.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Permission Required', msg);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const rawName = 'Camera_Evidence_' + Date.now().toString().slice(-4) + '.jpg';
        const newPhoto = {
          title: rawName,
          name: rawName,
          category: 'Photo Evidence',
          fileType: 'Photo',
          type: 'Photo',
          fileSize: 'Camera Photo',
          size: 'Camera Photo',
          fileUri: asset.uri,
          uri: asset.uri,
          caseId: caseId ? Number(caseId) : null,
        };

        await addToVault(newPhoto);
        const msg = `Photo captured and safely stored in your vault.`;
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Photo Saved', msg);
      }
    } catch (err) {
      const msg = 'Unable to take photo: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete Vault Item
  const handleDeleteItem = async (item) => {
    const doDelete = async () => {
      try {
        await deleteFromVault(item.id);
        const msg = `"${item.title || item.name}" removed from vault.`;
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Removed', msg);
      } catch (e) {
        const msg = e.response?.data?.message || 'Could not delete item.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${item.title || item.name}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Remove Evidence',
        `Are you sure you want to delete "${item.title || item.name}" from your vault?`,
        [
          { text: 'Yes, Delete', style: 'destructive', onPress: doDelete },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // Filter evidence items if case-specific view
  const evidenceList = caseId
    ? evidenceVault.filter((v) => String(v.caseId) === String(caseId))
    : evidenceVault;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#080402" />

      {/* Header */}
      <AppHeader 
        title={caseData ? 'Case Evidence Vault' : 'Secure Evidence Vault'} 
        showBack={true} 
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: 110 }]}>
        <Text style={styles.title}>Secure Evidence Vault</Text>
        {caseData ? (
          <Text style={styles.caseName}>Case: {caseData.title}</Text>
        ) : (
          <Text style={styles.caseName}>Personal Private Repository</Text>
        )}
        <Text style={styles.info}>
          All documents and media are isolated in your on-device sandbox directory (vault/) with zero-knowledge privacy. No platform administrators can access your unshared files.
        </Text>

        {/* Quick Upload Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#FF7A00',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickDocument}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
              Add Document
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 140, 0, 0.25)',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 160, 40, 0.4)',
            }}
            onPress={handlePickPhoto}
            disabled={loading}
          >
            <Text style={{ color: '#FFB74D', fontSize: 11, fontWeight: '800' }}>
              Pick Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 140, 0, 0.25)',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 160, 40, 0.4)',
            }}
            onPress={handleCaptureCamera}
            disabled={loading}
          >
            <Text style={{ color: '#FFB74D', fontSize: 11, fontWeight: '800' }}>
              Snap Camera
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator color="#FF9500" />
            <Text style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Accessing device storage...</Text>
          </View>
        )}

        {/* Existing Vault Items List */}
        <View style={styles.vaultCard}>
          <Text style={styles.vaultTitle}>
            Saved Vault Files ({evidenceList.length})
          </Text>

          {evidenceList.length > 0 ? (
            evidenceList.map((item, index) => {
              const name = item.title || item.name || 'Evidence File';
              const size = item.fileSize || item.size || 'Saved';
              const type = item.fileType || item.type || 'Document';
              const isShared = item.isSharedWithLawyer || false;

              return (
                <View key={item.id || index} style={styles.evidenceRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        backgroundColor: 'rgba(255, 149, 0, 0.15)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 160, 40, 0.3)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFB74D' }}>{type === 'Photo' ? 'IMG' : 'DOC'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.evidenceText} numberOfLines={1}>{name}</Text>
                      <Text style={{ fontSize: 10, color: 'rgba(255, 220, 180, 0.65)', marginTop: 1 }}>
                        {type} • {size} {isShared ? '• Shared with Lawyer' : '• Private Vault'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item)}
                    style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  >
                    <Text style={{ color: '#f87171', fontSize: 10, fontWeight: '700' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>
              No evidence files stored in this vault yet. Use the buttons above to safely add documents, photos, or snaps from your phone.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Shared bottom navigation */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}
