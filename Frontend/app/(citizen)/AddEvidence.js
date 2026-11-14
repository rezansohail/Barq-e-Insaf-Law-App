import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import styles from './AddEvidence.styles';
import { addEvidenceToCase, activeCases } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function AddEvidence() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseType = params.caseType || 'property';
  const caseId = params.caseId;

  const [loading, setLoading] = useState(false);
  const [vaultFiles, setVaultFiles] = useState([
    { id: '1', name: 'Identity_Proof.pdf', type: 'PDF', size: '1.2 MB', uri: '' },
    { id: '2', name: 'Utility_Bill_Latest.pdf', type: 'PDF', size: '820 KB', uri: '' },
    { id: '3', name: 'Property_Sale_Deed_Scanned.pdf', type: 'PDF', size: '3.4 MB', uri: '' },
  ]);

  // Hardware back returns to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

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
          id: 'doc-' + Date.now(),
          name: file.name || 'Document.pdf',
          type: isPdf ? 'PDF' : 'Document',
          size: formattedSize,
          uri: file.uri,
        };

        setVaultFiles(prev => [newDoc, ...prev]);
        handleSelectFile(newDoc);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick document: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  // 2. Pick Photo from Gallery
  const handlePickFromGallery = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow gallery access to upload evidence photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'Photo_' + Date.now() + '.jpg';
        const newImg = {
          id: 'img-' + Date.now(),
          name: fileName,
          type: 'IMAGE',
          size: 'Photo Asset',
          uri: asset.uri,
        };

        setVaultFiles(prev => [newImg, ...prev]);
        handleSelectFile(newImg);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick image: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  // 3. Take Live Camera Photo
  const handleTakePhoto = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to take document photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = 'Camera_Capture_' + Date.now() + '.jpg';
        const newImg = {
          id: 'cam-' + Date.now(),
          name: fileName,
          type: 'IMAGE',
          size: 'Camera Photo',
          uri: asset.uri,
        };

        setVaultFiles(prev => [newImg, ...prev]);
        handleSelectFile(newImg);
      }
    } catch (err) {
      Alert.alert('Error', 'Camera capture failed: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (file) => {
    if (caseId) {
      addEvidenceToCase(caseId, {
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        uri: file.uri,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      });
      Alert.alert('Attached', `"${file.name}" has been linked to your case.`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }

    router.push({
      pathname: '/(citizen)/CaseForm',
      params: { 
        caseType, 
        newFileName: file.name, 
        newFileType: file.type,
        newFileSize: file.size,
        newFileUri: file.uri,
      }
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Add Evidence' Header */}
      <AppHeader
        title="Add Evidence"
        showBack={true}
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Upload Evidence Files</Text>
        <Text style={styles.subtitle}>Select photos, scanned documents, or PDFs from your device.</Text>

        {/* Action Cards Grid */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 149, 0, 0.15)',
              borderWidth: 1,
              borderColor: '#FF9500',
              padding: 14,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleBrowseFiles}
            activeOpacity={0.75}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FF9500" />
            ) : (
              <>
                <Text style={{ fontSize: 20, marginBottom: 4 }}>📄</Text>
                <Text style={{ color: '#FFEED6', fontSize: 12, fontWeight: '800' }}>Pick Document</Text>
                <Text style={{ color: 'rgba(255, 220, 180, 0.5)', fontSize: 10, marginTop: 2 }}>PDF / Word</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255, 200, 120, 0.25)',
              padding: 14,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickFromGallery}
            activeOpacity={0.75}
            disabled={loading}
          >
            <Text style={{ fontSize: 20, marginBottom: 4 }}>🖼️</Text>
            <Text style={{ color: '#FFE5C4', fontSize: 12, fontWeight: '800' }}>Gallery Photo</Text>
            <Text style={{ color: 'rgba(255, 220, 180, 0.5)', fontSize: 10, marginTop: 2 }}>Images / JPEG</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: 'rgba(25, 12, 5, 0.75)',
              borderWidth: 1,
              borderColor: 'rgba(255, 160, 40, 0.3)',
              padding: 14,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleTakePhoto}
            activeOpacity={0.75}
            disabled={loading}
          >
            <Text style={{ fontSize: 20, marginBottom: 4 }}>📷</Text>
            <Text style={{ color: '#FFB74D', fontSize: 12, fontWeight: '800' }}>Camera Scan</Text>
            <Text style={{ color: 'rgba(255, 220, 180, 0.5)', fontSize: 10, marginTop: 2 }}>Instant Snap</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Vault Records */}
        <View style={styles.explorerBox}>
          <Text style={styles.explorerHeader}>Device Vault Documents</Text>
          {vaultFiles.map((file) => (
            <TouchableOpacity 
              key={file.id} 
              style={styles.fileRow}
              onPress={() => handleSelectFile(file)}
              activeOpacity={0.75}
            >
              <View style={styles.fileIconBox}>
                <Text style={styles.fileIconText}>{file.type}</Text>
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileSize}>{file.size}</Text>
              </View>
              <Text style={styles.importText}>Attach &gt;</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}
