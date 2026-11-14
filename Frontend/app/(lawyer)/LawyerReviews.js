import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

// Reviews left by citizens (to be loaded from the backend API)
const reviewsList = [
  {
    clientName: 'Rezan Sohail',
    caseType: 'Property Dispute',
    score: '5.0',
    rating: '★★★★★',
    comment: 'Exceptional legal representation. The advocate guided our civil matter thoroughly with proper court filings.',
    date: '12 Nov 2026',
  },
  {
    clientName: 'Farooq Ahmed',
    caseType: 'Inheritance Matter',
    score: '4.8',
    rating: '★★★★★',
    comment: 'Very professional chamber consultancy. Clear advice on inheritance succession certificates.',
    date: '08 Nov 2026',
  },
];

export default function LawyerReviews() {
  const router = useRouter();
  const reviewCount = reviewsList.length;
  const averageScore = reviewCount > 0
    ? reviewsList.reduce((sum, r) => sum + Number(r.score || 0), 0) / reviewCount
    : 4.9;
  const filledStars = Math.round(averageScore);

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      {/* Modern '< Client Ratings & Reviews' Header */}
      <AppHeader
        title="Client Reviews"
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Rating Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryScore}>{averageScore.toFixed(1)}</Text>
          <Text style={styles.summaryStars}>{'★'.repeat(filledStars)}{'☆'.repeat(5 - filledStars)}</Text>
          <Text style={styles.summarySub}>Based on {reviewCount} verified client consultation{reviewCount === 1 ? '' : 's'}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified by Barq-e-Insaf & SBC</Text>
          </View>
        </View>

        {/* Reviews List Header */}
        <Text style={styles.sectionTitle}>Client Feedback</Text>

        {/* Render Review Cards */}
        {reviewCount === 0 && (
          <Text style={styles.emptyText}>No reviews recorded yet.</Text>
        )}
        {reviewsList.map((item, index) => (
          <View key={index} style={styles.reviewCard}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.clientName}>{item.clientName}</Text>
                <Text style={styles.caseType}>{item.caseType}</Text>
              </View>
              <View style={styles.scorePill}>
                <Text style={styles.scoreText}>★ {item.score}</Text>
              </View>
            </View>

            <Text style={styles.comment}>{item.comment}</Text>
            <Text style={styles.dateText}>Posted {item.date}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="lawyer" activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060201' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110, gap: 14 },
  summaryCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryScore: { fontSize: 44, fontWeight: '900', color: '#FFF5E8' },
  summaryStars: { color: '#FFA726', fontSize: 22, marginVertical: 4 },
  summarySub: { fontSize: 12, color: 'rgba(255, 220, 180, 0.6)', fontWeight: '600' },
  verifiedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    marginTop: 12,
  },
  verifiedText: { color: '#4ade80', fontSize: 11, fontWeight: '800' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#FFF5E8', marginTop: 4 },
  reviewCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  clientName: { fontSize: 15, fontWeight: '800', color: '#FFF5E8' },
  caseType: { fontSize: 12, color: '#FFB74D', marginTop: 2, fontWeight: '600' },
  scorePill: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.25)',
  },
  scoreText: { color: '#FFA726', fontSize: 11, fontWeight: '800' },
  comment: { fontSize: 13, color: '#C8A892', lineHeight: 19, marginBottom: 8 },
  dateText: { fontSize: 10, color: 'rgba(255, 220, 180, 0.45)', fontStyle: 'italic' },
  emptyText: { fontSize: 14, color: 'rgba(255, 220, 180, 0.5)', textAlign: 'center', marginTop: 20 },
});
