// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  university: University;
  program?: string;
  studentId?: string;
  role: Role;
  createdAt: string;
}

export type Role = 'STUDENT' | 'ADMIN' | 'ADVISOR';

export type University =
  | 'UNIVERSITY_OF_MANITOBA'
  | 'UNIVERSITY_OF_WINNIPEG'
  | 'RED_RIVER_COLLEGE'
  | 'BRANDON_UNIVERSITY'
  | 'OTHER';

// ============================================
// Study Permit
// ============================================

export interface StudyPermit {
  id: string;
  userId: string;
  permitNumber?: string;
  issueDate?: string;
  expiryDate: string;
  status: PermitStatus;
  conditions: string[];
}

export type PermitStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWAL_PENDING';

// ============================================
// Work Log
// ============================================

export interface WorkLog {
  id: string;
  userId: string;
  date: string;
  hoursWorked: number;
  employer: string;
  notes?: string;
}

export interface WeekSummary {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  remaining: number;
  isOverLimit: boolean;
  isNearLimit: boolean;
  logs: WorkLog[];
}

export interface WorkLogAlert {
  level: 'WARNING' | 'CRITICAL';
  message: string;
}

// ============================================
// Compliance
// ============================================

export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  category: ComplianceCategory;
  deadlineType: DeadlineType;
  deadlineDays?: number;
  priority: number;
  helpUrl?: string;
}

export interface ComplianceItem {
  id: string;
  userId: string;
  ruleId: string;
  status: ComplianceStatus;
  dueDate?: string;
  completedAt?: string;
  documentId?: string;
  notes?: string;
  rule: ComplianceRule;
}

export type ComplianceCategory =
  | 'STUDY_PERMIT'
  | 'WORK_AUTHORIZATION'
  | 'ENROLLMENT'
  | 'HEALTH_INSURANCE'
  | 'HOUSING'
  | 'TAXES'
  | 'REPORTING';

export type ComplianceStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'NOT_APPLICABLE';

export type DeadlineType =
  | 'FIXED_DATE'
  | 'RELATIVE_TO_PERMIT'
  | 'RECURRING'
  | 'ONE_TIME';

export interface ComplianceStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  inProgress: number;
  completionRate: number;
}

// ============================================
// Documents
// ============================================

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isVerified: boolean;
  uploadedAt: string;
  expiresAt?: string;
}

export type DocumentType =
  | 'STUDY_PERMIT'
  | 'ENROLLMENT_LETTER'
  | 'WORK_PERMIT'
  | 'COOOP_LETTER'
  | 'LEASE_AGREEMENT'
  | 'HEALTH_INSURANCE'
  | 'TAX_RETURN'
  | 'OTHER';

// ============================================
// Notifications
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  isRead: boolean;
  actionUrl?: string;
  sentAt: string;
}

export type NotificationType =
  | 'PERMIT_EXPIRY'
  | 'WORK_HOUR_WARNING'
  | 'WORK_HOUR_LIMIT'
  | 'COMPLIANCE_DUE'
  | 'COMPLIANCE_OVERDUE'
  | 'DOCUMENT_EXPIRY'
  | 'SYSTEM';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS';
