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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2744" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>BI</Text>
          </View>
          <Text style={styles.headerTitle}>My Schedule ({timingSlots.length})</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Office Hours</Text>
        <Text style={styles.sectionSub}>Set your available consultation hours for citizens</Text>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#0F2744" />
            <Text style={styles.loadingText}>Loading schedule...</Text>
          </View>
        ) : timingSlots.length > 0 ? (
          timingSlots.map((slot, i) => (
            <View key={slot.id || i} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayText}>{slot.day}</Text>
                  <Text style={styles.timeText}>⏰ {slot.time}</Text>
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
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No time slots added yet</Text>
            <Text style={styles.emptySub}>Tap + Add to set your available hours</Text>
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

      {/* FOOTER */}
      <View style={styles.bottomNav}>
        {['Dashboard', 'Requests', 'Cases', 'Schedule', 'Profile'].map((lbl, idx) => {
          const ids = ['home', 'requests', 'cases', 'schedule', 'profile'];
          return (
            <TouchableOpacity
              key={lbl}
              style={styles.navItem}
              onPress={() => handleNav(ids[idx])}
            >
              <Text style={[styles.navLabel, ids[idx] === 'schedule' && styles.navLabelActive]}>{lbl}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F2744' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#0F2744',
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#fff', fontSize: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 8 },
  logoBadge: {
    backgroundColor: '#fff', width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  logoBadgeText: { color: '#0F2744', fontSize: 14, fontWeight: '800' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  addBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#0F2744',
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: { flex: 1, backgroundColor: '#F5F3EF' },
  content: { padding: 20, paddingBottom: 100, gap: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F2744' },
  sectionSub: { fontSize: 12, color: '#888', marginBottom: 4 },
  loadingWrap: { padding: 40, alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#ece9e4', elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  timeText: { fontSize: 13, color: '#666', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: {
    backgroundColor: '#e0ebf5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editBtnText: { color: '#0F2744', fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deleteBtnText: { color: '#991b1b', fontSize: 11, fontWeight: '700' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    borderWidth: 1,
    borderColor: '#ece9e4',
    alignItems: 'center',
  },
  emptyText: { fontSize: 16, color: '#666', fontWeight: '600' },
  emptySub: { fontSize: 13, color: '#999', marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  modalClose: { fontSize: 28, color: '#666', fontWeight: '300' },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  dayChipsRow: { flexDirection: 'row', marginBottom: 4 },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
    marginRight: 6,
  },
  dayChipActive: {
    backgroundColor: '#0F2744',
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  dayChipTextActive: {
    color: '#fff',
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
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  presetChipActive: {
    backgroundColor: '#0F2744',
    borderColor: '#0F2744',
  },
  presetChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveBtn: {
    backgroundColor: '#0F2744',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ece9e4',
    flexDirection: 'row',
    height: 80,
    paddingBottom: 24,
    paddingTop: 10,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 11, fontWeight: '600', color: '#bbb' },
  navLabelActive: { color: '#0F2744' },
});
