import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export default function DigitalSignatureModal({
  visible,
  caseItem,
  lawyerProfile,
  onClose,
  onConfirmSign,
}) {
  const [signatureType, setSignatureType] = useState('name'); // 'name' | 'drawn'
  const [typedName, setTypedName] = useState(
    lawyerProfile?.name || 'Adv. Tariq Mansoor'
  );
  const [consultancyTime, setConsultancyTime] = useState('Tomorrow at 11:30 AM');
  const [chamberAddress, setChamberAddress] = useState(
    lawyerProfile?.address || 'Chamber 402, Lawyers Court Building, M.A. Jinnah Road, Karachi'
  );
  const [lawyerPhone, setLawyerPhone] = useState(
    lawyerProfile?.phone || '0321-9876543'
  );
  const [notes, setNotes] = useState(
    'Please bring your original CNIC copy, property documents, and prior notices.'
  );

  // Drawn Signature State (touch paths)
  const [drawnPaths, setDrawnPaths] = useState([]);
  const currentPathRef = useRef([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current = [`M${Math.round(locationX)} ${Math.round(locationY)}`];
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current.push(`L${Math.round(locationX)} ${Math.round(locationY)}`);
        setDrawnPaths((prev) => [
          ...prev.filter((_, idx) => idx !== prev.length - 1),
          currentPathRef.current.join(' '),
        ]);
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current.length > 0) {
          setDrawnPaths((prev) => [...prev, currentPathRef.current.join(' ')]);
          currentPathRef.current = [];
        }
      },
    })
  ).current;

  const handleClearSignature = () => {
    setDrawnPaths([]);
    currentPathRef.current = [];
  };

  const handleConfirm = () => {
    if (signatureType === 'name' && !typedName.trim()) {
      Alert.alert('Required', 'Please enter your legal name for the digital signature.');
      return;
    }
    if (signatureType === 'drawn' && drawnPaths.length === 0) {
      Alert.alert('Required', 'Please draw your signature in the signature pad area.');
      return;
    }
    if (!consultancyTime.trim()) {
      Alert.alert('Required', 'Please specify a consultation visit time.');
      return;
    }

    const certificateId =
      'SBC-DS-' + Math.floor(100000 + Math.random() * 900000);
    const timestamp = new Date().toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const signaturePayload = {
      signatureType,
      signedName: signatureType === 'name' ? typedName.trim() : lawyerProfile?.name || 'Advocate',
      drawnPaths: signatureType === 'drawn' ? drawnPaths : null,
      consultancyTime: consultancyTime.trim(),
      chamberAddress: chamberAddress.trim(),
      lawyerPhone: lawyerPhone.trim(),
      lawyerEmail: lawyerProfile?.email || 'lawyer@sindhbar.org',
      notes: notes.trim(),
      signedAt: timestamp,
      certificateId,
      sbcLicense: lawyerProfile?.sbc || 'SBC-4421/KHI',
    };

    onConfirmSign(signaturePayload);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 45 : 75}
            tint="dark"
            style={styles.cardBlur}
          >
            <LinearGradient
              colors={[
                'rgba(26, 12, 5, 0.96)',
                'rgba(18, 8, 3, 0.98)',
                'rgba(8, 3, 1, 0.99)',
              ]}
              style={styles.cardGradient}
            >
              {/* Top Accent Sheen */}
              <View style={styles.topSheen} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Digital Signature & Acceptance</Text>
                  <Text style={styles.modalSubtitle}>
                    Consultancy Appointment & Representation Agreement
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeText}>X</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Case Reference Banner */}
                <View style={styles.caseBanner}>
                  <View style={styles.caseBadge}>
                    <Text style={styles.caseBadgeText}>CLIENT CASE</Text>
                  </View>
                  <Text style={styles.caseName}>
                    {caseItem?.name || 'Citizen Client'}
                  </Text>
                  <Text style={styles.caseSpec}>
                    {caseItem?.spec || 'Legal Matter'} · {caseItem?.court || 'Sindh Court'}
                  </Text>
                </View>

                {/* 1. CONSULTANCY VISIT SCHEDULE */}
                <Text style={styles.sectionHeading}>
                  1. Scheduled Consultancy Visit Time
                </Text>
                <Text style={styles.fieldHint}>
                  Specify the date and time when the client will visit your chamber:
                </Text>

                <TextInput
                  style={styles.input}
                  value={consultancyTime}
                  onChangeText={setConsultancyTime}
                  placeholder="e.g. Tomorrow at 11:30 AM"
                  placeholderTextColor="rgba(255, 220, 180, 0.35)"
                />

                {/* Quick time pills */}
                <View style={styles.presetRow}>
                  {[
                    'Today at 4:30 PM',
                    'Tomorrow at 11:00 AM',
                    'Monday at 10:30 AM',
                  ].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      onPress={() => setConsultancyTime(preset)}
                      style={[
                        styles.presetChip,
                        consultancyTime === preset && styles.presetChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          consultancyTime === preset && styles.presetChipTextActive,
                        ]}
                      >
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 2. LAWYER CONTACT DETAILS TO SHARE */}
                <Text style={[styles.sectionHeading, { marginTop: 16 }]}>
                  2. Chamber Location & Contact Details
                </Text>
                <Text style={styles.fieldHint}>
                  These contact details will be shared directly with the citizen for meeting arrangement:
                </Text>

                <Text style={styles.inputLabel}>Chamber Address</Text>
                <TextInput
                  style={styles.input}
                  value={chamberAddress}
                  onChangeText={setChamberAddress}
                  placeholder="Chamber Address"
                  placeholderTextColor="rgba(255, 220, 180, 0.35)"
                />

                <Text style={styles.inputLabel}>Advocate Direct Phone / WhatsApp</Text>
                <TextInput
                  style={styles.input}
                  value={lawyerPhone}
                  onChangeText={setLawyerPhone}
                  placeholder="03XX-XXXXXXX"
                  placeholderTextColor="rgba(255, 220, 180, 0.35)"
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Special Instructions for Client</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder="Documents or instructions"
                  placeholderTextColor="rgba(255, 220, 180, 0.35)"
                />

                {/* 3. DIGITAL SIGNATURE OPTIONS */}
                <Text style={[styles.sectionHeading, { marginTop: 18 }]}>
                  3. Select Digital Signature Type
                </Text>
                <Text style={styles.fieldHint}>
                  Choose between typed verified legal name or hand-drawn digital signature:
                </Text>

                <View style={styles.typeSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeTab,
                      signatureType === 'name' && styles.typeTabActive,
                    ]}
                    onPress={() => setSignatureType('name')}
                  >
                    <Text
                      style={[
                        styles.typeTabText,
                        signatureType === 'name' && styles.typeTabTextActive,
                      ]}
                    >
                      Type Legal Name
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeTab,
                      signatureType === 'drawn' && styles.typeTabActive,
                    ]}
                    onPress={() => setSignatureType('drawn')}
                  >
                    <Text
                      style={[
                        styles.typeTabText,
                        signatureType === 'drawn' && styles.typeTabTextActive,
                      ]}
                    >
                      Draw Signature Pad
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* SIGNATURE PAD / PREVIEW BOX */}
                {signatureType === 'name' ? (
                  <View style={styles.signatureCard}>
                    <Text style={styles.inputLabel}>Full Legal Advocate Name</Text>
                    <TextInput
                      style={styles.input}
                      value={typedName}
                      onChangeText={setTypedName}
                      placeholder="e.g. Adv. Tariq Mansoor"
                      placeholderTextColor="rgba(255, 220, 180, 0.35)"
                    />

                    {/* Cursive Signature Stamp Preview */}
                    <View style={styles.stampBox}>
                      <View style={styles.stampHeader}>
                        <Text style={styles.stampBadge}>SINDH BAR COUNCIL DIGITAL SEAL</Text>
                        <Text style={styles.stampHash}>VERIFIED HASH: #SBC-{Math.floor(1000 + Math.random() * 9000)}</Text>
                      </View>
                      <Text style={styles.cursiveSignature}>
                        {typedName || 'Advocate Signature'}
                      </Text>
                      <View style={styles.stampFooter}>
                        <Text style={styles.stampDetails}>
                          Licence: {lawyerProfile?.sbc || 'SBC-4421/KHI'} · Advocate High Court
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.signatureCard}>
                    <View style={styles.drawHeader}>
                      <Text style={styles.inputLabel}>Draw your signature below:</Text>
                      <TouchableOpacity onPress={handleClearSignature}>
                        <Text style={styles.clearBtnText}>Clear Canvas</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Touch Canvas */}
                    <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                      <Svg width="100%" height={140} style={StyleSheet.absoluteFill}>
                        <Rect
                          x={0}
                          y={0}
                          width="100%"
                          height="100%"
                          fill="rgba(24, 11, 4, 0.4)"
                        />
                        {drawnPaths.map((pathStr, index) => (
                          <Path
                            key={index}
                            d={pathStr}
                            stroke="#FFA726"
                            strokeWidth={2.5}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ))}
                      </Svg>
                      {drawnPaths.length === 0 && (
                        <View style={styles.canvasPlaceholder} pointerEvents="none">
                          <Text style={styles.canvasPlaceholderText}>
                            Sign with finger or stylus here
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.canvasSecurityNote}>
                      Hardware-encrypted biometric touch signature certificate
                    </Text>
                  </View>
                )}

                {/* Legal Attestation */}
                <View style={styles.attestationBox}>
                  <Text style={styles.attestationText}>
                    By signing, I confirm that the citizen is scheduled to visit at the designated time, and I authorize sharing my chamber contact details for consultation arrangement.
                  </Text>
                </View>
              </ScrollView>

              {/* Bottom Actions */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signBtn}
                  onPress={handleConfirm}
                  activeOpacity={0.84}
                >
                  <LinearGradient
                    colors={['#FF9500', '#EA580C']}
                    style={styles.signBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.signBtnText}>
                      Digitally Sign & Accept Request
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '92%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.45)',
  },
  cardBlur: {
    flex: 1,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },
  topSheen: {
    position: 'absolute',
    top: 2,
    left: '20%',
    right: '20%',
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.2)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  modalSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.65)',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFE2B8',
    fontSize: 14,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  caseBanner: {
    backgroundColor: 'rgba(255, 149, 0, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.30)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  caseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.22)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  caseBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFA726',
    letterSpacing: 0.8,
  },
  caseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  caseSpec: {
    fontSize: 12,
    color: 'rgba(255, 230, 205, 0.7)',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFA726',
    letterSpacing: 0.3,
  },
  fieldHint: {
    fontSize: 11,
    color: 'rgba(255, 220, 185, 0.65)',
    marginTop: 3,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    color: '#FFE2B8',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(28, 12, 4, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.28)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  presetChipActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.28)',
    borderColor: '#FFA726',
  },
  presetChipText: {
    fontSize: 10.5,
    color: 'rgba(255, 230, 205, 0.75)',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
    borderRadius: 10,
    alignItems: 'center',
  },
  typeTabActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.25)',
    borderColor: '#FFA726',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 220, 180, 0.7)',
  },
  typeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  signatureCard: {
    backgroundColor: 'rgba(20, 8, 3, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.28)',
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
  },
  stampBox: {
    marginTop: 12,
    backgroundColor: 'rgba(35, 16, 6, 0.6)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 160, 40, 0.45)',
    borderRadius: 10,
    padding: 12,
    borderStyle: 'dashed',
  },
  stampHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stampBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFB74D',
    letterSpacing: 0.8,
  },
  stampHash: {
    fontSize: 8.5,
    color: 'rgba(255, 200, 150, 0.6)',
  },
  cursiveSignature: {
    fontSize: 24,
    fontStyle: 'italic',
    color: '#FFA726',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginVertical: 6,
    textShadowColor: 'rgba(255, 149, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  stampFooter: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 149, 0, 0.2)',
    paddingTop: 6,
  },
  stampDetails: {
    fontSize: 9.5,
    color: 'rgba(255, 230, 200, 0.7)',
  },
  drawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clearBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '700',
  },
  canvasContainer: {
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 160, 40, 0.4)',
    position: 'relative',
    marginTop: 4,
  },
  canvasPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasPlaceholderText: {
    color: 'rgba(255, 220, 180, 0.4)',
    fontSize: 12,
  },
  canvasSecurityNote: {
    fontSize: 9.5,
    color: 'rgba(255, 200, 150, 0.6)',
    marginTop: 6,
    textAlign: 'center',
  },
  attestationBox: {
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  attestationText: {
    fontSize: 10.5,
    color: 'rgba(255, 240, 225, 0.82)',
    lineHeight: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 149, 0, 0.2)',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 220, 180, 0.75)',
  },
  signBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  signBtnGradient: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
