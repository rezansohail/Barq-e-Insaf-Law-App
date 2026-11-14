import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import LiquidGlassButton from '../../components/LiquidGlassButton';

export default function VerificationPending() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      <View style={styles.content}>
        <View style={styles.badgeBox}>
          <Text style={styles.badge}>🛡️</Text>
        </View>

        <Text style={styles.title}>Account Under Verification</Text>
        
        <Text style={styles.desc}>
          Thank you for registering on Barq-e-Insaf. We have received your Sindh Bar Council license credentials and CNIC.
        </Text>
        
        <Text style={styles.desc}>
          Our administrative compliance team is validating your registration details with the SBC directory. This process typically takes 12–24 hours. You will receive an SMS and email notification upon approval.
        </Text>
        
        <View style={{ width: '100%', marginTop: 20 }}>
          <LiquidGlassButton
            title="RETURN TO ROLE SELECTION"
            onPress={() => router.replace('/RoleSelectScreen')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060201',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: 'rgba(22, 10, 4, 0.85)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 160, 40, 0.28)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF5E8',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 13,
    color: '#C8A892',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
});
