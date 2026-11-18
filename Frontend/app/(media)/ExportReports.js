import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
<<<<<<< HEAD
import { useTranslation } from 'react-i18next';
import api, { BASE_URL } from '../../constants/api';

export default function MediaExportReports() {
  const router = useRouter();
  const { isDarkMode } = useAppTheme();
  const { t } = useTranslation();
=======

export default function MediaExportReports() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
>>>>>>> 2f0fafeb8c8aae19704bfcb258be0756f36f51aa
  useAppNavigation({ isHome: false, homeRoute: '/(media)/MediaHome' });

  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [includeBiometric, setIncludeBiometric] = useState(true);
  const [includeKTN, setIncludeKTN] = useState(true);
  const [generating, setGenerating] = useState(false);

  const formats = [
<<<<<<< HEAD
    {
      id: 'PDF',
      label: t('media.pressPacketTitle', 'PDF Press Packet'),
      icon: 'PDF',
      desc: t('media.pressPacketDesc', '1-Page official judicial press brief for newsroom dissemination'),
    },
=======
    { id: 'PDF', label: 'PDF Press Packet', icon: 'PDF', desc: 'Formatted for broadcast newsroom and editorial publication' },
    { id: 'CSV', label: 'CSV Tabular Data', icon: 'CSV', desc: 'Raw tabular case data for investigative journalism' },
    { id: 'JSON', label: 'JSON Feed', icon: 'JSON', desc: 'Structured data for KTN News journalism & research archives' },
>>>>>>> 2f0fafeb8c8aae19704bfcb258be0756f36f51aa
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      Alert.alert(
        'Press Packet Ready',
        `The official Sindh Legal Accessibility ${selectedFormat} report has been compiled successfully under KTN News editorial standards.`,
        [{ text: 'Download File', onPress: () => router.replace('/(media)/MediaHome') }]
      );
    }, 1200);
  };

  const safeBg = isDarkMode ? '#13131A' : '#FAF8F5';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      <AppHeader
        title="Export Press Briefs"
        showBack={true}
        homeRoute="/(media)/MediaHome"
        role="media"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.94)' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.35)' : 'rgba(234, 88, 12, 0.25)' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Select Output Format</Text>
          <Text style={[styles.cardSub, { color: isDarkMode ? 'rgba(255, 235, 215, 0.7)' : '#664530' }]}>
            Choose compilation standard for news dissemination
          </Text>

          {formats.map((fmt) => (
            <TouchableOpacity
              key={fmt.id}
              style={[
                styles.formatOption,
                { backgroundColor: isDarkMode ? 'rgba(16, 8, 4, 0.92)' : '#F5F1E9' },
                selectedFormat === fmt.id && styles.formatOptionActive,
              ]}
              onPress={() => setSelectedFormat(fmt.id)}
            >
              <View style={[styles.formatIconBox, selectedFormat === fmt.id && styles.formatIconBoxActive]}>
                <Text style={styles.formatIconText}>{fmt.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formatLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>{fmt.label}</Text>
                <Text style={[styles.formatDesc, { color: isDarkMode ? 'rgba(255, 235, 215, 0.65)' : '#664530' }]}>{fmt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Verification Checkboxes */}
        <View style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.94)' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.35)' : 'rgba(234, 88, 12, 0.25)' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>Editorial Compliance</Text>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setIncludeBiometric(!includeBiometric)}
          >
            <View style={[styles.checkbox, includeBiometric && styles.checkboxActive]}>
              {includeBiometric && <View style={styles.checkInner} />}
            </View>
            <Text style={[styles.checkLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
              Anonymize All Litigant Personal Identifiers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setIncludeKTN(!includeKTN)}
          >
            <View style={[styles.checkbox, includeKTN && styles.checkboxActive]}>
              {includeKTN && <View style={styles.checkInner} />}
            </View>
            <Text style={[styles.checkLabel, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
              Embed KTN News Editorial Verification Seal
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionBox}>
          <LiquidGlassButton
<<<<<<< HEAD
            title={generating ? t('media.downloadingPdf', 'DOWNLOADING PRESS PACKET...') : t('media.downloadPdfDirectly', '⬇ DOWNLOAD OFFICIAL PDF DIRECTLY')}
            onPress={handleDirectDownload}
=======
            title={generating ? 'COMPILING PRESS PACKET...' : `GENERATE ${selectedFormat} PACKET`}
            onPress={handleGenerate}
>>>>>>> 2f0fafeb8c8aae19704bfcb258be0756f36f51aa
            disabled={generating}
          />
        </View>
      </ScrollView>

      {/* Shared Bottom Nav */}
      <BottomNavBar role="media" activeTab="reports" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080402' },
  scrollContent: { padding: 16, paddingBottom: 110 },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  cardSub: {
    fontSize: 11,
    marginBottom: 14,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  formatOptionActive: {
    borderColor: '#FF7A00',
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
  },
  formatIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 140, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatIconBoxActive: {
    backgroundColor: '#FF7A00',
  },
  formatIconText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  formatLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  formatDesc: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#FF7A00',
  },
  checkInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  checkLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  actionBox: {
    marginTop: 8,
    marginBottom: 12,
  },
});
