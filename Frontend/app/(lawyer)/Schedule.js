import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  TextInput, 
  Modal, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMockStore, timingSlots, addTimingSlot, deleteTimingSlot, editTimingSlot } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Schedule() {
  useMockStore();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newDay, setNewDay] = useState('Monday');
  const [newTime, setNewTime] = useState('');
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  const handleAddSlot = () => {
    if (!newTime.trim()) {
      Alert.alert('Error', 'Please enter consultation time (e.g. 10:00 AM - 01:00 PM)');
      return;
    }
    addTimingSlot(newDay, newTime.trim());
    setNewDay('Monday');
    setNewTime('');
    setShowAddModal(false);
    Alert.alert('Success', 'Office hours updated successfully');
  };

  const handleDeleteSlot = (id) => {
    Alert.alert(
      'Remove Slot',
      'Are you sure you want to remove this availability window?',
      [
        { text: 'Yes, Remove', style: 'destructive', onPress: () => deleteTimingSlot(id) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setNewDay(slot.day);
    setNewTime(slot.time);
    setShowEditModal(true);
  };

  const handleUpdateSlot = () => {
    if (!newTime.trim()) {
      Alert.alert('Error', 'Please enter a valid time window');
      return;
    }
    editTimingSlot(editingSlot.id, newDay, newTime.trim());
    setShowEditModal(false);
    setEditingSlot(null);
    setNewDay('Monday');
    setNewTime('');
    Alert.alert('Success', 'Availability window updated');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      {/* Modern '< Chamber Schedule' Header with + Add button on right */}
      <AppHeader
        title="Chamber Schedule"
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
        rightElement={
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ ADD</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Chamber Office Hours</Text>
        <Text style={styles.sectionSub}>Set your weekly availability for citizen consultations</Text>

        {timingSlots.length > 0 ? (
          timingSlots.map((slot, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.dayText}>{slot.day}</Text>
                  <Text style={styles.timeText}>⏰ {slot.time}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.editBtn} 
                    onPress={() => handleEditSlot(slot)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={() => handleDeleteSlot(slot.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No availability slots configured</Text>
            <Text style={styles.emptySub}>Tap "+ ADD" above to publish chamber consultation hours</Text>
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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Office Hours</Text>

            <Text style={styles.inputLabel}>Select Day</Text>
            <TouchableOpacity 
              style={styles.dropdownBtn}
              onPress={() => setShowDayDropdown(!showDayDropdown)}
              activeOpacity={0.75}
            >
              <Text style={styles.dropdownBtnText}>{newDay}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {showDayDropdown && (
              <View style={styles.dropdownList}>
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setNewDay(day);
                      setShowDayDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>Consultation Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10:00 AM - 01:00 PM"
              placeholderTextColor="rgba(255, 220, 180, 0.35)"
              value={newTime}
              onChangeText={setNewTime}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleAddSlot}
              >
                <Text style={styles.saveBtnText}>Save Slot</Text>
              </TouchableOpacity>
            </View>
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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Consultation Hours</Text>

            <Text style={styles.inputLabel}>Day of Week</Text>
            <View style={styles.uneditableBox}>
              <Text style={styles.uneditableText}>{newDay}</Text>
            </View>

            <Text style={styles.inputLabel}>Time Window</Text>
            <TextInput
              style={styles.input}
              value={newTime}
              onChangeText={setNewTime}
              placeholderTextColor="rgba(255, 220, 180, 0.35)"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleUpdateSlot}
              >
                <Text style={styles.saveBtnText}>Update Slot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="lawyer" activeTab="schedule" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060201' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110, gap: 12 },
  addBtn: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: {
    color: '#0A0301',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFF5E8' },
  sectionSub: { fontSize: 12, color: 'rgba(255, 220, 180, 0.6)', marginBottom: 6 },
  card: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayText: { fontSize: 15, fontWeight: '800', color: '#FFF5E8' },
  timeText: { fontSize: 13, color: '#FFB74D', marginTop: 4, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 120, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: { color: '#FFEED6', fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtnText: { color: '#ef4444', fontSize: 11, fontWeight: '700' },
  emptyCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.65)',
    borderRadius: 16,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.18)',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: { fontSize: 14, fontWeight: '700', color: '#FFF5E8', marginBottom: 4 },
  emptySub: { fontSize: 12, color: 'rgba(255, 220, 180, 0.5)', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0E0603',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#FFF5E8', marginBottom: 16, textAlign: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#FFB74D', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  dropdownBtn: {
    backgroundColor: 'rgba(25, 12, 5, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownBtnText: { color: '#FFF5E8', fontSize: 14, fontWeight: '600' },
  dropdownArrow: { color: '#FF9500', fontSize: 10 },
  dropdownList: {
    backgroundColor: '#140803',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.3)',
    marginBottom: 14,
    maxHeight: 180,
    overflow: 'hidden',
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.06)' },
  dropdownItemText: { color: '#FFF5E8', fontSize: 13 },
  input: {
    backgroundColor: 'rgba(25, 12, 5, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
    padding: 12,
    color: '#FFF5E8',
    fontSize: 14,
    marginBottom: 16,
  },
  uneditableBox: {
    backgroundColor: 'rgba(15, 7, 3, 0.65)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.15)',
    padding: 12,
    marginBottom: 16,
  },
  uneditableText: { color: '#C8A892', fontSize: 14, fontWeight: '600' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 120, 0.25)',
  },
  cancelBtnText: { color: '#FFE5C4', fontSize: 13, fontWeight: '700' },
  saveBtn: {
    flex: 1,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#0A0301', fontSize: 13, fontWeight: '900' },
});
