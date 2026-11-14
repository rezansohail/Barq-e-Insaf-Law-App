import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function NGOExportReports() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Hardware back returns to NGOHome
  useAppNavigation({ isHome: false, homeRoute: '/(ngo)/NGOHome' });

  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [includeBiometric, setIncludeBiometric] = useState(true);
  const [includeNCHD, setIncludeNCHD] = useState(true);
  const [generating, setGenerating] = useState(false);

  const formats = [
    { id: 'PDF', label: 'PDF Dossier', icon: 'PDF', desc: 'Formatted for executive presentation & High Court review' },
    { id: 'CSV', label: 'CSV Spreadsheet', icon: 'CSV', desc: 'Raw tabular case data for district statistical analysis' },
    { id: 'JSON', label: 'JSON Dataset', icon: 'JSON', desc: 'Structured data for KTN News journalism & research archives' },
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      Alert.alert(
        'Report Generated',
        `The official Sindh Legal Accessibility ${selectedFormat} report has been compiled successfully under National Commission for Human Development (NCHD) and KTN News accreditation.`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Obsidian Background */}
      <LinearGradient
        colors={['#0A0402', '#060201', '#020101']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient warm glow halos */}
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            top: -height * 0.05,
            left: -width * 0.12,
            width: width * 0.75,
            height: width * 0.75,
            backgroundColor: 'rgba(255, 120, 20, 0.08)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            bottom: height * 0.1,
            right: -width * 0.15,
            width: width * 0.8,
            height: width * 0.8,
            backgroundColor: 'rgba(234, 88, 12, 0.06)',
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Modern '< Export Dossiers' Header */}
        <AppHeader
          title="Export Dossiers"
          showBack={true}
          homeRoute="/(ngo)/NGOHome"
          role="ngo"
          subtitle="Reports"
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Format selection */}
          <Text style={styles.sectionHeader}>SELECT EXPORT FORMAT</Text>
          <View style={styles.formatsColumn}>
            {formats.map((fmt) => (
              <TouchableOpacity
                key={fmt.id}
                style={[styles.formatCard, selectedFormat === fmt.id && styles.formatCardActive]}
                onPress={() => setSelectedFormat(fmt.id)}
                activeOpacity={0.8}
              >
                <View style={styles.formatIconBox}>
                  <Text style={{ fontSize: 22 }}>{fmt.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.formatLabel, selectedFormat === fmt.id && styles.formatLabelActive]}>
                    {fmt.label}
                  </Text>
                  <Text style={styles.formatDesc}>{fmt.desc}</Text>
                </View>
                <View style={[styles.radioCircle, selectedFormat === fmt.id && styles.radioCircleActive]}>
                  {selectedFormat === fmt.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scope & Accreditation */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>DATA SCOPE & METRICS</Text>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIncludeBiometric(!includeBiometric)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Include SBC Biometric & Digital Signatures</Text>
                <Text style={styles.toggleDesc}>Attach certificate timestamps and advocate chamber verification</Text>
              </View>
              <View style={[styles.checkbox, includeBiometric && styles.checkboxActive]}>
                {includeBiometric && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIncludeNCHD(!includeNCHD)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>NCHD Human Rights Observatory Watermark</Text>
                <Text style={styles.toggleDesc}>Stamp official serial number for government petitioning</Text>
              </View>
              <View style={[styles.checkbox, includeNCHD && styles.checkboxActive]}>
                {includeNCHD && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </View>

          {/* Liquid Glass Export Button */}
          <View style={styles.actionBox}>
            <LiquidGlassButton
              title={generating ? 'COMPILING DOSSIER...' : `GENERATE OFFICIAL ${selectedFormat}`}
              onPress={handleGenerate}
              disabled={generating}
            />
          </View>
        </ScrollView>

        {/* Consistent Bottom Nav */}
        <BottomNavBar role="ngo" activeTab="reports" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0402',
  },
  safeArea: {
    flex: 1,
  },
  ambientHalo: {
    position: 'absolute',
    borderRadius: 999,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.15)',
  },
  simpleBackBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  simpleBackText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFB74D',
    lineHeight: 26,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFEED6',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 10.5,
    color: 'rgba(255, 180, 80, 0.65)',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB74D',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  formatsColumn: {
    gap: 10,
    marginBottom: 20,
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 12, 5, 0.75)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.18)',
    gap: 12,
  },
  formatCardActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderColor: '#FF9500',
  },
  formatIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: 'rgba(255, 235, 215, 0.85)',
  },
  formatLabelActive: {
    color: '#FFEED6',
    fontWeight: '800',
  },
  formatDesc: {
    fontSize: 10.5,
    color: 'rgba(255, 200, 150, 0.55)',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 149, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#FF9500',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9500',
  },
  sectionCard: {
    backgroundColor: 'rgba(24, 12, 5, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.22)',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFEED6',
  },
  toggleDesc: {
    fontSize: 10,
    color: 'rgba(255, 210, 160, 0.55)',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
  },
  checkboxActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  checkMark: {
    color: '#0A0402',
    fontSize: 13,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    marginVertical: 12,
  },
  actionBox: {
    marginBottom: 20,
  },
});
