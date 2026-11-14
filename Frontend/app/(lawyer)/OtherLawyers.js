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
import { useMockStore, otherLawyers } from './MockStore';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function OtherLawyers() {
  useMockStore();
  const router = useRouter();
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  const handleLawyerPress = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowProfile(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      {/* Modern '< Bar Council Colleagues' Header */}
      <AppHeader
        title="Bar Council Colleagues"
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {otherLawyers.length === 0 && (
          <Text style={[styles.lawyerSpec, { textAlign: 'center', marginTop: 30 }]}>No other lawyers found</Text>
        )}
        {otherLawyers.map((lawyer, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.lawyerCard}
            onPress={() => handleLawyerPress(lawyer)}
            activeOpacity={0.78}
          >
            <View style={[styles.avatarLarge, { backgroundColor: lawyer.color || '#2A1206' }]}>
              <Text style={styles.avatarText}>{lawyer.initials}</Text>
            </View>
            <View style={styles.lawyerInfo}>
              <Text style={styles.lawyerName}>{lawyer.name}</Text>
              <Text style={styles.lawyerSpec}>{lawyer.spec}</Text>
              
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingText}>{lawyer.rating}</Text>
              </View>

              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: lawyer.status === 'Available' ? '#4ade80' : '#888' }]} />
                <Text style={styles.statusText}>{lawyer.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal Profile View */}
      <Modal
        visible={showProfile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setShowProfile(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {selectedLawyer && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.modalAvatar, { backgroundColor: selectedLawyer.color || '#2A1206' }]}>
                  <Text style={styles.modalAvatarText}>{selectedLawyer.initials}</Text>
                </View>
                
                <Text style={styles.modalName}>{selectedLawyer.name}</Text>
                <Text style={styles.modalSpec}>{selectedLawyer.spec}</Text>
                
                <View style={styles.modalRatingRow}>
                  <Text style={styles.ratingStar}>★</Text>
                  <Text style={styles.ratingText}>{selectedLawyer.rating} / 5.0</Text>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>SBC Bar License</Text>
                    <Text style={styles.infoValue}>{selectedLawyer.sbc || 'Verified'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Experience</Text>
                    <Text style={styles.infoValue}>{selectedLawyer.experience}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Jurisdiction Court</Text>
                    <Text style={styles.infoValue}>{selectedLawyer.court || 'Sindh High Court'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Chamber Email</Text>
                    <Text style={styles.infoValue}>{selectedLawyer.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Chamber Phone</Text>
                    <Text style={styles.infoValue}>{selectedLawyer.phone}</Text>
                  </View>
                </View>

                <View style={styles.bioSection}>
                  <Text style={styles.bioLabel}>Professional Background</Text>
                  <Text style={styles.bioText}>{selectedLawyer.bio || 'Advocate practicing at the Sindh Bar Council with specialized focus on civil, criminal and constitutional litigation.'}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.contactBtn}
                  onPress={() => setShowProfile(false)}
                >
                  <Text style={styles.contactBtnText}>CLOSE PROFILE</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="lawyer" activeTab="home" />
    </SafeAreaView>
  );
}
