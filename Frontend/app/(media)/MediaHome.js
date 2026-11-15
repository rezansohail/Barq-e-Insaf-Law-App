import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './MediaHome.styles';
import TopHeaderMenu from '../../components/TopHeaderMenu';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { fetchRealSindhCases } from '../../constants/realCasesStore';
import { useAppTheme } from '../../context/ThemeContext';
import SindhCasesMap from '../../components/SindhCasesMap';
import api from '../../constants/api';
import { useMockStore, activeCases, updateCase } from '../(citizen)/MockStore';

// Initial verified citizen coverage leads in Sindh for immediate newsroom triage
const INITIAL_LEADS = [
  {
    id: 'LEAD-SINDH-5',
    district: 'Karachi Central',
    court: 'District & Sessions Court',
    title: 'Plot Encroachment & Illegal Demarcation',
    summary: 'Land demarcation dispute in Scheme 33 where encroachers are violating a judicial court stay order with forged registry docs.',
    anonymousRelay: true,
    status: 'urgent',
    timestamp: '20 mins ago',
  },
  {
    id: 'LEAD-SINDH-8',
    district: 'Hyderabad City',
    court: 'Civil Court & Environmental Tribunal',
    title: 'Municipal Canal Pollution & Commercial Encroachment',
    summary: 'Commercial chemical discharge violating municipal drainage bypass order, impacting drinking water irrigation in Qasimabad.',
    anonymousRelay: true,
    status: 'urgent',
    timestamp: '1 hour ago',
  },
  {
    id: 'LEAD-SINDH-12',
    district: 'Sukkur',
    court: 'Senior Civil Judge Court',
    title: 'Tenant Eviction Violating Sindh Rented Premises Ordinance',
    summary: 'Landlord unlawfully locked commercial premises without mandatory 60-day notice under Sindh tenancy protections.',
    anonymousRelay: true,
    status: 'urgent',
    timestamp: '3 hours ago',
  },
];

export default function MediaHome() {
  useMockStore();
  const router = useRouter();
  const { isDarkMode } = useAppTheme();
  useAppNavigation({ isHome: true, homeRoute: '/(media)/MediaHome' });

  const [realCases, setRealCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Sindh Metrics from Heatmap API
  const [activeDisputesCount, setActiveDisputesCount] = useState(0);
  const [districtsCoveredCount, setDistrictsCoveredCount] = useState(0);
  const [hotspotDistrictText, setHotspotDistrictText] = useState('Karachi (66.7%)');

  // Citizen Coverage Leads Feed
  const [leads, setLeads] = useState(INITIAL_LEADS);

  // Publish Story Modal States
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [district, setDistrict] = useState('Karachi Central');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [isBreakingNews, setIsBreakingNews] = useState(false);
  const [publishedStories, setPublishedStories] = useState([]);

  // Fetch real cases and calculate / fetch heatmap analytics
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const cases = await fetchRealSindhCases();
        if (!isMounted) return;
        setRealCases(cases);

        // Try calling GET /api/media/analytics/heatmap, with resilient fallback to live computation
        try {
          const res = await api.get('/media/analytics/heatmap');
          if (res?.data && isMounted) {
            setActiveDisputesCount(res.data.activeDisputes || cases.length);
            setDistrictsCoveredCount(res.data.districtsCovered || new Set(cases.map((c) => c.district)).size);
            if (res.data.hotspotDistrict) {
              setHotspotDistrictText(res.data.hotspotDistrict);
            }
          }
        } catch (apiErr) {
          // Live calculation from active cases in database
          const total = cases.length;
          const uniqueDists = new Set(cases.map((c) => c.district || 'Karachi Central')).size;
          setActiveDisputesCount(total);
          setDistrictsCoveredCount(uniqueDists);

          const counts = {};
          cases.forEach((c) => {
            const d = c.district || 'Karachi Central';
            counts[d] = (counts[d] || 0) + 1;
          });

          let maxD = 'Karachi';
          let maxC = 0;
          Object.entries(counts).forEach(([d, c]) => {
            if (c > maxC) {
              maxC = c;
              maxD = d;
            }
          });
          const ratio = total > 0 ? ((maxC / total) * 100).toFixed(1) : '66.7';
          const cleanName = maxD.replace(' Central', '').replace(' City', '');
          setHotspotDistrictText(`${cleanName} (${ratio}%)`);
        }

        // Dynamically add citizen cases that requested media coverage to the urgent leads feed
        const citizenMediaRequests = (activeCases || [])
          .filter((c) => c.mediaRequested)
          .map((c) => ({
            id: `LEAD-SINDH-${c.id}`,
            district: c.district || 'Karachi Central',
            court: c.court || 'District & Sessions Court',
            title: c.title || 'Legal Dispute',
            summary: c.mediaNotes || c.description || 'Citizen requested media investigation on judicial proceedings.',
            anonymousRelay: Boolean(c.anonymousRelayConsent ?? true),
            status: c.mediaStatus === 'under_investigation' ? 'under_investigation' : 'urgent',
            timestamp: c.lastUpdated || 'Recently',
            caseId: c.id,
          }));

        // Merge with initial leads, avoiding duplicate IDs
        const existingIds = new Set(citizenMediaRequests.map((l) => l.id));
        const combined = [
          ...citizenMediaRequests,
          ...INITIAL_LEADS.filter((l) => !existingIds.has(l.id)),
        ];
        setLeads(combined);
      } catch (err) {
        console.warn('Error loading media dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  const totalCases = realCases.length;
  const propertyCount = realCases.filter((c) => /property|land/i.test(c.type)).length;
  const familyCount = realCases.filter((c) => /family|custody|khula/i.test(c.type)).length;
  const otherCount = Math.max(0, totalCases - propertyCount - familyCount);

  // Handle journalist accepting lead for investigation
  const handleInvestigateCase = (lead) => {
    setLeads((prev) =>
      prev.map((item) =>
        item.id === lead.id ? { ...item, status: 'under_investigation' } : item
      )
    );

    // If linked to activeCases in store, update status to under_investigation
    if (lead.caseId) {
      updateCase(lead.caseId, { mediaStatus: 'under_investigation' }).catch(() => {});
    }

    Alert.alert(
      'Investigation Accepted',
      `Lead ${lead.id} is now tagged as 'Under KTN Investigation'. The newsroom desk will follow up via secure anonymous relay.`
    );
  };

  // Handle publishing official story
  const handlePublishStory = () => {
    if (!headline.trim() || !summary.trim()) {
      Alert.alert('Required Fields', 'Please enter both Headline and Summary for this report.');
      return;
    }

    const newStory = {
      id: `STORY-${Date.now()}`,
      headline: headline.trim(),
      summary: summary.trim(),
      district: district.trim() || 'Karachi Central',
      broadcastLink: broadcastLink.trim(),
      isBreaking: isBreakingNews,
      publishedAt: 'Just now',
    };

    setPublishedStories((prev) => [newStory, ...prev]);
    setShowPublishModal(false);
    setHeadline('');
    setSummary('');
    setBroadcastLink('');
    setIsBreakingNews(false);

    Alert.alert(
      'Story Published',
      'Verified investigative report is now live on the Barq-e-Insaf public broadcast bulletin.'
    );
  };

  const safeBg = isDarkMode ? '#13131A' : '#FAF8F5';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: safeBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor={safeBg} />

      {/* HEADER - Media Newsroom Desk with + Publish Story Button */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#181822' : '#FFFFFF' }]}>
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <Text style={[styles.brandName, { color: '#FF9500' }]}>Barq-e-Insaf</Text>
            <Text style={[styles.brandSub, { color: isDarkMode ? '#9CA3AF' : '#664530' }]}>
              Court Reporting & Broadcast Journalism Desk
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.publishHeaderBtn}
              onPress={() => setShowPublishModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.publishHeaderBtnText}>+ Publish Story</Text>
            </TouchableOpacity>
            <TopHeaderMenu role="media" avatarText="KTN" />
          </View>
        </View>

        <Text style={[styles.orgName, { color: isDarkMode ? '#FFFFFF' : '#1A0C04' }]}>
          KTN News · Legal Affairs & Judicial Bureau
        </Text>
        <Text style={[styles.orgSub, { color: isDarkMode ? '#A1A1AA' : '#7C5238' }]}>
          Verified Public Interest Coverage · Sindh Court Beat & Dispute Registry
        </Text>

        {/* TOP STATS CHIPS (REAL-TIME SINDH METRICS) */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={[styles.statNum, { color: '#FFA726' }]}>
              {activeDisputesCount || totalCases}
            </Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#664530' }]}>
              Active Disputes
            </Text>
          </View>

          <View style={styles.statChip}>
            <Text style={[styles.statNum, { color: '#38BDF8' }]}>
              {districtsCoveredCount || (new Set(realCases.map((c) => c.district)).size || 1)}
            </Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#664530' }]}>
              Districts Covered
            </Text>
          </View>

          <View style={[styles.statChip, styles.statChipHotspot]}>
            <Text style={[styles.statNum, { color: '#EF4444' }]}>
              {hotspotDistrictText}
            </Text>
            <Text style={[styles.statLabel, { color: '#F87171' }]}>
              Hotspot District
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* CITIZEN COVERAGE LEADS (URGENT) SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFA726' : '#C2410C' }]}>
              Citizen Coverage Leads (Urgent)
            </Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>Whistleblower</Text>
            </View>
          </View>
          <Text style={styles.seeAllText}>Live Feed ({leads.length})</Text>
        </View>

        {leads.map((lead) => {
          const isInvestigating = lead.status === 'under_investigation';
          return (
            <View
              key={lead.id}
              style={[
                styles.leadCard,
                isInvestigating && styles.leadCardInvestigating,
              ]}
            >
              {/* Reference ID & Relay Badge */}
              <View style={styles.leadTopRow}>
                <View style={styles.leadRefBadge}>
                  <Text style={styles.leadRefText}>{lead.id}</Text>
                </View>
                {lead.anonymousRelay && (
                  <View style={styles.relayBadge}>
                    <Text style={styles.relayBadgeText}>Anonymous Relay Available</Text>
                  </View>
                )}
              </View>

              {/* District & Court */}
              <Text style={styles.leadDistrictText}>
                {lead.district} · {lead.court}
              </Text>

              {/* Case Summary */}
              <View style={styles.leadSummaryBox}>
                <Text style={styles.leadSummaryText}>{lead.summary}</Text>
              </View>

              {/* 100% Identity Protection Indicator */}
              <View style={styles.privacyRow}>
                <View style={styles.privacyPill}>
                  <Text style={styles.privacyText}>
                    100% Identity Protected · Citizen Name & CNIC Hidden
                  </Text>
                </View>
              </View>

              {/* Action Button: Investigate Case */}
              <View style={styles.leadActionRow}>
                <TouchableOpacity
                  style={[
                    styles.investigateBtn,
                    isInvestigating && styles.investigateBtnActive,
                  ]}
                  onPress={() => !isInvestigating && handleInvestigateCase(lead)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.investigateBtnText,
                      isInvestigating && styles.investigateBtnTextActive,
                    ]}
                  >
                    {isInvestigating ? 'Under KTN Investigation' : 'Investigate Case'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* VERIFIED PUBLISHED STORIES (IF ANY) */}
        {publishedStories.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFA726' : '#C2410C' }]}>
                Verified KTN Broadcast Stories
              </Text>
              <Text style={styles.seeAllText}>Published ({publishedStories.length})</Text>
            </View>

            {publishedStories.map((story) => (
              <View key={story.id} style={styles.leadCard}>
                <View style={styles.leadTopRow}>
                  <View style={[styles.leadRefBadge, { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Text style={[styles.leadRefText, { color: '#10B981' }]}>BROADCAST VERIFIED</Text>
                  </View>
                  {story.isBreaking && (
                    <View style={[styles.sectionBadge, { marginLeft: 0 }]}>
                      <Text style={styles.sectionBadgeText}>Breaking News</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.leadDistrictText, { fontSize: 14, fontWeight: '800' }]}>
                  {story.headline}
                </Text>

                <Text style={[styles.leadSummaryText, { color: '#D1D5DB' }]}>
                  {story.summary}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                    Jurisdiction: {story.district}
                  </Text>
                  {story.broadcastLink ? (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(story.broadcastLink).catch(() => Alert.alert('Link', story.broadcastLink))}
                    >
                      <Text style={{ fontSize: 11.5, color: '#38BDF8', fontWeight: '700' }}>
                        Watch Broadcast
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ))}
          </>
        )}

        {/* SINDH JUDICIAL CASE MAP SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFA726' : '#C2410C' }]}>
            Sindh Judicial Case Map (Live)
          </Text>
          <TouchableOpacity onPress={() => router.push('/(media)/CaseMap')} activeOpacity={0.8}>
            <Text style={styles.seeAllText}>Fullscreen Map</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#FF9500" />
          </View>
        ) : (
          <SindhCasesMap cases={realCases} />
        )}

        {/* NEWSROOM BEAT BREAKDOWN */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFA726' : '#C2410C' }]}>
            Newsroom Beat Breakdown
          </Text>
          <TouchableOpacity onPress={() => router.push('/(media)/Analytics')} activeOpacity={0.8}>
            <Text style={styles.seeAllText}>Detailed Beat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.breakdownCard}>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Property & Land</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: totalCases > 0 ? `${(propertyCount / totalCases) * 100}%` : '0%',
                    backgroundColor: '#FF9100',
                  },
                ]}
              />
            </View>
            <Text style={[styles.barVal, { color: '#FFB74D' }]}>{propertyCount}</Text>
          </View>

          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Family & Custody</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: totalCases > 0 ? `${(familyCount / totalCases) * 100}%` : '0%',
                    backgroundColor: '#00E5FF',
                  },
                ]}
              />
            </View>
            <Text style={[styles.barVal, { color: '#00E5FF' }]}>{familyCount}</Text>
          </View>

          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Civil & Contract</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: totalCases > 0 ? `${(otherCount / totalCases) * 100}%` : '0%',
                    backgroundColor: '#C084FC',
                  },
                ]}
              />
            </View>
            <Text style={[styles.barVal, { color: '#C084FC' }]}>{otherCount}</Text>
          </View>
        </View>

        {/* JOURNALISTIC STANDARDS */}
        <Text style={[styles.sectionLabel, { color: isDarkMode ? '#FFA726' : '#C2410C', marginTop: 14 }]}>
          Broadcast Journalistic Standards
        </Text>
        <View style={styles.insightGrid}>
          <View style={styles.insightCard}>
            <Text style={[styles.insightNum, { color: '#FF9500' }]}>100%</Text>
            <Text style={[styles.insightLabel, { color: isDarkMode ? '#D1D5DB' : '#664530' }]}>
              Court Record Fact-Checked
            </Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={[styles.insightNum, { color: '#00E5FF' }]}>Sindh</Text>
            <Text style={[styles.insightLabel, { color: isDarkMode ? '#D1D5DB' : '#664530' }]}>
              Provincial Jurisdiction
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* POP-UP MODAL: + PUBLISH STORY */}
      <Modal
        visible={showPublishModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publish Official Investigative Story</Text>
              <TouchableOpacity onPress={() => setShowPublishModal(false)}>
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Headline</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Investigation: Illegal Plot Encroachment in Scheme 33 Exposed"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={headline}
              onChangeText={setHeadline}
            />

            <Text style={styles.fieldLabel}>Short Summary of Report</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              multiline
              numberOfLines={3}
              placeholder="Summarize the core legal facts and court orders..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={summary}
              onChangeText={setSummary}
            />

            <Text style={styles.fieldLabel}>District Jurisdiction</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Karachi Central"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={district}
              onChangeText={setDistrict}
            />

            <Text style={styles.fieldLabel}>Video / Broadcast Link</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. KTN News YouTube or TV broadcast URL"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={broadcastLink}
              onChangeText={setBroadcastLink}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Breaking News Alert</Text>
                <Text style={styles.toggleSub}>Highlight at top of public justice feed</Text>
              </View>
              <Switch
                value={isBreakingNews}
                onValueChange={setIsBreakingNews}
                trackColor={{ false: '#36384C', true: '#FF9500' }}
                thumbColor={isBreakingNews ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPublishModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handlePublishStory}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSubmitText}>Publish Official Story</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Shared Bottom Nav */}
      <BottomNavBar role="media" activeTab="home" />
    </SafeAreaView>
  );
}
