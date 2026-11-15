import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  TextInput, 
  Modal, 
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  useMockStore, 
  timingSlots, 
  addTimingSlot, 
  deleteTimingSlot, 
  editTimingSlot, 
  fetchSchedule 
} from './MockStore';
import { getCurrentLawyerId } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PRESET_TIMES = [
  '10:00 AM - 01:00 PM',
  '02:00 PM - 05:00 PM',
  '03:00 PM - 06:00 PM',
  '11:00 AM - 02:00 PM',
  '09:00 AM - 12:00 PM',
  '05:00 PM - 08:00 PM',
];

export default function Schedule() {
  useMockStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentLawyerId = params.lawyerId || params.id || getCurrentLawyerId();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newDay, setNewDay] = useState('Monday');
  const [newTime, setNewTime] = useState('10:00 AM - 01:00 PM');
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  useEffect(() => {
    let isMounted = true;
    if (currentLawyerId) {
      setIsLoading(true);
      fetchSchedule(currentLawyerId)
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [currentLawyerId]);

  const handleOpenAddModal = () => {
    setNewDay('Monday');
    setNewTime('10:00 AM - 01:00 PM');
    setShowDayDropdown(false);
    setShowAddModal(true);
  };

  const handleAddSlot = async () => {
    const slotTime = (newTime || '').trim() || '10:00 AM - 01:00 PM';
    setIsSaving(true);
    try {
      await addTimingSlot(newDay, slotTime, currentLawyerId);
      setShowAddModal(false);
      setNewDay('Monday');
      setNewTime('10:00 AM - 01:00 PM');
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Time slot added and saved to database');
      }
    } catch (err) {
      console.error('Failed to add slot:', err);
      if (Platform.OS === 'web') {
        alert('Failed to save slot to database.');
      } else {
        Alert.alert('Error', 'Failed to save slot to database');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        ? window.confirm('Are you sure you want to delete this time slot from your schedule?')
        : true;
      if (confirmed) {
        setIsSaving(true);
        try {
          await deleteTimingSlot(id, currentLawyerId);
        } catch (err) {
          console.error('Failed to delete slot:', err);
          alert('Failed to delete slot from database.');
        } finally {
          setIsSaving(false);
        }
      }
      return;
    }

    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this time slot from your schedule?',
      [
        { 
          text: 'Yes, Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await deleteTimingSlot(id, currentLawyerId);
              Alert.alert('Deleted', 'Schedule slot removed');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete slot');
            } finally {
              setIsSaving(false);
            }
          } 
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setNewDay(slot.day || 'Monday');
    setNewTime(slot.time || '10:00 AM - 01:00 PM');
    setShowDayDropdown(false);
    setShowEditModal(true);
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;
    const slotTime = (newTime || '').trim() || editingSlot.time || '10:00 AM - 01:00 PM';
    setIsSaving(true);
    try {
      await editTimingSlot(editingSlot.id, newDay, slotTime, currentLawyerId);
      setShowEditModal(false);
      setEditingSlot(null);
      setNewDay('Monday');
      setNewTime('10:00 AM - 01:00 PM');
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Time slot updated and saved to database');
      }
    } catch (err) {
      console.error('Failed to update slot:', err);
      if (Platform.OS === 'web') {
        alert('Failed to update slot in database.');
      } else {
        Alert.alert('Error', 'Failed to update slot in database');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNav = (lbl) => {
    if (lbl === 'home') router.push('/(lawyer)/LawyerHome');
    if (lbl === 'requests') router.push('/(lawyer)/CaseRequests');
    if (lbl === 'cases') router.push('/(lawyer)/MyCases');
    if (lbl === 'schedule') router.push('/(lawyer)/Schedule');
    if (lbl === 'profile') router.push('/(lawyer)/LawyerProfile');
  };

  const { theme, isDarkMode } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={theme.bg} />
      
      {/* Top Header */}
      <AppHeader
        title={`Schedule (${timingSlots.length})`}
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
        rightElement={
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add Slot</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Chamber Consultation Hours</Text>
        <Text style={[styles.sectionSub, !isDarkMode && { color: theme.textSecondary }]}>
          Set your available consultation hours for verified citizen appointments
        </Text>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={[styles.loadingText, !isDarkMode && { color: theme.textSecondary }]}>Loading schedule...</Text>
          </View>
        ) : timingSlots.length > 0 ? (
          timingSlots.map((slot, i) => (
            <View key={slot.id || i} style={[styles.card, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dayText, !isDarkMode && { color: theme.textPrimary }]}>{slot.day}</Text>
                  <Text style={[styles.timeText, !isDarkMode && { color: theme.textSecondary }]}>{slot.time}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.editBtn} 
                    onPress={() => handleEditSlot(slot)}
                    disabled={isSaving}
                  >
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={() => handleDeleteSlot(slot.id)}
                    disabled={isSaving}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, !isDarkMode && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.emptyText, !isDarkMode && { color: theme.textPrimary }]}>No consultation slots added yet</Text>
            <Text style={[styles.emptySub, !isDarkMode && { color: theme.textSecondary }]}>Tap + Add Slot to set your available hours</Text>
          </View>
        )}
      </ScrollView>

      {/* ADD MODAL */}
      <Modal
        transparent={true}
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Time Slot</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayChipsRow}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity 
                  key={day}
                  style={[styles.dayChip, newDay === day && styles.dayChipActive]}
                  onPress={() => setNewDay(day)}
                >
                  <Text style={[styles.dayChipText, newDay === day && styles.dayChipTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Quick Time Presets</Text>
            <View style={styles.presetChipsWrap}>
              {PRESET_TIMES.map((pt) => (
                <TouchableOpacity
                  key={pt}
                  style={[styles.presetChip, newTime === pt && styles.presetChipActive]}
                  onPress={() => setNewTime(pt)}
                >
                  <Text style={[styles.presetChipText, newTime === pt && styles.presetChipTextActive]}>
                    {pt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Time Interval</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 10:00 AM - 01:00 PM"
              placeholderTextColor="#999"
              value={newTime}
              onChangeText={setNewTime}
            />

            <TouchableOpacity 
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
              onPress={handleAddSlot}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Add Slot</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        transparent={true}
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Time Slot</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayChipsRow}>
              {daysOfWeek.map((day) => (
                <TouchableOpacity 
                  key={day}
                  style={[styles.dayChip, newDay === day && styles.dayChipActive]}
                  onPress={() => setNewDay(day)}
                >
                  <Text style={[styles.dayChipText, newDay === day && styles.dayChipTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Quick Time Presets</Text>
            <View style={styles.presetChipsWrap}>
              {PRESET_TIMES.map((pt) => (
                <TouchableOpacity
                  key={pt}
                  style={[styles.presetChip, newTime === pt && styles.presetChipActive]}
                  onPress={() => setNewTime(pt)}
                >
                  <Text style={[styles.presetChipText, newTime === pt && styles.presetChipTextActive]}>
                    {pt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Time Interval</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 02:00 PM - 05:00 PM"
              placeholderTextColor="#999"
              value={newTime}
              onChangeText={setNewTime}
            />

            <TouchableOpacity 
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
              onPress={handleUpdateSlot}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Update Slot</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Unified Bottom Navigation */}
      <BottomNavBar role="lawyer" activeTab="schedule" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080402' },
  addBtn: {
    backgroundColor: 'rgba(255, 149, 0, 0.18)',
    borderWidth: 1.2,
    borderColor: '#FF9500',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFB74D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 110, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FF9500', letterSpacing: -0.2 },
  sectionSub: { fontSize: 12, color: 'rgba(255, 230, 205, 0.75)', marginBottom: 4, lineHeight: 17 },
  loadingWrap: { padding: 40, alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: 'rgba(255, 220, 180, 0.7)' },
  card: {
    backgroundColor: 'rgba(38, 20, 10, 0.94)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.25)',
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayText: { fontSize: 15.5, fontWeight: '800', color: '#FFFFFF' },
  timeText: { fontSize: 13, color: '#FFEED6', marginTop: 4, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editBtnText: { color: '#FFB74D', fontSize: 11, fontWeight: '800' },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deleteBtnText: { color: '#F87171', fontSize: 11, fontWeight: '800' },
  emptyCard: {
    backgroundColor: 'rgba(38, 20, 10, 0.85)',
    borderRadius: 16,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.22)',
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, color: '#FFFFFF', fontWeight: '800' },
  emptySub: { fontSize: 12, color: 'rgba(255, 230, 205, 0.7)', marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#170905',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.35)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalClose: { fontSize: 24, color: '#FF9500', fontWeight: '600' },
  modalLabel: { fontSize: 11, fontWeight: '800', color: '#FF9500', textTransform: 'uppercase', marginBottom: 6, marginTop: 12, letterSpacing: 0.8 },
  dayChipsRow: { flexDirection: 'row', marginBottom: 4 },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.25)',
    marginRight: 6,
  },
  dayChipActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 230, 205, 0.85)',
  },
  dayChipTextActive: {
    color: '#080402',
    fontWeight: '900',
  },
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.25)',
  },
  presetChipActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  presetChipText: {
    fontSize: 11,
    color: 'rgba(255, 230, 205, 0.85)',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#080402',
    fontWeight: '900',
  },
  modalInput: {
    backgroundColor: 'rgba(10, 4, 1, 0.95)',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.3)',
  },
  saveBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});
