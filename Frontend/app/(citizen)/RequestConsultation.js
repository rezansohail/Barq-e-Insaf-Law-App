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
import { useMockStore, lawyers, activeCases, requestConsultation } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTranslation } from '../../utils/translationHelper';

export default function RequestConsultation() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, currentLang, translateCategory, translateDistrict, translateLawyerName } = useAppTranslation();
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

  const [selectedCaseId, setSelectedCaseId] = useState(params.caseId || (activeCases[0]?.id || ''));
  const [problemStatement, setProblemStatement] = useState('');
  const [caseSummary, setCaseSummary] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(
    lawyer.schedule && lawyer.schedule[0] ? lawyer.schedule[0].time : '10:00 AM - 01:00 PM'
  );
  const [submitting, setSubmitting] = useState(false);

  // If case is selected, prefill title and description
  useEffect(() => {
    if (selectedCaseId) {
      const c = activeCases.find((item) => String(item.id) === String(selectedCaseId));
      if (c) {
        if (!problemStatement) setProblemStatement(c.title);
        if (!caseSummary) setCaseSummary(c.description);
      }
    }
  }, [selectedCaseId]);

  const handleSubmit = async () => {
    if (!problemStatement.trim()) {
      const msg = currentLang === 'ur'
        ? 'براہ کرم قانونی معاملہ یا عنوان درج کریں۔'
        : currentLang === 'sd'
        ? 'مهرباني ڪري قانوني معاملو يا عنوان لکو.'
        : 'Please enter a clear legal problem or subject.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert(t('common.error', 'Required'), msg);
      return;
    }

    setSubmitting(true);
    try {
      await requestConsultation({
        lawyerId: lawyer.id,
        caseId: selectedCaseId || null,
        problemStatement: problemStatement.trim(),
        caseSummary: caseSummary.trim() || problemStatement.trim(),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      });

      const successMsg = currentLang === 'ur'
        ? `آپ کی قانونی مشاورت کی درخواست وکیل ${translateLawyerName(lawyer.name)} کو بھیج دی گئی ہے۔ وہ آپ کے کیس اور ثبوت کا جائزہ لیں گے۔`
        : currentLang === 'sd'
        ? `توهان جي قانوني صلاح جي درخواست وڪيل ${translateLawyerName(lawyer.name)} ڏانهن موڪلي وئي آهي. هو توهان جي ڪيس ۽ ثبوتن جو جائزو وٺندا.`
        : `Your consultation request and case details have been sent to ${lawyer.name}. They can now review your files.`;

      if (Platform.OS === 'web') {
        alert(successMsg);
        router.replace('/(citizen)/CitizenHome');
      } else {
        Alert.alert(t('common.success', 'Consultation Requested'), successMsg, [
          {
            text: 'OK',
            onPress: () => router.replace('/(citizen)/CitizenHome'),
          },
        ]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit consultation request.';
      Platform.OS === 'web' ? alert(errMsg) : Alert.alert(t('common.error', 'Error'), errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#080402" />

      {/* Header */}
      <AppHeader
        title={t('citizen.requestConsultation', 'Request Consultation')}
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
            <Text style={styles.lawyerName}>{translateLawyerName(lawyer.name)}</Text>
            <Text style={styles.lawyerSpec}>{translateCategory(lawyer.spec)}</Text>
            <Text style={styles.lawyerSbc}>
              {t('lawyer.licence', 'Licence:')} {lawyer.sbc || t('citizen.sbcVerified', 'SBC Approved')}
            </Text>
            <Text style={styles.lawyerDistrict}>
              {t('auth.district', 'District')}: {translateDistrict(lawyer.district || 'Karachi')}
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {t('consult.title', 'Consultation & Case Dossier')}
          </Text>

          {/* Option to attach an existing registered case */}
          {activeCases.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>
                {t('consult.selectCase', 'Attach Registered Case (Optional)')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                {activeCases.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.caseChip,
                      selectedCaseId === c.id && styles.caseChipActive,
                    ]}
                    onPress={() => setSelectedCaseId(c.id === selectedCaseId ? '' : c.id)}
                  >
                    <Text style={[styles.caseChipText, selectedCaseId === c.id && { color: '#0A0301', fontWeight: '800' }]}>
                      {c.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.label}>
            {t('case.titleLabel', 'Legal Matter / Subject *')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              currentLang === 'ur'
                ? 'مثلاً جائیداد کی حد بندی / چیک ڈس آنر'
                : currentLang === 'sd'
                ? 'مثال: زميني تڪرار / چيڪ بائونس'
                : 'e.g. Property Boundary Dispute / Cheque Dishonor'
            }
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={problemStatement}
            onChangeText={setProblemStatement}
          />

          <Text style={styles.label}>
            {t('case.descLabel', 'Case Background & Facts')}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={
              currentLang === 'ur'
                ? 'واقعے، تنازعہ کی تاریخ، ملوث فریقین اور مطلوبہ قانونی امداد بیان کریں...'
                : currentLang === 'sd'
                ? 'واقعي، تڪرار جي تاريخ، ڌرين ۽ گهربل قانوني مدد جا تفصيل لکو...'
                : 'Describe the incident, dispute history, parties involved, or urgent court relief needed...'
            }
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            numberOfLines={4}
            value={caseSummary}
            onChangeText={setCaseSummary}
          />

          <Text style={styles.label}>
            {t('consult.date', 'Preferred Meeting Date')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={selectedDate}
            onChangeText={setSelectedDate}
          />

          {/* Time Slot Selection from Lawyer's Real Office Hours */}
          <Text style={styles.label}>
            {t('consult.slot', 'Available Office Hours Slot')}
          </Text>
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
              <Text style={styles.submitBtnText}>
                {t('consult.sendBtn', 'Send Consultation Request')}
              </Text>
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
    backgroundColor: 'rgba(22, 11, 4, 0.94)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFEED6',
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 235, 215, 0.8)',
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 80, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  caseChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 80, 0.25)',
  },
  caseChipActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FFB74D',
  },
  caseChipText: {
    fontSize: 11,
    color: '#FFEED6',
    fontWeight: '600',
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  slotChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
  },
  slotChipActive: {
    borderColor: '#FF9100',
    backgroundColor: 'rgba(255, 145, 0, 0.2)',
  },
  slotChipDay: { fontSize: 10, color: '#FF9100', fontWeight: '700' },
  slotChipDayActive: { color: '#FFA726' },
  slotChipText: { fontSize: 11, color: '#E5E7EB', marginTop: 2, fontWeight: '500' },
  slotChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#E65100',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#FF9100',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
