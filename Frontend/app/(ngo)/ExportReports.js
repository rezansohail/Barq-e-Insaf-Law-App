import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api, { BASE_URL } from '../../constants/api';

export default function NGOExportReports() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { isDarkMode } = useAppTheme();
  const { t } = useTranslation();

  useAppNavigation({ isHome: false, homeRoute: '/(ngo)/NGOHome' });

  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [includeBiometric, setIncludeBiometric] = useState(true);
  const [includeNCHD, setIncludeNCHD] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const formats = [
    {
      id: 'PDF',
      label: t('ngo.pdfDossierTitle', 'PDF Dossier'),
      icon: 'PDF',
      desc: t('ngo.pdfDossierDesc', '1-Page statutory audit for High Court & institutional review'),
    },
  ];

  const handleDirectDownload = async () => {
    try {
      setGenerating(true);
      setDownloadSuccess(null);

      const res = await api.post('/ngo/reports/export', {
        format: selectedFormat.toLowerCase(),
        range: 'This Month',
        includeAnonymizedDockets: includeBiometric,
        includeNchdSeal: includeNCHD,
      });

      const reportData = res.data;
      if (!reportData?.downloadUrl) {
        throw new Error('Server did not return a valid download URL.');
      }

      const base = BASE_URL.replace(/\/api\/?$/, '');
      const fullUrl = reportData.downloadUrl.startsWith('http')
        ? reportData.downloadUrl
        : `${base}${reportData.downloadUrl.startsWith('/') ? '' : '/'}${reportData.downloadUrl}`;

      const filename = `${reportData.reportId || 'NCHD-AUDIT'}.${selectedFormat.toLowerCase()}`;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        try {
          await WebBrowser.openBrowserAsync(fullUrl);
        } catch (_) {
          await Linking.openURL(fullUrl);
        }
      }

      setDownloadSuccess({
        reportId: reportData.reportId,
        format: reportData.format || selectedFormat,
        fullUrl,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      console.error('[NGO_DOWNLOAD] Error:', err.message);
      Alert.alert(
        'Export Notice',
        'Could not complete instant download. Please check your connection to the server.'
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#0A0402', '#060201', '#020101']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title={t('ngo.reportsTitle', 'Export Institutional Audits')}
          showBack={true}
          homeRoute="/(ngo)/NGOHome"
          role="ngo"
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {downloadSuccess && (
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.14)', borderColor: '#10B981', borderWidth: 1.2, borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '800' }}>
                  ✓ {downloadSuccess.format} Downloaded Directly
                </Text>
                <Text style={{ color: '#6EE7B7', fontSize: 10, fontWeight: '700' }}>
                  {downloadSuccess.timestamp} PKT
                </Text>
              </View>

              <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '700', marginTop: 6 }}>
                {downloadSuccess.reportId}
              </Text>
              <Text style={{ color: 'rgba(255, 235, 215, 0.7)', fontSize: 10.5, marginTop: 2 }}>
                1-Page Statutory Audit Dossier saved directly to your device.
              </Text>

              <TouchableOpacity
                style={{ marginTop: 8, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'rgba(16, 185, 129, 0.25)', borderRadius: 6 }}
                onPress={handleDirectDownload}
              >
                <Text style={{ color: '#10B981', fontSize: 10.5, fontWeight: '800' }}>⬇ Re-Download File</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionHeader}>{t('ngo.selectExportSpec', 'SELECT EXPORT SPECIFICATION')}</Text>

          <View style={styles.formatsColumn}>
            {formats.map((fmt) => (
              <TouchableOpacity
                key={fmt.id}
                style={[
                  styles.formatCard,
                  selectedFormat === fmt.id && styles.formatCardActive,
                ]}
                onPress={() => setSelectedFormat(fmt.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.formatIconBox, selectedFormat === fmt.id && styles.formatIconBoxActive]}>
                  <Text style={styles.formatIconText}>{fmt.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formatTitle}>{fmt.label}</Text>
                  <Text style={styles.formatDesc}>{fmt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionHeader}>{t('ngo.complianceHeader', 'STATUTORY COMPLIANCE STAMPS')}</Text>
          <View style={styles.complianceBox}>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIncludeBiometric(!includeBiometric)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>{t('ngo.strictIdentityLabel', 'Strict Litigant Identity Concealment')}</Text>
                <Text style={styles.toggleDesc}>{t('ngo.strictIdentityDesc', 'Redacts CNIC, telephone, and addresses under judicial privacy')}</Text>
              </View>
              <View style={[styles.checkbox, includeBiometric && styles.checkboxActive]}>
                {includeBiometric && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIncludeNCHD(!includeNCHD)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>{t('ngo.nchdSealLabel', 'NCHD Statutory Human Rights Seal')}</Text>
                <Text style={styles.toggleDesc}>{t('ngo.nchdSealDesc', 'Affixes statutory authority under Federal Ordinance XXIX of 2002')}</Text>
              </View>
              <View style={[styles.checkbox, includeNCHD && styles.checkboxActive]}>
                {includeNCHD && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.actionBox}>
            <LiquidGlassButton
              title={generating ? t('ngo.downloadingPdf', 'DOWNLOADING PDF DOSSIER...') : t('ngo.downloadPdfDirectly', '⬇ DOWNLOAD OFFICIAL PDF DIRECTLY')}
              onPress={handleDirectDownload}
              disabled={generating}
            />
          </View>
        </ScrollView>

        <BottomNavBar role="ngo" activeTab="reports" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0402' },
  safeArea: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 110 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB74D',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  formatsColumn: { gap: 10, marginBottom: 18 },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 12, 5, 0.75)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.18)',
    gap: 12,
  },
  formatCardActive: {
    borderColor: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
  },
  formatIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatIconBoxActive: { backgroundColor: '#FF9500' },
  formatIconText: { fontSize: 11, fontWeight: '900', color: '#FFB74D' },
  formatTitle: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  formatDesc: { fontSize: 10.5, color: 'rgba(255, 220, 180, 0.65)', marginTop: 2 },
  complianceBox: {
    backgroundColor: 'rgba(24, 12, 5, 0.75)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.18)',
    gap: 12,
    marginBottom: 18,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  toggleTitle: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  toggleDesc: { fontSize: 10, color: 'rgba(255, 220, 180, 0.6)', marginTop: 2 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 149, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#FF9500', borderColor: '#FF9500' },
  checkMark: { color: '#000000', fontSize: 12, fontWeight: '900' },
  actionBox: { marginTop: 4, marginBottom: 12 },
});
