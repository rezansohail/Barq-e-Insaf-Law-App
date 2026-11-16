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
  type = 'error',
  buttons = [{ text: 'OK' }],
  onClose,
}) {
  const { isDarkMode } = useAppTheme();

  if (!visible) return null;

  // Select icon strictly among pop1, pop2, pop3, pop4
  const iconSource = ICONS[type] || (type === 'warning' ? ICONS.warning : type === 'info' ? ICONS.info : ICONS.error);

  const defaultTitle =
    title ||
    (type === 'error'
      ? 'ERROR'
      : type === 'warning'
      ? 'WARNING'
      : type === 'info'
      ? 'INFORMATION'
      : 'NOTICE');

  // Strictly use theme colors: shades of orange, black, and white
  const cardBg = isDarkMode ? '#1E202C' : '#FFFFFF';
  const borderColor = '#FF9500'; // App theme primary orange
  const titleColor = isDarkMode ? '#FFFFFF' : '#1A0C04';
  const subTextColor = isDarkMode ? '#E5E7EB' : '#374151';

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
          {/* Header Row: Pop Icon, Title, and Close Button 'X' */}
          <View style={styles.headerRow}>
            <Image source={iconSource} style={styles.icon} resizeMode="contain" />
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: titleColor }]}>
                {defaultTitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.closeText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                X
              </Text>
            </TouchableOpacity>
          </View>

          {/* Message Body */}
          {message ? (
            <Text style={[styles.message, { color: subTextColor }]}>
              {message}
            </Text>
          ) : null}

          {/* Action Buttons: e.g. Cancel & Retry */}
          <View style={styles.buttonRow}>
            {buttons.map((btn, idx) => {
              const isCancel = btn.style === 'cancel' || /cancel|close|dismiss/i.test(btn.text);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.btn,
                    isCancel
                      ? [styles.cancelBtn, { borderColor: isDarkMode ? '#3E4158' : '#D1D5DB' }]
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
                        ? { color: isDarkMode ? '#E5E7EB' : '#4B5563' }
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
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 99999,
  },
  // Compact, sleek banner size inspired by error popup design
  card: {
    width: Math.min(SCREEN_WIDTH - 64, 296),
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  icon: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 3,
  },
  closeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  message: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 10,
    marginLeft: 34,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 2,
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  primaryBtn: {
    backgroundColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primaryBtnText: {
    color: '#0A0502',
    fontWeight: '900',
  },
});
