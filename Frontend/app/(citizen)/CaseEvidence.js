import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import styles from './CaseEvidence.styles';
import { useMockStore, activeCases, addEvidenceToCase, removeEvidenceFromCase } from './MockStore';

export default function CaseEvidence() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = params.caseId;

  const caseData = activeCases.find(c => c.id === caseId);
  const [loading, setLoading] = useState(false);

  const handleNav = (id) => {
    if (id === 'home')    router.push('/(citizen)/CitizenHome');
    if (id === 'cases')   router.push('/(citizen)/MyCases');
    if (id === 'lawyers') router.push('/(citizen)/FindLawyer');
    if (id === 'profile') router.push('/(citizen)/Profile');
  };

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
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        };

        addEvidenceToCase(caseData.id, newPhoto);
        Alert.alert('Photo Added', `"${newPhoto.name}" has been attached to case.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick photo: ' + (err.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (index, fileName) => {
    Alert.alert(
      'Remove Evidence',
      `Are you sure you want to delete "${fileName}" from this case?`,
      [
        { text: 'Yes, Delete', onPress: () => removeEvidenceFromCase(caseData.id, index) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (!caseData) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#5C1A1A" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Case not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const evidenceList = Array.isArray(caseData.evidence) ? caseData.evidence : [];

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
          <Text style={styles.headerTitle}>Case Evidence Vault</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Secure Evidence Vault</Text>
        <Text style={styles.caseName}>Case: {caseData.title}</Text>
        <Text style={styles.info}>
          These are verified documents and media uploaded for your advocate consultation. All files are encrypted.
        </Text>

        {/* Quick Upload Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: '#5C1A1A',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickDocument}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              📄 + Add File (PDF)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              flex: 1,
              backgroundColor: '#0F2744',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handlePickImage}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              🖼️ + Add Photo
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ padding: 12, alignItems: 'center' }}>
            <ActivityIndicator color="#5C1A1A" />
            <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Accessing device storage...</Text>
          </View>
        )}

        <View style={styles.evidenceContainer}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: 10 }}>
            Uploaded Files ({evidenceList.length})
          </Text>

          {evidenceList.length > 0 ? (
            evidenceList.map((item, index) => {
              const name = typeof item === 'string' ? item : item.name;
              const type = typeof item === 'object' && item.type ? item.type : (name && name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Document');
              const size = typeof item === 'object' && item.size ? item.size : null;

              return (
                <View key={index} style={[styles.evidenceCard, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: type === 'Photo' ? '#e0f2fe' : '#fef3c7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      <Text style={{ fontSize: 14 }}>{type === 'Photo' ? '🖼️' : '📄'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.evidenceText} numberOfLines={1}>{name}</Text>
                      {size && (
                        <Text style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{type} • {size}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDeleteItem(index, name)}
                    style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#fee2e2', borderRadius: 4 }}
                  >
                    <Text style={{ color: '#ef4444', fontSize: 10, fontWeight: '700' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No evidence files added to this case yet. Use the buttons above to upload from your phone.</Text>
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