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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import styles from './CaseForm.styles';
import { useMockStore, addCase, userData } from './MockStore';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTranslation } from '../../utils/translationHelper';
import { useAppTheme } from '../../context/ThemeContext';

// Comprehensive Sindh Cities & Divisions Mapping
const SINDH_CITIES_DATA = {
  'Karachi': ['Karachi Central', 'Karachi East', 'Karachi South', 'Karachi West', 'Malir', 'Korangi', 'Keamari'],
  'Hyderabad': ['Hyderabad', 'Hyderabad City', 'Latifabad', 'Qasimabad', 'Tando Jam'],
  'Sukkur': ['Sukkur', 'Rohri', 'Pano Aqil', 'Salehpat'],
  'Larkana': ['Larkana', 'Ratodero', 'Dokri', 'Bakrani'],
  'Mirpur Khas': ['Mirpur Khas', 'Digri', 'Kot Ghulam Muhammad', 'Jhuddo'],
  'Nawabshah': ['Nawabshah', 'Shaheed Benazirabad', 'Sakrand', 'Daur', 'Qazi Ahmed'],
  'Shaheed Benazirabad': ['Shaheed Benazirabad', 'Nawabshah', 'Sakrand', 'Daur'],
  'Khairpur': ['Khairpur', 'Gambat', 'Kot Diji', 'Sobhodero', 'Kingri', 'Thari Mirwah'],
  'Ghotki': ['Ghotki', 'Mirpur Mathelo', 'Daharki', 'Ubauro', 'Khangarh'],
  'Jacobabad': ['Jacobabad', 'Thul', 'Garhi Khairo'],
  'Kashmore': ['Kashmore', 'Kandhkot', 'Tangwani'],
  'Shikarpur': ['Shikarpur', 'Garhi Yasin', 'Lakhi Ghulam Shah', 'Khanpur'],
  'Qambar Shahdadkot': ['Qambar Shahdadkot', 'Qambar', 'Shahdadkot', 'Mirokhan', 'Warah', 'Nasirabad'],
  'Dadu': ['Dadu', 'Mehar', 'Khairpur Nathan Shah', 'Johi'],
  'Jamshoro': ['Jamshoro', 'Kotri', 'Sehwan', 'Manjhand', 'Thano Bula Khan'],
  'Matiari': ['Matiari', 'Hala', 'Saeedabad'],
  'Tando Allahyar': ['Tando Allahyar', 'Chamber', 'Jhando Mari'],
  'Tando Muhammad Khan': ['Tando Muhammad Khan', 'Bulri Shah Karim', 'Tando Ghulam Hyder'],
  'Badin': ['Badin', 'Matli', 'Talhar', 'Tando Bago', 'Golarchi'],
  'Thatta': ['Thatta', 'Makli', 'Mirpur Sakro', 'Ghorabari'],
  'Sujawal': ['Sujawal', 'Jati', 'Shah Bandar', 'Mirpur Bathoro'],
  'Sanghar': ['Sanghar', 'Shahdadpur', 'Tando Adam', 'Sinjhoro', 'Khipro'],
  'Naushahro Feroze': ['Naushahro Feroze', 'Moro', 'Bhiria', 'Kandiaro', 'Mehrabpur'],
  'Umerkot': ['Umerkot', 'Kunri', 'Pithoro', 'Samaro'],
  'Tharparkar': ['Tharparkar', 'Mithi', 'Islamkot', 'Chachro', 'Nagarparkar', 'Diplo'],
};

// All 30 Official Districts of Sindh
const ALL_SINDH_DISTRICTS = [
  'Karachi Central',
  'Karachi East',
  'Karachi South',
  'Karachi West',
  'Malir',
  'Korangi',
  'Keamari',
  'Hyderabad',
  'Sukkur',
  'Larkana',
  'Mirpur Khas',
  'Shaheed Benazirabad',
  'Khairpur',
  'Ghotki',
  'Jacobabad',
  'Kashmore',
  'Shikarpur',
  'Qambar Shahdadkot',
  'Dadu',
  'Jamshoro',
  'Matiari',
  'Tando Allahyar',
  'Tando Muhammad Khan',
  'Badin',
  'Thatta',
  'Sujawal',
  'Sanghar',
  'Naushahro Feroze',
  'Umerkot',
  'Tharparkar',
];

export default function CaseForm() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useAppTheme();
  const { t, currentLang, translateDistrict } = useAppTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [selectedCity, setSelectedCity] = useState('Karachi');
  const [selectedDistrict, setSelectedDistrict] = useState(userData.district || 'Karachi Central');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const [evidenceList, setEvidenceList] = useState([]);
  const [pickingLoading, setPickingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setEvidenceList((prev) => [...prev, newFile]);
    }
  }, [params.newFileName, params.newFileType, params.newFileSize, params.newFileUri]);

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
          ? file.size > 1048576
            ? (file.size / 1048576).toFixed(1) + ' MB'
            : Math.round(file.size / 1024) + ' KB'
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

        setEvidenceList((prev) => [...prev, newDoc]);
        Alert.alert(
          t('common.success', 'Success'),
          currentLang === 'ur'
            ? `فائل "${newDoc.name}" ثبوت میں محفوظ ہو گئی ہے۔`
            : currentLang === 'sd'
            ? `فائل "${newDoc.name}" ثبوت ۾ شامل ڪئي وئي.`
            : `Successfully attached "${newDoc.name}" to your case evidence.`
        );
      }
    } catch (err) {
      Alert.alert(t('common.error', 'Error'), err.message || 'Unable to pick document');
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
        Alert.alert(
          t('common.error', 'Permission Required'),
          t('case.galleryPermission', 'Please allow gallery access to upload evidence photos.')
        );
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
          ? asset.fileSize > 1048576
            ? (asset.fileSize / 1048576).toFixed(1) + ' MB'
            : Math.round(asset.fileSize / 1024) + ' KB'
          : 'Photo';

        const newPhoto = {
          id: 'img-' + Date.now(),
          name: rawName,
          type: 'Photo',
          size: formattedSize,
          uri: asset.uri,
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        };

        setEvidenceList((prev) => [...prev, newPhoto]);
        Alert.alert(
          t('common.success', 'Success'),
          currentLang === 'ur'
            ? `تصویر "${newPhoto.name}" ثبوت میں محفوظ ہو گئی ہے۔`
            : currentLang === 'sd'
            ? `فوٽو "${newPhoto.name}" ثبوت ۾ شامل ڪيو ويو.`
            : `Successfully attached "${newPhoto.name}" to your case evidence.`
        );
      }
    } catch (err) {
      Alert.alert(t('common.error', 'Error'), err.message || 'Unable to pick photo');
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
        Alert.alert(
          t('common.error', 'Permission Required'),
          t('case.cameraPermission', 'Camera permission is needed to photograph evidence.')
        );
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

        setEvidenceList((prev) => [...prev, newPhoto]);
        Alert.alert(
          t('common.success', 'Success'),
          currentLang === 'ur'
            ? 'کیمرے سے تصویر محفوظ ہو گئی ہے۔'
            : currentLang === 'sd'
            ? 'ڪئميرا مان فوٽو محفوظ ٿي ويو.'
            : 'Evidence photo captured and attached.'
        );
      }
    } catch (err) {
      Alert.alert(t('common.error', 'Error'), err.message || 'Unable to open camera');
    } finally {
      setPickingLoading(false);
    }
  };

  const todayDate = new Date().toLocaleDateString(
    currentLang === 'ur' ? 'ur-PK' : currentLang === 'sd' ? 'sd-PK' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert(
        t('common.error', 'Required'),
        currentLang === 'ur'
          ? 'براہ کرم کیس کا عنوان درج کریں۔'
          : currentLang === 'sd'
          ? 'مهرباني ڪري ڪيس جو عنوان لکو.'
          : 'Please enter a clear Case Title.'
      );
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert(
        t('common.error', 'Required'),
        currentLang === 'ur'
          ? 'براہ کرم کیس کی مکمل تفصیلات فراہم کریں۔'
          : currentLang === 'sd'
          ? 'مهرباني ڪري ڪيس جا تفصيل لکو.'
          : 'Please provide a detailed description of the incident / dispute.'
      );
      return;
    }
    if (!selectedCity || !selectedDistrict) {
      Alert.alert(
        t('common.error', 'Required'),
        currentLang === 'ur'
          ? 'براہ کرم سندھ کا شہر اور ضلع منتخب کریں۔'
          : currentLang === 'sd'
          ? 'مهرباني ڪري سنڌ جو شهر ۽ ضلعو چونڊيو.'
          : 'Please select both your Sindh City and District.'
      );
      return;
    }

    try {
      setSubmitting(true);
      await addCase({
        title: formData.title.trim(),
        type: 'Legal Case',
        description: formData.description.trim(),
        district: `${selectedCity} - ${selectedDistrict}`,
        evidence: evidenceList,
      });

      Alert.alert(
        t('common.success', 'Case Created Successfully'),
        currentLang === 'ur'
          ? 'آپ کا کیس اور تمام ثبوت والٹ میں محفوظ ہو گئے ہیں۔ کیا آپ کسی مصدقہ وکیل سے قانونی مشاورت چاہتے ہیں؟'
          : currentLang === 'sd'
          ? 'توهان جو ڪيس ۽ سمورا ثبوت والٽ ۾ محفوظ ٿي ويا آهن. ڇا توهان ڪنهن وڪيل کان صلاح وٺڻ چاهيو ٿا؟'
          : 'Your case and evidence have been securely registered in your Vault. You can now view your cases or request consultation with a verified advocate.',
        [
          {
            text: currentLang === 'ur' ? 'وکلاء دیکھیں' : currentLang === 'sd' ? 'وڪيل ڏسو' : 'Find Advocate',
            onPress: () => router.push('/(citizen)/FindLawyer'),
          },
          {
            text: currentLang === 'ur' ? 'میرے مقدمات' : currentLang === 'sd' ? 'منهنجا ڪيس' : 'View My Cases',
            onPress: () => router.push('/(citizen)/MyCases'),
          },
        ]
      );
    } catch (e) {
      Alert.alert(t('common.error', 'Error'), e.message || 'Failed to submit case.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvidence = (id) => {
    Alert.alert(
      t('case.removeEvidence', 'Remove Evidence'),
      currentLang === 'ur'
        ? 'کیا آپ اس ثبوت فائل کو ہٹانا چاہتے ہیں؟'
        : currentLang === 'sd'
        ? 'ڇا توهان هي ثبوت فائل هٽائڻ چاهيو ٿا؟'
        : 'Are you sure you want to remove this evidence file?',
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: currentLang === 'ur' ? 'ہاں، ہٹائیں' : currentLang === 'sd' ? 'ها، هٽايو' : 'Yes, Remove',
          onPress: () => setEvidenceList(evidenceList.filter((item) => item.id !== id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Header */}
      <AppHeader
        title={t('citizen.buildCase', 'Build Your Case')}
        showBack={true}
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner with clean 'Build Your Case' title only */}
        <View style={styles.caseTypeBanner}>
          <Text style={styles.caseTypeName}>
            {t('citizen.buildCase', 'Build Your Case')}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            {t('case.titleLabel', 'CASE TITLE *')}
          </Text>
          <TextInput
            style={styles.formInput}
            placeholder={t('case.titlePlaceholder', 'Enter case title')}
            placeholderTextColor="#999"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            {t('case.descLabel', 'DESCRIPTION *')}
          </Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder={t('case.descPlaceholder', 'Describe your case in detail. Include all relevant information.')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />
        </View>

        {/* SINDH CITY (SEARCHABLE & EDITABLE COMBOBOX) */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            {t('case.sindhCity', 'SINDH CITY *')}
          </Text>
          <View style={styles.comboboxContainer}>
            <TextInput
              style={styles.comboboxInput}
              value={selectedCity}
              placeholder={currentLang === 'ur' ? 'شہر کا نام درج کریں یا منتخب کریں' : currentLang === 'sd' ? 'شهر جو نالو لکو يا چونڊيو' : 'Type or select Sindh City...'}
              placeholderTextColor="#888"
              onChangeText={(text) => {
                setSelectedCity(text);
                setShowCityDropdown(true);
                setShowDistrictDropdown(false);
              }}
              onFocus={() => {
                setShowCityDropdown(true);
                setShowDistrictDropdown(false);
              }}
            />
            <TouchableOpacity
              style={styles.comboboxToggle}
              onPress={() => {
                setShowCityDropdown(!showCityDropdown);
                setShowDistrictDropdown(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.comboboxToggleText}>{showCityDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          </View>

          {showCityDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView
                style={styles.dropdownScroll}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {(() => {
                  const allCities = Object.keys(SINDH_CITIES_DATA);
                  const searchTrim = (selectedCity || '').trim().toLowerCase();
                  const matches = allCities.filter((c) => {
                    const trans = (translateDistrict(c) || '').toLowerCase();
                    return c.toLowerCase().includes(searchTrim) || trans.includes(searchTrim);
                  });
                  const displayList = matches.length > 0 ? matches : allCities;

                  return displayList.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[
                        styles.dropdownItemRow,
                        selectedCity.toLowerCase() === city.toLowerCase() && { backgroundColor: 'rgba(255, 149, 0, 0.18)' },
                      ]}
                      onPress={() => {
                        setSelectedCity(city);
                        if (SINDH_CITIES_DATA[city] && SINDH_CITIES_DATA[city][0]) {
                          setSelectedDistrict(SINDH_CITIES_DATA[city][0]);
                        }
                        setShowCityDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{city}</Text>
                      {currentLang !== 'en' && (
                        <Text style={styles.dropdownItemSub}>{translateDistrict(city)}</Text>
                      )}
                    </TouchableOpacity>
                  ));
                })()}
              </ScrollView>
            </View>
          )}
        </View>

        {/* DISTRICT (SEARCHABLE & EDITABLE COMBOBOX - ALL 30 SINDH DISTRICTS) */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            {t('case.district', 'DISTRICT *')}
          </Text>
          <View style={styles.comboboxContainer}>
            <TextInput
              style={styles.comboboxInput}
              value={selectedDistrict}
              placeholder={currentLang === 'ur' ? 'ضلع کا نام درج کریں یا منتخب کریں' : currentLang === 'sd' ? 'ضلعي جو نالو لکو يا چونڊيو' : 'Type or select District...'}
              placeholderTextColor="#888"
              onChangeText={(text) => {
                setSelectedDistrict(text);
                setShowDistrictDropdown(true);
                setShowCityDropdown(false);
              }}
              onFocus={() => {
                setShowDistrictDropdown(true);
                setShowCityDropdown(false);
              }}
            />
            <TouchableOpacity
              style={styles.comboboxToggle}
              onPress={() => {
                setShowDistrictDropdown(!showDistrictDropdown);
                setShowCityDropdown(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.comboboxToggleText}>{showDistrictDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          </View>

          {showDistrictDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView
                style={styles.dropdownScroll}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {(() => {
                  const cityDistricts = SINDH_CITIES_DATA[selectedCity] || [];
                  const remaining = ALL_SINDH_DISTRICTS.filter((d) => !cityDistricts.includes(d));
                  const combinedPool = [...cityDistricts, ...remaining];

                  const searchTrim = (selectedDistrict || '').trim().toLowerCase();
                  const matches = combinedPool.filter((d) => {
                    const trans = (translateDistrict(d) || '').toLowerCase();
                    return d.toLowerCase().includes(searchTrim) || trans.includes(searchTrim);
                  });
                  const displayList = matches.length > 0 ? matches : combinedPool;

                  return displayList.map((dist) => (
                    <TouchableOpacity
                      key={dist}
                      style={[
                        styles.dropdownItemRow,
                        selectedDistrict.toLowerCase() === dist.toLowerCase() && { backgroundColor: 'rgba(255, 149, 0, 0.18)' },
                      ]}
                      onPress={() => {
                        setSelectedDistrict(dist);
                        setShowDistrictDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{dist}</Text>
                      {currentLang !== 'en' && (
                        <Text style={styles.dropdownItemSub}>{translateDistrict(dist)}</Text>
                      )}
                    </TouchableOpacity>
                  ));
                })()}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Uneditable Actual Date */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            {t('case.filingDate', 'FILING DATE')}
          </Text>
          <View style={styles.uneditableField}>
            <Text style={styles.uneditableFieldText}>{todayDate}</Text>
          </View>
        </View>

        {/* Evidence Section */}
        <View style={styles.evidenceSection}>
          <View style={styles.evidenceHeader}>
            <View>
              <Text style={styles.evidenceTitle}>
                {t('case.secureEvidence', 'Secure Evidence Collection')}
              </Text>
              <Text style={styles.evidenceHint}>
                {t('case.evidenceHint', 'Attach documents or photos directly from your phone.')}
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
                {t('case.phonePdf', 'Phone File (PDF)')}
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
                {t('case.galleryPhoto', 'Gallery Photo')}
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
                {t('case.snapCamera', 'Snap Camera')}
              </Text>
            </TouchableOpacity>
          </View>

          {pickingLoading && (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <ActivityIndicator color="#FF9500" />
              <Text style={{ fontSize: 11, color: 'rgba(255, 220, 180, 0.6)', marginTop: 4 }}>
                {t('common.loading', 'Accessing phone file system...')}
              </Text>
            </View>
          )}

          {evidenceList.length === 0 && !pickingLoading && (
            <View
              style={{
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: 'rgba(25, 12, 5, 0.65)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(255, 149, 0, 0.25)',
                borderStyle: 'dashed',
              }}
            >
              <Text style={{ fontSize: 12, color: 'rgba(255, 220, 180, 0.55)', fontWeight: '500', textAlign: 'center' }}>
                {t('case.noEvidence', 'No evidence attached yet. Tap a button above to add files.')}
              </Text>
            </View>
          )}

          {evidenceList.map((item, index) => (
            <View key={item.id || index} style={styles.evidenceItem}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 149, 0, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 160, 40, 0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFB74D' }}>
                  {item.type === 'Photo' ? 'IMG' : 'DOC'}
                </Text>
              </View>
              <View style={styles.evidenceInfo}>
                <Text style={styles.evidenceName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.evidenceMeta}>
                  {item.type} • {item.size || 'Attached'} {item.date ? `• ${item.date}` : ''}
                </Text>
              </View>
              <View style={styles.evidenceActions}>
                <TouchableOpacity onPress={() => handleDeleteEvidence(item.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>{t('case.remove', 'Remove')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Clean Submit Button: "SUBMIT" */}
        <View style={{ marginVertical: 18 }}>
          {submitting ? (
            <ActivityIndicator color="#FF9500" size="large" />
          ) : (
            <LiquidGlassButton
              title={t('case.submit', 'SUBMIT')}
              onPress={handleSubmit}
            />
          )}
        </View>
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="citizen" activeTab="cases" />
    </SafeAreaView>
  );
}
