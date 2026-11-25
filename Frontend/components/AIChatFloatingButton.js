import React, { useState, useRef, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { subscribeToChat, closeAIChat } from '../constants/chatBotStore';
import { getDevHost } from '../constants/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AIChatFloatingButton() {
  const pathname = usePathname();

  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [docModalVisible, setDocModalVisible] = useState(false);
  const scrollViewRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'السلام علیکم! I am your Barq-e-Insaf AI Legal Assistant. Ask me any Pakistan legal law question in Urdu, Sindhi, or English!',
    },
  ]);

  // Clean raw markdown hashes, dividers, and emojis
  const cleanRawText = (raw) => {
    if (!raw) return '';
    // Strip emojis
    let t = raw.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');
    // Strip divider lines
    t = t.replace(/^[-=_*]{3,}$/gm, '');
    // Strip leading hashes (### or ## or #)
    t = t.replace(/^#{1,6}\s*/gm, '');
    t = t.replace(/#{2,}/g, '');
    return t.trim();
  };

  // Open Full PDF in Browser / Viewer
  const openPdf = async (source) => {
    if (!source || !source.source) return;
    const host = getDevHost();
    const pageParam = source.page && source.page !== 'N/A' ? `#page=${source.page}` : '';
    const url = `http://${host}:5001/api/pdf/${encodeURIComponent(source.source)}${pageParam}`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      try {
        await Linking.openURL(url);
      } catch (e) {
        console.warn('Could not open PDF URL:', url);
      }
    }
  };

  // Render nicely formatted text with bold tags (**bold**) for React Native
  const renderFormattedText = (rawText, isUser) => {
    const cleaned = cleanRawText(rawText);
    const lines = cleaned.split('\n');

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <View key={lineIdx} style={{ height: 6 }} />;
      }

      // Check for headings or numbered points
      const isHeading = /^\d+\.\s+[A-Za-z]/.test(trimmed) || /^[A-Z][a-zA-Z\s]+:$/.test(trimmed);
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
      const displayLine = isBullet ? `•  ${trimmed.substring(2)}` : line;

      // Split line by bold tags (**bold**)
      const parts = displayLine.split(/(\*\*.*?\*\*)/g);

      return (
        <Text
          key={lineIdx}
          style={[
            styles.msgText,
            isUser ? styles.userMsgText : styles.aiMsgText,
            isHeading && styles.headingLine,
            isBullet && styles.bulletLine,
          ]}
        >
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldContent = part.slice(2, -2);
              return (
                <Text key={partIdx} style={styles.boldText}>
                  {boldContent}
                </Text>
              );
            }
            return part;
          })}
        </Text>
      );
    });
  };

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

  const sendMessage = async (overrideText) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : inputText;
    if (!textToSend || textToSend.trim() === '' || loading) return;

    const userQuery = textToSend.trim();
    const userMsg = { id: Date.now().toString(), sender: 'user', text: userQuery };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Automatically detect the laptop's IP address so it works on any Wi-Fi!
      const host = getDevHost();
      
      const response = await fetch(`http://${host}:5001/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery, model: 'qwen/qwen3.8-27b', temperature: 0.3, language: 'Auto-Detect' }),
      });

      const data = await response.json();
      const aiResponseText = data.answer || data.response || 'Thank you for your legal query. For formal court filings, connect with a verified advocate on Barq-e-Insaf.';

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText, sources: data.sources }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Connecting to Barq-e-Insaf AI server... Please ensure run_chatbot.bat is running locally.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Listen to openAIChat() triggers across any screen (e.g. LandingScreen "Ask AI")
  useEffect(() => {
    return subscribeToChat(({ isOpen, query }) => {
      if (isOpen) {
        setModalVisible(true);
        if (query && query.trim()) {
          sendMessage(query.trim());
        }
      } else {
        setModalVisible(false);
      }
    });
  }, []);

  const handleClose = () => {
    setModalVisible(false);
    closeAIChat();
  };

  // Hide floating button on splash & startup screens
  const hiddenRoutes = ['/', '/SplashScreen', '/StartScreen', '/OnboardingScreen'];
  const isFabHidden = hiddenRoutes.includes(pathname);

  if (isFabHidden && !modalVisible) {
    return null;
  }

  return (
    <>
      {/* Draggable Floating Button (only shown on permitted routes) */}
      {!isFabHidden && (
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
                <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    fill="#FFA726"
                    stroke="#FF9500"
                    strokeWidth={1.2}
                  />
                </Svg>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* POPUP AI CHAT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={handleClose}>
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
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeBtnText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => (
                <View key={msg.id} style={[styles.msgBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                  {renderFormattedText(msg.text, msg.sender === 'user')}
                  
                  {/* Render Sources if available as interactive cards */}
                  {msg.sources && msg.sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                      <View style={styles.sourcesHeaderRow}>
                        <View style={styles.sourcesBadgeDot} />
                        <Text style={styles.sourcesTitle}>Official Law References ({msg.sources.length}):</Text>
                      </View>
                      <Text style={styles.sourcesHint}>Tap any document to view cited section or open PDF</Text>
                      
                      <View style={styles.sourcesList}>
                        {msg.sources.map((src, idx) => {
                          const cleanName = src.source.replace('.pdf', '');
                          return (
                            <TouchableOpacity
                              key={idx}
                              style={styles.sourceCard}
                              activeOpacity={0.75}
                              onPress={() => {
                                setSelectedSource(src);
                                setDocModalVisible(true);
                              }}
                            >
                              <View style={styles.sourceCardLeft}>
                                <View style={styles.pdfBadge}>
                                  <Text style={styles.pdfBadgeText}>PDF</Text>
                                </View>
                                <View style={styles.sourceDetails}>
                                  <Text style={styles.sourceTitleText} numberOfLines={1}>
                                    {cleanName}
                                  </Text>
                                  <Text style={styles.sourcePageText}>
                                    {src.page && src.page !== 'N/A' ? `Page ${src.page}` : 'Statute Book'}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.sourceCardAction}>
                                <Text style={styles.viewActionText}>View</Text>
                                <Text style={styles.viewActionArrow}>›</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
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
                onSubmitEditing={() => sendMessage()}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} disabled={loading}>
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

      {/* CITATION & PDF INSPECTOR MODAL */}
      <Modal
        visible={docModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDocModalVisible(false)}
      >
        <View style={styles.docModalBackdrop}>
          <View style={styles.docModalCard}>
            {/* Modal Header */}
            <View style={styles.docModalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={styles.docBadgeRow}>
                  <Text style={styles.docModalBadge}>STATUTE CITATION</Text>
                  {selectedSource?.page && selectedSource.page !== 'N/A' && (
                    <Text style={styles.docPageBadge}>Page {selectedSource.page}</Text>
                  )}
                </View>
                <Text style={styles.docModalTitle} numberOfLines={2}>
                  {selectedSource?.source}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.docModalCloseBtn}
                onPress={() => setDocModalVisible(false)}
              >
                <Text style={styles.docModalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content: Highlighted Statutory Text */}
            <ScrollView style={styles.docModalScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.docSectionSub}>Cited Statutory Clause & Section:</Text>
              <View style={styles.docExcerptBox}>
                <Text style={styles.docExcerptText}>
                  {selectedSource?.text || selectedSource?.snippet || 'Legal statute excerpt loaded from Pakistan Law Database.'}
                </Text>
              </View>

              <Text style={styles.docNoticeText}>
                Verified clause from the official statute books of Pakistan. Tap below to view or download the complete PDF document.
              </Text>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.docModalActions}>
              <TouchableOpacity
                style={styles.openPdfBtn}
                activeOpacity={0.85}
                onPress={() => {
                  if (selectedSource) openPdf(selectedSource);
                }}
              >
                <LinearGradient
                  colors={['#2563EB', '#1D4ED8']}
                  style={styles.openPdfGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.openPdfBtnText}>
                    Open Full PDF {selectedSource?.page && selectedSource.page !== 'N/A' ? `(Page ${selectedSource.page})` : ''}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeDocBtn}
                onPress={() => setDocModalVisible(false)}
              >
                <Text style={styles.closeDocBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#121829',
    borderWidth: 1.2,
    borderColor: 'rgba(59, 130, 246, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
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
  msgBubble: { maxWidth: '88%', padding: 14, borderRadius: 18, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#1E293B', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#334155' },
  userMsgText: { color: '#ffffff', fontSize: 13.5, lineHeight: 21 },
  aiMsgText: { color: '#e2e8f0', fontSize: 13.5, lineHeight: 21 },
  boldText: { fontWeight: '700', color: '#f8fafc' },
  headingLine: { fontWeight: '700', fontSize: 14, color: '#60a5fa', marginTop: 8, marginBottom: 2 },
  bulletLine: { paddingLeft: 4, marginVertical: 1.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10 },
  textInput: { flex: 1, backgroundColor: '#1E293B', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, fontSize: 13, color: '#f8fafc' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },

  // Sources Interactive Styles
  sourcesContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  sourcesHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  sourcesBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fbbf24' },
  sourcesTitle: { color: '#fbbf24', fontSize: 12, fontWeight: '700' },
  sourcesHint: { color: '#94a3b8', fontSize: 11, marginBottom: 8 },
  sourcesList: { gap: 6 },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  sourceCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  pdfBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pdfBadgeText: { color: '#f87171', fontSize: 9, fontWeight: '800' },
  sourceDetails: { flex: 1 },
  sourceTitleText: { color: '#f1f5f9', fontSize: 12, fontWeight: '600' },
  sourcePageText: { color: '#94a3b8', fontSize: 10.5, marginTop: 1 },
  sourceCardAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewActionText: { color: '#38bdf8', fontSize: 11, fontWeight: '700' },
  viewActionArrow: { color: '#38bdf8', fontSize: 14, fontWeight: '800' },

  // Document Inspector Modal Styles
  docModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  docModalCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.78,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38bdf8',
    padding: 18,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  docModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 12,
    marginBottom: 12,
  },
  docBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  docModalBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    fontSize: 9.5,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  docPageBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    color: '#fbbf24',
    fontSize: 9.5,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  docModalTitle: { color: '#f8fafc', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  docModalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docModalCloseText: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' },
  docModalScroll: { maxHeight: SCREEN_HEIGHT * 0.45, marginBottom: 14 },
  docSectionSub: { color: '#94a3b8', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  docExcerptBox: {
    backgroundColor: '#1E293B',
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  docExcerptText: { color: '#e2e8f0', fontSize: 12.5, lineHeight: 19 },
  docNoticeText: { color: '#64748b', fontSize: 10.5, fontStyle: 'italic', marginTop: 4 },
  docModalActions: { gap: 8 },
  openPdfBtn: { borderRadius: 12, overflow: 'hidden' },
  openPdfGradient: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  openPdfBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  closeDocBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  closeDocBtnText: { color: '#94a3b8', fontSize: 12.5, fontWeight: '600' },
});
