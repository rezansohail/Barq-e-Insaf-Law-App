import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import Svg, { Path, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { useAppTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SindhCasesMap({ cases = [], onCaseSelect }) {
  const { isDarkMode } = useAppTheme();
  const [selectedCase, setSelectedCase] = useState(null);

  const districtSeverityMap = useMemo(() => {
    const total = cases.length || 1;
    const counts = {};
    cases.forEach((c) => {
      const d = c.district || 'Karachi Central';
      counts[d] = (counts[d] || 0) + 1;
    });

    const map = {};
    Object.entries(counts).forEach(([dist, count]) => {
      const ratio = count / total;
      if (ratio >= 0.35 || count >= 3) {
        map[dist] = { level: 'High Hotspot', color: '#EF4444', label: 'High Hotspot' };
      } else if (ratio >= 0.15 || count >= 2) {
        map[dist] = { level: 'Moderate', color: '#F59E0B', label: 'Moderate' };
      } else {
        map[dist] = { level: 'Low', color: '#10B981', label: 'Low Frequency' };
      }
    });
    return map;
  }, [cases]);

  const handlePointerPress = (c) => {
    setSelectedCase(c);
    if (onCaseSelect) onCaseSelect(c);
  };

  // Canvas bounds
  const mapWidth = Math.min(SCREEN_WIDTH - 32, 420);
  const mapHeight = mapWidth * 1.15;

  return (
    <View style={styles.container}>
      {/* Visual Legend Header */}
      <View style={[styles.legendCard, { backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.94)' : '#FFFFFF' }]}>
        <View style={styles.legendRow}>
          <View style={styles.legendGroup}>
            <Text style={[styles.legendGroupTitle, { color: isDarkMode ? '#FFB74D' : '#C2410C' }]}>
              CASE CATEGORIES:
            </Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendMarker, { backgroundColor: '#FF9100' }]} />
                <Text style={[styles.legendText, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
                  Property Dispute
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendMarker, { backgroundColor: '#00E5FF' }]} />
                <Text style={[styles.legendText, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
                  Family / Custody
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.legendGroup}>
            <Text style={[styles.legendGroupTitle, { color: isDarkMode ? '#FFB74D' : '#C2410C' }]}>
              RECENCY SHADING:
            </Text>
            <View style={styles.shadeScale}>
              <View style={styles.shadeStep}>
                <View style={[styles.shadeDot, { backgroundColor: '#FF9100' }]} />
                <Text style={styles.shadeLabel}>New (0-2d)</Text>
              </View>
              <View style={styles.shadeStep}>
                <View style={[styles.shadeDot, { backgroundColor: '#B45309' }]} />
                <Text style={styles.shadeLabel}>Older</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dynamic Sindh Hotspot Ratios */}
        <View style={styles.hotspotLegendRow}>
          <Text style={[styles.legendGroupTitle, { color: isDarkMode ? '#FFB74D' : '#C2410C' }]}>
            HOTSPOT SEVERITY:
          </Text>
          <View style={styles.hotspotItems}>
            <View style={styles.hotspotItem}>
              <View style={[styles.hotspotDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.hotspotLabel}>High Hotspot</Text>
            </View>
            <View style={styles.hotspotItem}>
              <View style={[styles.hotspotDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.hotspotLabel}>Moderate</Text>
            </View>
            <View style={styles.hotspotItem}>
              <View style={[styles.hotspotDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.hotspotLabel}>Low / Stable</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sindh Map Canvas Container */}
      <View
        style={[
          styles.mapCanvasWrapper,
          {
            width: mapWidth,
            height: mapHeight,
            backgroundColor: isDarkMode ? 'rgba(18, 9, 4, 0.96)' : '#F5F1E9',
            borderColor: isDarkMode ? 'rgba(255, 160, 40, 0.35)' : 'rgba(234, 88, 12, 0.25)',
          },
        ]}
      >
        {/* SVG Outline Representation of Sindh Province */}
        <Svg width={mapWidth} height={mapHeight} viewBox="0 0 100 115">
          {/* Sindh Geographic Boundary Silhouette */}
          <Path
            d="M 40 12 
               L 55 10 
               L 75 18 
               L 82 26 
               L 78 40 
               L 85 58 
               L 82 82 
               L 66 92 
               L 52 92 
               L 42 90 
               L 36 86 
               L 26 84 
               L 22 76 
               L 28 66 
               L 35 50 
               L 32 38 
               L 36 24 
               Z"
            fill={isDarkMode ? 'rgba(38, 18, 8, 0.85)' : 'rgba(255, 235, 215, 0.75)'}
            stroke={isDarkMode ? 'rgba(255, 160, 40, 0.45)' : 'rgba(234, 88, 12, 0.45)'}
            strokeWidth="1.2"
            strokeDasharray="2,1"
          />

          {/* Internal Major District Centers & Division Markers */}
          <G opacity={isDarkMode ? 0.35 : 0.5}>
            {/* Indus River Arterial Curve */}
            <Path
              d="M 68 18 Q 58 35 46 54 T 38 84"
              fill="none"
              stroke="#0284C7"
              strokeWidth="0.8"
              strokeDasharray="1.5,1.5"
            />
            {/* Key Regional City Nodes */}
            <Circle cx="62" cy="28" r="1.2" fill={isDarkMode ? '#FFB74D' : '#C2410C'} />
            <SvgText x="64" y="29" fill={isDarkMode ? 'rgba(255,220,180,0.6)' : '#666'} fontSize="3" fontWeight="600">Sukkur</SvgText>

            <Circle cx="42" cy="34" r="1.2" fill={isDarkMode ? '#FFB74D' : '#C2410C'} />
            <SvgText x="31" y="35" fill={isDarkMode ? 'rgba(255,220,180,0.6)' : '#666'} fontSize="3" fontWeight="600">Larkana</SvgText>

            <Circle cx="50" cy="52" r="1.2" fill={isDarkMode ? '#FFB74D' : '#C2410C'} />
            <SvgText x="52" y="53" fill={isDarkMode ? 'rgba(255,220,180,0.6)' : '#666'} fontSize="3" fontWeight="600">Nawabshah</SvgText>

            <Circle cx="44" cy="68" r="1.2" fill={isDarkMode ? '#FFB74D' : '#C2410C'} />
            <SvgText x="46" y="69" fill={isDarkMode ? 'rgba(255,220,180,0.6)' : '#666'} fontSize="3" fontWeight="600">Hyderabad</SvgText>

            <Circle cx="30" cy="82" r="1.5" fill={isDarkMode ? '#FFB74D' : '#C2410C'} />
            <SvgText x="16" y="83" fill={isDarkMode ? 'rgba(255,220,180,0.85)' : '#333'} fontSize="3.5" fontWeight="800">Karachi</SvgText>

            <Circle cx="60" cy="70" r="1.2" fill={isDarkMode ? '#FFB74D' : '#C2410C'} />
            <SvgText x="62" y="71" fill={isDarkMode ? 'rgba(255,220,180,0.6)' : '#666'} fontSize="3" fontWeight="600">Mirpurkhas</SvgText>

            <Circle cx="54" cy="86" r="1.2" fill={isDarkMode ? '#FFB74D' : '#C2410C'} />
            <SvgText x="56" y="87" fill={isDarkMode ? 'rgba(255,220,180,0.6)' : '#666'} fontSize="3" fontWeight="600">Badin</SvgText>
          </G>
        </Svg>

        {/* Real Cases Pointers Plotted on Sindh Canvas */}
        {cases.map((c, index) => {
          const posX = (c.coords.x / 100) * mapWidth;
          const posY = (c.coords.y / 100) * mapHeight;
          const { color, glow, category } = c.colorProfile;
          const isSelected = selectedCase && selectedCase.id === c.id;
          const districtSeverity = districtSeverityMap[c.district] || { color: '#F59E0B' };

          return (
            <TouchableOpacity
              key={c.id || index}
              style={[
                styles.pointerBtn,
                {
                  left: Math.max(12, Math.min(mapWidth - 36, posX - 14)),
                  top: Math.max(12, Math.min(mapHeight - 36, posY - 14)),
                },
              ]}
              onPress={() => handlePointerPress(c)}
              activeOpacity={0.8}
            >
              {/* Outer Pulse Glow */}
              <View
                style={[
                  styles.pulseRing,
                  {
                    backgroundColor: glow,
                    borderColor: districtSeverity.color || color,
                    transform: [{ scale: isSelected ? 1.4 : 1 }],
                  },
                ]}
              />
              {/* Center Marker Dot */}
              <View style={[styles.markerDot, { backgroundColor: color, borderColor: districtSeverity.color }]}>
                <View style={styles.innerDotCore} />
              </View>

              {/* Speaker pin indicator if media requested */}
              {c.mediaRequested && (
                <View style={styles.pinSpeakerBadge}>
                  <Image source={require('../assets/images/speaker.png')} style={styles.pinSpeakerIcon} />
                </View>
              )}

              {/* Date Tag Badge below pointer */}
              <View style={[styles.pointerDateBadge, { backgroundColor: isDarkMode ? 'rgba(10, 5, 2, 0.92)' : '#FFFFFF' }]}>
                <Text style={[styles.pointerDateText, { color: color }]}>
                  {c.filingDate}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {cases.length === 0 && (
          <View style={styles.emptyMapNotice}>
            <Text style={styles.emptyNoticeTitle}>Synchronizing Active Cases</Text>
            <Text style={styles.emptyNoticeSub}>
              Pointers will dynamically plot as cases are registered across Sindh districts.
            </Text>
          </View>
        )}
      </View>

      {/* Case Count Summary Banner */}
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryText, { color: isDarkMode ? 'rgba(255, 235, 215, 0.75)' : '#4A2A15' }]}>
          Showing {cases.length} active registered {cases.length === 1 ? 'case' : 'cases'} in Sindh Province
        </Text>
      </View>

      {/* Case Details Popup Modal (Strictly No Personal Information) */}
      <Modal
        visible={!!selectedCase}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCase(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedCase(null)}
        >
          <View
            style={[
              styles.caseModalCard,
              {
                backgroundColor: isDarkMode ? 'rgba(28, 14, 6, 0.98)' : '#FFFFFF',
                borderColor: selectedCase?.colorProfile.color || 'rgba(255, 160, 40, 0.4)',
              },
            ]}
          >
            {selectedCase && (
              <>
                <View style={styles.modalTopRow}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: selectedCase.colorProfile.color },
                    ]}
                  >
                    <Text style={styles.categoryBadgeText}>
                      {selectedCase.type}
                    </Text>
                  </View>
                  <Text style={[styles.modalDate, { color: isDarkMode ? '#FFB74D' : '#C2410C' }]}>
                    Filing Date: {selectedCase.filingDate}
                  </Text>
                </View>

                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
                  {selectedCase.title}
                </Text>

                {/* Media Investigation Requested Tag */}
                {selectedCase.mediaRequested && (
                  <View style={styles.mediaInvestigationBadge}>
                    <Image
                      source={require('../assets/images/speaker.png')}
                      style={styles.speakerIcon}
                    />
                    <Text style={styles.mediaInvestigationText}>Media Investigation Requested</Text>
                  </View>
                )}

                <View style={styles.jurisdictionRow}>
                  <Text style={styles.jurisdictionText}>
                    Jurisdiction: {selectedCase.district} · {selectedCase.court}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {districtSeverityMap[selectedCase.district] && (
                      <View style={[styles.hotspotBadge, { backgroundColor: `${districtSeverityMap[selectedCase.district].color}25`, borderColor: districtSeverityMap[selectedCase.district].color }]}>
                        <Text style={[styles.hotspotBadgeText, { color: districtSeverityMap[selectedCase.district].color }]}>
                          {districtSeverityMap[selectedCase.district].level}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.ageLabel, { color: selectedCase.colorProfile.color }]}>
                      {selectedCase.colorProfile.shadeLabel}
                    </Text>
                  </View>
                </View>

                {/* Brief Facts & Description Only (Zero Personal Data) */}
                <View style={[styles.descBox, { backgroundColor: isDarkMode ? 'rgba(16, 8, 4, 0.92)' : '#F5F1E9' }]}>
                  <Text style={[styles.descTitle, { color: isDarkMode ? '#FFB74D' : '#7A3508' }]}>
                    Case Brief & Documentation Overview:
                  </Text>
                  <Text style={[styles.descBody, { color: isDarkMode ? 'rgba(255, 240, 225, 0.88)' : '#261408' }]}>
                    {selectedCase.description}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: selectedCase.colorProfile.color }]}
                  onPress={() => setSelectedCase(null)}
                >
                  <Text style={styles.closeBtnText}>CLOSE CASE INSPECTION</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legendCard: {
    width: '100%',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  legendGroup: {
    flex: 1,
  },
  legendGroupTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  legendItems: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  shadeScale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  shadeStep: {
    alignItems: 'center',
    gap: 3,
  },
  shadeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shadeLabel: {
    fontSize: 9,
    color: 'rgba(255, 220, 180, 0.65)',
    fontWeight: '600',
  },
  mapCanvasWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointerBtn: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 38,
    zIndex: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    opacity: 0.7,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDotCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  pointerDateBadge: {
    marginTop: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 160, 40, 0.3)',
  },
  pointerDateText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  emptyMapNotice: {
    position: 'absolute',
    padding: 16,
    alignItems: 'center',
  },
  emptyNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFB74D',
    marginBottom: 4,
  },
  emptyNoticeSub: {
    fontSize: 11,
    color: 'rgba(255, 235, 215, 0.65)',
    textAlign: 'center',
    maxWidth: 240,
  },
  summaryRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  caseModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#000000',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  modalDate: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 6,
  },
  jurisdictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jurisdictionText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  ageLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  descBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.2)',
  },
  descTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  descBody: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  closeBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  hotspotLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  hotspotItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hotspotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotspotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hotspotLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pinSpeakerBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF9500',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 30,
  },
  pinSpeakerIcon: {
    width: 8,
    height: 8,
    tintColor: '#000000',
    resizeMode: 'contain',
  },
  mediaInvestigationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFA726',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  speakerIcon: {
    width: 14,
    height: 14,
    tintColor: '#FFA726',
    resizeMode: 'contain',
  },
  mediaInvestigationText: {
    color: '#FFA726',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  hotspotBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  hotspotBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
