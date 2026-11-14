import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#060201',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(25, 12, 5, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
  },
  filterChipActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FFA726',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  filterText: {
    fontSize: 12,
    color: 'rgba(255, 220, 180, 0.65)',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0A0301',
    fontWeight: '800',
  },
  caseCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  caseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseType: {
    flex: 1,
    marginRight: 12,
  },
  caseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF5E8',
    letterSpacing: -0.2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB74D',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 60, 0.3)',
    textTransform: 'uppercase',
  },
  caseMeta: {
    fontSize: 12,
    color: '#C8A892',
    marginTop: 4,
  },
  emptyText: {
    color: 'rgba(255, 220, 180, 0.5)',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
