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

export default function KTNNewsInfo() {
  const router = useRouter();

  const handleEmailPress = async (email) => {
    const url = `mailto:${email}?subject=Legal%20Grievance%20Story%20-%20Barq-e-Insaf`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Contact Newsroom',
          `Please send your legal story or case grievance to:\n\n${email}`,
          [{ text: 'OK' }]
        );
      }
    } catch (_) {
      Alert.alert(
        'Contact Newsroom',
        `Please send your legal story or case grievance to:\n\n${email}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#0A0402" />

      {/* Top Header */}
      <AppHeader
        title="KTN News Overview"
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
                source={require('../assets/images/media.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>24/7 SINDHI BROADCAST JOURNALISM</Text>
              </View>
              <Text style={styles.orgTitle}>
                KTN News (Kawish Television Network)
              </Text>
              <Text style={styles.orgSubtitle}>
                کے ٽي اين نيوز · Premier Sindhi News Channel
              </Text>
            </View>
          </View>

          <Text style={styles.heroDesc}>
            Launched in October 2007 by Kawish Group of Publications, KTN News is Pakistan’s first 24-hour private Sindhi news television channel. It is renowned for high court and trial court reporting, investigative journalism on social and legal injustices, and providing a powerful public microphone for aggrieved citizens across Sindh.
          </Text>
        </View>

        {/* PICTURE SLOTS SECTION */}
        <Text style={styles.sectionHeading}>Newsroom & Court Press Gallery</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryScroll}
        >
          {/* Picture Slot 1: Official Emblem */}
          <View style={styles.pictureCard}>
            <View style={[styles.pictureImgSlot, { backgroundColor: '#180B04', justifyContent: 'center', alignItems: 'center' }]}>
              <Image
                source={require('../assets/images/media.png')}
                style={{ width: '85%', height: '85%' }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.pictureCaption}>Broadcast Brand Identity</Text>
            <Text style={styles.pictureSub}>Karachi Central Studio</Text>
          </View>

          {/* Picture Slot 2: Court Reporting Unit */}
          <View style={styles.pictureCard}>
            <View style={[styles.pictureImgSlot, { backgroundColor: 'rgba(255, 149, 0, 0.12)', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#FFB74D', fontSize: 13, fontWeight: '800' }}>PRESS</Text>
              <Text style={{ color: '#FFB74D', fontSize: 11, fontWeight: '800', marginTop: 4 }}>High Court Bureau</Text>
            </View>
            <Text style={styles.pictureCaption}>Legal & Court Affairs</Text>
            <Text style={styles.pictureSub}>Sindh High Court Press Room</Text>
          </View>

          {/* Picture Slot 3: Public Grievance Desk */}
          <View style={styles.pictureCard}>
            <View style={[styles.pictureImgSlot, { backgroundColor: 'rgba(20, 10, 4, 0.85)', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#FFB74D', fontSize: 13, fontWeight: '800' }}>DESK</Text>
              <Text style={{ color: '#FFB74D', fontSize: 11, fontWeight: '800', marginTop: 4 }}>Awami Ijtima Desk</Text>
            </View>
            <Text style={styles.pictureCaption}>Investigative Journalism</Text>
            <Text style={styles.pictureSub}>Human Rights & Civil Coverage</Text>
          </View>
        </ScrollView>

        {/* REACH OUT VIA EMAIL CARD (FOCUSED CONTACT) */}
        <View style={styles.reachOutCard}>
          <View style={styles.reachOutHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reachOutTitle}>Contact KTN News via Email</Text>
              <Text style={styles.reachOutSub}>
                Citizens and lawyers facing judicial delays, human rights violations, land-grabbing, or police non-compliance can submit their legal stories directly to the newsroom via email only.
              </Text>
            </View>
          </View>

          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Editorial Newsroom & Grievance Desk:</Text>
            <Text style={styles.emailValue}>news@ktnnews.tv</Text>
            <TouchableOpacity
              style={styles.emailBtn}
              activeOpacity={0.84}
              onPress={() => handleEmailPress('news@ktnnews.tv')}
            >
              <Text style={styles.emailBtnText}>Email news@ktnnews.tv</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.emailContainer, { marginTop: 10 }]}>
            <Text style={styles.emailLabel}>Official Legal & Public Interest Inquiries:</Text>
            <Text style={styles.emailValue}>info@ktnnews.tv</Text>
            <TouchableOpacity
              style={[styles.emailBtn, { backgroundColor: 'rgba(255, 149, 0, 0.18)', borderWidth: 1, borderColor: '#FF9500' }]}
              activeOpacity={0.84}
              onPress={() => handleEmailPress('info@ktnnews.tv')}
            >
              <Text style={[styles.emailBtnText, { color: '#FFB74D' }]}>Email info@ktnnews.tv</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.reachOutNotice}>
            Investigative Protocol: Please attach relevant court orders, FIR copies, or advocate representation references for prioritized editorial scrutiny.
          </Text>
        </View>

        {/* MISSION & VISION */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardHeading}>Editorial Mission & Journalism Mandate</Text>
          <Text style={styles.infoParagraph}>
            KTN News champions transparency and civil justice for the people of Sindh. Its newsroom operates on an uncompromising mandate to spotlight legal injustices that often go unreported in mainstream federal media.
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Judicial Scrutiny</Text>: Rigorous live coverage of bail hearings, constitutional petitions, and public interest litigations (PILs) at the Sindh High Court.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Combating Feudal & Extra-Legal Coercion</Text>: Exposing illegal Jirga decrees, forced dispossession (Kabza), bonded agricultural labor, and honor-killing cases.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Amplifying Vulnerable Voices</Text>: Providing prime-time coverage for unrepresented rural litigants who cannot afford legal representation or public visibility.</Text>
          </View>
        </View>

        {/* NETWORK & REGIONAL BUREAUS */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardHeading}>Broadcast Bureaus & Coverage Across Sindh</Text>
          <Text style={styles.infoParagraph}>
            Operating specialized legal correspondents in every district of Sindh with direct uplink to central studios:
          </Text>
          <View style={styles.districtTagsRow}>
            {['Karachi (HQ)', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpurkhas', 'Thatta', 'Jacobabad', 'Shikarpur', 'Islamabad Bureau'].map((b) => (
              <View key={b} style={styles.districtPill}>
                <Text style={styles.districtPillText}>{b}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.addressLine}>
            Central News Complex: Kawish Television Network, Media City / Saddar, Karachi & Hyderabad, Sindh.
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
