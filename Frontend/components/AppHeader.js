import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import TopHeaderMenu from './TopHeaderMenu';
import { useAppTheme } from '../context/ThemeContext';
import { getTranslatedAppName } from '../utils/translationHelper';
import { getAdminUnreadNotificationStatus, subscribeToStore } from '../constants/ngoMediaStore';

/**
 * AppHeader
 * Top navigation header replicating modern luxury app aesthetics (Image 1 & Image 2)
 *
 * @param {string} title - Screen heading text
 * @param {boolean} showBack - Whether to show the back button (false for home/dashboards)
 * @param {function} onBack - Optional custom back handler
 * @param {function} onBackPress - Alias for onBack
 * @param {string} homeRoute - Route to go back to (e.g. '/(citizen)/CitizenHome')
 * @param {React.ReactNode} rightElement - Optional custom right element
 * @param {boolean} showMenu - Whether to show the top-right menu (default true)
 * @param {string} role - Current role for TopHeaderMenu ('citizen', 'lawyer', 'ngo', 'media', 'admin')
 * @param {string} subtitle - Optional small subtitle / category badge
 * @param {string} userName - Optional user name to display "hi, [Name]" on top right for homepages
 */
export default function AppHeader({
  title,
  showBack = true,
  onBack,
  onBackPress,
  homeRoute,
  rightElement,
  showMenu = true,
  role = 'citizen',
  subtitle,
  userName,
  avatarText,
}) {
  const router = useRouter();
  const { theme, isDarkMode } = useAppTheme();
  const [hasUnread, setHasUnread] = useState(getAdminUnreadNotificationStatus());

  useEffect(() => {
    return subscribeToStore(() => {
      setHasUnread(getAdminUnreadNotificationStatus());
    });
  }, []);

  const handleBackPress = () => {
    const customBack = onBack || onBackPress;
    if (customBack) {
      customBack();
      return;
    }
    if (homeRoute) {
      router.replace(homeRoute);
    } else {
      router.back();
    }
  };

  const { i18n, t } = useTranslation();
  const currentLang = i18n?.language || 'en';

  const isAppName = title === 'Barq-e-Insaf' || title === 'BARQ-E-INSAF';
  let displayTitle = (!showBack && isAppName) ? '' : title;
  if (isAppName) {
    displayTitle = getTranslatedAppName(currentLang);
  } else if (title) {
    displayTitle = t(title, title);
  }

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.headerBg, borderBottomColor: theme.navBorder }]}>
      {/* Top Specular Sheen line */}
      <View style={styles.topSheen} pointerEvents="none" />

      <View style={styles.contentRow}>
        {/* Left Section: Top Logo (on home) OR Back Button (on sub-screens) + Title */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              style={[
                styles.circularBackBtn,
                {
                  backgroundColor: isDarkMode ? 'rgba(25, 10, 3, 0.75)' : '#FFFFFF',
                  borderColor: isDarkMode ? 'rgba(255, 170, 60, 0.35)' : 'rgba(217, 119, 6, 0.40)',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
              onPress={handleBackPress}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke={isDarkMode ? '#FFEED6' : '#1A0C04'}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          ) : (
            <Image
              source={require('../assets/images/logo1.png')}
              style={styles.headerLogoImg}
              resizeMode="contain"
            />
          )}

          <View style={styles.titleColumn}>
            {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
            {displayTitle ? (
              <Text
                style={[
                  styles.headingTitle,
                  { color: theme.textPrimary },
                  !showBack && styles.headingTitleNoBack,
                ]}
                numberOfLines={1}
              >
                {displayTitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right Section: Name (on home) + admin bell + custom right element + standard TopHeaderMenu */}
        <View style={styles.rightSection}>
          {!showBack && userName ? (
            <Text style={[styles.hiGreetingText, { color: theme.textSecondary }]}>
              {userName}
            </Text>
          ) : null}
          {role === 'admin' && (
            <TouchableOpacity
              style={[
                styles.adminBellBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceBorder,
                },
              ]}
              onPress={() => router.push('/(Admin)/Notifications')}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Admin Notifications"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  stroke={theme.textPrimary}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              {hasUnread && <View style={styles.unreadGreenDot} />}
            </TouchableOpacity>
          )}
          {rightElement}
          {showMenu && <TopHeaderMenu role={role} avatarText={avatarText} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0A0402',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 150, 40, 0.16)',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 8,
    paddingBottom: 12,
    position: 'relative',
    zIndex: 50,
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: 'rgba(255, 200, 120, 0.25)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  circularBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.35)',
    backgroundColor: 'rgba(25, 10, 3, 0.65)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  backBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowImg: {
    width: 20,
    height: 14,
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF5E8',
    letterSpacing: -0.3,
  },
  headingTitleNoBack: {
    fontSize: 21,
    letterSpacing: 0.2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 4,
  },
  hiGreetingText: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerLogoImg: {
    width: 32,
    height: 32,
  },
  adminBellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadGreenDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    borderWidth: 1.5,
    borderColor: '#0A0402',
  },
});
