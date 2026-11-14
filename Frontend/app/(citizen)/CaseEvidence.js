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

export default function CaseEvidence() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = params.caseId;

  const caseData = caseId ? activeCases.find((c) => String(c.id) === String(caseId)) : null;
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
        const msg = `"${newDoc.title}" has been securely saved to your on-device sandbox vault.`;
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Evidence Added', msg);
      }
    } catch (err) {
      const msg = 'Unable to pick file: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Pick Photo from Gallery
  const handlePickImage = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'Gallery access is needed to upload photos.';
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
      const msg = 'Unable to open camera: ' + (err.message || 'Please try again');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (item) => {
    const doDelete = async () => {
      try {
        setLoading(true);
        await deleteFromVault(item.id);
        const msg = 'Evidence removed from vault.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Removed', msg);
      } catch (err) {
        const msg = 'Could not delete item: ' + err.message;
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      } finally {
        setLoading(false);
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
          <Text style={styles.headerTitle}>
            {caseData ? 'Case Evidence Vault' : 'Citizen Evidence Vault'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
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
              backgroundColor: '#5C1A1A',
              paddingVertical: 12,
              paddingHorizontal: 6,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickDocument}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
              📄 + File (PDF)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#0F2744',
              paddingVertical: 12,
              paddingHorizontal: 6,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickImage}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
              🖼️ + Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#1B4332',
              paddingVertical: 12,
              paddingHorizontal: 6,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleCaptureCamera}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
              📸 + Snap
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ padding: 12, alignItems: 'center' }}>
            <ActivityIndicator color="#5C1A1A" />
            <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Processing sandbox storage...</Text>
          </View>
        )}

        <View style={styles.evidenceContainer}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: 10 }}>
            Stored Evidence Files ({evidenceList.length})
          </Text>

          {evidenceList.length > 0 ? (
            evidenceList.map((item, index) => {
              const name = item.title || item.name || 'Evidence File';
              const type = item.fileType || item.type || (name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Document');
              const size = item.fileSize || item.size || 'Saved';
              const isShared = item.isSharedWithLawyer;

              return (
                <View key={item.id || index} style={[styles.evidenceCard, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        backgroundColor: type === 'Photo' ? '#e0f2fe' : '#fef3c7',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{type === 'Photo' ? '🖼️' : '📄'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.evidenceText} numberOfLines={1}>{name}</Text>
                      <Text style={{ fontSize: 10, color: '#888', marginTop: 1 }}>
                        {type} • {size} {isShared ? '• 🔒 Shared with Lawyer' : '• 🛡️ Private'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item)}
                    style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#fee2e2', borderRadius: 4 }}
                  >
                    <Text style={{ color: '#ef4444', fontSize: 10, fontWeight: '700' }}>Delete</Text>
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
