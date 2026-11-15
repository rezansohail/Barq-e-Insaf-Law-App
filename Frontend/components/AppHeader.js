import React from 'react';
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
import TopHeaderMenu from './TopHeaderMenu';
import { useAppTheme } from '../context/ThemeContext';

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

  const isAppName = title === 'Barq-e-Insaf' || title === 'Barq-e-Insaf ⚡' || title === 'BARQ-E-INSAF';
  const displayTitle = (!showBack && isAppName) ? '' : title;

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
                  backgroundColor: isDarkMode ? 'rgba(25, 10, 3, 0.65)' : 'rgba(245, 240, 235, 0.9)',
                  borderColor: isDarkMode ? 'rgba(255, 170, 60, 0.35)' : 'rgba(234, 88, 12, 0.35)',
                },
              ]}
              onPress={handleBackPress}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <BlurView
                intensity={Platform.OS === 'ios' ? 40 : 60}
                tint={isDarkMode ? 'dark' : 'light'}
                style={styles.backBlur}
              >
                <Image
                  source={require('../assets/images/backarrow.png')}
                  style={styles.backArrowImg}
                  resizeMode="contain"
                />
              </BlurView>
            </TouchableOpacity>
          ) : (
            <Image
              source={require('../assets/images/logo.png')}
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

        {/* Right Section: Hi [Name] (on home) + custom right element + standard TopHeaderMenu */}
        <View style={styles.rightSection}>
          {!showBack && userName ? (
            <Text style={[styles.hiGreetingText, { color: isDarkMode ? '#FFEED6' : '#1A0C04' }]}>
              hi, {userName}
            </Text>
          ) : null}
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
});
