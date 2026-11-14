import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMockStore, lawyers, requestConsultation } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function RequestConsultation() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetLawyerId = params.lawyerId;
  useAppNavigation({ isHome: false, homeRoute: '/(citizen)/CitizenHome' });

  const lawyer = lawyers.find((l) => String(l.id) === String(targetLawyerId)) || {
    id: targetLawyerId,
    name: 'Verified Advocate',
    spec: 'Legal Consultation',
    sbc: 'SBC Verified',
    schedule: [],
    district: 'Sindh',
  };

  const [problemStatement, setProblemStatement] = useState('');
  const [caseSummary, setCaseSummary] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(
    lawyer.schedule && lawyer.schedule[0] ? lawyer.schedule[0].time : '10:00 AM - 01:00 PM'
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!problemStatement.trim()) {
      const msg = 'Please enter a clear legal problem or subject.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Required', msg);
      return;
    }

    setSubmitting(true);
    try {
      await requestConsultation({
        lawyerId: lawyer.id,
        problemStatement: problemStatement.trim(),
        caseSummary: caseSummary.trim() || problemStatement.trim(),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      });

      const successMsg = `Your consultation request has been sent to ${lawyer.name}. You will be notified once they review your case.`;
      if (Platform.OS === 'web') {
        alert(successMsg);
        router.replace('/(citizen)/CitizenHome');
      } else {
        Alert.alert('Consultation Requested', successMsg, [
          {
            text: 'OK',
            onPress: () => router.replace('/(citizen)/CitizenHome'),
          },
        ]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit consultation request.';
      Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#080402" />

      {/* Header */}
      <AppHeader 
        title="Request Consultation" 
        showBack={true} 
        homeRoute="/(citizen)/CitizenHome"
        role="citizen"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Lawyer Summary Card */}
        <View style={styles.lawyerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{lawyer.initials || 'L'}</Text>
          </View>
          <View style={styles.lawyerInfo}>
            <Text style={styles.lawyerName}>{lawyer.name}</Text>
            <Text style={styles.lawyerSpec}>{lawyer.spec}</Text>
            <Text style={styles.lawyerSbc}>Licence: {lawyer.sbc || 'SBC Approved'}</Text>
            <Text style={styles.lawyerDistrict}>Chamber District: {lawyer.district || 'Sindh Jurisdiction'}</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Consultation Details</Text>

          <Text style={styles.label}>Legal Matter / Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Property Boundary Dispute / Cheque Dishonor"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={problemStatement}
            onChangeText={setProblemStatement}
          />

          <Text style={styles.label}>Case Background & Facts</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the incident, dispute history, parties involved, or urgent court relief needed..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            numberOfLines={4}
            value={caseSummary}
            onChangeText={setCaseSummary}
          />

          <Text style={styles.label}>Preferred Meeting Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={selectedDate}
            onChangeText={setSelectedDate}
          />

          {/* Time Slot Selection from Lawyer's Real Office Hours */}
          <Text style={styles.label}>Available Office Hours Slot</Text>
          {Array.isArray(lawyer.schedule) && lawyer.schedule.length > 0 ? (
            <View style={styles.slotsRow}>
              {lawyer.schedule.map((slot, idx) => (
                <TouchableOpacity
                  key={slot.id || idx}
                  style={[styles.slotChip, selectedTime === slot.time && styles.slotChipActive]}
                  onPress={() => setSelectedTime(slot.time)}
                >
                  <Text style={[styles.slotChipDay, selectedTime === slot.time && styles.slotChipDayActive]}>
                    {slot.day}
                  </Text>
                  <Text style={[styles.slotChipText, selectedTime === slot.time && styles.slotChipTextActive]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="e.g. 10:00 AM - 01:00 PM"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={selectedTime}
              onChangeText={setSelectedTime}
            />
          )}

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Send Consultation Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Shared bottom navigation */}
      <BottomNavBar role="citizen" activeTab="lawyers" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080402' },
  scrollContent: { padding: 16, paddingBottom: 110, backgroundColor: '#080402' },
  lawyerCard: {
    backgroundColor: 'rgba(32, 16, 7, 0.94)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.35)',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF9100',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  lawyerInfo: { flex: 1 },
  lawyerName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  lawyerSpec: { fontSize: 13, color: '#FFB74D', marginTop: 2, fontWeight: '600' },
  lawyerSbc: { fontSize: 11, color: '#FF9100', fontWeight: '700', marginTop: 3 },
  lawyerDistrict: { fontSize: 11, color: 'rgba(255, 235, 215, 0.65)', marginTop: 2 },
  formCard: {
    backgroundColor: 'rgba(32, 16, 7, 0.94)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.35)',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFB74D', marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: '#FFB74D', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: 'rgba(20, 9, 4, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.35)',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 9, 4, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.3)',
  },
  slotChipActive: { backgroundColor: '#FF7A00', borderColor: '#FF9100' },
  slotChipDay: { fontSize: 11, fontWeight: '700', color: '#FFB74D' },
  slotChipDayActive: { color: '#FFFFFF' },
  slotChipText: { fontSize: 11, color: 'rgba(255, 235, 215, 0.8)', marginTop: 2 },
  slotChipTextActive: { color: '#fff', fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
