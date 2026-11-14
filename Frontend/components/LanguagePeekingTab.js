import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Available translation languages
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي' },
];

export default function LanguagePeekingTab() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isExpanded, setIsExpanded] = useState(false);

  // Position limits: lower half of the screen
  const MIN_Y = SCREEN_HEIGHT * 0.42;
  const MAX_Y = SCREEN_HEIGHT * 0.80;
  const DEFAULT_Y = SCREEN_HEIGHT * 0.62;

  // Vertical position animated value
  const panY = useRef(new Animated.Value(DEFAULT_Y)).current;
  const currentY = useRef(DEFAULT_Y);

  // Horizontal expand animation (0 = collapsed/peeking, 1 = fully expanded)
  const expandAnim = useRef(new Animated.Value(0)).current;

  // PanResponder to allow dragging vertically up and down
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only take over if vertical movement is significant
        return Math.abs(gestureState.dy) > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        panY.setOffset(currentY.current);
        panY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const nextY = currentY.current + gestureState.dy;
        if (nextY >= MIN_Y && nextY <= MAX_Y) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        panY.flattenOffset();
        let targetY = currentY.current + gestureState.dy;
        targetY = Math.max(MIN_Y, Math.min(MAX_Y, targetY));
        currentY.current = targetY;

        Animated.spring(panY, {
          toValue: targetY,
          useNativeDriver: false,
          friction: 7,
          tension: 50,
        }).start();
      },
    })
  ).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
  };

  const handleSelect = (code) => {
    setSelectedLang(code);
    // User can add functionality later
  };

  // Card slide-in offset from the right
  const cardTranslateX = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [180, 0],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          top: panY,
          transform: [{ translateX: cardTranslateX }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Drag handle & trigger notch */}
        <TouchableOpacity
          style={styles.peekingHandle}
          activeOpacity={0.85}
          onPress={toggleExpand}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <LinearGradient
            colors={['#251206', '#140803', '#0C0402']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.handleGradient}
          >
            {/* Drag dots */}
            <View style={styles.dragGrip}>
              <View style={styles.gripDot} />
              <View style={styles.gripDot} />
              <View style={styles.gripDot} />
            </View>

            {/* Globe icon */}
            <Text style={styles.globeIcon}>🌐</Text>

            {/* Compact text in collapsed state */}
            {!isExpanded && (
              <View style={styles.compactLabelBox}>
                <Text style={styles.langNameUrdu}>اردو</Text>
                <Text style={styles.langSep}>|</Text>
                <Text style={styles.langNameSindhi}>سنڌي</Text>
              </View>
            )}

            {/* Arrow chevron */}
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={styles.arrowIcon}>
              <Path
                d={isExpanded ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'}
                stroke="#FFB74D"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </LinearGradient>
        </TouchableOpacity>

        {/* Expanded language switcher panel */}
        {isExpanded && (
          <View style={styles.expandedPanel}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 45 : 70}
              tint="dark"
              style={styles.blurCard}
            >
              <LinearGradient
                colors={['#1F0E06', '#140804', '#0B0402']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Header */}
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>SELECT LANGUAGE</Text>
                  <Text style={styles.panelSubUrdu}>تبدیل کریں</Text>
                </View>

                {/* Language list chips */}
                <View style={styles.chipsRow}>
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.chip,
                          isSelected && styles.chipActive,
                        ]}
                        onPress={() => handleSelect(lang.code)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.chipNative,
                            isSelected && styles.chipNativeActive,
                          ]}
                        >
                          {lang.native}
                        </Text>
                        <Text
                          style={[
                            styles.chipLabel,
                            isSelected && styles.chipLabelActive,
                          ]}
                        >
                          {lang.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 0,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peekingHandle: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderRightWidth: 0,
    borderColor: 'rgba(255, 149, 0, 0.45)',
    shadowColor: '#FF9500',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  handleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingLeft: 7,
    paddingRight: 9,
    gap: 5,
  },
  dragGrip: {
    flexDirection: 'column',
    gap: 2.5,
    paddingRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gripDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 180, 80, 0.65)',
  },
  globeIcon: {
    fontSize: 13,
  },
  compactLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },
  langNameUrdu: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFEED6',
    letterSpacing: 0.3,
  },
  langSep: {
    fontSize: 10,
    color: 'rgba(255, 149, 0, 0.5)',
  },
  langNameSindhi: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFB74D',
    letterSpacing: 0.3,
  },
  arrowIcon: {
    marginLeft: 1,
  },
  expandedPanel: {
    width: 195,
    marginRight: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.35)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  blurCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.15)',
  },
  panelTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: 1.2,
  },
  panelSubUrdu: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 235, 215, 0.6)',
  },
  chipsRow: {
    flexDirection: 'column',
    gap: 5,
  },
  chip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 149, 0, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.12)',
  },
  chipActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.22)',
    borderColor: '#FF9500',
  },
  chipNative: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 240, 220, 0.85)',
  },
  chipNativeActive: {
    color: '#FFF2E0',
    fontWeight: '800',
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 200, 140, 0.55)',
  },
  chipLabelActive: {
    color: '#FFB74D',
    fontWeight: '700',
  },
});
