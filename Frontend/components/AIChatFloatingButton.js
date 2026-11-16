import React, { useState, useRef } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AIChatFloatingButton() {
  const pathname = usePathname();

  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'السلام علیکم! I am your Barq-e-Insaf AI Legal Assistant. Ask me any Pakistan legal law question in Urdu, Sindhi, or English!',
    },
  ]);

  // DRAGGABLE PAN RESPONDER
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 84, y: SCREEN_HEIGHT - 170 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // Hide floating button on splash & startup screens
  const hiddenRoutes = ['/', '/SplashScreen', '/StartScreen', '/OnboardingScreen'];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const sendMessage = async () => {
    if (inputText.trim() === '' || loading) return;

    const userQuery = inputText.trim();
    const userMsg = { id: Date.now().toString(), sender: 'user', text: userQuery };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Automatically detect the laptop's IP address so it works on any Wi-Fi!
      const laptopIp = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
      
      const response = await fetch(`http://${laptopIp}:5001/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery, model: 'llama-3.3-70b-versatile', temperature: 0.3 }),
      });

      const data = await response.json();
      const aiResponseText = data.response || data.answer || 'Thank you for your legal query. For formal court filings, connect with a verified advocate on Barq-e-Insaf.';

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText, sources: data.sources }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Connecting to Barq-e-Insaf AI server... Please ensure run_chatbot.bat is running locally.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Draggable Floating Button */}
      <Animated.View
        style={[styles.draggableFab, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.fabBtn} activeOpacity={0.88} onPress={() => setModalVisible(true)}>
          <LinearGradient
            colors={['#161726', '#0F1018', '#1A0E06']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Inner Electric Blue Rim Halo to match Chatbot interior */}
            <View style={styles.blueRimHalo} pointerEvents="none" />

            {/* Inner Glow Circle with Chatbot Blue & Orange Legal Lightning */}
            <View style={styles.glowCircle}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  fill="#FFA726"
                  stroke="#FF9500"
                  strokeWidth={1.2}
                />
              </Svg>
            </View>

            {/* Bottom AI Legal Tag Pill in Black & Orange with Subtle Blue Border */}
            <View style={styles.aiTagPill}>
              <View style={styles.aiBlueDot} />
              <Text style={styles.aiTagText}>AI LEGAL</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* POPUP AI CHAT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SafeAreaView style={styles.modalCard}>
            
            {/* Header Bar */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <View style={styles.headerBadge}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFD700" />
                  </Svg>
                </View>
                <View>
                  <Text style={styles.headerTitle}>Barq-e-Insaf AI Assistant</Text>
                  <Text style={styles.headerSub}>Pakistan Penal Code & Legal Guidance</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtnText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
              {messages.map((msg) => (
                <View key={msg.id} style={[styles.msgBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.msgText, msg.sender === 'user' ? styles.userMsgText : styles.aiMsgText]}>{msg.text}</Text>
                  
                  {/* Render Sources if available */}
                  {msg.sources && msg.sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                      <Text style={styles.sourcesTitle}>Reference Documents:</Text>
                      {msg.sources.map((src, idx) => (
                        <Text key={idx} style={styles.sourceItem}>
                          • {src.source} {src.page && src.page !== 'N/A' ? `(Page ${src.page})` : ''}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              {loading && (
                <View style={[styles.msgBubble, styles.aiBubble, styles.loadingRow]}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={styles.loadingText}>Searching legal database & statutes...</Text>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Type legal question (Urdu / English)..."
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
                <Image
                  source={require('../assets/images/arrow.png')}
                  style={{ width: 18, height: 13 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  draggableFab: { position: 'absolute', top: 0, left: 0, zIndex: 9999, elevation: 12 },
  fabBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    elevation: 10,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9500',
    padding: 2,
    overflow: 'hidden',
  },
  blueRimHalo: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 31,
    borderWidth: 1.4,
    borderColor: 'rgba(59, 130, 246, 0.65)',
  },
  glowCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#121829',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  fabIcon: { fontSize: 24 },
  aiTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0F111A',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 7,
    marginTop: -4,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  aiBlueDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  aiTagText: {
    color: '#FFA726',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0F172A', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: SCREEN_HEIGHT * 0.84 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#020617', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  headerIcon: { fontSize: 20 },
  headerTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '800' },
  headerSub: { color: '#fbbf24', fontSize: 11, fontWeight: '600', marginTop: 1 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#f8fafc', fontSize: 16, fontWeight: '800' },
  chatScroll: { flex: 1, backgroundColor: '#0F172A' },
  chatContent: { padding: 18, gap: 12 },
  msgBubble: { maxWidth: '84%', padding: 14, borderRadius: 18, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#3b82f6', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#1E293B', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#334155' },
  userMsgText: { color: '#ffffff', fontSize: 13, lineHeight: 19 },
  aiMsgText: { color: '#e2e8f0', fontSize: 13, lineHeight: 19 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10 },
  textInput: { flex: 1, backgroundColor: '#1E293B', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, fontSize: 13, color: '#f8fafc' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  sourcesContainer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  sourcesTitle: { color: '#fbbf24', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  sourceItem: { color: '#94a3b8', fontSize: 11, fontStyle: 'italic', marginBottom: 2 },
});