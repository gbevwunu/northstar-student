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
  Alert,
} from 'react-native';
import { useAuthStore } from '../utils/auth-store';
import { complianceApi } from '../utils/api';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'COMPLETED' | 'PENDING' | 'OVERDUE' | 'IN_PROGRESS';
  dueDate?: string;
}

const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  STUDY_PERMIT: { icon: '🪪', color: '#2563EB' },
  WORK_AUTHORIZATION: { icon: '💼', color: '#7C3AED' },
  ENROLLMENT: { icon: '🎓', color: '#059669' },
  HEALTH_INSURANCE: { icon: '🏥', color: '#DC2626' },
  HOUSING: { icon: '🏠', color: '#D97706' },
  TAXES: { icon: '🧾', color: '#4B5563' },
  REPORTING: { icon: '📝', color: '#0891B2' },
};

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  COMPLETED: { label: 'Completed', bgColor: '#16A34A20', textColor: '#22C55E' },
  PENDING: { label: 'Pending', bgColor: '#64748B20', textColor: '#94A3B8' },
  OVERDUE: { label: 'Overdue', bgColor: '#EF444420', textColor: '#EF4444' },
  IN_PROGRESS: { label: 'In Progress', bgColor: '#3B82F620', textColor: '#3B82F6' },
};

export default function ComplianceScreen({ navigation }: any) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    if (!token) return;
    try {
      const res = (await complianceApi.getChecklist(token)) as any;
      const data: ChecklistItem[] = res.items || res.checklist || res || [];
      setItems(data);
    } catch {
      // Silent fail
    }
  }, [token]);

  useEffect(() => {
    fetchChecklist().finally(() => setLoading(false));
  }, [fetchChecklist]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChecklist();
    setRefreshing(false);
  }, [fetchChecklist]);

  const toggleItem = async (item: ChecklistItem) => {
    if (!token || togglingId) return;

    const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setTogglingId(item.id);

    try {
      await complianceApi.updateItem(token, item.id, { status: newStatus });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus as ChecklistItem['status'] } : i))
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update item.');
    } finally {
      setTogglingId(null);
    }
  };

  const completedCount = items.filter((i) => i.status === 'COMPLETED').length;
  const totalCount = items.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const overdueCount = items.filter((i) => i.status === 'OVERDUE').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading checklist...</Text>
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
        <Text style={styles.screenTitle}>Compliance Checklist</Text>
        <Text style={styles.screenSubtitle}>
          Stay on top of your study permit requirements
        </Text>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsTop}>
            <View>
              <Text style={styles.statsPercentage}>{completionPercentage}%</Text>
              <Text style={styles.statsLabel}>Complete</Text>
            </View>
            <View style={styles.statsRight}>
              <Text style={styles.statsCount}>
                {completedCount}/{totalCount}
              </Text>
              <Text style={styles.statsLabel}>Items Done</Text>
            </View>
          </View>

          {/* Completion Bar */}
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionPercentage}%`,
                  backgroundColor:
                    completionPercentage === 100
                      ? '#22C55E'
                      : completionPercentage >= 50
                        ? '#3B82F6'
                        : '#EAB308',
                },
              ]}
            />
          </View>

          {overdueCount > 0 && (
            <View style={styles.overdueBanner}>
              <Text style={styles.overdueText}>
                {'⚠️'} {overdueCount} overdue item{overdueCount > 1 ? 's' : ''} requiring attention
              </Text>
            </View>
          )}
        </View>

        {/* Checklist Items */}
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{'📋'}</Text>
            <Text style={styles.emptyTitle}>No checklist items</Text>
            <Text style={styles.emptySubtitle}>
              Your compliance checklist will appear here once configured.
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const categoryConfig = CATEGORY_CONFIG[item.category] || {
              icon: '📌',
              color: '#64748B',
            };
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
            const isToggling = togglingId === item.id;

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => toggleItem(item)}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <ActivityIndicator size="small" color="#3B82F6" />
                    ) : (
                      <View
                        style={[
                          styles.checkbox,
                          item.status === 'COMPLETED' && styles.checkboxChecked,
                        ]}
                      >
                        {item.status === 'COMPLETED' && (
                          <Text style={styles.checkmark}>{'✓'}</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Content */}
                  <View style={styles.itemContent}>
                    {/* Category */}
                    <View style={styles.categoryRow}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: categoryConfig.color + '20' },
                        ]}
                      >
                        <Text style={styles.categoryIcon}>
                          {categoryConfig.icon}
                        </Text>
                        <Text
                          style={[
                            styles.categoryText,
                            { color: categoryConfig.color },
                          ]}
                        >
                          {item.category.replace(/_/g, ' ')}
                        </Text>
                      </View>

                      {/* Status Badge */}
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusConfig.bgColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: statusConfig.textColor },
                          ]}
                        >
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>

                    {/* Title & Description */}
                    <Text
                      style={[
                        styles.itemTitle,
                        item.status === 'COMPLETED' && styles.itemTitleCompleted,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.description ? (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    ) : null}

                    {/* Due date */}
                    {item.dueDate && (
                      <Text
                        style={[
                          styles.dueDate,
                          item.status === 'OVERDUE' && styles.dueDateOverdue,
                        ]}
                      >
                        Due: {item.dueDate}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
  statsCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statsPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  statsCount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  overdueBanner: {
    backgroundColor: '#7F1D1D40',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  overdueText: {
    fontSize: 12,
    color: '#FCA5A5',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  itemDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  dueDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
  dueDateOverdue: {
    color: '#EF4444',
  },
});
