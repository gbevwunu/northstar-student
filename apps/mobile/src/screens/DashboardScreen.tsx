import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { WORK_HOUR_CAP_PER_WEEK } from '@northstar/shared/constants';

export default function DashboardScreen() {
  // Mock data - replace with API integration
  const user = { firstName: 'Amina' };
  const permitDays = 208;
  const weekHours = 16;
  const complianceRate = 67;
  const overdue = 1;

  const workPercentage = (weekHours / WORK_HOUR_CAP_PER_WEEK) * 100;
  const remaining = WORK_HOUR_CAP_PER_WEEK - weekHours;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user.firstName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Permit Card */}
        <View style={[styles.card, styles.permitCard]}>
          <Text style={styles.cardIcon}>🪪</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Study Permit</Text>
            <Text style={styles.cardValue}>{permitDays} days remaining</Text>
            <Text style={styles.cardSub}>Status: Active</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
        </View>

        {/* Work Hours Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>⏱️</Text>
            <Text style={styles.cardLabel}>This Week&apos;s Hours</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursValue}>{weekHours}h</Text>
            <Text style={styles.hoursCap}>/ {WORK_HOUR_CAP_PER_WEEK}h</Text>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(workPercentage, 100)}%`,
                  backgroundColor: workPercentage >= 83 ? '#EAB308' : '#3B82F6',
                },
              ]}
            />
          </View>
          <Text style={styles.remainingText}>{remaining}h remaining this week</Text>
        </View>

        {/* Compliance Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardLabel}>Compliance</Text>
          </View>
          <Text style={styles.cardValue}>{complianceRate}% complete</Text>
          {overdue > 0 && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertText}>⚠️ {overdue} overdue item(s)</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton icon="⏱️" label="Log Hours" />
          <ActionButton icon="📄" label="Upload Doc" />
          <ActionButton icon="📋" label="Checklist" />
          <ActionButton icon="🏠" label="Tenancy" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 14, color: '#94A3B8' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  notifButton: { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  card: {
    backgroundColor: '#1E293B80',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  permitCard: { flexDirection: 'row', alignItems: 'center' },
  cardContent: { flex: 1, marginLeft: 12 },
  cardIcon: { fontSize: 32 },
  cardLabel: { fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  hoursRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  hoursValue: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  hoursCap: { fontSize: 16, color: '#64748B' },
  progressBg: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  remainingText: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  alertBanner: {
    backgroundColor: '#7F1D1D40',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  alertText: { fontSize: 12, color: '#FCA5A5' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtn: {
    width: '47%',
    backgroundColor: '#1E293B80',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, color: '#CBD5E1' },
});
