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

export default function AddEvidence() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseType = params.caseType || 'property';
  const caseId = params.caseId;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData.id) {
      fetchCitizenVault(userData.id);
    }
  }, [userData.id]);

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

        const saved = await addToVault(newDoc);
        handleSelectFile({
          ...newDoc,
          id: saved?.evidence?.id || newDoc.title,
        });
      }
    } catch (err) {
      const msg = 'Unable to pick document: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
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
        const msg = 'Please allow gallery access to upload evidence photos.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Permission Required', msg);
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
          title: rawName,
          name: rawName,
          category: 'Photo Evidence',
          fileType: 'Photo',
          type: 'Photo',
          fileSize: formattedSize,
          size: formattedSize,
          fileUri: asset.uri,
          uri: asset.uri,
          caseId: caseId ? Number(caseId) : null,
        };

        const saved = await addToVault(newPhoto);
        handleSelectFile({
          ...newPhoto,
          id: saved?.evidence?.id || newPhoto.title,
        });
      }
    } catch (err) {
      const msg = 'Unable to pick photo: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
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

        const saved = await addToVault(newPhoto);
        handleSelectFile({
          ...newPhoto,
          id: saved?.evidence?.id || newPhoto.title,
        });
      }
    } catch (err) {
      const msg = 'Unable to open camera: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (file) => {
    const fileName = file.title || file.name;
    if (caseId) {
      const msg = `"${fileName}" has been linked to your case vault.`;
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Evidence Attached', msg, [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }

    router.push({
      pathname: '/(citizen)/CaseForm',
      params: { 
        caseType, 
        newFileName: fileName, 
        newFileType: file.fileType || file.type || 'Document',
        newFileSize: file.fileSize || file.size || 'Saved',
        newFileUri: file.fileUri || file.uri || '',
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
        <Text style={styles.subtitle}>Select photos, scanned documents, or PDFs to store in your private sandbox directory.</Text>

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
            <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Saving to vault...</Text>
          </View>
        )}

        <View style={styles.explorerBox}>
          <Text style={styles.explorerHeader}>Available Vault Files ({evidenceVault.length})</Text>
          
          {evidenceVault.length > 0 ? (
            evidenceVault.map((file) => {
              const fileName = file.title || file.name || 'Evidence File';
              const fileType = file.fileType || file.type || 'Document';
              const fileSize = file.fileSize || file.size || 'Saved';

              return (
                <TouchableOpacity 
                  key={file.id} 
                  style={styles.fileRow}
                  onPress={() => handleSelectFile(file)}
                >
                  <View style={styles.fileIconBox}>
                    <Text style={styles.fileIconText}>{fileType === 'Photo' ? '🖼️' : '📄'}</Text>
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                    <Text style={styles.fileSize}>{fileType} • {fileSize}</Text>
                  </View>
                  <View style={{ backgroundColor: '#5C1A1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Attach</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ padding: 14, color: '#888', fontSize: 12, textAlign: 'center' }}>
              No documents currently in your vault. Use the buttons above to browse or snap files.
            </Text>
          )}
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
