import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';
import AppHeader from '../components/AppHeader';

export default function TermsScreen() {
  const router = useRouter();
  const { isDarkMode } = useAppTheme();

  const safeBg = isDarkMode ? '#121218' : '#FAF8F5';
  const cardBg = isDarkMode ? '#1E202C' : '#FFFFFF';
  const innerCardBg = isDarkMode ? '#262837' : '#F5F2EB';
  const borderColor = isDarkMode ? '#2F3144' : 'rgba(234, 88, 12, 0.2)';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const subTextColor = isDarkMode ? '#E5E7EB' : '#4B5563';

  const sections = [
    {
      title: '1. Platform Mission & Non-Profit Pro Bono Commitment',
      body: 'Barq-e-Insaf is a pro bono digital justice platform dedicated to providing unprivileged citizens of Sindh with free access to legal literacy, court docketing tools, verified legal counsel, and NGO/Media aid. Absolutely NO fees, charges, commissions, or monetary transactions are levied on citizens or counsel within this app.',
    },
    {
      title: '2. Artificial Intelligence Legal Guidance Disclaimer',
      body: 'The integrated AI Legal Assistant provides information derived from the Pakistan Penal Code (PPC), Sindh Rented Premises Ordinance, Family Courts Act 1964, and constitutional statutes for educational and procedural navigation only. Interactions with the AI Assistant do NOT constitute formal attorney-client privilege or definitive legal counsel.',
    },
    {
      title: '3. Digital Evidence Vault Confidentiality',
      body: 'Evidence uploaded to the digital vault (contracts, notices, registry documents, incident photographs) is stored securely. Evidence is exclusively accessible to the registered citizen and is disclosed to assigned advocates, NGOs, or media correspondents ONLY upon the citizen\'s explicit authorization.',
    },
    {
      title: '4. Advocate Verification & Ethical Standards',
      body: 'All legal practitioners registered on Barq-e-Insaf must hold valid licensing credentials with the Sindh Bar Council (SBC). Advocates agree to provide pro bono legal consultations and transparent procedural updates in accordance with the Legal Practitioners and Bar Councils Act.',
    },
    {
      title: '5. Whistleblower & Citizen Media Protection',
      body: 'When a citizen initiates a media investigation or NGO assistance request, Barq-e-Insaf strictly masks and protects personal identifiers (real name, CNIC number, and personal phone number). Journalists and observers receive only factual summaries, jurisdiction, and anonymous relay access to ensure complete citizen safety.',
    },
    {
      title: '6. User Conduct & Administrative Moderation',
      body: 'Users are strictly prohibited from submitting defamatory material, forged documents, fraudulent court petitions, or harassment. Platform administrators reserve the authority to review system activity logs, investigate violations, and approve, suspend, or revoke accounts to uphold institutional integrity.',
    },
    {
      title: '7. Governing Law & Jurisdiction',
      body: 'These terms are governed by the laws of the Islamic Republic of Pakistan and the statutory jurisdiction of the High Court of Sindh.',
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      <AppHeader
        title="Terms & Conditions"
        showBack={true}
        homeRoute="/LoginScreen"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Banner */}
        <View style={[styles.introCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.introBadge, { color: '#FFA726' }]}>
            OFFICIAL USER AGREEMENT · PRO BONO JUSTICE CHARTER
          </Text>
          <Text style={[styles.introTitle, { color: textColor }]}>
            Terms of Service & Public Legal Protocol
          </Text>
          <Text style={[styles.introDate, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            Effective Date: November 2026 · Province of Sindh
          </Text>
          <Text style={[styles.introDesc, { color: subTextColor }]}>
            Please review the legal standards, privacy protections, and pro bono policies governing your use of Barq-e-Insaf across Citizen, Advocate, NGO, Media, and Administrative modules.
          </Text>
        </View>

        {/* Policy Sections */}
        {sections.map((sec, idx) => (
          <View
            key={idx}
            style={[
              styles.sectionCard,
              { backgroundColor: cardBg, borderColor },
            ]}
          >
            <View style={[styles.sectionHeaderBox, { backgroundColor: innerCardBg }]}>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
            </View>
            <Text style={[styles.sectionBody, { color: subTextColor }]}>
              {sec.body}
            </Text>
          </View>
        ))}

        {/* Acknowledge Button */}
        <TouchableOpacity
          style={styles.liquidGlassBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.liquidGlassBtnText}>I UNDERSTAND AND AGREE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
    gap: 14,
  },
  introCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  introBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  introDate: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
  },
  introDesc: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  sectionCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.2,
    gap: 10,
  },
  sectionHeaderBox: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFA726',
    letterSpacing: 0.2,
  },
  sectionBody: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  liquidGlassBtn: {
    backgroundColor: 'rgba(255, 149, 0, 0.22)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 167, 38, 0.65)',
    marginTop: 8,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  liquidGlassBtnText: {
    color: '#FFD180',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
