import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../utils/auth-store';
import { documentApi } from '../utils/api';

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  documentType: string;
  category?: string;
  uploadedAt: string;
  mimeType?: string;
}

const DOC_TYPE_ICONS: Record<string, string> = {
  STUDY_PERMIT: '🪪',
  ENROLLMENT_LETTER: '🎓',
  WORK_PERMIT: '💼',
  COOOP_LETTER: '💼',
  LEASE_AGREEMENT: '🏠',
  HEALTH_INSURANCE: '🏥',
  TAX_RETURN: '🧾',
  OTHER: '📄',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  STUDY_PERMIT: 'Study Permit',
  ENROLLMENT_LETTER: 'Enrollment Letter',
  WORK_PERMIT: 'Work Permit',
  COOOP_LETTER: 'Co-op Letter',
  LEASE_AGREEMENT: 'Lease Agreement',
  HEALTH_INSURANCE: 'Health Insurance',
  TAX_RETURN: 'Tax Return',
  OTHER: 'Other',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function DocumentsScreen({ navigation }: any) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    try {
      const res = (await documentApi.getAll(token)) as any;
      const docs: Document[] = res.documents || res || [];
      setDocuments(docs);
    } catch {
      // Silent fail
    }
  }, [token]);

  useEffect(() => {
    fetchDocuments().finally(() => setLoading(false));
  }, [fetchDocuments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  }, [fetchDocuments]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading documents...</Text>
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
        <Text style={styles.screenTitle}>Documents</Text>
        <Text style={styles.screenSubtitle}>
          Your uploaded documents and permits
        </Text>

        {/* Upload Notice */}
        <View style={styles.uploadNotice}>
          <Text style={styles.uploadNoticeIcon}>{'💡'}</Text>
          <Text style={styles.uploadNoticeText}>
            To upload new documents, please use the NorthStar web app. Document
            upload requires file selection which is best handled on desktop.
          </Text>
        </View>

        {/* Document Count */}
        {documents.length > 0 && (
          <Text style={styles.countText}>
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </Text>
        )}

        {/* Documents List */}
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{'📂'}</Text>
            <Text style={styles.emptyTitle}>No Documents Yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload your study permit, enrollment letters, and other important
              documents from the web app to keep them organized and accessible.
            </Text>
            <View style={styles.emptyTipCard}>
              <Text style={styles.emptyTipTitle}>Documents to upload:</Text>
              <Text style={styles.emptyTipItem}>{'  '}{'🪪'} Study Permit</Text>
              <Text style={styles.emptyTipItem}>{'  '}{'🎓'} Enrollment Letter</Text>
              <Text style={styles.emptyTipItem}>{'  '}{'🏥'} Health Insurance Card</Text>
              <Text style={styles.emptyTipItem}>{'  '}{'🏠'} Lease Agreement</Text>
              <Text style={styles.emptyTipItem}>{'  '}{'🧾'} Tax Documents</Text>
            </View>
          </View>
        ) : (
          documents.map((doc) => {
            const icon = DOC_TYPE_ICONS[doc.documentType] || '📄';
            const typeLabel =
              DOC_TYPE_LABELS[doc.documentType] || doc.documentType || 'Document';

            return (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docRow}>
                  <Text style={styles.docIcon}>{icon}</Text>
                  <View style={styles.docInfo}>
                    <Text style={styles.docFilename} numberOfLines={1}>
                      {doc.filename}
                    </Text>
                    <View style={styles.docMeta}>
                      <Text style={styles.docSize}>
                        {formatFileSize(doc.fileSize)}
                      </Text>
                      <Text style={styles.docDot}>{'  '}{'  '}</Text>
                      <Text style={styles.docDate}>
                        {formatDate(doc.uploadedAt)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Category Badge */}
                <View style={styles.docBadgeRow}>
                  <View style={styles.docBadge}>
                    <Text style={styles.docBadgeText}>{typeLabel}</Text>
                  </View>
                  {doc.category && doc.category !== doc.documentType && (
                    <View style={[styles.docBadge, styles.docBadgeSecondary]}>
                      <Text style={styles.docBadgeTextSecondary}>
                        {doc.category.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  )}
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
  uploadNotice: {
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#3B82F640',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  uploadNoticeIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  uploadNoticeText: {
    fontSize: 13,
    color: '#93C5FD',
    flex: 1,
    lineHeight: 19,
  },
  countText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  emptyTipCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  emptyTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptyTipItem: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
    lineHeight: 20,
  },
  docCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docIcon: {
    fontSize: 32,
  },
  docInfo: {
    flex: 1,
  },
  docFilename: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docSize: {
    fontSize: 12,
    color: '#64748B',
  },
  docDot: {
    fontSize: 12,
    color: '#475569',
  },
  docDate: {
    fontSize: 12,
    color: '#64748B',
  },
  docBadgeRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  docBadge: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  docBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  docBadgeSecondary: {
    backgroundColor: '#64748B20',
  },
  docBadgeTextSecondary: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
