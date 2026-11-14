import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#060201',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF5E8',
    marginBottom: 4,
  },
  caseName: {
    fontSize: 13,
    color: '#FFB74D',
    fontWeight: '700',
    marginBottom: 10,
  },
  info: {
    fontSize: 12,
    color: 'rgba(255, 220, 180, 0.65)',
    lineHeight: 18,
    marginBottom: 16,
  },
  evidenceContainer: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  bulletBox: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    marginRight: 12,
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  evidenceText: {
    fontSize: 13,
    color: '#FFF5E8',
    fontWeight: '600',
    flex: 1,
  },
  emptyText: {
    color: 'rgba(255, 220, 180, 0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
