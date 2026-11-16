import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0C0502',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#140803',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 149, 0, 0.20)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'column',
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  brandSub: {
    fontSize: 9.5,
    marginTop: 1,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  publishHeaderBtn: {
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 167, 38, 0.55)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  publishHeaderBtnText: {
    color: '#FFB74D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  orgName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
  },
  orgSub: {
    fontSize: 10,
    marginTop: 1,
  },

  // ── TOP STATS CHIPS (COMPACT ROW CONNECTED TO HEATMAP API) ──
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  statChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(28, 14, 6, 0.85)',
    borderColor: 'rgba(255, 160, 40, 0.35)',
    alignItems: 'center',
  },
  statChipHotspot: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  statNum: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 8.5,
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ── QUICK NAVIGATION GRID (3 COMPACT TILES - NO EMBEDDED MAP ON HOME) ──
  navGridRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  navTile: {
    flex: 1,
    backgroundColor: '#1B0E07',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTileIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  navTileTitle: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  navTileSub: {
    fontSize: 8.5,
    marginTop: 1,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── SCROLL CONTENT CONTAINER ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
    gap: 12,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 6,
  },
  sectionBadgeText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9500',
  },

  // ── AID REQUEST / CITIZEN LEAD CARDS ──
  leadCard: {
    backgroundColor: '#1B0E07',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 160, 40, 0.30)',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  leadCardAssisted: {
    borderColor: 'rgba(16, 185, 129, 0.55)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  leadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadRefBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    borderColor: 'rgba(255, 167, 38, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  leadRefText: {
    color: '#FFA726',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  relayBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  relayBadgeText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '800',
  },

  leadDistrictText: {
    fontSize: 11,
    fontWeight: '700',
  },
  leadSummaryBox: {
    backgroundColor: 'rgba(255, 149, 0, 0.06)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.12)',
  },
  leadSummaryText: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  // ── ACTION BUTTONS ──
  investigateBtn: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FFA726',
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  investigateBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderColor: '#10B981',
  },
  investigateBtnText: {
    color: '#FFA726',
    fontSize: 11,
    fontWeight: '800',
  },
  investigateBtnTextActive: {
    color: '#10B981',
  },

  // ── MODAL STYLES ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#180B04',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.35)',
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '700',
  },

  privacyPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    borderWidth: 0.8,
    padding: 8,
    borderRadius: 6,
  },
  privacyText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
  },

  modalInputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFA726',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#26130A',
    borderWidth: 1,
    borderColor: '#3D2012',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 12,
  },
  modalTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },

  publishSubmitBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },
  publishSubmitBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
