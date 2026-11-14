import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../context/ThemeContext';

export default function TopHeaderMenu({ role = 'citizen', avatarText = 'BI' }) {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  const langOptions = ['English', 'اردو (Urdu)', 'سنڌي (Sindhi)'];

  const handleCycleLang = () => {
    const nextIdx = (langOptions.indexOf(currentLang) + 1) % langOptions.length;
    setCurrentLang(langOptions[nextIdx]);
  };

  const handleProfile = () => {
    setMenuVisible(false);
    if (role === 'citizen') {
      router.push('/(citizen)/Profile');
    } else if (role === 'lawyer') {
      router.push('/(lawyer)/LawyerProfile');
    } else {
      Alert.alert(
        'Profile Information',
        `Logged in as: ${role.toUpperCase()}\nStatus: Verified Active Organization\nAccess Level: Full Portal Access`
      );
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleSignOut = () => {
    setMenuVisible(false);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Barq-e-Insaf?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Accurately sign out and navigate back to role selection
            router.replace('/RoleSelectScreen');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Menu Trigger Button */}
      <TouchableOpacity
        style={styles.triggerBtn}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.8}
        accessibilityLabel="Menu Options"
      >
        <LinearGradient
          colors={['rgba(255, 149, 0, 0.25)', 'rgba(20, 10, 4, 0.5)']}
          style={styles.triggerGradient}
        >
          {/* Menu icon - 3 dots / lines */}
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 13a1 1 0 100-2 1 1 0 000 2zm0-7a1 1 0 100-2 1 1 0 000 2zm0 14a1 1 0 100-2 1 1 0 000 2z"
              stroke="#FFA726"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </Svg>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal Dropdown */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownContainer}>
                <BlurView
                  intensity={Platform.OS === 'ios' ? 50 : 75}
                  tint={isDarkMode ? 'dark' : 'light'}
                  style={styles.dropdownBlur}
                >
                  <LinearGradient
                    colors={
                      isDarkMode
                        ? [
                            'rgba(28, 14, 5, 0.95)',
                            'rgba(18, 8, 3, 0.98)',
                            'rgba(10, 4, 2, 0.99)',
                          ]
                        : [
                            'rgba(255, 255, 255, 0.98)',
                            'rgba(254, 245, 235, 0.98)',
                            'rgba(250, 235, 220, 0.99)',
                          ]
                    }
                    style={styles.dropdownContent}
                  >
                    {/* Role header chip inside menu */}
                    <View style={styles.menuHeader}>
                      <View style={styles.menuAvatar}>
                        <Text style={styles.menuAvatarText}>{avatarText}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.menuRoleLabel,
                            { color: isDarkMode ? '#FFFFFF' : '#1F1005' },
                          ]}
                          numberOfLines={1}
                        >
                          {role.toUpperCase()} PORTAL
                        </Text>
                        <Text style={styles.menuRoleSub}>Barq-e-Insaf Active</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* 👤 Profile Option */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleProfile}
                      activeOpacity={0.75}
                    >
                      <View style={styles.itemIconCircle}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                            stroke="#FF9500"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <Text
                        style={[
                          styles.menuItemText,
                          { color: isDarkMode ? '#FFFFFF' : '#1A0C04' },
                        ]}
                      >
                        Profile
                      </Text>
                    </TouchableOpacity>

                    {/* 🌓 Dark Mode / Light Mode Toggle */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleToggleTheme}
                      activeOpacity={0.75}
                    >
                      <View style={styles.itemIconCircle}>
                        {isDarkMode ? (
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            {/* Sun icon for switching to light mode */}
                            <Path
                              d="M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                              stroke="#FFA726"
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                          </Svg>
                        ) : (
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            {/* Moon icon for switching to dark mode */}
                            <Path
                              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                              stroke="#FF9500"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.menuItemText,
                            { color: isDarkMode ? '#FFFFFF' : '#1A0C04' },
                          ]}
                        >
                          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </Text>
                        <Text style={styles.modeSubText}>
                          Current: {isDarkMode ? 'Dark' : 'Light'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.modePill,
                          {
                            backgroundColor: isDarkMode
                              ? 'rgba(255, 149, 0, 0.2)'
                              : 'rgba(234, 88, 12, 0.15)',
                          },
                        ]}
                      >
                        <Text style={styles.modePillText}>
                          {isDarkMode ? '🌙' : '☀️'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* 🌐 Language Translation Option */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleCycleLang}
                      activeOpacity={0.75}
                    >
                      <View style={styles.itemIconCircle}>
                        <Text style={{ fontSize: 13 }}>🌐</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.menuItemText,
                            { color: isDarkMode ? '#FFFFFF' : '#1A0C04' },
                          ]}
                        >
                          Language / زبان
                        </Text>
                        <Text style={styles.modeSubText}>
                          Current: {currentLang}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.modePill,
                          {
                            backgroundColor: 'rgba(255, 149, 0, 0.22)',
                            borderColor: 'rgba(255, 170, 60, 0.4)',
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text style={[styles.modePillText, { fontSize: 10, fontWeight: '800' }]}>
                          {currentLang.startsWith('English') ? 'EN' : currentLang.startsWith('اردو') ? 'UR' : 'SD'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* 🚪 Sign Out */}
                    <TouchableOpacity
                      style={[styles.menuItem, styles.signOutItem]}
                      onPress={handleSignOut}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.itemIconCircle,
                          {
                            backgroundColor: 'rgba(239, 68, 68, 0.18)',
                            borderColor: 'rgba(239, 68, 68, 0.35)',
                          },
                        ]}
                      >
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                            stroke="#EF4444"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </BlurView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 99,
  },
  triggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.40)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 48,
    right: 18,
    width: 230,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.4,
    borderColor: 'rgba(255, 149, 0, 0.45)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  dropdownBlur: {
    width: '100%',
  },
  dropdownContent: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  menuAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 149, 0, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuAvatarText: {
    color: '#FFB74D',
    fontSize: 12,
    fontWeight: '800',
  },
  menuRoleLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  menuRoleSub: {
    fontSize: 10,
    color: 'rgba(255, 149, 0, 0.75)',
    fontWeight: '600',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  itemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modeSubText: {
    fontSize: 9.5,
    color: 'rgba(255, 220, 180, 0.55)',
    marginTop: 1,
  },
  modePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  modePillText: {
    fontSize: 12,
  },
  signOutItem: {
    marginTop: 2,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
