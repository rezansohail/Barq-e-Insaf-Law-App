import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api, { BASE_URL } from '../../constants/api';

export default function MediaExportReports() {
  const router = useRouter();
  const { isDarkMode } = useAppTheme();
  const { t } = useTranslation();
  useAppNavigation({ isHome: false, homeRoute: '/(media)/MediaHome' });

  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [includeBiometric, setIncludeBiometric] = useState(true);
  const [includeKTN, setIncludeKTN] = useState(true);
  const [generating, setGenerating] = useState(false);

  const formats = [
    {
      id: 'PDF',
      label: t('media.pressPacketTitle', 'PDF Press Packet'),
      icon: 'PDF',
      desc: t('media.pressPacketDesc', '1-Page official judicial press brief for newsroom dissemination'),
    },
  ];

  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const handleDirectDownload = async () => {
    try {
      setGenerating(true);
      setDownloadSuccess(null);

      const res = await api.post('/media/reports/export', {
        format: selectedFormat.toLowerCase(),
        range: 'This Month',
        anonymizeLitigants: includeBiometric,
        includeKtnSeal: includeKTN,
      });

      const reportData = res.data;
      if (!reportData?.downloadUrl) {
        throw new Error('Server did not return a valid download URL.');
      }

      const base = BASE_URL.replace(/\/api\/?$/, '');
      const fullUrl = reportData.downloadUrl.startsWith('http')
        ? reportData.downloadUrl
        : `${base}${reportData.downloadUrl.startsWith('/') ? '' : '/'}${reportData.downloadUrl}`;

      const filename = `${reportData.reportId || 'KTN-PRESS-BRIEF'}.${selectedFormat.toLowerCase()}`;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        await Linking.openURL(fullUrl);
      }

      setDownloadSuccess({
        reportId: reportData.reportId,
        format: reportData.format || selectedFormat,
        fullUrl,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      console.error('[MEDIA_DOWNLOAD] Error:', err.message);
      Alert.alert(
        'Export Notice',
        'Could not complete instant download. Please check your connection to the server.'
      );
    } finally {
      setGenerating(false);
    }
  };

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

  const { isDark } = useAppTheme();
  const safeBg = isDark ? '#080402' : '#FAF7F2';
  const cardBg = isDark ? 'rgba(34, 16, 12, 0.95)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(245, 158, 11, 0.40)' : 'rgba(255, 149, 0, 0.20)';
  const textPrimary = isDark ? '#FFF5E8' : '#1A0F07';
  const textSecondary = isDark ? 'rgba(255, 235, 215, 0.75)' : '#664530';
  const optionBg = isDark ? 'rgba(26, 12, 5, 0.85)' : '#F2ECE4';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      <AppHeader
        title="Export Press Briefs"
        showBack={true}
        homeRoute="/(media)/MediaHome"
        role="media"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {downloadSuccess && (
          <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.14)', borderColor: '#10B981', borderWidth: 1.2, borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '800' }}>
                {downloadSuccess.format} Downloaded Directly
              </Text>
              <Text style={{ color: '#6EE7B7', fontSize: 10, fontWeight: '700' }}>
                {downloadSuccess.timestamp} PKT
              </Text>
            </View>
            <Text style={{ color: textPrimary, fontSize: 11.5, fontWeight: '700', marginTop: 6 }}>
              {downloadSuccess.reportId}
            </Text>
            <Text style={{ color: textSecondary, fontSize: 10.5, marginTop: 2 }}>
              1-Page Official Judicial Press Packet saved directly to your device.
            </Text>
            <TouchableOpacity
              style={{ marginTop: 8, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'rgba(16, 185, 129, 0.25)', borderRadius: 6 }}
              onPress={handleDirectDownload}
            >
              <Text style={{ color: '#10B981', fontSize: 10.5, fontWeight: '800' }}>Re-Download File</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Select Output Format</Text>
          <Text style={[styles.cardSub, { color: textSecondary }]}>
            Choose compilation standard for news dissemination
          </Text>

          {formats.map((fmt) => (
            <TouchableOpacity
              key={fmt.id}
              style={[
                styles.formatOption,
                { backgroundColor: optionBg },
                selectedFormat === fmt.id && styles.formatOptionActive,
              ]}
              onPress={() => setSelectedFormat(fmt.id)}
            >
              <View style={[styles.formatIconBox, selectedFormat === fmt.id && styles.formatIconBoxActive]}>
                <Text style={styles.formatIconText}>{fmt.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formatLabel, { color: textPrimary }]}>{fmt.label}</Text>
                <Text style={[styles.formatDesc, { color: textSecondary }]}>{fmt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Verification Checkboxes */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Editorial Compliance</Text>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setIncludeBiometric(!includeBiometric)}
          >
            <View style={[styles.checkbox, includeBiometric && styles.checkboxActive]}>
              {includeBiometric && <View style={styles.checkInner} />}
            </View>
            <Text style={[styles.checkLabel, { color: textPrimary }]}>
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
            <Text style={[styles.checkLabel, { color: textPrimary }]}>
              Embed KTN News Editorial Verification Seal
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionBox}>
          <LiquidGlassButton
            title={generating ? t('media.downloadingPdf', 'DOWNLOADING PRESS PACKET...') : t('media.downloadPdfDirectly', 'DOWNLOAD OFFICIAL PDF DIRECTLY')}
            onPress={handleDirectDownload}
            disabled={generating}
            variant="amber"
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
