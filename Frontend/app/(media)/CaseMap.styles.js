import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080402',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  introCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    backgroundColor: 'rgba(34, 16, 12, 0.95)',
    borderColor: 'rgba(245, 158, 11, 0.40)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  introSub: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});
