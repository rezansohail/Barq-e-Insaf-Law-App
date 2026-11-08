// ExploreScreen – uses the obsidian & amber liquid‑glass theme
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useFonts, RacingSansOne_400Regular } from '@expo-google-fonts/racing-sans-one';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 36 : 0;

export default function ExploreScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ RacingSansOne_400Regular });

  const goHome = () => router.push('/');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07152e" translucent />

      {/* Header with gradient – same theme as other screens */}
      <LinearGradient
        colors={['#14557a', '#040808', '#141363', '#180669']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.title, fontsLoaded && { fontFamily: 'RacingSansOne_400Regular' }]}>Explore</Text>
          <TouchableOpacity onPress={goHome} style={styles.homeBtn}>
            <Text style={styles.homeBtnText}>Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable cards showcasing features */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {[1, 2, 3, 4].map((i) => (
          <BlurView key={i} intensity={90} style={styles.card}>
            <Image
              source={require('../assets/images/bg2.jpg')}
              style={styles.cardImg}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(15,39,68,0.95)']}
              style={styles.cardOverlay}
            >
              <Text style={styles.cardTitle}>Explore Feature #{i}</Text>
              <Text style={styles.cardDesc}>Brief description of this feature.</Text>
            </LinearGradient>
          </BlurView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#01010a' },
  header: {
    paddingTop: STATUSBAR_HEIGHT,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  homeBtn: { backgroundColor: '#1d4ed8', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  homeBtnText: { color: '#fff', fontWeight: '600' },
  scrollContent: { padding: 16 },
  card: { marginBottom: 20, borderRadius: 12, overflow: 'hidden', height: height * 0.25 },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cardDesc: { color: '#d1d5db', marginTop: 4 },
});
