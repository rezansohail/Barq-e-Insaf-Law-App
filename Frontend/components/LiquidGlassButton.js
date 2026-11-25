import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function LiquidGlassButton({
  title,
  onPress,
  style,
  textStyle,
  variant = 'amber', // 'amber' | 'crimson' | 'glass'
  disabled = false,
  children,
  icon,
}) {
  const gradientColors =
    variant === 'crimson'
      ? ['rgba(255, 255, 255, 0.22)', 'rgba(239, 68, 68, 0.25)', 'rgba(30, 8, 8, 0.75)']
      : variant === 'emerald'
      ? ['rgba(255, 255, 255, 0.22)', 'rgba(16, 185, 129, 0.35)', 'rgba(6, 44, 28, 0.85)']
      : variant === 'glass'
      ? ['rgba(255, 255, 255, 0.20)', 'rgba(255, 255, 255, 0.05)', 'rgba(18, 9, 4, 0.65)']
      : ['rgba(255, 255, 255, 0.26)', 'rgba(255, 170, 50, 0.18)', 'rgba(22, 10, 3, 0.60)'];

  const borderColor =
    variant === 'crimson'
      ? 'rgba(255, 120, 120, 0.45)'
      : variant === 'emerald'
      ? 'rgba(52, 211, 153, 0.55)'
      : 'rgba(255, 215, 140, 0.45)';

  const shadowColor =
    variant === 'crimson'
      ? '#EF4444'
      : variant === 'emerald'
      ? '#10B981'
      : '#FF7A00';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      disabled={disabled}
      style={[
        styles.touchWrapper,
        { shadowColor },
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 45 : 75}
        tint="dark"
        style={[styles.liquidGlassPill, { borderColor }]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.liquidGlassGradient}
        >
          {/* Top specular sheen */}
          <View style={styles.liquidGlassSheen} pointerEvents="none" />

          {icon ? <View style={styles.iconBox}>{icon}</View> : null}

          {title ? (
            <Text style={[styles.buttonText, textStyle]}>
              {title}
            </Text>
          ) : (
            children
          )}
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchWrapper: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  liquidGlassPill: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1.2,
    backgroundColor: 'rgba(24, 12, 6, 0.35)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 0 20px rgba(255, 122, 0, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.45), inset 0 -1px 2px rgba(0, 0, 0, 0.5)',
        }
      : {}),
  },
  liquidGlassGradient: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    gap: 8,
  },
  liquidGlassSheen: {
    position: 'absolute',
    top: 1,
    left: '12%',
    right: '12%',
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  iconBox: {
    marginRight: 4,
  },
  buttonText: {
    color: '#FFEED6',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 140, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
});
