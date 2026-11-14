import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AppHeader from '../components/AppHeader';

const { width } = Dimensions.get('window');

export default function NCHDInfo() {
  const router = useRouter();

  const handleEmailPress = async (email) => {
    const url = `mailto:${email}?subject=Legal%20Assistance%20Inquiry%20-%20Barq-e-Insaf`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Contact Email',
          `Please send an email directly to:\n\n${email}`,
          [{ text: 'OK' }]
        );
      }
    } catch (_) {
      Alert.alert(
        'Contact Email',
        `Please send an email directly to:\n\n${email}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Top Header matching app standard */}
      <AppHeader
        title="NCHD Overview"
        showBack={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.logoSlot}>
              <Image
                source={require('../assets/images/ngo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>INSTITUTIONAL LEGAL AID & DEVELOPMENT</Text>
              </View>
              <Text style={styles.orgTitle}>
                National Commission for Human Development (NCHD)
              </Text>
              <Text style={styles.orgSubtitle}>
                قومی کمیشن برائے انسانی ترقی · Govt of Pakistan
              </Text>
            </View>
          </View>

          <Text style={styles.heroDesc}>
            Established in 2002 under Presidential Ordinance No. XXIX, NCHD is a premier federal statutory body operating under the Ministry of Federal Education & Professional Training, dedicated to grassroots community empowerment, adult legal literacy, and primary social justice across Pakistan.
          </Text>
        </View>

        {/* PICTURE SLOTS SECTION */}
        <Text style={styles.sectionHeading}>Organizational Gallery & Field Operations</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryScroll}
        >
          {/* Picture Slot 1: Official Emblem / Charter */}
          <View style={styles.pictureCard}>
            <View style={styles.pictureImgSlot}>
              <Image
                source={require('../assets/images/ngob.jpeg')}
                style={styles.pictureImg}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.pictureCaption}>Provincial Operations Center</Text>
            <Text style={styles.pictureSub}>Sindh Coordination Headquarters</Text>
          </View>

          {/* Picture Slot 2: Community Legal Literacy */}
          <View style={styles.pictureCard}>
            <View style={[styles.pictureImgSlot, { backgroundColor: 'rgba(255, 149, 0, 0.12)' }]}>
              <Image
                source={require('../assets/images/ngo1.png')}
                style={styles.pictureImg}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.pictureCaption}>Grassroots Legal Literacy</Text>
            <Text style={styles.pictureSub}>Rural Sindh Community Outreaches</Text>
          </View>

          {/* Picture Slot 3: Community Empowerment */}
          <View style={styles.pictureCard}>
            <View style={[styles.pictureImgSlot, { backgroundColor: 'rgba(20, 10, 4, 0.85)', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#FFB74D', fontSize: 13, fontWeight: '800' }}>LEGAL DESK</Text>
              <Text style={{ color: '#FFB74D', fontSize: 11, fontWeight: '700', marginTop: 4 }}>Legal Aid Desk</Text>
            </View>
            <Text style={styles.pictureCaption}>Dispute Support Desks</Text>
            <Text style={styles.pictureSub}>District-Level Family & Rights Relief</Text>
          </View>
        </ScrollView>

        {/* REACH OUT VIA EMAIL CARD (FOCUSED CONTACT) */}
        <View style={styles.reachOutCard}>
          <View style={styles.reachOutHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reachOutTitle}>Reach Out via Email</Text>
              <Text style={styles.reachOutSub}>
                Citizens and advocates can contact NCHD via official email for pro-bono referrals, legal literacy support, and grassroots grievance mediation.
              </Text>
            </View>
          </View>

          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Official Inquiries & Legal Aid Desk:</Text>
            <Text style={styles.emailValue}>info@nchd.org.pk</Text>
            <TouchableOpacity
              style={styles.emailBtn}
              activeOpacity={0.84}
              onPress={() => handleEmailPress('info@nchd.org.pk')}
            >
              <Text style={styles.emailBtnText}>Email info@nchd.org.pk</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.emailContainer, { marginTop: 10 }]}>
            <Text style={styles.emailLabel}>Sindh Provincial Coordination Desk:</Text>
            <Text style={styles.emailValue}>sindh@nchd.org.pk</Text>
            <TouchableOpacity
              style={[styles.emailBtn, { backgroundColor: 'rgba(255, 149, 0, 0.18)', borderWidth: 1, borderColor: '#FF9500' }]}
              activeOpacity={0.84}
              onPress={() => handleEmailPress('sindh@nchd.org.pk')}
            >
              <Text style={[styles.emailBtnText, { color: '#FFB74D' }]}>Email sindh@nchd.org.pk</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.reachOutNotice}>
            Response Window: Inquiries are acknowledged within 24 to 48 business hours by the legal liaison wing.
          </Text>
        </View>

        {/* MISSION & VISION */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardHeading}>Mission & Core Mandate</Text>
          <Text style={styles.infoParagraph}>
            NCHD is dedicated to bridging the socio-legal inequality gap by supporting vulnerable citizens in rural Pakistan. Its core mission is to establish sustainable community institutions, impart legal literacy, and empower individuals to claim their fundamental constitutional rights.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Grassroots Legal Literacy</Text>: Educating rural women, laborers, and unrepresented families about marriage contracts (Nikahnama), inheritance rights, and domestic protection laws.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Universal Access</Text>: Operating thousands of community feeder centers in interior Sindh to eradicate illiteracy and legal opacity.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Advocate Networking</Text>: Facilitating pro-bono representation by connecting impoverished litigants with bar councils and human rights committees.</Text>
          </View>
        </View>

        {/* JURISDICTION & SINDH NETWORK */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardHeading}>Sindh Provincial Operations</Text>
          <Text style={styles.infoParagraph}>
            NCHD maintains active district networks across the length and breadth of Sindh, providing institutional assistance in:
          </Text>
          <View style={styles.districtTagsRow}>
            {['Karachi', 'Hyderabad', 'Larkana', 'Sukkur', 'Mirpurkhas', 'Badin', 'Tharparkar', 'Jacobabad', 'Ghotki', 'Dadu'].map((d) => (
              <View key={d} style={styles.districtPill}>
                <Text style={styles.districtPillText}>{d}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.addressLine}>
            Provincial Office: Sindh Provincial Office, Saddar / Shahrah-e-Faisal, Karachi, Sindh.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#060201',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.82)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 160, 40, 0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  logoSlot: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderWidth: 1.5,
    borderColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: 52,
    height: 52,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 149, 0, 0.18)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.35)',
  },
  badgePillText: {
    color: '#FFB74D',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orgTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF5E8',
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  orgSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.65)',
    marginTop: 2,
    fontWeight: '600',
  },
  heroDesc: {
    fontSize: 12.5,
    color: 'rgba(255, 240, 225, 0.82)',
    lineHeight: 19,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 149, 0, 0.15)',
    paddingTop: 12,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFB74D',
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  galleryScroll: {
    gap: 12,
    paddingBottom: 14,
  },
  pictureCard: {
    width: width * 0.56,
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
  },
  pictureImgSlot: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    backgroundColor: 'rgba(25, 12, 5, 0.8)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  pictureImg: {
    width: '100%',
    height: '100%',
  },
  pictureCaption: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF5E8',
  },
  pictureSub: {
    fontSize: 10,
    color: 'rgba(255, 220, 180, 0.55)',
    marginTop: 2,
  },
  reachOutCard: {
    backgroundColor: 'rgba(28, 12, 4, 0.88)',
    borderRadius: 20,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1.4,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  reachOutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  reachOutIcon: {
    fontSize: 26,
  },
  reachOutTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF5E8',
  },
  reachOutSub: {
    fontSize: 11.5,
    color: 'rgba(255, 220, 180, 0.75)',
    lineHeight: 16,
    marginTop: 3,
  },
  emailContainer: {
    backgroundColor: 'rgba(15, 7, 2, 0.9)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.2)',
  },
  emailLabel: {
    fontSize: 10.5,
    color: 'rgba(255, 220, 180, 0.6)',
    fontWeight: '600',
    marginBottom: 2,
  },
  emailValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF9500',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  emailBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailBtnText: {
    color: '#0A0301',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  reachOutNotice: {
    fontSize: 10,
    color: 'rgba(255, 220, 180, 0.5)',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(22, 10, 4, 0.78)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 160, 40, 0.22)',
  },
  infoCardHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFB74D',
    marginBottom: 8,
  },
  infoParagraph: {
    fontSize: 12.5,
    color: 'rgba(255, 235, 215, 0.8)',
    lineHeight: 19,
    marginBottom: 10,
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    fontSize: 12,
    color: 'rgba(255, 230, 205, 0.78)',
    lineHeight: 18,
  },
  boldText: {
    color: '#FFF5E8',
    fontWeight: '800',
  },
  districtTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  districtPill: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
  },
  districtPillText: {
    fontSize: 11,
    color: '#FFB74D',
    fontWeight: '700',
  },
  addressLine: {
    fontSize: 11,
    color: 'rgba(255, 220, 180, 0.65)',
    marginTop: 6,
    lineHeight: 16,
  },
});
