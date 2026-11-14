import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import styles from './CaseForm.styles';
import { useMockStore, addCase } from './MockStore';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const sindhCities = {
  Karachi: ['Karachi Central', 'Karachi East', 'Karachi South', 'Karachi West', 'Malir', 'Korangi', 'Keamari'],
  Hyderabad: ['Hyderabad City', 'Latifabad', 'Qasimabad', 'Tando Jam'],
  Sukkur: ['Sukkur City', 'Rohri', 'Pano Aqil', 'Salehpat'],
  Larkana: ['Larkana City', 'Ratodero', 'Dokri', 'Bakrani'],
  'Mirpur Khas': ['Mirpur Khas City', 'Digri', 'Kot Ghulam Muhammad', 'Jhuddo'],
  'Shaheed Benazirabad': ['Nawabshah', 'Daur', 'Sakrand', 'Qazi Ahmed'],
  'Thatta & Sujawal': ['Thatta', 'Makli', 'Mirpur Sakro', 'Sujawal', 'Jati'],
  Badin: ['Badin City', 'Matli', 'Talhar', 'Tando Bago', 'Golarchi'],
};

export default function CaseForm() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseType = params.caseType || 'property';
  
  const navItems = [
    { id: 'home',     label: 'Home'    },
    { id: 'cases',    label: 'Cases'   },
    { id: 'lawyers',  label: 'Lawyers' },
    { id: 'profile',  label: 'Profile' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [selectedCity, setSelectedCity] = useState('Karachi');
  const [selectedDistrict, setSelectedDistrict] = useState('Karachi Central');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const [evidenceList, setEvidenceList] = useState([]);
  const [pickingLoading, setPickingLoading] = useState(false);

  // Hardware back returns to CitizenHome
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  useEffect(() => {
    if (params.newFileName && params.newFileType) {
      const newFile = {
        id: 'file-' + Date.now(),
        type: params.newFileType,
        name: params.newFileName,
        size: params.newFileSize || 'Attached File',
        uri: params.newFileUri || '',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      };
      setEvidenceList(prev => [...prev, newFile]);
    }
  }, [params.newFileName, params.newFileType, params.newFileSize, params.newFileUri]);

  const handleNav = (id) => {
    if (id === 'home')    router.push('/(citizen)/CitizenHome');
    if (id === 'cases')   router.push('/(citizen)/MyCases');
    if (id === 'lawyers') router.push('/(citizen)/FindLawyer');
    if (id === 'profile') router.push('/(citizen)/Profile');
  };

  const getCaseTypeName = () => {
    switch (caseType) {
      case 'property': return 'Property & Land Dispute';
      case 'family': return 'Family & Custody Case';
      case 'inheritance': return 'Inheritance & Succession';
      case 'civil': return 'Civil & Contract Dispute';
      case 'criminal': return 'Criminal / FIR Matter';
      default: return 'Legal Case';
    }
  };

  // 1. Pick Document/PDF directly from Phone
  const handlePickDocument = async () => {
    try {
      setPickingLoading(true);
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

        setEvidenceList(prev => [...prev, newDoc]);
        Alert.alert('File Added', `Successfully attached "${newDoc.name}" to your case evidence.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick document: ' + (err.message || 'Please try again'));
    } finally {
      setPickingLoading(false);
    }
  };

  // 2. Pick Photo from Phone Gallery
  const handlePickImage = async () => {
    try {
      setPickingLoading(true);
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
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        };

        setEvidenceList(prev => [...prev, newPhoto]);
        Alert.alert('Photo Added', `Successfully attached "${newPhoto.name}" to your case evidence.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick photo: ' + (err.message || 'Please try again'));
    } finally {
      setPickingLoading(false);
    }
  };

  // 3. Capture Photo with Camera
  const handleCaptureCamera = async () => {
    try {
      setPickingLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to photograph evidence.');
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
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        };

        setEvidenceList(prev => [...prev, newPhoto]);
        Alert.alert('Photo Captured', 'Evidence photo captured and attached.');
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to open camera: ' + (err.message || 'Please try again'));
    } finally {
      setPickingLoading(false);
    }
  };

  const todayDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Required', 'Please enter a clear Case Title.');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Required', 'Please provide a detailed description of the incident / dispute.');
      return;
    }
    if (!selectedCity || !selectedDistrict) {
      Alert.alert('Required', 'Please select both your Sindh City and District.');
      return;
    }
    
    addCase({
      title: formData.title.trim(),
      type: getCaseTypeName(),
      description: formData.description.trim(),
      district: `${selectedCity} - ${selectedDistrict}`,
      evidence: evidenceList,
    });

    Alert.alert(
      'Case Created Successfully! ⚡',
      'Your case has been securely registered in your Vault. Verified Sindh advocates can now review your files.',
      [
        {
          text: 'View My Cases',
          onPress: () => router.push('/(citizen)/MyCases'),
        },
      ]
    );
  };

  const handleDeleteEvidence = (id) => {
    Alert.alert(
      'Remove Evidence',
      'Are you sure you want to remove this evidence file?',
      [
        { text: 'Yes, Remove', onPress: () => setEvidenceList(evidenceList.filter(item => item.id !== id)) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      {/* Modern '< Build Your Case' Header */}
      <AppHeader
        title="Build Your Case"
        showBack={true}
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.caseTypeBanner}>
          <Text style={styles.caseTypeName}>{getCaseTypeName()}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Case Title *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter case title"
            placeholderTextColor="#999"
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Description *</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Describe your case in detail. Include all relevant information."
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
          />
        </View>

        {/* Sindh City Dropdown */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Sindh City *</Text>
          <TouchableOpacity 
            style={styles.dropdownSelector}
            onPress={() => {
              setShowCityDropdown(!showCityDropdown);
              setShowDistrictDropdown(false);
            }}
          >
            <Text style={styles.dropdownValue}>
              {selectedCity || 'Select Sindh City'}
            </Text>
          </TouchableOpacity>
          
          {showCityDropdown && (
            <View style={styles.dropdownList}>
              {Object.keys(sindhCities).map(city => (
                <TouchableOpacity 
                  key={city} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCity(city);
                    setSelectedDistrict('');
                    setShowCityDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* District Dropdown */}
        {selectedCity !== '' && (
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>District *</Text>
            <TouchableOpacity 
              style={styles.dropdownSelector}
              onPress={() => {
                setShowDistrictDropdown(!showDistrictDropdown);
                setShowCityDropdown(false);
              }}
            >
              <Text style={styles.dropdownValue}>
                {selectedDistrict || 'Select District'}
              </Text>
            </TouchableOpacity>
            
            {showDistrictDropdown && (
              <View style={styles.dropdownList}>
                {sindhCities[selectedCity].map(dist => (
                  <TouchableOpacity 
                    key={dist} 
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedDistrict(dist);
                      setShowDistrictDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{dist}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Uneditable Actual Date */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Filing Date</Text>
          <View style={styles.uneditableField}>
            <Text style={styles.uneditableFieldText}>{todayDate}</Text>
          </View>
        </View>

        {/* Evidence Section */}
        <View style={styles.evidenceSection}>
          <View style={styles.evidenceHeader}>
            <View>
              <Text style={styles.evidenceTitle}>Secure Evidence Collection</Text>
              <Text style={styles.evidenceHint}>
                Attach documents or photos directly from your phone.
              </Text>
            </View>
          </View>

          {/* Direct Phone Attachment Buttons */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: '#5C1A1A',
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handlePickDocument}
              disabled={pickingLoading}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                📄 Phone File (PDF)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: '#0F2744',
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handlePickImage}
              disabled={pickingLoading}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                🖼️ Gallery Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: '#1B4332',
                paddingVertical: 10,
                paddingHorizontal: 8,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleCaptureCamera}
              disabled={pickingLoading}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                📸 Snap Camera
              </Text>
            </TouchableOpacity>
          </View>

          {pickingLoading && (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <ActivityIndicator color="#FF9500" />
              <Text style={{ fontSize: 11, color: 'rgba(255, 220, 180, 0.6)', marginTop: 4 }}>Accessing phone file system...</Text>
            </View>
          )}

          {evidenceList.length === 0 && !pickingLoading && (
            <View style={{ paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(25, 12, 5, 0.65)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 149, 0, 0.25)', borderStyle: 'dashed' }}>
              <Text style={{ fontSize: 12, color: 'rgba(255, 220, 180, 0.55)', fontWeight: '500' }}>
                No evidence attached yet. Tap a button above to add files.
              </Text>
            </View>
          )}

          {evidenceList.map((item, index) => (
            <View key={item.id || index} style={styles.evidenceItem}>
              <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: 'rgba(255, 149, 0, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 160, 40, 0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ fontSize: 16 }}>{item.type === 'Photo' ? '🖼️' : '📄'}</Text>
              </View>
              <View style={styles.evidenceInfo}>
                <Text style={styles.evidenceName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.evidenceMeta}>
                  {item.type} • {item.size || 'Attached'} {item.date ? `• ${item.date}` : ''}
                </Text>
              </View>
              <View style={styles.evidenceActions}>
                <TouchableOpacity onPress={() => handleDeleteEvidence(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Liquid Glass Submit Button */}
        <View style={{ marginVertical: 18 }}>
          <LiquidGlassButton
            title="SUBMIT CASE FOR VERIFICATION"
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}