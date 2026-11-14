import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { lawyers, activeCases, userData } from './MockStore';
import { addCaseRequest } from '../(lawyer)/MockStore';
import LiquidGlassButton from '../../components/LiquidGlassButton';
import AppHeader from '../../components/AppHeader';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function RequestConsultation() {
  const router = useRouter();
  const { lawyerId } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  // Hardware back returns to FindLawyer
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/FindLawyer' });

  const selectedLawyer = lawyers.find((l) => l.id === lawyerId) || lawyers[0];

  const [matterTitle, setMatterTitle] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState(activeCases[0]?.id || '');
  const [preferredDate, setPreferredDate] = useState('Tomorrow, 11:00 AM');
  const [notes, setNotes] = useState('');
  const [contactPhone, setContactPhone] = useState(userData.phone || '0300-1234567');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = [
    'Tomorrow, 11:00 AM',
    'Tomorrow, 03:30 PM',
    'In 2 Days, 10:30 AM',
    'In 2 Days, 04:00 PM',
  ];

  const handleSubmit = () => {
    if (!matterTitle.trim()) {
      Alert.alert('Required Information', 'Please provide a brief title or description of your legal matter.');
      return;
    }

    setSubmitting(true);

    // Register consultation request into shared lawyer case requests queue
    addCaseRequest({
      name: userData.name || 'Citizen Client',
      spec: selectedLawyer.spec || 'Legal Consultancy',
      court: selectedLawyer.location || 'Sindh High Court',
      desc: notes.trim() || matterTitle.trim(),
      contact: contactPhone.trim(),
      evidence: 'Attached Case Documents',
      problemStatement: matterTitle.trim(),
      preferredTime: preferredDate,
      district: userData.district || 'Karachi Central',
      status: 'Pending Lawyer Review',
    });

    Alert.alert(
      'Consultation Request Sent',
      `Your consultation request has been delivered to ${selectedLawyer.name}.\n\nThe advocate will review your details, sign the appointment digitally, and confirm your scheduled chamber visit.`,
      [
        {
          text: 'View My Cases',
          onPress: () => router.replace('/(citizen)/MyCases'),
        },
      ]
    );
    setSubmitting(false);
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
        {/* Modern '< Request Consultation' Header */}
        <AppHeader
          title="Request Consultation"
          showBack={true}
          homeRoute="/(citizen)/FindLawyer"
          role="citizen"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Advocate Summary Card */}
          <View style={styles.lawyerCard}>
            <LinearGradient
              colors={['rgba(255, 149, 0, 0.14)', 'rgba(20, 10, 4, 0.65)', 'rgba(10, 4, 2, 0.85)']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardTop}>
                <View style={[styles.avatarBox, { backgroundColor: selectedLawyer.color || '#0F2744' }]}>
                  <Text style={styles.avatarText}>{selectedLawyer.initials || 'ADV'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lawyerName}>{selectedLawyer.name}</Text>
                  <Text style={styles.lawyerSpec}>{selectedLawyer.spec}</Text>
                  <Text style={styles.lawyerCourt}>🏛️ {selectedLawyer.location}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>SBC Approved</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Chamber Consultation:</Text>
                <Text style={styles.feeValue}>{selectedLawyer.fee || 'Complimentary / Subsidized'}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Matter Title */}
            <Text style={styles.fieldLabel}>LEGAL MATTER TITLE *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Urgent property demarcation dispute in Karachi"
              placeholderTextColor="rgba(255, 220, 180, 0.35)"
              value={matterTitle}
              onChangeText={setMatterTitle}
            />

            {/* Select Existing Case */}
            {activeCases.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>ATTACH TO EXISTING CASE (OPTIONAL)</Text>
                <View style={styles.caseChipsRow}>
                  {activeCases.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.caseChip, selectedCaseId === c.id && styles.caseChipActive]}
                      onPress={() => setSelectedCaseId(c.id)}
                    >
                      <Text style={[styles.caseChipText, selectedCaseId === c.id && styles.caseChipTextActive]}>
                        📁 {c.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Preferred Time Slot */}
            <Text style={styles.fieldLabel}>PREFERRED CONSULTATION SLOT</Text>
            <View style={styles.slotsGrid}>
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.slotCard, preferredDate === slot && styles.slotCardActive]}
                  onPress={() => setPreferredDate(slot)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.slotText, preferredDate === slot && styles.slotTextActive]}>
                    📅 {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Contact Phone */}
            <Text style={styles.fieldLabel}>CONFIRM CONTACT NUMBER</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0300-1234567"
              placeholderTextColor="rgba(255, 220, 180, 0.35)"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />

            {/* Case Background / Notes */}
            <Text style={styles.fieldLabel}>EXPLAIN YOUR LEGAL ISSUE</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Provide key details, court references, or questions you wish to discuss during the chamber visit..."
              placeholderTextColor="rgba(255, 220, 180, 0.35)"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Liquid Glass Submit Button */}
          <View style={styles.buttonWrapper}>
            <LiquidGlassButton
              title={submitting ? 'SENDING REQUEST...' : '⚡ SEND CONSULTATION REQUEST'}
              onPress={handleSubmit}
              disabled={submitting}
            />
          </View>
        </ScrollView>
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
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  lawyerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 170, 60, 0.3)',
    marginBottom: 20,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  cardGradient: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFEED6',
  },
  lawyerSpec: {
    fontSize: 12,
    color: '#FFB74D',
    fontWeight: '600',
    marginTop: 2,
  },
  lawyerCourt: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.65)',
    marginTop: 2,
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignSelf: 'flex-start',
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    marginVertical: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 11.5,
    color: 'rgba(255, 230, 200, 0.65)',
    fontWeight: '600',
  },
  feeValue: {
    fontSize: 12,
    color: '#FFA726',
    fontWeight: '800',
  },
  formSection: {
    gap: 10,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFB74D',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: 'rgba(25, 12, 5, 0.65)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFEED6',
    fontSize: 13,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  caseChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  caseChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.18)',
  },
  caseChipActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.25)',
    borderColor: '#FF9500',
  },
  caseChipText: {
    fontSize: 11.5,
    color: 'rgba(255, 235, 215, 0.7)',
    fontWeight: '600',
  },
  caseChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCard: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(25, 12, 5, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotCardActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.22)',
    borderColor: '#FF9500',
  },
  slotText: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.7)',
    fontWeight: '600',
  },
  slotTextActive: {
    color: '#FFEED6',
    fontWeight: '800',
  },
  buttonWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
});
