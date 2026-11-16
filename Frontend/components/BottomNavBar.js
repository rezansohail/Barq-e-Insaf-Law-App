import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAppTheme } from '../context/ThemeContext';

// Tab configuration per role
const ROLE_TABS = {
  citizen: [
    { id: 'home', label: 'Home', route: '/(citizen)/CitizenHome', icon: 'home' },
    { id: 'cases', label: 'Cases', route: '/(citizen)/MyCases', icon: 'cases' },
    { id: 'lawyers', label: 'Lawyers', route: '/(citizen)/FindLawyer', icon: 'lawyers' },
    { id: 'profile', label: 'Profile', route: '/(citizen)/Profile', icon: 'profile' },
  ],
  lawyer: [
    { id: 'home', label: 'Home', route: '/(lawyer)/LawyerHome', icon: 'home' },
    { id: 'requests', label: 'Requests', route: '/(lawyer)/CaseRequests', icon: 'requests' },
    { id: 'cases', label: 'Cases', route: '/(lawyer)/MyCases', icon: 'cases' },
    { id: 'schedule', label: 'Schedule', route: '/(lawyer)/Schedule', icon: 'schedule' },
    { id: 'profile', label: 'Profile', route: '/(lawyer)/LawyerProfile', icon: 'profile' },
  ],
  ngo: [
    { id: 'home', label: 'Home', route: '/(ngo)/NGOHome', icon: 'home' },
    { id: 'map', label: 'Sindh Map', route: '/(ngo)/CaseMap', icon: 'map' },
    { id: 'analytics', label: 'Analytics', route: '/(ngo)/Analytics', icon: 'analytics' },
    { id: 'reports', label: 'Reports', route: '/(ngo)/ExportReports', icon: 'reports' },
  ],
  media: [
    { id: 'home', label: 'News Desk', route: '/(media)/MediaHome', icon: 'home' },
    { id: 'map', label: 'Case Map', route: '/(media)/CaseMap', icon: 'map' },
    { id: 'analytics', label: 'Insights', route: '/(media)/Analytics', icon: 'analytics' },
    { id: 'reports', label: 'Briefs', route: '/(media)/ExportReports', icon: 'reports' },
  ],
  admin: [
    { id: 'home', label: 'Overview', route: '/(Admin)', icon: 'home' },
    { id: 'citizens', label: 'Citizens', route: '/(Admin)/CitizenManagement', icon: 'profile' },
    { id: 'lawyers', label: 'Lawyers', route: '/(Admin)/LawyerManagement', icon: 'lawyers' },
    { id: 'ngos', label: 'NGOs', route: '/(Admin)/NGOManagement', icon: 'cases' },
    { id: 'media', label: 'Media', route: '/(Admin)/MediaManagement', icon: 'media' },
  ],
};

function renderTabIcon(icon, active, isDarkMode) {
  const color = active ? '#FFA726' : (isDarkMode ? 'rgba(255, 220, 180, 0.45)' : 'rgba(80, 45, 25, 0.45)');
  const strokeW = active ? 2.2 : 1.6;

  switch (icon) {
    case 'home':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'cases':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect
            x={3}
            y={4}
            width={18}
            height={16}
            rx={3}
            stroke={color}
            strokeWidth={strokeW}
          />
          <Path
            d="M8 2v4M16 2v4M3 10h18M8 14h8"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'lawyers':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2v20M5 7l7-4 7 4M2 13c0 2.2 1.8 4 4 4s4-1.8 4-4L6 7 2 13zM14 13c0 2.2 1.8 4 4 4s4-1.8 4-4l-4-6-4 6zM8 22h8"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'profile':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'requests':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'schedule':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={strokeW} />
          <Path
            d="M12 7v5l3 3"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'map':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M1 6v15l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v15M16 6v15"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'analytics':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 20V10M12 20V4M6 20v-6"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'reports':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'media':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x={2} y={7} width={20} height={14} rx={3} stroke={color} strokeWidth={strokeW} />
          <Path d="M17 2l-5 5-5-5" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}

export default function BottomNavBar({ role = 'citizen', activeTab = 'home' }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useAppTheme();
  const tabs = ROLE_TABS[role] || ROLE_TABS.citizen;

  const handleTabPress = (tab) => {
    if (tab.id === activeTab) return;
    router.replace(tab.route);
  };

  const navBg = isDarkMode ? '#080402' : '#FFFFFF';
  const navBorder = isDarkMode ? 'rgba(255, 150, 40, 0.22)' : 'rgba(234, 88, 12, 0.18)';
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);

  return (
    <View style={[styles.navContainer, { backgroundColor: navBg, borderTopColor: navBorder, paddingBottom: bottomPadding }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 45 : 70}
        tint={isDarkMode ? 'dark' : 'light'}
        style={[styles.blurWrap, { backgroundColor: isDarkMode ? 'rgba(10, 4, 2, 0.92)' : 'rgba(255, 255, 255, 0.92)' }]}
      >
        {isDarkMode && <View style={styles.topSheen} pointerEvents="none" />}

        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabBtn}
                onPress={() => handleTabPress(tab)}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                {isActive && (
                  <View style={[styles.activeGlowPill, !isDarkMode && { backgroundColor: 'rgba(234, 88, 12, 0.12)' }]} pointerEvents="none" />
                )}
                <View style={styles.iconContainer}>
                  {renderTabIcon(tab.icon, isActive, isDarkMode)}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.tabLabelActive : (isDarkMode ? styles.tabLabelInactiveDark : styles.tabLabelInactiveLight),
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#080402',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 150, 40, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 99,
  },
  blurWrap: {
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'rgba(10, 4, 2, 0.88)',
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 180, 60, 0.35)',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeGlowPill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 6,
    right: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.14)',
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#FFA726',
  },
  tabLabelInactiveDark: {
    color: 'rgba(255, 220, 180, 0.45)',
  },
  tabLabelInactiveLight: {
    color: 'rgba(70, 40, 20, 0.55)',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF9500',
    marginTop: 3,
  },
});
