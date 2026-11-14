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
import { useMockStore, lawyers, requestConsultation, userData } from './MockStore';

export default function RequestConsultation() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetLawyerId = params.lawyerId;

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
        Alert.alert('Request Submitted! ⚡', successMsg, [
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
      <StatusBar barStyle="light-content" backgroundColor="#5C1A1A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Consultation</Text>
        <View style={{ width: 40 }} />
      </View>

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
            <Text style={styles.lawyerDistrict}>📍 {lawyer.district || 'Sindh Jurisdiction'}</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Consultation Details</Text>

          <Text style={styles.label}>Legal Matter / Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Property Boundary Dispute / Cheque Dishonor"
            placeholderTextColor="#999"
            value={problemStatement}
            onChangeText={setProblemStatement}
          />

          <Text style={styles.label}>Case Background & Facts</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the incident, dispute history, parties involved, or urgent court relief needed..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={caseSummary}
            onChangeText={setCaseSummary}
          />

          <Text style={styles.label}>Preferred Meeting Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              <Text style={styles.submitBtnText}>Send Consultation Request ⚡</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#5C1A1A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#5C1A1A',
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  backText: { color: '#FFEED6', fontSize: 14, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 60, backgroundColor: '#F8F6F2', minHeight: '100%' },
  lawyerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ece9e4',
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F2744',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  lawyerInfo: { flex: 1 },
  lawyerName: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  lawyerSpec: { fontSize: 13, color: '#666', marginTop: 2 },
  lawyerSbc: { fontSize: 11, color: '#0F2744', fontWeight: '700', marginTop: 3 },
  lawyerDistrict: { fontSize: 11, color: '#888', marginTop: 2 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ece9e4',
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#5C1A1A', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#555', textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  slotChipActive: { backgroundColor: '#5C1A1A', borderColor: '#5C1A1A' },
  slotChipDay: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  slotChipDayActive: { color: '#FFEED6' },
  slotChipText: { fontSize: 11, color: '#334155', marginTop: 2 },
  slotChipTextActive: { color: '#fff', fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#5C1A1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
