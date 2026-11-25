import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080402' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },
  introCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
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
