import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ICONS = {
  info: require('../assets/images/pop1.png'),
  success: require('../assets/images/pop2.png'),
  error: require('../assets/images/pop3.png'),
  warning: require('../assets/images/pop4.png'),
};

export default function ThemedAlertModal({
  visible = false,
  title = '',
  message = '',
  type = 'info',
  buttons = [{ text: 'OK' }],
  onClose,
}) {
  const { theme, isDark } = useAppTheme();

  if (!visible) return null;

  // Select appropriate icon
  const iconSource = ICONS[type] || ICONS.info;

  const defaultTitle =
    title ||
    (type === 'error'
      ? 'ERROR'
      : type === 'warning'
      ? 'WARNING'
      : type === 'success'
      ? 'SUCCESS'
      : 'NOTICE');

  // Luxurious legal obsidian styling matching Barq-e-Insaf theme
  const cardBg = isDark ? '#160A04' : '#FFFFFF';
  const borderColor = '#FF9500'; // App theme radiant amber
  const titleColor = isDark ? '#FFA726' : '#C2410C';
  const messageColor = isDark ? '#FFEED6' : '#2D1808';
  const closeColor = isDark ? '#FFA726' : '#9A3412';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: borderColor,
            },
          ]}
        >
          {/* Header Row: Seal Icon, Title, and Close Button 'X' */}
          <View style={styles.headerRow}>
            <Image source={iconSource} style={styles.icon} resizeMode="contain" />
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
                {defaultTitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeText, { color: closeColor }]}>
                X
              </Text>
            </TouchableOpacity>
          </View>

          {/* Message Body */}
          {message ? (
            <Text style={[styles.message, { color: messageColor }]}>
              {message}
            </Text>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {buttons.map((btn, idx) => {
              const isCancel = btn.style === 'cancel' || /cancel|close|dismiss/i.test(btn.text);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.btn,
                    isCancel
                      ? [
                          styles.cancelBtn,
                          {
                            backgroundColor: isDark ? 'rgba(255, 149, 0, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                            borderColor: isDark ? 'rgba(255, 160, 40, 0.35)' : 'rgba(180, 83, 9, 0.35)',
                          },
                        ]
                      : styles.primaryBtn,
                  ]}
                  onPress={() => {
                    onClose();
                    if (btn.onPress) btn.onPress();
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isCancel
                        ? { color: isDark ? '#FFA726' : '#9A3412', fontWeight: '700' }
                        : styles.primaryBtnText,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 99999,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 44, 380),
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  icon: {
    width: 26,
    height: 26,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '900',
  },
  message: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 16,
    marginLeft: 36,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 76,
  },
  cancelBtn: {
    borderWidth: 1.2,
  },
  primaryBtn: {
    backgroundColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  primaryBtnText: {
    color: '#0A0402',
    fontWeight: '900',
  },
});
