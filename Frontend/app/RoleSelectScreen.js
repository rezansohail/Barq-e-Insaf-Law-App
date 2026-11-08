import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';

const roles = [
  {
    id: 'citizen',
    label: 'Citizen',
    subtitle: 'File cases & connect with verified lawyers',
    accentColor: '#FF9800',
    accentGlow: 'rgba(255, 152, 0, 0.2)',
    iconPath:
      'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  },
  {
    id: 'lawyer',
    label: 'Lawyer / Advocate',
    subtitle: 'Manage client cases & court representations',
    accentColor: '#F59E0B',
    accentGlow: 'rgba(245, 158, 11, 0.2)',
    iconPath:
      'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
  },
  {
    id: 'ngo',
    label: 'NGO / Media',
    subtitle: 'Human rights analytics & legal reporting',
    accentColor: '#FB923C',
    accentGlow: 'rgba(251, 146, 60, 0.2)',
    iconPath:
      'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
  },
  {
    id: 'admin',
    label: 'System Admin',
    subtitle: 'Sindh Bar Council directory governance',
    accentColor: '#EA580C',
    accentGlow: 'rgba(234, 88, 12, 0.2)',
    iconPath:
      'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const handleSelect = (roleId) => {
    router.push({ pathname: '/LoginScreen', params: { role: roleId } });
  };

  return (
    <View style={styles.container}>
      {/* Translucent status bar */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Obsidian & Amber Luxury Background */}
      <LinearGradient
        colors={['#0A0402', '#060201', '#020101']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient warm glow halos */}
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            top: -height * 0.05,
            left: -width * 0.12,
            width: width * 0.75,
            height: width * 0.75,
            backgroundColor: 'rgba(255, 120, 20, 0.08)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.ambientHalo,
          {
            bottom: height * 0.1,
            right: -width * 0.15,
            width: width * 0.8,
            height: width * 0.8,
            backgroundColor: 'rgba(234, 88, 12, 0.06)',
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>
            BARQ-E-INSAF <Text style={styles.boltIcon}>⚡</Text>
          </Text>
          <Text style={styles.headerSub}>Select your role to continue</Text>
        </View>

        {/* Roles List */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => handleSelect(role.id)}
              activeOpacity={0.82}
              style={styles.cardTouch}
            >
              <BlurView
                intensity={Platform.OS === 'ios' ? 35 : 55}
                tint="dark"
                style={styles.cardBlur}
              >
                <LinearGradient
                  colors={[
                    'rgba(255, 160, 40, 0.1)',
                    'rgba(255, 255, 255, 0.02)',
                    'rgba(18, 9, 3, 0.45)',
                  ]}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Top specular reflection sheen */}
                  <View style={styles.cardSheen} pointerEvents="none" />

                  {/* Left luminous accent bar */}
                  <View
                    style={[
                      styles.accentBar,
                      { backgroundColor: role.accentColor, shadowColor: role.accentColor },
                    ]}
                  />

                  {/* Glowing Icon Orb */}
                  <View style={[styles.iconWrap, { backgroundColor: role.accentGlow }]}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill={role.accentColor}>
                      <Path d={role.iconPath} />
                    </Svg>
                  </View>

                  {/* Role Titles */}
                  <View style={styles.roleTextGroup}>
                    <Text style={styles.roleLabel}>{role.label}</Text>
                    <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                  </View>

                  {/* Liquid Glass Arrow Pill */}
                  <View style={styles.arrowBox}>
                    <BlurView
                      intensity={Platform.OS === 'ios' ? 40 : 65}
                      tint="dark"
                      style={styles.arrowBlur}
                    >
                      <LinearGradient
                        colors={[
                          'rgba(255, 255, 255, 0.25)',
                          'rgba(255, 170, 50, 0.14)',
                          'rgba(24, 11, 4, 0.55)',
                        ]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.arrowGradient}
                      >
                        <Text style={styles.arrowText}>→</Text>
                      </LinearGradient>
                    </BlurView>
                  </View>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Legal assistance for Sindh · English · Urdu · Sindhi
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060201',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  ambientHalo: {
    position: 'absolute',
    borderRadius: 999,
  },

  // ── HEADER ──
  header: {
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 8,
    zIndex: 1,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF2DF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  boltIcon: {
    color: '#FF9800',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255, 220, 185, 0.65)',
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // ── ROLES CONTAINER ──
  rolesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 13,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
  cardTouch: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 210, 140, 0.24)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow:
            '0 0 18px rgba(255, 120, 20, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        }
      : {}),
  },
  cardBlur: {
    flex: 1,
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingRight: 16,
    paddingLeft: 0,
    gap: 13,
    position: 'relative',
    backgroundColor: 'rgba(20, 10, 4, 0.42)',
  },
  cardSheen: {
    position: 'absolute',
    top: 1,
    left: '10%',
    right: '10%',
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
  },

  // Left accent bar
  accentBar: {
    width: 3.5,
    alignSelf: 'stretch',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  // Icon wrap
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 140, 0.3)',
  },

  // Text
  roleTextGroup: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFF5E8',
    letterSpacing: -0.2,
  },
  roleSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 220, 190, 0.62)',
    marginTop: 3,
    fontWeight: '400',
    lineHeight: 16,
  },

  // Arrow Liquid Glass Pill
  arrowBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 220, 160, 0.55)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  arrowBlur: {
    flex: 1,
  },
  arrowGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25, 12, 4, 0.5)',
  },
  arrowText: {
    color: '#FFE8C5',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── FOOTER ──
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 150, 0.15)',
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  footerText: {
    fontSize: 10.5,
    color: 'rgba(255, 225, 195, 0.6)',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});