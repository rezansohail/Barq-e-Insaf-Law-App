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
import { useAppTheme } from '../../context/ThemeContext';

export default function OtherLawyers() {
  useMockStore();
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
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

  const dynamicStyles = {
    safe: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    lawyerCard: {
      backgroundColor: theme.card,
      borderColor: theme.cardBorder,
    },
    lawyerName: {
      color: theme.textPrimary,
    },
    casesText: {
      fontSize: 12,
      color: '#FF9500',
      fontWeight: '700',
      marginTop: 3,
    },
    statusText: {
      color: theme.textMuted,
    },
    modalContent: {
      backgroundColor: theme.headerBg,
      borderColor: theme.cardBorder,
    },
    modalName: {
      color: theme.textPrimary,
    },
    detailCard: {
      backgroundColor: theme.surface,
      borderColor: theme.surfaceBorder,
    },
    detailLabel: {
      color: '#FF9500',
    },
    detailValue: {
      color: theme.textPrimary,
    },
    aboutText: {
      color: theme.textSecondary,
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.statusBarBg} />
      
      <AppHeader 
        title="Peer Advocates" 
        showBack={true} 
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {otherLawyers.length === 0 && (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#665544', fontSize: 14 }}>
              No other advocates registered yet.
            </Text>
          </View>
        )}
        {otherLawyers.map((lawyer, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.lawyerCard, dynamicStyles.lawyerCard]}
            onPress={() => handleLawyerPress(lawyer)}
          >
            <View style={[styles.avatarLarge, { backgroundColor: lawyer.color || '#E65100' }]}>
              <Text style={styles.avatarText}>{lawyer.initials}</Text>
            </View>
            <View style={styles.lawyerInfo}>
              <Text style={[styles.lawyerName, dynamicStyles.lawyerName]}>{lawyer.name}</Text>
              <Text style={styles.lawyerSpec}>{lawyer.spec}</Text>
              <Text style={dynamicStyles.casesText}>{lawyer.successfulCasesCount || 0} Disposed Cases</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: lawyer.isAvailable ? '#4ade80' : '#ef4444' }]} />
                <Text style={[styles.statusText, dynamicStyles.statusText]}>
                  {lawyer.isAvailable ? 'Available for Counsel' : 'Chamber Busy'}
                </Text>
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
          <View style={[styles.modalContent, dynamicStyles.modalContent]}>
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
                
                <Text style={[styles.modalName, dynamicStyles.modalName]}>{selectedLawyer.name}</Text>
                <Text style={styles.modalSpec}>{selectedLawyer.spec}</Text>
                
                <View style={styles.modalDetails}>
                  <View style={[styles.detailRow, dynamicStyles.detailCard]}>
                    <Text style={[styles.detailLabel, dynamicStyles.detailLabel]}>Location</Text>
                    <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{selectedLawyer.district}</Text>
                  </View>
                  <View style={[styles.detailRow, dynamicStyles.detailCard]}>
                    <Text style={[styles.detailLabel, dynamicStyles.detailLabel]}>Experience</Text>
                    <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{selectedLawyer.experience}</Text>
                  </View>
                  <View style={[styles.detailRow, dynamicStyles.detailCard]}>
                    <Text style={[styles.detailLabel, dynamicStyles.detailLabel]}>Disposed Cases</Text>
                    <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{selectedLawyer.successfulCasesCount}</Text>
                  </View>
                  <View style={[styles.detailRow, dynamicStyles.detailCard]}>
                    <Text style={[styles.detailLabel, dynamicStyles.detailLabel]}>Education</Text>
                    <Text style={[styles.detailValue, dynamicStyles.detailValue]}>{selectedLawyer.education}</Text>
                  </View>
                  <View style={[styles.detailRow, styles.detailRowLast, dynamicStyles.detailCard]}>
                    <Text style={[styles.detailLabel, dynamicStyles.detailLabel]}>Status</Text>
                    <Text style={[styles.detailValue, { color: selectedLawyer.isAvailable ? '#4ade80' : '#ef4444' }]}>
                      {selectedLawyer.isAvailable ? 'Available' : 'Chamber Busy'}
                    </Text>
                  </View>
                </View>

                {selectedLawyer.about ? (
                  <Text style={[styles.aboutText, dynamicStyles.aboutText]}>{selectedLawyer.about}</Text>
                ) : null}
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
