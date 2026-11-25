import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../context/ThemeContext';

/**
 * Smooths raw touch points into a continuous SVG path using quadratic Bézier midpoint interpolation.
 * This completely eliminates corner jaggedness and gives a natural, fluid signature line.
 */
function pointsToSmoothSvgPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    const p0 = points[0];
    return `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} L ${(p0.x + 0.3).toFixed(1)} ${(p0.y + 0.3).toFixed(1)}`;
  }
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  // With 3+ points, connect through midpoints with quadratic Bézier curves
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = ((points[i].x + points[i + 1].x) / 2).toFixed(1);
    const midY = ((points[i].y + points[i + 1].y) / 2).toFixed(1);
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}, ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

export default function FingerSignaturePad({
  onSignatureChange,
  initialPaths,
  height = 140,
  signerRole = 'Signer', // 'Advocate' | 'Citizen'
  signerName = '',
}) {
  const { theme, isDark } = useAppTheme();
  const [strokes, setStrokes] = useState(() => (Array.isArray(initialPaths) ? initialPaths : []));
  const [currentStroke, setCurrentStroke] = useState('');
  const strokesRef = useRef(Array.isArray(initialPaths) ? initialPaths : []);
  const currentPointsRef = useRef([]);

  // Sync with initialPaths if passed and changed externally
  useEffect(() => {
    if (Array.isArray(initialPaths) && initialPaths !== strokesRef.current) {
      strokesRef.current = initialPaths;
      setStrokes(initialPaths);
      setCurrentStroke('');
      currentPointsRef.current = [];
    }
  }, [initialPaths]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPointsRef.current = [{ x: locationX, y: locationY }];
        const d = pointsToSmoothSvgPath(currentPointsRef.current);
        setCurrentStroke(d);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const pts = currentPointsRef.current;
        if (!pts || pts.length === 0) {
          currentPointsRef.current = [{ x: locationX, y: locationY }];
          return;
        }
        const last = pts[pts.length - 1];
        const dx = locationX - last.x;
        const dy = locationY - last.y;
        // Suppress micro-jitter less than 1.5 pixels
        if (dx * dx + dy * dy < 2.25) {
          return;
        }
        pts.push({ x: locationX, y: locationY });
        const d = pointsToSmoothSvgPath(pts);
        setCurrentStroke(d);
      },
      onPanResponderRelease: () => {
        const pts = currentPointsRef.current;
        if (pts && pts.length > 0) {
          const finalD = pointsToSmoothSvgPath(pts);
          const updated = [...strokesRef.current, finalD];
          strokesRef.current = updated;
          setStrokes(updated);
          setCurrentStroke('');
          currentPointsRef.current = [];
          if (onSignatureChange) {
            onSignatureChange(updated);
          }
        }
      },
      onPanResponderTerminate: () => {
        const pts = currentPointsRef.current;
        if (pts && pts.length > 0) {
          const finalD = pointsToSmoothSvgPath(pts);
          const updated = [...strokesRef.current, finalD];
          strokesRef.current = updated;
          setStrokes(updated);
          setCurrentStroke('');
          currentPointsRef.current = [];
          if (onSignatureChange) {
            onSignatureChange(updated);
          }
        }
      },
    })
  ).current;

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    const updated = strokesRef.current.slice(0, -1);
    strokesRef.current = updated;
    setStrokes(updated);
    setCurrentStroke('');
    if (onSignatureChange) {
      onSignatureChange(updated);
    }
  };

  const handleClear = () => {
    strokesRef.current = [];
    currentPointsRef.current = [];
    setStrokes([]);
    setCurrentStroke('');
    if (onSignatureChange) {
      onSignatureChange([]);
    }
  };

  const hasSignature = strokes.length > 0 || Boolean(currentStroke);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.signerBadge}>
          <Text style={styles.signerRoleText}>{signerRole.toUpperCase()} SIGNATURE PAD</Text>
        </View>
        <View style={styles.headerActions}>
          {strokes.length > 0 && (
            <TouchableOpacity
              onPress={handleUndo}
              style={styles.undoBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.undoBtnText}>Undo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleClear}
            style={[styles.clearBtn, { opacity: hasSignature ? 1 : 0.4 }]}
            disabled={!hasSignature}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.padCanvas,
          {
            height,
            backgroundColor: isDark ? 'rgba(20, 10, 4, 0.75)' : '#FAF8F5',
            borderColor: hasSignature
              ? '#FF9500'
              : isDark
              ? 'rgba(255, 160, 40, 0.3)'
              : 'rgba(234, 88, 12, 0.25)',
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height={height} style={StyleSheet.absoluteFill}>
          {strokes.map((d, index) => (
            <Path
              key={`stroke-${index}`}
              d={d}
              stroke={isDark ? '#FFA726' : '#EA580C'}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {Boolean(currentStroke) && (
            <Path
              d={currentStroke}
              stroke={isDark ? '#FFA726' : '#EA580C'}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>

        {!hasSignature && (
          <View style={styles.watermarkContainer} pointerEvents="none">
            <Text
              style={[
                styles.watermarkText,
                {
                  color: isDark
                    ? 'rgba(255, 220, 180, 0.4)'
                    : 'rgba(100, 70, 50, 0.4)',
                },
              ]}
            >
              Sign here with your finger
            </Text>
            <View
              style={[
                styles.guideline,
                {
                  borderColor: isDark
                    ? 'rgba(255, 160, 40, 0.2)'
                    : 'rgba(234, 88, 12, 0.2)',
                },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.footerRow}>
        <Text
          style={[
            styles.footerText,
            { color: isDark ? 'rgba(255, 220, 180, 0.6)' : '#7C6859' },
          ]}
        >
          {hasSignature
            ? `${strokes.length + (currentStroke ? 1 : 0)} stroke(s) recorded`
            : 'Touch and draw your legal mark above'}
        </Text>
        {signerName ? (
          <Text style={[styles.signerName, { color: theme.textPrimary }]}>
            {signerName}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  signerBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.3)',
  },
  signerRoleText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFB74D',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  undoBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  undoBtnText: {
    fontSize: 11,
    color: '#FCD34D',
    fontWeight: '700',
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  clearBtnText: {
    fontSize: 11,
    color: '#FF9500',
    fontWeight: '700',
  },
  padCanvas: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  watermarkText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  guideline: {
    width: '80%',
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  footerText: {
    fontSize: 10.5,
    fontStyle: 'italic',
  },
  signerName: {
    fontSize: 11,
    fontWeight: '700',
  },
});
