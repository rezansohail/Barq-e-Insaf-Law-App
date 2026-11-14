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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF5E8',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 220, 180, 0.6)',
    marginBottom: 16,
  },
  uploadActionCard: {
    backgroundColor: 'rgba(25, 12, 5, 0.75)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
    marginBottom: 18,
    gap: 10,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#FFEED6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  explorerBox: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    overflow: 'hidden',
  },
  explorerHeader: {
    backgroundColor: 'rgba(35, 16, 7, 0.9)',
    padding: 12,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB74D',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 160, 40, 0.15)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  fileIconBox: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.3)',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFB74D',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF5E8',
  },
  fileSize: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.5)',
    marginTop: 2,
  },
  importText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '800',
  },
});
