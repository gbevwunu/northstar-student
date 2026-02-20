import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';

interface TenancyCategory {
  id: string;
  icon: string;
  title: string;
  color: string;
  items: string[];
}

const TENANCY_CATEGORIES: TenancyCategory[] = [
  {
    id: 'deposits',
    icon: '💰',
    title: 'Security Deposits',
    color: '#22C55E',
    items: [
      'Maximum deposit is HALF of one month\'s rent',
      'Landlord must return deposit within 14 business days after move-out',
      'Landlord must pay interest on your deposit annually',
      'Deductions only for unpaid rent or damage beyond normal wear and tear',
      'Always get a receipt for your deposit payment',
      'Do a move-in AND move-out inspection with dated photos',
    ],
  },
  {
    id: 'repairs',
    icon: '🔧',
    title: 'Repairs & Maintenance',
    color: '#3B82F6',
    items: [
      'Landlord must maintain the unit in a habitable condition',
      'Always put repair requests in writing (email works)',
      'Include a reasonable deadline (7-14 days for non-urgent)',
      'Do NOT withhold rent without RTB authorization',
      'Do NOT make repairs yourself and deduct from rent without RTB approval',
      'Contact RTB or City of Winnipeg (311) if landlord refuses repairs',
      'Document everything with photos and dates',
    ],
  },
  {
    id: 'rent',
    icon: '📈',
    title: 'Rent Increases',
    color: '#EAB308',
    items: [
      'Landlord must give 3 months (90 days) written notice',
      'Increases must follow the annual guideline rate set by the government',
      'Above-guideline increases require RTB approval',
      'Cannot be increased during a fixed-term lease',
      'The notice must state the new amount and effective date',
      'You can object to above-guideline increases through the RTB',
    ],
  },
  {
    id: 'eviction',
    icon: '🚪',
    title: 'Eviction Protection',
    color: '#EF4444',
    items: [
      'Verbal eviction threats are NOT legally valid',
      'Non-payment of rent: landlord must give 14 days written notice',
      'Landlord\'s own use: 3 months written notice required',
      'Month-to-month (no reason): 3 months written notice',
      'Landlord CANNOT change locks, remove belongings, or shut off utilities',
      'Only the RTB can legally order an eviction',
      'You cannot be evicted for complaining about repairs or contacting RTB',
    ],
  },
  {
    id: 'general',
    icon: '📋',
    title: 'General Rights',
    color: '#8B5CF6',
    items: [
      'Landlord must give 24 hours notice before entering (except emergencies)',
      'You can refuse entry without proper notice',
      'Month-to-month tenancy: give 1 full rental month notice to leave',
      'Fixed-term lease: notice required before lease end date',
      'Keep copies of your lease, all receipts, and communications',
      'You have the right to a safe, habitable living environment',
      'Discrimination based on race, nationality, etc. is illegal',
    ],
  },
];

export default function TenancyScreen({ navigation }: any) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openRTBWebsite = () => {
    Linking.openURL('https://www.gov.mb.ca/cca/rtb/');
  };

  const callRTB = () => {
    Linking.openURL('tel:2049452476');
  };

  const callLegalAid = () => {
    Linking.openURL('tel:2049858500');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerIcon}>{'🏠'}</Text>
          <Text style={styles.screenTitle}>Manitoba Tenancy Rights</Text>
          <Text style={styles.screenSubtitle}>
            Know your rights under the Residential Tenancies Act
          </Text>
        </View>

        {/* Quick Facts */}
        <View style={styles.quickFactsCard}>
          <Text style={styles.quickFactsTitle}>Quick Facts</Text>
          <View style={styles.quickFactsRow}>
            <View style={styles.quickFact}>
              <Text style={styles.quickFactValue}>50%</Text>
              <Text style={styles.quickFactLabel}>Max Deposit{'\n'}(of 1 month)</Text>
            </View>
            <View style={styles.quickFactDivider} />
            <View style={styles.quickFact}>
              <Text style={styles.quickFactValue}>90</Text>
              <Text style={styles.quickFactLabel}>Days Notice{'\n'}Rent Increase</Text>
            </View>
            <View style={styles.quickFactDivider} />
            <View style={styles.quickFact}>
              <Text style={styles.quickFactValue}>30</Text>
              <Text style={styles.quickFactLabel}>Days Notice{'\n'}Move Out</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        {TENANCY_CATEGORIES.map((category) => {
          const isExpanded = expandedId === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => toggleExpand(category.id)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: category.color + '20' },
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryCount}>
                      {category.items.length} key points
                    </Text>
                  </View>
                </View>
                <Text style={styles.expandArrow}>
                  {isExpanded ? '▲' : '▼'}
                </Text>
              </View>

              {isExpanded && (
                <View style={styles.categoryContent}>
                  <View style={styles.divider} />
                  {category.items.map((item, index) => (
                    <View key={index} style={styles.bulletItem}>
                      <View
                        style={[
                          styles.bulletDot,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* RTB Contact Card */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactSubtitle}>
            Residential Tenancies Branch (RTB)
          </Text>

          <TouchableOpacity style={styles.contactButton} onPress={callRTB}>
            <Text style={styles.contactButtonIcon}>{'📞'}</Text>
            <View>
              <Text style={styles.contactButtonLabel}>Call RTB</Text>
              <Text style={styles.contactButtonValue}>204-945-2476</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={openRTBWebsite}>
            <Text style={styles.contactButtonIcon}>{'🌐'}</Text>
            <View>
              <Text style={styles.contactButtonLabel}>RTB Website</Text>
              <Text style={styles.contactButtonValue}>gov.mb.ca/cca/rtb/</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={callLegalAid}>
            <Text style={styles.contactButtonIcon}>{'⚖️'}</Text>
            <View>
              <Text style={styles.contactButtonLabel}>Legal Aid Manitoba</Text>
              <Text style={styles.contactButtonValue}>204-985-8500</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This is general information only, not legal advice. For your specific
          situation, consult a lawyer or contact the RTB directly.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 20, paddingBottom: 40 },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  quickFactsCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  quickFactsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickFactsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickFact: {
    flex: 1,
    alignItems: 'center',
  },
  quickFactValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  quickFactLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
  quickFactDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  categoryCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  expandArrow: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
  categoryContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  bulletText: {
    fontSize: 14,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  contactButtonIcon: {
    fontSize: 24,
  },
  contactButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactButtonValue: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 1,
  },
  disclaimer: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
