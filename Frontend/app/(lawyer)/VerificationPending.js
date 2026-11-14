import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import LiquidGlassButton from '../../components/LiquidGlassButton';

export default function VerificationPending() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />
      
      <View style={styles.content}>
        <View style={styles.badgeBox}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="#FFA726"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
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
    borderColor: 'rgba(255, 149, 0, 0.35)',
  },
  badgeBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 149, 0, 0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF5E8',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 13,
    color: 'rgba(255, 220, 180, 0.75)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
});
