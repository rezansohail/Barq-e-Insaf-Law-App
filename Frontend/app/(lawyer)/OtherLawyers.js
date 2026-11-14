import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './OtherLawyers.styles';
import { useMockStore, otherLawyers, fetchOtherLawyers } from './MockStore';
import { getCurrentLawyerId } from '../../constants/authStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function OtherLawyers() {
  useMockStore();
  const router = useRouter();
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  React.useEffect(() => {
    fetchOtherLawyers(getCurrentLawyerId());
  }, []);

  const handleLawyerPress = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowProfile(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#080402" />
      
      <AppHeader 
        title="Peer Advocates" 
        showBack={true} 
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {otherLawyers.length === 0 && (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>No other advocates registered yet.</Text>
          </View>
        )}
        {otherLawyers.map((lawyer, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.lawyerCard}
            onPress={() => handleLawyerPress(lawyer)}
          >
            <View style={[styles.avatarLarge, { backgroundColor: lawyer.color || '#E65100' }]}>
              <Text style={styles.avatarText}>{lawyer.initials}</Text>
            </View>
            <View style={styles.lawyerInfo}>
              <Text style={styles.lawyerName}>{lawyer.name}</Text>
              <Text style={styles.lawyerSpec}>{lawyer.spec}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingText}>{lawyer.rating} ({lawyer.successfulCasesCount} cases)</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: lawyer.isAvailable ? '#4ade80' : '#ef4444' }]} />
                <Text style={styles.statusText}>{lawyer.isAvailable ? 'Available for Counsel' : 'Chamber Busy'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lawyer Profile Modal */}
      <Modal
        transparent={true}
        visible={showProfile}
        animationType="slide"
        onRequestClose={() => setShowProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setShowProfile(false)}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            {selectedLawyer && (
              <>
                <View style={[styles.modalAvatar, { backgroundColor: selectedLawyer.color || '#E65100' }]}>
                  <Text style={styles.modalAvatarText}>{selectedLawyer.initials}</Text>
                </View>
                
                <Text style={styles.modalName}>{selectedLawyer.name}</Text>
                <Text style={styles.modalSpec}>{selectedLawyer.spec}</Text>
                
                <View style={styles.modalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{selectedLawyer.district}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Experience</Text>
                    <Text style={styles.detailValue}>{selectedLawyer.experience}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rating</Text>
                    <Text style={styles.detailValue}>{selectedLawyer.rating} ★</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cases</Text>
                    <Text style={styles.detailValue}>{selectedLawyer.successfulCasesCount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Education</Text>
                    <Text style={styles.detailValue}>{selectedLawyer.education}</Text>
                  </View>
                  <View style={[styles.detailRow, styles.detailRowLast]}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[styles.detailValue, { color: selectedLawyer.isAvailable ? '#4ade80' : '#ef4444' }]}>
                      {selectedLawyer.isAvailable ? 'Available' : 'Not Available'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.aboutText}>{selectedLawyer.about}</Text>

                {selectedLawyer.reviews && selectedLawyer.reviews.length > 0 && (
                  <View style={styles.reviewsSection}>
                    <Text style={styles.reviewsTitle}>Client Reviews</Text>
                    {selectedLawyer.reviews.slice(0, 2).map((review, idx) => (
                      <View key={idx} style={styles.reviewItem}>
                        <Text style={styles.reviewName}>{review.clientName}</Text>
                        <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Shared bottom navigation */}
      <BottomNavBar role="lawyer" activeTab="cases" />
    </SafeAreaView>
  );
}
