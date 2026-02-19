import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NorthStar Student database...');

  // ============================================
  // COMPLIANCE RULES (Manitoba-specific)
  // ============================================

  const rules = [
    // STUDY PERMIT
    {
      title: 'Study Permit Validity Check',
      description: 'Ensure your study permit is valid and not expired. Apply for renewal at least 30 days before expiry.',
      category: 'STUDY_PERMIT' as const,
      deadlineType: 'RELATIVE_TO_PERMIT' as const,
      deadlineDays: 30,
      referenceField: 'studyPermit.expiryDate',
      priority: 10,
      helpUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/extend-study-permit.html',
    },
    {
      title: 'Maintain Valid Passport',
      description: 'Your passport must be valid for the duration of your study permit. Renew at least 6 months before expiry.',
      category: 'STUDY_PERMIT' as const,
      deadlineType: 'ONE_TIME' as const,
      priority: 9,
      helpUrl: null,
    },
    {
      title: 'Report Change of Address to IRCC',
      description: 'You must report any change of address to IRCC within 30 days through your online account.',
      category: 'REPORTING' as const,
      deadlineType: 'ONE_TIME' as const,
      priority: 7,
      helpUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/change-address.html',
    },

    // ENROLLMENT
    {
      title: 'Maintain Full-Time Enrollment',
      description: 'You must be enrolled as a full-time student at your DLI. Dropping below full-time without authorization violates your permit.',
      category: 'ENROLLMENT' as const,
      deadlineType: 'RECURRING' as const,
      deadlineDays: 120, // Roughly each semester
      priority: 10,
      helpUrl: null,
    },
    {
      title: 'Upload Current Enrollment Letter',
      description: 'Upload your enrollment verification letter for the current semester from your university registrar.',
      category: 'ENROLLMENT' as const,
      deadlineType: 'RECURRING' as const,
      deadlineDays: 120,
      priority: 8,
      helpUrl: null,
    },

    // WORK AUTHORIZATION
    {
      title: 'Verify Off-Campus Work Eligibility',
      description: 'You can work up to 24 hours per week off-campus during academic sessions. Ensure you have a valid SIN.',
      category: 'WORK_AUTHORIZATION' as const,
      deadlineType: 'ONE_TIME' as const,
      priority: 8,
      helpUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/work-off-campus.html',
    },
    {
      title: 'Apply for Social Insurance Number (SIN)',
      description: 'You need a SIN to work in Canada. Apply at a Service Canada centre with your study permit.',
      category: 'WORK_AUTHORIZATION' as const,
      deadlineType: 'ONE_TIME' as const,
      priority: 9,
      helpUrl: 'https://www.canada.ca/en/employment-social-development/services/sin/apply.html',
    },
    {
      title: 'Track Weekly Work Hours',
      description: 'Monitor your weekly work hours to stay under the 24-hour cap during academic sessions. Use the NorthStar work log.',
      category: 'WORK_AUTHORIZATION' as const,
      deadlineType: 'RECURRING' as const,
      deadlineDays: 7,
      priority: 9,
      helpUrl: null,
    },

    // HEALTH INSURANCE
    {
      title: 'Enroll in Manitoba Health (MHSAL)',
      description: 'International students in Manitoba are eligible for provincial health coverage after a 6-month waiting period. Apply immediately upon arrival.',
      category: 'HEALTH_INSURANCE' as const,
      deadlineType: 'ONE_TIME' as const,
      priority: 7,
      helpUrl: 'https://www.gov.mb.ca/health/mhsip/',
    },
    {
      title: 'Maintain Interim Health Insurance',
      description: 'Ensure you have private health insurance coverage during the 6-month MHSAL waiting period.',
      category: 'HEALTH_INSURANCE' as const,
      deadlineType: 'FIXED_DATE' as const,
      deadlineDays: 180,
      priority: 8,
      helpUrl: null,
    },

    // TAXES
    {
      title: 'File Canadian Tax Return',
      description: 'International students must file a tax return by April 30 each year if they earned income. You may be eligible for GST/HST credit.',
      category: 'TAXES' as const,
      deadlineType: 'FIXED_DATE' as const,
      deadlineDays: 365,
      priority: 6,
      helpUrl: 'https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/individuals-leaving-entering-canada-non-residents/newcomers-canada-immigrants.html',
    },

    // HOUSING
    {
      title: 'Review Manitoba Tenancy Rights',
      description: 'Familiarize yourself with the Residential Tenancies Act. Max security deposit is half month rent. Landlords need 3 months notice for rent increases.',
      category: 'HOUSING' as const,
      deadlineType: 'ONE_TIME' as const,
      priority: 5,
      helpUrl: 'https://www.gov.mb.ca/cca/rtb/',
    },
  ];

  for (const rule of rules) {
    await prisma.complianceRule.upsert({
      where: {
        id: rule.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50),
      },
      update: rule,
      create: {
        id: rule.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50),
        ...rule,
      },
    });
  }

  console.log(`Seeded ${rules.length} compliance rules`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
