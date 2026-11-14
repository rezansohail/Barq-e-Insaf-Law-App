import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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

  // WELCOME BANNER (Featured Hero Card with glowing amber border)
  welcomeBanner: {
    backgroundColor: 'rgba(32, 16, 7, 0.95)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 160, 40, 0.35)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  greetingSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF9500',
    letterSpacing: 1,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF5E8',
    letterSpacing: 0.2,
  },
  districtBadgeText: {
    fontSize: 11.5,
    color: 'rgba(255, 220, 180, 0.75)',
    marginTop: 4,
    fontWeight: '600',
  },

  // BUILD CASE CTA BUTTON
  buildCaseBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  buildCaseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buildCaseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0A0301',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildCaseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  buildCaseBtnSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  buildCaseArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  buildCaseArrowImg: {
    width: 22,
    height: 15,
  },
  inlineArrowImg: {
    width: 14,
    height: 10,
  },

  // SECTION HEADERS
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFB74D',
    letterSpacing: 0.3,
  },
  seeAllText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FF9500',
  },

  // LAWYER ROW & CARDS (Subtle darker container, NO harsh orange border for visual separation)
  lawyerRow: {
    gap: 12,
    paddingBottom: 14,
  },
  lawyerCard: {
    width: width * 0.58,
    backgroundColor: 'rgba(20, 10, 4, 0.92)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)', // Clean subtle separation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  lawyerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lawyerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lawyerAvatarText: {
    color: '#FFF5E8',
    fontSize: 13,
    fontWeight: '900',
  },
  sbcPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  sbcPillText: {
    color: '#4ade80',
    fontSize: 9.5,
    fontWeight: '800',
  },
  lawyerName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFF5E8',
    marginBottom: 2,
  },
  lawyerSpec: {
    fontSize: 11,
    color: '#FFB74D',
    fontWeight: '600',
    marginBottom: 8,
  },
  lawyerCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFB74D',
  },
  consultFee: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 220, 180, 0.75)',
  },
  emptyCard: {
    backgroundColor: 'rgba(20, 10, 4, 0.85)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(255, 220, 180, 0.55)',
  },

  // ACTIVE CASES LIST (Distinct tone)
  caseItem: {
    backgroundColor: 'rgba(28, 14, 6, 0.94)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  caseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  caseInfo: {
    flex: 1,
  },
  caseTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFF5E8',
    marginBottom: 2,
  },
  caseSub: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.65)',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  noCaseCard: {
    backgroundColor: 'rgba(22, 11, 5, 0.85)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.20)',
    marginBottom: 14,
    borderStyle: 'dashed',
  },
  noCaseTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFF5E8',
    marginBottom: 2,
  },
  noCaseSub: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },

  // INSTITUTIONAL PARTNERS (Soft contrasting card)
  partnerCardsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  partnerCard: {
    backgroundColor: 'rgba(24, 12, 5, 0.94)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  partnerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 149, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.16)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  partnerPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFB74D',
    letterSpacing: 0.5,
  },
  partnerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFF5E8',
    lineHeight: 18,
  },
  partnerSub: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.65)',
    marginTop: 2,
    lineHeight: 15,
  },
  partnerBottomRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 149, 0, 0.14)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  partnerActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF9500',
  },
});
