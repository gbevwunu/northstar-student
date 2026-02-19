// ============================================
// WORK HOUR LIMITS (IRCC Regulations)
// ============================================

/** Maximum work hours per week for international students during academic sessions */
export const WORK_HOUR_CAP_PER_WEEK = 24;

/** Warning threshold - alert when reaching this many hours */
export const WORK_HOUR_WARNING_THRESHOLD = 20;

/** During scheduled breaks (summer, winter), no cap applies */
export const WORK_HOUR_CAP_BREAK = Infinity;

// ============================================
// PERMIT REMINDER THRESHOLDS
// ============================================

/** Days before expiry to send reminders */
export const PERMIT_REMINDER_DAYS = [90, 60, 30, 14, 7] as const;

// ============================================
// UNIVERSITIES
// ============================================

export const UNIVERSITIES = {
  UNIVERSITY_OF_MANITOBA: {
    name: 'University of Manitoba',
    shortName: 'U of M',
    city: 'Winnipeg',
    internationalOffice: 'International Centre',
    website: 'https://umanitoba.ca/international',
  },
  UNIVERSITY_OF_WINNIPEG: {
    name: 'University of Winnipeg',
    shortName: 'U of W',
    city: 'Winnipeg',
    internationalOffice: 'International Student Services',
    website: 'https://www.uwinnipeg.ca/international',
  },
  RED_RIVER_COLLEGE: {
    name: 'Red River College Polytechnic',
    shortName: 'RRC',
    city: 'Winnipeg',
    internationalOffice: 'International Education',
    website: 'https://www.rrc.ca/international',
  },
  BRANDON_UNIVERSITY: {
    name: 'Brandon University',
    shortName: 'BU',
    city: 'Brandon',
    internationalOffice: 'International Activities',
    website: 'https://www.brandonu.ca/international',
  },
} as const;

// ============================================
// COMPLIANCE CATEGORIES
// ============================================

export const COMPLIANCE_CATEGORIES = {
  STUDY_PERMIT: { label: 'Study Permit', icon: 'id-card', color: '#2563EB' },
  WORK_AUTHORIZATION: { label: 'Work Authorization', icon: 'briefcase', color: '#7C3AED' },
  ENROLLMENT: { label: 'Enrollment', icon: 'graduation-cap', color: '#059669' },
  HEALTH_INSURANCE: { label: 'Health Insurance', icon: 'heart-pulse', color: '#DC2626' },
  HOUSING: { label: 'Housing', icon: 'home', color: '#D97706' },
  TAXES: { label: 'Taxes', icon: 'receipt', color: '#4B5563' },
  REPORTING: { label: 'Reporting', icon: 'file-text', color: '#0891B2' },
} as const;

// ============================================
// DOCUMENT TYPES
// ============================================

export const DOCUMENT_TYPES = {
  STUDY_PERMIT: { label: 'Study Permit', required: true },
  ENROLLMENT_LETTER: { label: 'Enrollment Letter', required: true },
  WORK_PERMIT: { label: 'Work Permit / Co-op Letter', required: false },
  COOOP_LETTER: { label: 'Co-op Work Permit Letter', required: false },
  LEASE_AGREEMENT: { label: 'Lease Agreement', required: false },
  HEALTH_INSURANCE: { label: 'Health Insurance Card', required: true },
  TAX_RETURN: { label: 'Tax Return', required: false },
  OTHER: { label: 'Other Document', required: false },
} as const;

// ============================================
// MANITOBA TENANCY (V2 - Residential Tenancies Act)
// ============================================

export const MB_TENANCY = {
  securityDepositMax: 0.5, // Max half month's rent
  rentIncreaseNotice: 90,  // Days notice required
  moveOutNotice: 30,       // Days notice for month-to-month
  rtbPhone: '204-945-2476',
  rtbWebsite: 'https://www.gov.mb.ca/cca/rtb/',
} as const;
