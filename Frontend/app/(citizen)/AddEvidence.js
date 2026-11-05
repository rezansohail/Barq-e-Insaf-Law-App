import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import styles from './AddEvidence.styles';
import { addEvidenceToCase, activeCases } from './MockStore';

export default function AddEvidence() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseType = params.caseType || 'property';
  const caseId = params.caseId;

  const [loading, setLoading] = useState(false);
  const [vaultFiles, setVaultFiles] = useState([
    { id: '1', name: 'CNIC_Front_Back.pdf', type: 'PDF', size: '1.2 MB', uri: '' },
    { id: '2', name: 'Electricity_Bill_Latest.pdf', type: 'PDF', size: '820 KB', uri: '' },
    { id: '3', name: 'Property_Sale_Deed_Scanned.pdf', type: 'PDF', size: '3.4 MB', uri: '' },
  ]);

  const handleNav = (id) => {
    if (id === 'home')    router.push('/(citizen)/CitizenHome');
    if (id === 'cases')   router.push('/(citizen)/MyCases');
    if (id === 'lawyers') router.push('/(citizen)/FindLawyer');
    if (id === 'profile') router.push('/(citizen)/Profile');
  };

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
        const rawName = asset.fileName || asset.uri.split('/').pop() || 'Evidence_Photo.jpg';
        const formattedSize = asset.fileSize
          ? (asset.fileSize > 1048576
              ? (asset.fileSize / 1048576).toFixed(1) + ' MB'
              : Math.round(asset.fileSize / 1024) + ' KB')
          : 'Photo';

        const newPhoto = {
          id: 'img-' + Date.now(),
          name: rawName,
          type: 'Photo',
          size: formattedSize,
          uri: asset.uri,
        };

        setVaultFiles(prev => [newPhoto, ...prev]);
        handleSelectFile(newPhoto);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick photo: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  // 3. Take Photo with Camera
  const handleCaptureCamera = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to capture evidence.');
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
          id: 'cam-' + Date.now(),
          name: rawName,
          type: 'Photo',
          size: 'Camera Photo',
          uri: asset.uri,
        };

        setVaultFiles(prev => [newPhoto, ...prev]);
        handleSelectFile(newPhoto);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to open camera: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (file) => {
    if (caseId) {
      addEvidenceToCase(caseId, file);
      Alert.alert('Evidence Attached', `"${file.name}" has been added to your case evidence vault.`, [
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
      <StatusBar barStyle="light-content" backgroundColor="#5C1A1A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>BI</Text>
          </View>
          <Text style={styles.headerTitle}>Evidence Vault</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Add Evidence from Phone</Text>
        <Text style={styles.subtitle}>Select photos, scanned documents, or PDFs from your device.</Text>

        {/* Action Cards Grid */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: '#5C1A1A',
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleBrowseFiles}
            disabled={loading}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>📄</Text>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
              Browse Files (PDF)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: '#0F2744',
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickFromGallery}
            disabled={loading}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>🖼️</Text>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
              Photo Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: '#1B4332',
              padding: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleCaptureCamera}
            disabled={loading}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>📸</Text>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
              Snap Camera
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ padding: 16, alignItems: 'center', marginBottom: 12 }}>
            <ActivityIndicator color="#5C1A1A" size="small" />
            <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Accessing storage...</Text>
          </View>
        )}

        <View style={styles.explorerBox}>
          <Text style={styles.explorerHeader}>Available Vault Files ({vaultFiles.length})</Text>
          
          {vaultFiles.map((file) => (
            <TouchableOpacity 
              key={file.id} 
              style={styles.fileRow}
              onPress={() => handleSelectFile(file)}
            >
              <View style={styles.fileIconBox}>
                <Text style={styles.fileIconText}>{file.type === 'Photo' ? '🖼️' : '📄'}</Text>
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileSize}>{file.type} • {file.size}</Text>
              </View>
              <View style={{ backgroundColor: '#5C1A1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Attach</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.bottomNav}>
        {['Home', 'Cases', 'Lawyers', 'Profile'].map((lbl) => (
          <TouchableOpacity
            key={lbl}
            style={styles.navItem}
            onPress={() => handleNav(lbl.toLowerCase())}
          >
            <Text style={styles.navLabel}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}