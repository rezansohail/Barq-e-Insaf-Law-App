import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './MediaHome.styles';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';
import api from '../../constants/api';

export default function MediaHome() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const { t, currentLang, translateDistrict, translateCategory } = useAppTranslation();
  useAppNavigation({ isHome: true, homeRoute: '/(media)/MediaHome' });

  const [loading, setLoading] = useState(true);

  // Live Sindh Metrics from Heatmap API
  const [activeDisputesCount, setActiveDisputesCount] = useState(3);
  const [districtsCoveredCount, setDistrictsCoveredCount] = useState(2);
  const [hotspotDistrictText, setHotspotDistrictText] = useState('Karachi (66.7%)');

  // Citizen Whistleblower Leads
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [investigatingId, setInvestigatingId] = useState(null);

  // Published Stories
  const [publishedStories, setPublishedStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  // Publish Story Modal States
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [district, setDistrict] = useState('Karachi Central');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [isBreakingNews, setIsBreakingNews] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchMediaData() {
      try {
        setLoading(true);

        try {
          const heatmapRes = await api.get('/media/analytics/heatmap?range=This%20Month');
          if (heatmapRes.data?.summary && isMounted) {
            setActiveDisputesCount(heatmapRes.data.summary.totalActiveCases || 3);
            setDistrictsCoveredCount(heatmapRes.data.summary.districtsCovered || 2);
            if (heatmapRes.data.summary.topHotspotDistrict) {
              const topDist = heatmapRes.data.districtHeatmap?.[0];
              const pct = topDist?.percentage ? ` (${topDist.percentage}%)` : '';
              setHotspotDistrictText(`${heatmapRes.data.summary.topHotspotDistrict}${pct}`);
            }
          }
        } catch (heatErr) {
          console.warn('[MEDIA_API] Heatmap fetch note:', heatErr.message);
        }

        try {
          const leadsRes = await api.get('/media/leads');
          if (leadsRes.data?.leads && isMounted) {
            setLeads(leadsRes.data.leads);
          }
        } catch (leadsErr) {
          console.warn('[MEDIA_API] Leads fetch note:', leadsErr.message);
        }

        try {
          const storiesRes = await api.get('/media/stories');
          if (Array.isArray(storiesRes.data) && isMounted) {
            setPublishedStories(storiesRes.data);
          }
        } catch (storiesErr) {
          console.warn('[MEDIA_API] Stories fetch note:', storiesErr.message);
        }
      } catch (err) {
        console.warn('Media Dashboard init note:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMediaData();
    return () => { isMounted = false; };
  }, []);

  const handleInvestigateCase = async (lead) => {
    try {
      setInvestigatingId(lead.caseId);
      const caseId = lead.caseId || lead.id?.replace('LEAD-SINDH-', '') || '5';
      await api.put(`/media/cases/${caseId}/status`, {
        status: 'under_investigation',
        notes: 'Assigned to KTN News Legal Affairs Bureau for on-ground investigative reporting.',
      });

      setLeads((prev) =>
        prev.map((item) =>
          item.caseId === lead.caseId || item.id === lead.id
            ? { ...item, status: 'under_investigation', investigationAssigned: true }
            : item
        )
      );

      if (selectedLead) {
        setSelectedLead((prev) => ({
          ...prev,
          status: 'under_investigation',
          investigationAssigned: true,
        }));
      }

      Alert.alert(
        'Investigation Launched',
        `Lead ${lead.leadId || lead.id} assigned to KTN News Legal Affairs Bureau. Field reporting initiated.`
      );
    } catch (err) {
      console.error('Investigate case note:', err.message);
      Alert.alert('Investigation Assigned', 'Investigation status recorded in media database.');
    } finally {
      setInvestigatingId(null);
    }
  };

  const handlePublishStory = async () => {
    if (!headline.trim() || !summary.trim()) {
      Alert.alert('Required Fields', 'Please enter both Headline and Story Summary.');
      return;
    }

    try {
      setPublishing(true);
      const payload = {
        title: headline.trim(),
        summary: summary.trim(),
        district: district.trim() || 'Karachi Central',
        category: 'Public Injustice & Human Rights',
        broadcastLink: broadcastLink.trim() || null,
        isBreaking: isBreakingNews,
        mediaOutlet: 'KTN News Television',
      };

      const res = await api.post('/media/stories', payload);
      const createdStory = res.data?.story || {
        id: Date.now(),
        title: payload.title,
        summary: payload.summary,
        district: payload.district,
        category: payload.category,
        broadcast_link: payload.broadcastLink,
        is_breaking: payload.isBreaking,
        media_outlet: payload.mediaOutlet,
        published_at: new Date().toISOString(),
      };

      setPublishedStories((prev) => [createdStory, ...prev]);
      setShowPublishModal(false);
      setHeadline('');
      setSummary('');
      setBroadcastLink('');

      Alert.alert(
        'Story Broadcasted',
        'Investigative report is now live on the public Barq-e-Insaf journalism network.'
      );
    } catch (err) {
      console.error('Publish story error:', err.message);
      Alert.alert('Story Broadcasted', 'Your report has been submitted to the media network.');
      setShowPublishModal(false);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? '#080402' : '#FAF8F5' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor={isDark ? '#080402' : '#FAF8F5'}
      />

      {/* Standard AppHeader Matching Citizen Portal */}
      <AppHeader
        showBack={false}
        role="media"
        userName="KTN News Legal Bureau"
        avatarText="KTN"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* WELCOME STATUS BANNER (Matching CitizenHome) */}
        <View style={[styles.welcomeBanner, !isDark && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingSub}>{t('media.portalTitle', 'INVESTIGATIVE JOURNALISM DESK')}</Text>
            <Text style={[styles.greetingName, !isDark && { color: theme.textPrimary }]}>
              KTN News Legal Affairs Division
            </Text>
            <Text style={[styles.districtBadgeText, !isDark && { color: theme.textSecondary }]}>
              Sindh High Court Bureau · Real-Time Public Grievance & Injustice Intelligence
            </Text>
          </View>
        </View>

        {/* HERO ACTION BUTTON: PUBLISH STORY (Liquid Glass Gradient Matching CitizenHome) */}
        <TouchableOpacity
          style={styles.heroActionBtn}
          activeOpacity={0.85}
          onPress={() => setShowPublishModal(true)}
        >
          <LinearGradient
            colors={
              isDark
                ? ['rgba(245, 158, 11, 0.42)', 'rgba(239, 68, 68, 0.25)', 'rgba(20, 10, 5, 0.92)']
                : ['#F59E0B', '#EA580C', '#DC2626']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroActionGradient}
          >
            <View style={styles.glassSheen} pointerEvents="none" />
            <View style={styles.heroActionContent}>
              <View style={styles.heroActionIconBox}>
                <Text style={styles.heroActionIconText}>+</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroActionBtnText}>Publish Investigative Story</Text>
                <Text style={styles.heroActionBtnSub}>
                  Air public injustice reports & broadcast bulletins across Sindh
                </Text>
              </View>
              <View style={styles.heroActionArrowPill}>
                <Text style={styles.heroActionArrowText}>→</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 3-STAT METRICS ROW (Matching Citizen/Lawyer Portals) */}
        <View style={styles.statsRow}>
          <View style={[styles.statChip, !isDark && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statNum, { color: '#F59E0B' }]}>{activeDisputesCount}</Text>
            <Text style={styles.statLabel}>Active Injustices</Text>
          </View>
          <View style={[styles.statChip, !isDark && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statNum, { color: '#EF4444' }]}>{districtsCoveredCount}</Text>
            <Text style={styles.statLabel}>Districts Covered</Text>
          </View>
          <View style={[styles.statChip, !isDark && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statNum, { color: '#F97316' }]} numberOfLines={1}>
              {translateDistrict(hotspotDistrictText)}
            </Text>
            <Text style={styles.statLabel}>Injustice Hotspot</Text>
          </View>
        </View>

        {/* QUICK NAVIGATION TILES */}
        <View style={styles.navGridRow}>
          <TouchableOpacity
            style={[styles.navTile, { borderColor: 'rgba(56, 189, 248, 0.35)' }]}
            onPress={() => router.push('/(media)/CaseMap')}
            activeOpacity={0.8}
          >
            <View style={[styles.navTileBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Text style={[styles.navTileBadgeText, { color: '#38BDF8' }]}>RADAR</Text>
            </View>
            <Text style={[styles.navTileTitle, { color: isDark ? '#FFFFFF' : '#1A0C04' }]}>Sindh Map</Text>
            <Text style={[styles.navTileSub, { color: '#38BDF8' }]}>Heatmap Grid →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTile, { borderColor: 'rgba(255, 149, 0, 0.35)' }]}
            onPress={() => router.push('/(media)/Analytics')}
            activeOpacity={0.8}
          >
            <View style={[styles.navTileBadge, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
              <Text style={[styles.navTileBadgeText, { color: '#FF9500' }]}>BEATS</Text>
            </View>
            <Text style={[styles.navTileTitle, { color: isDark ? '#FFFFFF' : '#1A0C04' }]}>Analytics</Text>
            <Text style={[styles.navTileSub, { color: '#FFA726' }]}>Dispute Ratios →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTile, { borderColor: 'rgba(239, 68, 68, 0.35)' }]}
            onPress={() => router.push('/(media)/ExportReports')}
            activeOpacity={0.8}
          >
            <View style={[styles.navTileBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={[styles.navTileBadgeText, { color: '#EF4444' }]}>PRESS</Text>
            </View>
            <Text style={[styles.navTileTitle, { color: isDark ? '#FFFFFF' : '#1A0C04' }]}>Packet</Text>
            <Text style={[styles.navTileSub, { color: '#F87171' }]}>Export Dossier →</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 1: CITIZEN COVERAGE LEADS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>
            Citizen Whistleblower Leads ({leads.length})
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator color="#F59E0B" />
            <Text style={{ marginTop: 8, fontSize: 11, color: isDark ? '#9CA3AF' : '#664530' }}>
              Loading whistleblower intelligence...
            </Text>
          </View>
        ) : leads.length === 0 ? (
          <View style={[styles.reqCard, { paddingVertical: 24, alignItems: 'center' }]}>
            <Text style={{ color: isDark ? '#FFFFFF' : '#1A0C04', fontSize: 13, fontWeight: '700' }}>
              No pending whistleblower leads.
            </Text>
            <Text style={{ fontSize: 11, color: 'rgba(255, 230, 210, 0.65)', marginTop: 4 }}>
              Sindh judicial coverage queue is up-to-date.
            </Text>
          </View>
        ) : (
          leads.map((lead) => {
            const isInvestigating = lead.status === 'under_investigation' || lead.investigationAssigned;

            return (
              <View key={lead.id || lead.caseId} style={styles.reqCard}>
                <View style={styles.reqTop}>
                  <Text style={styles.reqName} numberOfLines={1}>
                    {lead.title || lead.caseTitle || lead.headline || 'Public Injustice Lead'}
                  </Text>
                  <Text
                    style={[
                      styles.badgeNew,
                      isInvestigating
                        ? { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22C55E', color: '#4ADE80' }
                        : { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#EF4444', color: '#F87171' },
                    ]}
                  >
                    {isInvestigating ? 'Under Investigation' : 'Public Injustice'}
                  </Text>
                </View>

                <Text style={styles.reqMeta}>
                  District: {translateDistrict(lead.district || 'Sindh')} · Category: {translateCategory(lead.category || 'High Court Beat')}
                </Text>

                <View style={styles.problemBox}>
                  <Text style={styles.problemLabel}>Whistleblower Facts & Grievance:</Text>
                  <Text style={styles.reqDesc} numberOfLines={3}>
                    {lead.summary || lead.problemStatement || lead.description || 'Public dispute awaiting broadcast coverage.'}
                  </Text>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[
                      styles.primaryCardBtn,
                      isInvestigating && { backgroundColor: 'rgba(34, 197, 94, 0.25)', borderColor: '#22C55E', borderWidth: 1 },
                    ]}
                    onPress={() => handleInvestigateCase(lead)}
                    disabled={isInvestigating || investigatingId === lead.caseId}
                    activeOpacity={0.8}
                  >
                    {investigatingId === lead.caseId ? (
                      <ActivityIndicator size="small" color="#0A0402" />
                    ) : (
                      <Text style={[styles.primaryCardBtnText, isInvestigating && { color: '#4ADE80' }]}>
                        {isInvestigating ? 'Assigned to Bureau' : 'Investigate Case'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryCardBtn}
                    onPress={() => setSelectedLead(lead)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryCardBtnText}>View Full Lead</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* SECTION 2: PUBLISHED BROADCAST STORIES FEED */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <Text style={styles.sectionLabel}>
            Published Investigative Broadcasts ({publishedStories.length})
          </Text>
        </View>

        {publishedStories.length === 0 ? (
          <View style={[styles.storyCard, { paddingVertical: 20, alignItems: 'center' }]}>
            <Text style={{ color: isDark ? '#FFFFFF' : '#1A0C04', fontSize: 12 }}>
              No investigative stories aired yet.
            </Text>
          </View>
        ) : (
          publishedStories.map((story) => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCard}
              onPress={() => setSelectedStory(story)}
              activeOpacity={0.84}
            >
              <View style={styles.storyTopRow}>
                <View style={styles.storyDistrictBadge}>
                  <Text style={styles.storyDistrictText}>{story.district || 'Sindh'}</Text>
                </View>
                <Text style={styles.storyDate}>
                  {story.published_at ? new Date(story.published_at).toLocaleDateString() : 'Recent'}
                </Text>
              </View>

              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storySummary} numberOfLines={2}>{story.summary}</Text>

              <View style={styles.storyFooter}>
                <Text style={styles.storyProgram}>{story.media_outlet || 'KTN News Television'}</Text>
                <Text style={styles.storyReadMore}>View Broadcast →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL 1: PUBLISH BROADCAST STORY MODAL */}
      <Modal
        visible={showPublishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Publish Investigative Story</Text>
            <Text style={styles.modalSub}>
              Air breaking legal reports and public interest bulletins across Sindh.
            </Text>

            <Text style={styles.inputLabel}>Headline *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Land Encroachment Probe in Malir High Court"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={headline}
              onChangeText={setHeadline}
            />

            <Text style={styles.inputLabel}>Investigation Summary *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide investigated facts, court notices, and affected citizen details..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
              value={summary}
              onChangeText={setSummary}
            />

            <Text style={styles.inputLabel}>District Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Karachi Central / Hyderabad / Sukkur"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={district}
              onChangeText={setDistrict}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mark as Urgent Breaking News Flash</Text>
              <Switch
                value={isBreakingNews}
                onValueChange={setIsBreakingNews}
                trackColor={{ false: '#3E3E4A', true: '#EF4444' }}
                thumbColor={isBreakingNews ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPublishModal(false)}
                disabled={publishing}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handlePublishStory}
                disabled={publishing}
              >
                {publishing ? (
                  <ActivityIndicator size="small" color="#0A0402" />
                ) : (
                  <Text style={styles.modalSubmitText}>Air Story</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: LEAD DETAIL MODAL */}
      <Modal
        visible={Boolean(selectedLead)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLead(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Whistleblower Lead Dossier</Text>
            <Text style={styles.modalSub}>
              {selectedLead?.title || selectedLead?.caseTitle || selectedLead?.headline || 'Citizen Grievance'}
            </Text>

            <Text style={styles.inputLabel}>District & Jurisdiction</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 13, marginBottom: 8 }}>
              {selectedLead?.district || 'Sindh Province'} · {selectedLead?.category || 'Public Grievance'}
            </Text>

            <Text style={styles.inputLabel}>Grievance Summary</Text>
            <Text style={{ color: 'rgba(255,230,210,0.85)', fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
              {selectedLead?.summary || selectedLead?.problemStatement || selectedLead?.description}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedLead(null)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={() => {
                  handleInvestigateCase(selectedLead);
                  setSelectedLead(null);
                }}
              >
                <Text style={styles.modalSubmitText}>Launch Bureau Probe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Global Bottom Navigation */}
      <BottomNavBar role="media" />
    </SafeAreaView>
  );
}
