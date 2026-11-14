import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useMockStore, activeCases, caseRequests } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function CaseDetail() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = params.caseId;

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/MyCases' });

  // Find case in active cases or pending requests
  const activeCase = activeCases.find((c) => c.id === caseId);
  const requestCase = caseRequests.find((c) => c.id === caseId);
  const caseData = activeCase || requestCase;

  if (!caseData) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#140803" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.simpleBackBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Image
              source={require('../../assets/images/backarrow.png')}
              style={{ width: 22, height: 15 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Case Details</Text>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.detailText}>Case not found</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleContactClient = () => {
    if (caseData.contact) {
      Alert.alert(
        'Client Contact',
        `Client Name: ${caseData.clientName || caseData.name}\nPhone: ${caseData.contact}`,
        [
          { text: 'Close', style: 'cancel' },
          {
            text: 'Call Now',
            onPress: () => Alert.alert('Dialing', `Calling ${caseData.contact}...`),
          },
        ]
      );
    } else {
      Alert.alert('Contact Hidden', 'Accept the case request with your digital signature to unlock client contact.');
    }
  };

  const handleViewEvidence = () => {
    if (caseData.evidence) {
      const evList = Array.isArray(caseData.evidence)
        ? caseData.evidence.map((e) => (typeof e === 'string' ? e : e.name)).join('\n')
        : caseData.evidence;
      Alert.alert('Case Evidence Files', evList || 'Verified evidence file attached.');
    } else {
      Alert.alert('No Evidence', 'No evidence has been uploaded for this case yet.');
    }
  };

  const sig = caseData.digitalSignature;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Matter Details' Header */}
      <AppHeader
        title="Matter Details"
        showBack={true}
        homeRoute="/(lawyer)/MyCases"
        role="lawyer"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* DIGITAL SIGNATURE & CONSULTANCY CERTIFICATE CARD */}
        {sig && (
          <View style={styles.signatureCard}>
            <View style={styles.sigCardHeader}>
              <View style={styles.sealCircle}>
                <Text style={styles.sealCircleText}>SBC</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sigCardTitle}>
                  Digital Signature & Consultancy Confirmed
                </Text>
                <Text style={styles.sigCertificateId}>
                  Certificate #{sig.certificateId} · Verified Legal Agreement
                </Text>
              </View>
            </View>

            {/* Scheduled Visit Highlight */}
            <View style={styles.visitBox}>
              <Text style={styles.visitLabel}>SCHEDULED CONSULTATION VISIT</Text>
              <Text style={styles.visitTime}>{sig.consultancyTime}</Text>
              <Text style={styles.visitAddress}>Chamber: {sig.chamberAddress}</Text>
            </View>

            {/* Signature Stamp Display */}
            <View style={styles.stampDisplay}>
              <Text style={styles.stampTypeLabel}>
                {sig.signatureType === 'drawn' ? 'DIGITALLY DRAWN SIGNATURE' : 'VERIFIED LEGAL SIGNATURE'}
              </Text>

              {sig.signatureType === 'drawn' && sig.drawnPaths && sig.drawnPaths.length > 0 ? (
                <View style={styles.drawnPreviewBox}>
                  <Svg width="100%" height={70}>
                    {sig.drawnPaths.map((p, idx) => (
                      <Path
                        key={idx}
                        d={p}
                        stroke="#FFA726"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </Svg>
                </View>
              ) : (
                <Text style={styles.cursiveName}>{sig.signedName}</Text>
              )}

              <Text style={styles.stampFooterText}>
                Signed on: {sig.signedAt} · License: {sig.sbcLicense}
              </Text>
            </View>

            {/* Contact details shared */}
            <View style={styles.sharedContactBox}>
              <Text style={styles.sharedContactTitle}>Contact Shared with Citizen:</Text>
              <Text style={styles.sharedContactText}>Phone: {sig.lawyerPhone} · Email: {sig.lawyerEmail}</Text>
              {sig.notes && (
                <Text style={styles.sharedNotesText}>Instructions: "{sig.notes}"</Text>
              )}
            </View>
          </View>
        )}

        {/* Case Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Case Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Case Title:</Text>
            <Text style={styles.infoValue}>{caseData?.title || caseData?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client:</Text>
            <Text style={styles.infoValue}>{caseData?.clientName || caseData?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Specialty:</Text>
            <Text style={styles.infoValue}>{caseData?.spec || 'General Practice'}</Text>
          </View>
          {caseData?.court && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Court:</Text>
              <Text style={styles.infoValue}>{caseData.court}</Text>
            </View>
          )}
        </View>

        {/* Problem Statement Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Problem Statement</Text>
          <Text style={styles.descriptionText}>
            {caseData?.problemStatement || caseData?.desc || caseData?.description}
          </Text>
        </View>

        {/* Contact Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Client Contact Information</Text>
          {caseData?.contact ? (
            <TouchableOpacity style={styles.contactBtn} onPress={handleContactClient} activeOpacity={0.84}>
              <Text style={styles.contactBtnText}>Call Client: {caseData.contact}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.securedNotice}>
              <Text style={styles.securedNoticeText}>
                Client contact is protected. Accept the request with your digital signature to reveal details.
              </Text>
            </View>
          )}
        </View>

        {/* Evidence Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Case Evidence Documents</Text>
          {caseData?.evidence ? (
            <TouchableOpacity style={styles.evidenceBtn} onPress={handleViewEvidence} activeOpacity={0.84}>
              <Text style={styles.evidenceBtnText}>View Attached Evidence Documents</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.securedNotice}>
              <Text style={styles.securedNoticeText}>
                Evidence documents are hidden until request acceptance.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="lawyer" activeTab="cases" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0C0502',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#140803',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.20)',
    gap: 8,
  },
  simpleBackBtn: {
    padding: 6,
    marginRight: 6,
  },
  simpleBackText: {
    color: '#FF9500',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 26,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },

  // DIGITAL SIGNATURE CERTIFICATE CARD
  signatureCard: {
    backgroundColor: 'rgba(32, 14, 5, 0.75)',
    borderRadius: 18,
    borderWidth: 1.4,
    borderColor: 'rgba(255, 160, 40, 0.55)',
    padding: 16,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  sigCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sealCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 149, 0, 0.25)',
    borderWidth: 1.2,
    borderColor: '#FFA726',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealCircleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFA726',
  },
  sigCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sigCertificateId: {
    fontSize: 10.5,
    color: 'rgba(255, 200, 150, 0.75)',
    marginTop: 2,
  },
  visitBox: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.30)',
  },
  visitLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFA726',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  visitTime: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  visitAddress: {
    fontSize: 12,
    color: 'rgba(255, 230, 205, 0.82)',
    lineHeight: 16,
  },
  stampDisplay: {
    backgroundColor: 'rgba(20, 8, 3, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.35)',
    borderStyle: 'dashed',
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  stampTypeLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFA726',
    letterSpacing: 0.8,
  },
  cursiveName: {
    fontSize: 24,
    fontStyle: 'italic',
    color: '#FFA726',
    marginVertical: 8,
    letterSpacing: 1.2,
  },
  drawnPreviewBox: {
    width: '100%',
    height: 70,
    marginVertical: 4,
  },
  stampFooterText: {
    fontSize: 9.5,
    color: 'rgba(255, 220, 180, 0.65)',
    marginTop: 4,
  },
  sharedContactBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 149, 0, 0.18)',
  },
  sharedContactTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFE2B8',
    marginBottom: 2,
  },
  sharedContactText: {
    fontSize: 11.5,
    color: 'rgba(255, 230, 205, 0.85)',
  },
  sharedNotesText: {
    fontSize: 11,
    color: 'rgba(255, 200, 150, 0.7)',
    fontStyle: 'italic',
    marginTop: 2,
  },

  // REGULAR CARDS
  card: {
    backgroundColor: 'rgba(22, 10, 4, 0.65)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.30)',
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFA726',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.18)',
    paddingBottom: 8,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    width: 85,
    fontSize: 12.5,
    color: 'rgba(255, 220, 180, 0.65)',
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  detailText: {
    fontSize: 13.5,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: 'rgba(255, 240, 225, 0.85)',
    lineHeight: 20,
  },
  contactBtn: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  evidenceBtn: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.4)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceBtnText: {
    color: '#FFA726',
    fontSize: 13,
    fontWeight: '700',
  },
  securedNotice: {
    backgroundColor: 'rgba(255, 149, 0, 0.10)',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  securedNoticeText: {
    fontSize: 11.5,
    color: 'rgba(255, 225, 190, 0.85)',
    lineHeight: 16,
  },
});
