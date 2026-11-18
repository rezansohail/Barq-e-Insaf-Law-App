import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLanguageModal } from '../context/LanguageModalContext';
import { useAppTheme } from '../context/ThemeContext';

/**
 * LanguageFloatingButton
 * 
 * Barq-e-Insaf floating language switcher pill at the bottom-left:
 * Shows current/toggle language (e.g. "🌐 اردو" / "🌐 سنڌي" / "🌐 English").
 * Tapping opens the Barq-e-Insaf Language Selection Modal.
 */
export default function LanguageFloatingButton() {
  const { i18n } = useTranslation();
  const { isDarkMode } = useAppTheme();
  const { openLanguageModal } = useLanguageModal();

  const currentLang = i18n?.language || 'en';

  const getBadgeConfig = () => {
    if (currentLang === 'ur') {
      return { label: 'Urdu', native: 'اردو', icon: '🇵🇰' };
    }
    if (currentLang === 'sd') {
      return { label: 'Sindhi', native: 'سنڌي', icon: '🏴' };
    }
    return { label: 'English', native: 'English', icon: '🇬🇧' };
  };

  const badge = getBadgeConfig();

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.pillButton}
        onPress={openLanguageModal}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel="Change Language"
      >
        <LinearGradient
          colors={
            isDarkMode
              ? ['#2A1408', '#1A0C04', '#0D0502'] // Barq-e-Insaf signature obsidian & dark amber
              : ['#EA580C', '#C2410C', '#9A3412']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Barq-e-Insaf Gold Specular Border & Content */}
          <View style={styles.innerRow}>
            <Text style={styles.globeIcon}>🌐</Text>
            <Text style={styles.labelText}>{badge.native}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 95 : 85, // Floats cleanly just above the bottom nav bar
    left: 14,
    zIndex: 9998,
  },
  pillButton: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.4,
    borderColor: '#FF9500', // Barq-e-Insaf Signature Amber Gold Border
    ...Platform.select({
      ios: {
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 14px rgba(255, 149, 0, 0.35)',
        cursor: 'pointer',
      },
    }),
  },
  gradient: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  globeIcon: {
    fontSize: 14,
  },
  labelText: {
    color: '#FFB800',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
