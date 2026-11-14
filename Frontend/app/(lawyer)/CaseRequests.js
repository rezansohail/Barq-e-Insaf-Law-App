import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './CaseRequests.styles';
import { useMockStore, caseRequests, declineRequest, acceptRequest, lawyerProfile } from './MockStore';
import DigitalSignatureModal from '../../components/DigitalSignatureModal';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function CaseRequests() {
  useMockStore();
  const router = useRouter();
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [selectedCaseForSign, setSelectedCaseForSign] = useState(null);

  // Hardware back returns to LawyerHome
  useAppNavigation({ isHome: false, homeRoute: '/(lawyer)/LawyerHome' });

  const handleOpenAcceptModal = (reqItem) => {
    setSelectedCaseForSign(reqItem);
    setSignatureModalVisible(true);
  };

  const handleConfirmSignature = (signaturePayload) => {
    if (selectedCaseForSign) {
      acceptRequest(selectedCaseForSign.id, signaturePayload);
      setSignatureModalVisible(false);
      Alert.alert(
        'Case Accepted with Digital Signature',
        `Representation agreed!\n\nClient Scheduled Visit: ${signaturePayload.consultancyTime}\nCertificate ID: ${signaturePayload.certificateId}\n\nYour chamber contact details have been dispatched to the client.`
      );
    }
  };

  const handleDecline = (id) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this client request?',
      [
        {
          text: 'Yes, Decline',
          style: 'destructive',
          onPress: () => {
            declineRequest(id);
            Alert.alert('Request Declined', 'The case request has been removed.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleViewCase = (id) => {
    router.push({
      pathname: '/(lawyer)/CaseDetail',
      params: { caseId: id },
    });
  };

  const handleNav = (lbl) => {
    if (lbl === 'home') router.push('/(lawyer)/LawyerHome');
    if (lbl === 'requests') router.push('/(lawyer)/CaseRequests');
    if (lbl === 'cases') router.push('/(lawyer)/MyCases');
    if (lbl === 'schedule') router.push('/(lawyer)/Schedule');
    if (lbl === 'profile') router.push('/(lawyer)/LawyerProfile');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Modern '< Client Requests' Header */}
      <AppHeader
        title="Client Requests"
        showBack={true}
        homeRoute="/(lawyer)/LawyerHome"
        role="lawyer"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {caseRequests.length > 0 ? (
          caseRequests.map((r, i) => (
            <View key={r.id || i} style={styles.reqCard}>
              <TouchableOpacity onPress={() => handleViewCase(r.id)}>
                <View style={styles.reqTop}>
                  <Text style={styles.reqName}>
                    {r.name} - {r.spec}
                  </Text>
                  <Text style={styles.badgeNew}>Pending</Text>
                </View>
                <Text style={styles.reqMeta}>
                  Court: {r.court || 'Sindh High Court'} · {r.location || 'Karachi'}
                </Text>

                <View style={styles.problemBox}>
                  <Text style={styles.problemLabel}>Problem Statement:</Text>
                  <Text style={styles.reqDesc}>
                    {r.problemStatement || (r.desc && r.desc.substring(0, 100)) || ''}
                  </Text>
                </View>

                {/* Secure Note */}
                <View style={styles.securedNotice}>
                  <Text style={styles.securedNoticeText}>
                    🔒 Contact details & evidence are revealed upon digital signature acceptance.
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleOpenAcceptModal(r)}
                  activeOpacity={0.84}
                >
                  <Text style={styles.acceptText}>Accept & Digitally Sign</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDecline(r.id)}
                  activeOpacity={0.84}
                >
                  <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No pending requests at this time.</Text>
        )}
      </ScrollView>

      {/* Consistent Bottom Nav */}
      <BottomNavBar role="lawyer" activeTab="requests" />

      {/* Digital Signature & Consultancy Appointment Modal */}
      <DigitalSignatureModal
        visible={signatureModalVisible}
        caseItem={selectedCaseForSign}
        lawyerProfile={lawyerProfile}
        onClose={() => setSignatureModalVisible(false)}
        onConfirmSign={handleConfirmSignature}
      />
    </SafeAreaView>
  );
}
