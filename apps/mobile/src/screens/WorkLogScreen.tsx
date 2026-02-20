import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../utils/auth-store';
import { workLogApi } from '../utils/api';
import { WORK_HOUR_CAP_PER_WEEK } from '@northstar/shared/constants';

interface WorkLogDashboard {
  currentWeek: {
    totalHours: number;
    entries: Array<{
      id: string;
      date: string;
      hoursWorked: number;
      employer: string;
      notes?: string;
    }>;
  };
  monthlyTotal: number;
  cap: number;
  remainingThisWeek: number;
}

export default function WorkLogScreen({ navigation }: any) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dashboard, setDashboard] = useState<WorkLogDashboard | null>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState('');
  const [employer, setEmployer] = useState('');
  const [notes, setNotes] = useState('');

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    try {
      const res = (await workLogApi.dashboard(token)) as WorkLogDashboard;
      setDashboard(res);
    } catch {
      // Silent fail
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard().finally(() => setLoading(false));
  }, [fetchDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, [fetchDashboard]);

  const handleSubmit = async () => {
    if (!token) return;

    const hours = parseFloat(hoursWorked);
    if (!hoursWorked || isNaN(hours) || hours <= 0) {
      Alert.alert('Validation Error', 'Please enter valid hours worked.');
      return;
    }
    if (hours > 24) {
      Alert.alert('Validation Error', 'Hours cannot exceed 24 in a single day.');
      return;
    }
    if (!employer.trim()) {
      Alert.alert('Validation Error', 'Please enter your employer name.');
      return;
    }
    if (!date) {
      Alert.alert('Validation Error', 'Please enter a valid date.');
      return;
    }

    setSubmitting(true);
    try {
      await workLogApi.logHours(token, {
        date,
        hoursWorked: hours,
        employer: employer.trim(),
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', `${hours} hours logged successfully.`);

      // Reset form
      setHoursWorked('');
      setNotes('');
      // Keep employer for convenience

      // Refresh dashboard data
      await fetchDashboard();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log hours. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const weekHours = dashboard?.currentWeek?.totalHours ?? 0;
  const workPercentage = (weekHours / WORK_HOUR_CAP_PER_WEEK) * 100;
  const remaining = dashboard?.remainingThisWeek ?? WORK_HOUR_CAP_PER_WEEK - weekHours;
  const monthlyTotal = dashboard?.monthlyTotal ?? 0;

  const getBarColor = () => {
    if (workPercentage >= 100) return '#EF4444';
    if (workPercentage >= 83) return '#EAB308';
    return '#3B82F6';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading work log...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
          <Text style={styles.screenTitle}>Work Hours</Text>
          <Text style={styles.screenSubtitle}>
            Track your weekly work hours to stay compliant
          </Text>

          {/* Weekly Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>THIS WEEK</Text>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursValue}>{weekHours}h</Text>
              <Text style={styles.hoursCap}>/ {WORK_HOUR_CAP_PER_WEEK}h</Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(workPercentage, 100)}%`,
                    backgroundColor: getBarColor(),
                  },
                ]}
              />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{remaining}h</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{monthlyTotal}h</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{WORK_HOUR_CAP_PER_WEEK}h</Text>
                <Text style={styles.statLabel}>Weekly Cap</Text>
              </View>
            </View>
          </View>

          {workPercentage >= 83 && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                {'⚠️'}{' '}
                {workPercentage >= 100
                  ? 'You have exceeded the weekly work hour limit!'
                  : 'You are approaching the weekly work hour limit.'}
              </Text>
            </View>
          )}

          {/* Log Hours Form */}
          <Text style={styles.sectionTitle}>Log Hours</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Hours Worked</Text>
            <TextInput
              style={styles.input}
              value={hoursWorked}
              onChangeText={setHoursWorked}
              placeholder="e.g. 4.5"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Employer</Text>
            <TextInput
              style={styles.input}
              value={employer}
              onChangeText={setEmployer}
              placeholder="Company or employer name"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.inputLabel}>
              Notes <Text style={styles.optionalText}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional details..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Log Hours</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Recent Entries */}
          {dashboard?.currentWeek?.entries && dashboard.currentWeek.entries.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>This Week&apos;s Entries</Text>
              {dashboard.currentWeek.entries.map((entry, index) => (
                <View key={entry.id || index} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{entry.date}</Text>
                    <Text style={styles.entryHours}>{entry.hoursWorked}h</Text>
                  </View>
                  <Text style={styles.entryEmployer}>{entry.employer}</Text>
                  {entry.notes ? (
                    <Text style={styles.entryNotes}>{entry.notes}</Text>
                  ) : null}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  hoursValue: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
  hoursCap: { fontSize: 18, color: '#64748B' },
  progressBg: {
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  warningBanner: {
    backgroundColor: '#7F1D1D40',
    borderWidth: 1,
    borderColor: '#EF444440',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    color: '#FCA5A5',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
    marginTop: 12,
  },
  optionalText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  entryHours: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  entryEmployer: {
    fontSize: 13,
    color: '#94A3B8',
  },
  entryNotes: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
