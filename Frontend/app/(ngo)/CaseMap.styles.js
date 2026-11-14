import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060201' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },

  legendRow: { flexDirection: 'row', gap: 14, marginBottom: 14, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 11, color: 'rgba(255, 220, 180, 0.7)', fontWeight: '600' },

  districtCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  districtIcon: { fontSize: 22 },
  districtInfo: { flex: 1 },
  districtName: { fontSize: 14, fontWeight: '800', color: '#FFF5E8' },
  districtMeta: { fontSize: 11, color: '#C8A892', marginTop: 2 },
  severityBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    textTransform: 'uppercase',
  },
  sevCritical: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    color: '#ef4444',
  },
  sevHigh: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    color: '#f59e0b',
  },
  sevCovered: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
    color: '#4ade80',
  },
});
