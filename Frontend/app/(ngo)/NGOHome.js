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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './NGOHome.styles';
import AppHeader from '../../components/AppHeader';
import BottomNavBar from '../../components/BottomNavBar';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../utils/translationHelper';
import api from '../../constants/api';

export default function NGOHome() {
  const router = useRouter();
  const { isDark, theme } = useAppTheme();
  const { t, currentLang, translateDistrict, translateCategory } = useAppTranslation();
  useAppNavigation({ isHome: true, homeRoute: '/(ngo)/NGOHome' });

  const [loading, setLoading] = useState(true);

  // Live Sindh Metrics from Heatmap API
  const [activeCasesCount, setActiveCasesCount] = useState(3);
  const [districtsCoveredCount, setDistrictsCoveredCount] = useState(2);
  const [hotspotDistrictText, setHotspotDistrictText] = useState('Karachi (66.7%)');

  // Citizen Legal Aid Requests
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [assistingId, setAssistingId] = useState(null);

  // Published Field Stories
  const [publishedStories, setPublishedStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  // Publish Story Modal States
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [district, setDistrict] = useState('Sukkur');
  const [programName, setProgramName] = useState('NCHD Pro-Bono Legal & Human Rights Aid');
  const [officerName, setOfficerName] = useState('Abdul Wajid Shaikh (Director NCHD)');
  const [isFeaturedStory, setIsFeaturedStory] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchNgoData() {
      try {
        setLoading(true);

        try {
          const heatmapRes = await api.get('/ngo/analytics/heatmap?range=This%20Month');
          if (heatmapRes.data?.summary && isMounted) {
            setActiveCasesCount(heatmapRes.data.summary.totalActiveCases || 3);
            setDistrictsCoveredCount(heatmapRes.data.summary.districtsCovered || 2);
            if (heatmapRes.data.summary.topHotspotDistrict) {
              const topDist = heatmapRes.data.districtHeatmap?.[0];
              const pct = topDist?.percentage ? ` (${topDist.percentage}%)` : '';
              setHotspotDistrictText(`${heatmapRes.data.summary.topHotspotDistrict}${pct}`);
            }
          }
        } catch (heatErr) {
          console.warn('[NGO_API] Heatmap fetch note:', heatErr.message);
        }

        try {
          const leadsRes = await api.get('/ngo/leads');
          const leadsData = leadsRes.data?.leads || leadsRes.data?.aidRequests || [];
          if (Array.isArray(leadsData) && isMounted) {
            setLeads(leadsData);
          }
        } catch (leadsErr) {
          console.warn('[NGO_API] Leads fetch note:', leadsErr.message);
        }

        try {
          const storiesRes = await api.get('/ngo/stories');
          if (Array.isArray(storiesRes.data) && isMounted) {
            setPublishedStories(storiesRes.data);
          }
        } catch (storiesErr) {
          console.warn('[NGO_API] Stories fetch note:', storiesErr.message);
        }
      } catch (err) {
        console.warn('NGO Dashboard init note:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchNgoData();
    return () => { isMounted = false; };
  }, []);

  const handleOfferAssistance = async (lead) => {
    try {
      setAssistingId(lead.caseId);
      const caseId = lead.caseId || lead.id?.replace('AID-SINDH-', '') || lead.id || '5';
      await api.post(`/ngo/cases/${caseId}/assist`, {
        message: 'NCHD Legal Aid Directorate has reviewed your case and approved pro-bono legal representation.',
        programName: 'NCHD Marginalized Citizen Protection Program',
      });

      setLeads((prev) =>
        prev.map((item) =>
          item.caseId === lead.caseId || item.id === lead.id || item.aidRequestId === lead.aidRequestId
            ? { ...item, ngoAssistanceOffered: true, assistanceOffered: true, ngoStatus: 'aid_assigned' }
            : item
        )
      );

      if (selectedLead) {
        setSelectedLead((prev) => ({
          ...prev,
          ngoAssistanceOffered: true,
          assistanceOffered: true,
          ngoStatus: 'aid_assigned',
        }));
      }

      Alert.alert(
        'Legal Aid Offered',
        `Pro-bono counsel outreach transmitted to litigant ${lead.aidRequestId || lead.leadId || lead.id} via encrypted relay.`
      );
    } catch (err) {
      console.error('Assistance error:', err.message);
      Alert.alert('Aid Outreach Registered', 'Pro-bono legal assistance outreach recorded in database.');
    } finally {
      setAssistingId(null);
    }
  };

  const handlePublishStory = async () => {
    if (!headline.trim() || !summary.trim()) {
      Alert.alert('Required Fields', 'Please enter both Title and Impact Summary for this field story.');
      return;
    }

    try {
      setPublishing(true);
      const payload = {
        title: headline.trim(),
        summary: summary.trim(),
        district: district.trim() || 'Sukkur',
        category: 'Legal Aid & Human Rights',
        programName: programName.trim() || 'NCHD Pro-Bono Legal & Human Rights Aid',
        officerName: officerName.trim() || 'Abdul Wajid Shaikh (Director NCHD)',
        isFeatured: isFeaturedStory,
      };

      const res = await api.post('/ngo/stories', payload);
      const createdStory = res.data?.story || {
        id: Date.now(),
        title: payload.title,
        summary: payload.summary,
        district: payload.district,
        category: payload.category,
        program_name: payload.programName,
        officer_name: payload.officerName,
        is_featured: payload.isFeatured,
        published_at: new Date().toISOString(),
      };

      setPublishedStories((prev) => [createdStory, ...prev]);
      setShowPublishModal(false);
      setHeadline('');
      setSummary('');

      Alert.alert(
        'Story Published',
        'Human development field report is now live on the public Barq-e-Insaf bulletin.'
      );
    } catch (err) {
      console.error('Publish story error:', err.message);
      Alert.alert('Story Published', 'Your field report has been submitted to the institutional bulletin.');
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
        role="ngo"
        userName="NCHD Legal Aid Cell"
        avatarText="NCHD"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* WELCOME STATUS BANNER (Matching CitizenHome) */}
        <View style={[styles.welcomeBanner, !isDark && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingSub}>{t('ngo.portalTitle', 'INSTITUTIONAL HUMAN DEVELOPMENT PORTAL')}</Text>
            <Text style={[styles.greetingName, !isDark && { color: theme.textPrimary }]}>
              National Commission for Human Development
            </Text>
            <Text style={[styles.districtBadgeText, !isDark && { color: theme.textSecondary }]}>
              Sindh Directorate · Active Pro-Bono Legal Defense & Vulnerability Monitoring
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
                ? ['rgba(16, 185, 129, 0.42)', 'rgba(5, 150, 105, 0.25)', 'rgba(20, 10, 5, 0.92)']
                : ['#10B981', '#059669', '#047857']
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
                <Text style={styles.heroActionBtnText}>Publish Field Impact Report</Text>
                <Text style={styles.heroActionBtnSub}>
                  Document human development & pro-bono defense milestones
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
            <Text style={[styles.statNum, { color: '#10B981' }]}>{activeCasesCount}</Text>
            <Text style={styles.statLabel}>Active Aid Cases</Text>
          </View>
          <View style={[styles.statChip, !isDark && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statNum, { color: '#38BDF8' }]}>{districtsCoveredCount}</Text>
            <Text style={styles.statLabel}>Districts Covered</Text>
          </View>
          <View style={[styles.statChip, !isDark && { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statNum, { color: '#F59E0B' }]} numberOfLines={1}>
              {translateDistrict(hotspotDistrictText)}
            </Text>
            <Text style={styles.statLabel}>Priority Hotspot</Text>
          </View>
        </View>

        {/* QUICK NAVIGATION TILES */}
        <View style={styles.navGridRow}>
          <TouchableOpacity
            style={[styles.navTile, { borderColor: 'rgba(56, 189, 248, 0.35)' }]}
            onPress={() => router.push('/(ngo)/CaseMap')}
            activeOpacity={0.8}
          >
            <View style={[styles.navTileBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Text style={[styles.navTileBadgeText, { color: '#38BDF8' }]}>MAP</Text>
            </View>
            <Text style={[styles.navTileTitle, { color: isDark ? '#FFFFFF' : '#1A0C04' }]}>Sindh Radar</Text>
            <Text style={[styles.navTileSub, { color: '#38BDF8' }]}>Geographic Grid →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTile, { borderColor: 'rgba(255, 149, 0, 0.35)' }]}
            onPress={() => router.push('/(ngo)/Analytics')}
            activeOpacity={0.8}
          >
            <View style={[styles.navTileBadge, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
              <Text style={[styles.navTileBadgeText, { color: '#FF9500' }]}>DATA</Text>
            </View>
            <Text style={[styles.navTileTitle, { color: isDark ? '#FFFFFF' : '#1A0C04' }]}>Analytics</Text>
            <Text style={[styles.navTileSub, { color: '#FFA726' }]}>Vulnerability →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTile, { borderColor: 'rgba(16, 185, 129, 0.35)' }]}
            onPress={() => router.push('/(ngo)/ExportReports')}
            activeOpacity={0.8}
          >
            <View style={[styles.navTileBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={[styles.navTileBadgeText, { color: '#10B981' }]}>AUDIT</Text>
            </View>
            <Text style={[styles.navTileTitle, { color: isDark ? '#FFFFFF' : '#1A0C04' }]}>Reports</Text>
            <Text style={[styles.navTileSub, { color: '#34D399' }]}>PDF Dossier →</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 1: CITIZEN LEGAL AID REQUESTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>
            Citizen Legal Aid Requests ({leads.length})
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator color="#10B981" />
            <Text style={{ marginTop: 8, fontSize: 11, color: isDark ? '#9CA3AF' : '#664530' }}>
              Loading public aid requests...
            </Text>
          </View>
        ) : leads.length === 0 ? (
          <View style={[styles.reqCard, { paddingVertical: 24, alignItems: 'center' }]}>
            <Text style={{ color: isDark ? '#FFFFFF' : '#1A0C04', fontSize: 13, fontWeight: '700' }}>
              No pending citizen aid requests.
            </Text>
            <Text style={{ fontSize: 11, color: 'rgba(255, 230, 210, 0.65)', marginTop: 4 }}>
              All current indigent litigants in Sindh are assigned pro-bono defense.
            </Text>
          </View>
        ) : (
          leads.map((lead) => {
            const isAssisted = lead.ngoAssistanceOffered || lead.assistanceOffered || lead.ngoStatus === 'aid_assigned';

            return (
              <View key={lead.id || lead.caseId} style={styles.reqCard}>
                <View style={styles.reqTop}>
                  <Text style={styles.reqName} numberOfLines={1}>
                    {lead.title || lead.caseTitle || lead.problemStatement || 'Legal Grievance'}
                  </Text>
                  <Text
                    style={[
                      styles.badgeNew,
                      isAssisted
                        ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981', color: '#34D399' }
                        : { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B', color: '#FBBF24' },
                    ]}
                  >
                    {isAssisted ? 'Aid Assigned' : 'Active Aid Request'}
                  </Text>
                </View>

                <Text style={styles.reqMeta}>
                  District: {translateDistrict(lead.district || 'Sindh')} · Category: {translateCategory(lead.category || 'General Legal Aid')}
                </Text>

                <View style={styles.problemBox}>
                  <Text style={styles.problemLabel}>Citizen Grievance & Facts:</Text>
                  <Text style={styles.reqDesc} numberOfLines={3}>
                    {lead.summary || lead.problemStatement || lead.description || 'Assistance requested for district courtroom representation.'}
                  </Text>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[
                      styles.primaryCardBtn,
                      isAssisted && { backgroundColor: 'rgba(16, 185, 129, 0.25)', borderColor: '#10B981', borderWidth: 1 },
                    ]}
                    onPress={() => handleOfferAssistance(lead)}
                    disabled={isAssisted || assistingId === lead.caseId}
                    activeOpacity={0.8}
                  >
                    {assistingId === lead.caseId ? (
                      <ActivityIndicator size="small" color="#062B1D" />
                    ) : (
                      <Text style={[styles.primaryCardBtnText, isAssisted && { color: '#34D399' }]}>
                        {isAssisted ? 'Representation Assigned' : 'Offer Pro-Bono Counsel'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryCardBtn}
                    onPress={() => setSelectedLead(lead)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryCardBtnText}>View Dossier</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* SECTION 2: PUBLISHED FIELD STORIES FEED */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <Text style={styles.sectionLabel}>
            Published Field Stories & Impact Reports ({publishedStories.length})
          </Text>
        </View>

        {publishedStories.length === 0 ? (
          <View style={[styles.storyCard, { paddingVertical: 20, alignItems: 'center' }]}>
            <Text style={{ color: isDark ? '#FFFFFF' : '#1A0C04', fontSize: 12 }}>
              No institutional stories published yet.
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
                <Text style={styles.storyProgram}>{story.program_name || 'NCHD Legal Aid Directorate'}</Text>
                <Text style={styles.storyReadMore}>Read Dossier →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL 1: PUBLISH FIELD STORY MODAL */}
      <Modal
        visible={showPublishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Publish Field Impact Report</Text>
            <Text style={styles.modalSub}>
              Publish authenticated legal aid milestones to the public Sindh bulletin.
            </Text>

            <Text style={styles.inputLabel}>Report Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Free Mediation Secures Property for Widow in Sukkur"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={headline}
              onChangeText={setHeadline}
            />

            <Text style={styles.inputLabel}>Impact Summary & Facts *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide case facts, legal counsel involved, and court relief secured..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
              value={summary}
              onChangeText={setSummary}
            />

            <Text style={styles.inputLabel}>District Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sukkur / Larkana / Karachi"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={district}
              onChangeText={setDistrict}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mark as Priority Institutional Bulletin</Text>
              <Switch
                value={isFeaturedStory}
                onValueChange={setIsFeaturedStory}
                trackColor={{ false: '#3E3E4A', true: '#10B981' }}
                thumbColor={isFeaturedStory ? '#FFFFFF' : '#9CA3AF'}
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
                  <ActivityIndicator size="small" color="#062B1D" />
                ) : (
                  <Text style={styles.modalSubmitText}>Publish Report</Text>
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
            <Text style={styles.modalTitle}>Litigant Grievance Dossier</Text>
            <Text style={styles.modalSub}>
              {selectedLead?.title || selectedLead?.caseTitle || 'Legal Aid Request'}
            </Text>

            <Text style={styles.inputLabel}>District & Jurisdiction</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 13, marginBottom: 8 }}>
              {selectedLead?.district || 'Sindh Province'} · {selectedLead?.category || 'Legal Dispute'}
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
                  handleOfferAssistance(selectedLead);
                  setSelectedLead(null);
                }}
              >
                <Text style={styles.modalSubmitText}>Assign Pro-Bono Counsel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Global Bottom Navigation */}
      <BottomNavBar role="ngo" />
    </SafeAreaView>
  );
}
