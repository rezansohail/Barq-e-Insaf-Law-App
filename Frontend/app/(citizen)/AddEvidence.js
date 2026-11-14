import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import styles from './AddEvidence.styles';
import {
  useMockStore,
  evidenceVault,
  addToVault,
  fetchCitizenVault,
  activeCases,
  userData,
} from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function AddEvidence() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseType = params.caseType || 'property';
  const caseId = params.caseId;
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData.id) {
      fetchCitizenVault(userData.id);
    }
  }, [userData.id]);

  // 1. Pick Document from Phone
  const handleBrowseFiles = async () => {
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
          category: 'Official Document',
          fileType: isPdf ? 'PDF' : 'Document',
          type: isPdf ? 'PDF' : 'Document',
          fileSize: formattedSize,
          size: formattedSize,
          fileUri: file.uri,
          uri: file.uri,
          caseId: caseId ? Number(caseId) : null,
        };

        await addToVault(newDoc);
        router.back();
      }
    } catch (err) {
      const msg = 'Unable to pick document: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Pick Photo from Phone Gallery
  const handlePickFromGallery = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'Photo_Evidence_' + Date.now().toString().slice(-4) + '.jpg';
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
        router.back();
      }
    } catch (err) {
      const msg = 'Unable to pick photo: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Snap Photo with Device Camera
  const handleSnapCamera = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'Camera permission is required to capture evidence photos.';
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
        router.back();
      }
    } catch (err) {
      const msg = 'Unable to take photo: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (file) => {
    router.replace({
      pathname: '/(citizen)/CaseForm',
      params: {
        caseType,
        newFileName: file.title || file.name,
        newFileType: file.fileType || file.type || 'Document',
        newFileSize: file.fileSize || file.size || 'Saved File',
        newFileUri: file.fileUri || file.uri || '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#080402" />

      {/* Header */}
      <AppHeader 
        title="Add Case Evidence" 
        showBack={true} 
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: 110 }]}>
        <Text style={styles.title}>Attach Case Documentation</Text>
        <Text style={styles.info}>
          Upload documents or photos from your device storage or camera. All records are backed by encrypted vault storage.
        </Text>

        {/* 3 Real Device Pick Options */}
        <View style={{ gap: 10, marginVertical: 14 }}>
          <TouchableOpacity 
            style={[styles.uploadBox, { backgroundColor: 'rgba(32, 16, 7, 0.94)', borderColor: 'rgba(255, 160, 40, 0.35)' }]} 
            onPress={handleBrowseFiles}
            disabled={loading}
          >
            <View style={[styles.uploadIcon, { backgroundColor: 'rgba(255, 140, 0, 0.2)' }]}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFB74D' }}>DOC</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadTitle}>Upload Document (PDF / DOC)</Text>
              <Text style={styles.uploadDesc}>Browse PDFs, contracts, registry deeds on your phone</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.uploadBox, { backgroundColor: 'rgba(32, 16, 7, 0.94)', borderColor: 'rgba(255, 160, 40, 0.35)' }]} 
            onPress={handlePickFromGallery}
            disabled={loading}
          >
            <View style={[styles.uploadIcon, { backgroundColor: 'rgba(255, 140, 0, 0.2)' }]}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFB74D' }}>IMG</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadTitle}>Pick Photo from Gallery</Text>
              <Text style={styles.uploadDesc}>Select receipts, CNIC copies, screenshots or photos</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.uploadBox, { backgroundColor: 'rgba(32, 16, 7, 0.94)', borderColor: 'rgba(255, 160, 40, 0.35)' }]} 
            onPress={handleSnapCamera}
            disabled={loading}
          >
            <View style={[styles.uploadIcon, { backgroundColor: 'rgba(255, 140, 0, 0.2)' }]}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFB74D' }}>CAM</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadTitle}>Snap Photo with Camera</Text>
              <Text style={styles.uploadDesc}>Take a live photo of physical documents or notices</Text>
            </View>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ paddingVertical: 14, alignItems: 'center' }}>
            <ActivityIndicator color="#FF9500" />
            <Text style={{ fontSize: 12, color: 'rgba(255, 220, 180, 0.7)', marginTop: 4 }}>Opening device storage...</Text>
          </View>
        )}

        {/* Existing Vault Files to Choose from */}
        <View style={styles.filesCard}>
          <Text style={styles.filesTitle}>Or Select from Existing Vault</Text>

          {evidenceVault && evidenceVault.length > 0 ? (
            evidenceVault.map((file) => {
              const fileName = file.title || file.name || 'Evidence File';
              const fileSize = file.fileSize || file.size || 'Saved';
              const fileType = file.fileType || file.type || 'Document';

              return (
                <TouchableOpacity 
                  key={file.id} 
                  style={styles.fileRow}
                  onPress={() => handleSelectFile(file)}
                >
                  <View style={styles.fileIconBox}>
                    <Text style={[styles.fileIconText, { fontSize: 11, fontWeight: '800' }]}>{fileType === 'Photo' ? 'IMG' : 'DOC'}</Text>
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                    <Text style={styles.fileSize}>{fileType} • {fileSize}</Text>
                  </View>
                  <View style={{ backgroundColor: '#FF7A00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Attach</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ padding: 14, color: 'rgba(255, 220, 180, 0.55)', fontSize: 12, textAlign: 'center' }}>
              No documents currently in your vault. Use the buttons above to browse or snap files.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Shared bottom navigation */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}
