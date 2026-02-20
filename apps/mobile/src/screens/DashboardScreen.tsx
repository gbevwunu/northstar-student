import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../utils/auth-store';
import { permitApi, workLogApi, complianceApi, notificationApi } from '../utils/api';
import { WORK_HOUR_CAP_PER_WEEK } from '@northstar/shared/constants';

interface PermitData {
  daysRemaining: number;
  expiryDate: string;
  status: string;
}

interface WorkLogDashboard {
  currentWeek: {
    totalHours: number;
    entries: unknown[];
  };
  monthlyTotal: number;
  cap: number;
  remainingThisWeek: number;
}

interface ComplianceItem {
  id: string;
  status: string;
}

interface Notification {
  id: string;
  read: boolean;
}

export default function DashboardScreen({ navigation }: any) {
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [permit, setPermit] = useState<PermitData | null>(null);
  const [workDashboard, setWorkDashboard] = useState<WorkLogDashboard | null>(null);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [permitRes, workRes, complianceRes, notifRes] = await Promise.allSettled([
        permitApi.get(token),
        workLogApi.dashboard(token),
        complianceApi.getChecklist(token),
        notificationApi.getAll(token),
      ]);

      if (permitRes.status === 'fulfilled') {
        const data = permitRes.value as any;
        setPermit(data.permit || data);
      }

      if (workRes.status === 'fulfilled') {
        setWorkDashboard(workRes.value as WorkLogDashboard);
      }

      if (complianceRes.status === 'fulfilled') {
        const data = complianceRes.value as any;
        setComplianceItems(data.items || data.checklist || data || []);
      }

      if (notifRes.status === 'fulfilled') {
        const data = notifRes.value as any;
        const notifications: Notification[] = data.notifications || data || [];
        setUnreadCount(notifications.filter((n) => !n.read).length);
      }
    } catch {
      // Silent fail on dashboard - individual cards will show fallback
    }
  }, [token]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Computed values
  const weekHours = workDashboard?.currentWeek?.totalHours ?? 0;
  const workPercentage = (weekHours / WORK_HOUR_CAP_PER_WEEK) * 100;
  const remaining = Math.max(0, WORK_HOUR_CAP_PER_WEEK - weekHours);

  const permitDays = permit?.daysRemaining ?? 0;
  const permitStatus = permit?.status ?? 'Unknown';

  const completedItems = complianceItems.filter((i) => i.status === 'COMPLETED').length;
  const totalItems = complianceItems.length;
  const complianceRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const overdueItems = complianceItems.filter((i) => i.status === 'OVERDUE').length;

  const getPermitDotColor = () => {
    if (permitDays > 90) return '#22C55E';
    if (permitDays > 30) return '#EAB308';
    return '#EF4444';
  };

  const getWorkBarColor = () => {
    if (workPercentage >= 100) return '#EF4444';
    if (workPercentage >= 83) return '#EAB308';
    return '#3B82F6';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.firstName ?? 'Student'}</Text>
          </View>
          <TouchableOpacity style={styles.notifButton} onPress={onRefresh}>
            <Text style={styles.notifIcon}>{'🔔'}</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Permit Card */}
        <View style={[styles.card, styles.permitCard]}>
          <Text style={styles.cardIcon}>{'🪪'}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Study Permit</Text>
            <Text style={styles.cardValue}>
              {permitDays} days remaining
            </Text>
            <Text style={styles.cardSub}>Status: {permitStatus}</Text>
          </View>
          <View
            style={[styles.statusDot, { backgroundColor: getPermitDotColor() }]}
          />
        </View>

        {/* Work Hours Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>{'⏱️'}</Text>
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
                  backgroundColor: getWorkBarColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.remainingText}>
            {remaining}h remaining this week
          </Text>
        </View>

        {/* Compliance Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardIcon}>{'📋'}</Text>
            <Text style={styles.cardLabel}>Compliance</Text>
          </View>
          <Text style={styles.cardValue}>{complianceRate}% complete</Text>
          <Text style={styles.cardSub}>
            {completedItems} of {totalItems} items completed
          </Text>
          {overdueItems > 0 && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertText}>
                {'⚠️'} {overdueItems} overdue item(s)
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon="⏱️"
            label="Log Hours"
            onPress={() => navigation.navigate('WorkLog')}
          />
          <ActionButton
            icon="📋"
            label="Checklist"
            onPress={() => navigation.navigate('Compliance')}
          />
          <ActionButton
            icon="📄"
            label="Documents"
            onPress={() => navigation.navigate('Documents')}
          />
          <ActionButton
            icon="🏠"
            label="Tenancy"
            onPress={() => navigation.navigate('Tenancy')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 20, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
  },
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  card: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  permitCard: { flexDirection: 'row', alignItems: 'center' },
  cardContent: { flex: 1, marginLeft: 12 },
  cardIcon: { fontSize: 32 },
  cardLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
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
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, color: '#CBD5E1' },
});
