import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles from './NGOHome.styles';

const caseTypes = [
  { label: 'Property',    value: 0, pct: 0, color: '#5C1A1A' },
  { label: 'Family',      value: 0, pct: 0, color: '#0F2744' },
  { label: 'Inheritance', value: 0, pct: 0, color: '#1B4332' },
  { label: 'Divorce',     value: 0, pct: 0, color: '#4a148c' },
];

const insights = [
  { num: '—', label: 'Avg. lawyer response' },
  { num: '—', label: 'Rural access rate' },
  { num: '—', label: 'Evidence uploaded' },
  { num: '—', label: 'Chatbot queries' },
];

const heatmap = [];

const navItems = [
  { id: 'home',      icon: '📊', label: 'Dashboard' },
  { id: 'map',       icon: '🗺️', label: 'Map'       },
  { id: 'analytics', icon: '📈', label: 'Trends'    },
  { id: 'export',    icon: '📤', label: 'Export'    },
  { id: 'settings',  icon: '⚙️', label: 'Settings'  },
];

export default function NGOHome() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('home');

  const handleNav = (id) => {
    setActiveNav(id);
    if (id === 'map')       router.push('/(ngo)/CaseMap');
    if (id === 'analytics') router.push('/(ngo)/Analytics');
    if (id === 'export')    router.push('/(ngo)/ExportReports');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>Barq-e-Insaf ⚡</Text>
            <Text style={styles.brandSub}>Legal Analytics Portal</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NGO</Text>
            </View>
          </View>
        </View>

        <Text style={styles.orgName}>NGO Dashboard</Text>
        <Text style={styles.orgSub}>Public data · Exportable</Text>

        <View style={styles.statsRow}>
          <View style={styles.statChip}><Text style={styles.statNum}>0</Text><Text style={styles.statLabel}>Cases / Month</Text></View>
          <View style={styles.statChip}><Text style={styles.statNum}>0</Text><Text style={styles.statLabel}>Districts</Text></View>
          <View style={styles.statChip}><Text style={styles.statNum}>—</Text><Text style={styles.statLabel}>vs Last Month</Text></View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Sindh Case Heatmap</Text>
          <TouchableOpacity onPress={() => router.push('/(ngo)/CaseMap')}>
            <Text style={styles.seeAllText}>Expand →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mapCard} onPress={() => router.push('/(ngo)/CaseMap')}>
          <View style={styles.mapVisual}>
            {heatmap.length === 0 && <Text style={styles.mapSub}>No case data yet</Text>}
            {heatmap.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.mapDot,
                  {
                    width: 16,
                    height: h,
                    backgroundColor: i % 3 === 0 ? '#5C1A1A' : i % 3 === 1 ? '#1B4332' : '#f59e0b',
                    opacity: 0.4 + (h / 22) * 0.6,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.mapFooter}>
            <View>
              <Text style={styles.mapLabel}>Interactive Sindh Map</Text>
              <Text style={styles.mapSub}>Tap to explore district data</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Case Type Breakdown</Text>
          <TouchableOpacity onPress={() => router.push('/(ngo)/Analytics')}>
            <Text style={styles.seeAllText}>Full Report →</Text>
          </TouchableOpacity>
        </View>

        {caseTypes.map((c, i) => (
          <View key={i} style={styles.barRow}>
            <Text style={styles.barLabel}>{c.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${c.pct}%`, backgroundColor: c.color }]} />
            </View>
            <Text style={styles.barVal}>{c.value}</Text>
          </View>
        ))}

        <Text style={styles.sectionLabel}>Key Insights</Text>
        <View style={styles.insightGrid}>
          {insights.map((ins, i) => (
            <View key={i} style={styles.insightCard}>
              <Text style={styles.insightNum}>{ins.num}</Text>
              <Text style={styles.insightLabel}>{ins.label}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.navItem} onPress={() => handleNav(item.id)}>
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, activeNav === item.id && styles.navLabelActive]}>{item.label}</Text>
            {activeNav === item.id && <View style={styles.navActiveDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}