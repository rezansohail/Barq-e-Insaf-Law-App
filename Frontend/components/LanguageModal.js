import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage, SUPPORTED_LANGUAGES } from '../constants/i18n';
import { useAppTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LANGUAGE_ICONS = {
  en: require('../assets/images/en.png'),
  ur: require('../assets/images/ur.png'),
  sd: require('../assets/images/si.png'),
  si: require('../assets/images/si.png'),
};

/**
 * Barq-e-Insaf Language Selection Popup Modal
 * Allows switching between English, Urdu (اردو), and Sindhi (سنڌي).
 */
export default function LanguageModal({ visible, onClose }) {
  const { i18n } = useTranslation();
  const { isDark } = useAppTheme();
  const currentLang = i18n?.language || 'en';

  const handleSelectLanguage = async (code) => {
    await changeAppLanguage(code);
    if (onClose) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#140A05' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 149, 0, 0.4)' : 'rgba(234, 88, 12, 0.3)',
              }
            ]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.globeBadge}>
                  <Image
                    source={require('../assets/images/lang.png')}
                    style={styles.modalLangIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A0C04' }]}>
                    Select Language
                  </Text>
                  <Text style={[styles.subtitle, { color: isDark ? '#FFA726' : '#C2410C' }]}>
                    زبان منتخب کریں / ٻولي چونڊيو
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <View style={styles.closeBtn}>
                    <Text style={{ color: isDark ? '#FFEED6' : '#6B7280', fontSize: 13, fontWeight: '800' }}>X</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Language Options */}
              <View style={styles.optionsList}>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langOption,
                        {
                          backgroundColor: isSelected
                            ? (isDark ? 'rgba(255, 149, 0, 0.16)' : 'rgba(234, 88, 12, 0.12)')
                            : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB'),
                          borderColor: isSelected
                            ? '#FF9500'
                            : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB'),
                        },
                      ]}
                      onPress={() => handleSelectLanguage(lang.code)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.optionLeft}>
                        <View style={{
                          width: 44,
                          height: 28,
                          borderRadius: 6,
                          overflow: 'hidden',
                          backgroundColor: isSelected ? 'rgba(255, 149, 0, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6'),
                          borderWidth: 1.5,
                          borderColor: isSelected ? '#FF9500' : (isDark ? 'rgba(255, 255, 255, 0.15)' : '#E5E7EB'),
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {LANGUAGE_ICONS[lang.code] ? (
                            <Image
                              source={LANGUAGE_ICONS[lang.code]}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={{ color: isSelected ? '#FF9500' : (isDark ? '#FFEED6' : '#4A3325'), fontSize: 11, fontWeight: '800' }}>
                              {lang.code.toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={[
                            styles.langLabel,
                            {
                              color: isSelected
                                ? '#FF9500'
                                : (isDark ? '#FFFFFF' : '#111827'),
                              fontWeight: isSelected ? '800' : '600',
                            }
                          ]}>
                            {lang.label}
                          </Text>
                          <Text style={[
                            styles.nativeLabel,
                            { color: isDark ? 'rgba(255, 220, 180, 0.7)' : '#6B7280' }
                          ]}>
                            {lang.native}
                          </Text>
                        </View>
                      </View>

                      {/* Radio / Checkmark Indicator */}
                      <View style={[
                        styles.indicator,
                        isSelected && styles.indicatorSelected,
                      ]}>
                        {isSelected && (
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#000000' }} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.hintText, { color: isDark ? 'rgba(255, 220, 180, 0.5)' : '#9CA3AF' }]}>
                Changes apply instantly across all screens.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: Math.min(SCREEN_WIDTH - 40, 360),
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  globeBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLangIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.18)',
    marginVertical: 12,
  },
  optionsList: {
    gap: 10,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
  },
  langLabel: {
    fontSize: 14,
  },
  nativeLabel: {
    fontSize: 12,
    marginTop: 1,
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(128, 128, 128, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorSelected: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  checkmark: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 14,
  },
});
