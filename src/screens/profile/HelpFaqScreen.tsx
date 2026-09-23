import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpFaq'>;

const FAQS = [
  {
    q: 'How does Kirayedar24 verify property listings?',
    a: 'Every listing submitted by owners is vetted through physical verification by our field audit officers as well as digital document checks (electricity bills, title documents) to guarantee zero fake properties.',
  },
  {
    q: 'Are there any brokerage charges on rentals?',
    a: 'No! All properties listed by direct verified owners are 100% zero-brokerage. You connect and deal directly with the landlord without paying any intermediary commission.',
  },
  {
    q: 'How does the online Rent Agreement service work?',
    a: 'Once booked, our legal advocate prepares the legally binding government draft. We provide doorstep biometric verification and deliver the registered e-stamped legal agreement within 24 hours.',
  },
  {
    q: 'Can I generate valid rent receipts for HRA tax exemption?',
    a: 'Yes! When you pay rent through Kirayedar24, instant digital rent receipts with landlord PAN & transaction ID are generated and emailed to you for direct HRA submission.',
  },
  {
    q: 'How do landlords boost property visibility?',
    a: 'Landlords can subscribe to our Gold Pro or Platinum plans to get top-of-search placement, automated WhatsApp lead alerts, and featured badges.',
  },
];

export const HelpFaqScreen: React.FC<Props> = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Help & FAQs" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Frequently Asked Questions</Text>
        <Text style={styles.subheading}>
          Find quick answers regarding properties, visits, rent agreements & payments.
        </Text>

        <View style={styles.faqList}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(index)}
                  style={styles.faqQuestionRow}
                >
                  <Text style={styles.questionText}>{faq.q}</Text>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.primaryDark}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerText}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Support contact box */}
        <View style={styles.supportBox}>
          <Text style={styles.supportTitle}>Still need assistance?</Text>
          <Text style={styles.supportSub}>
            Our real-estate support specialists are available 24/7.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ContactUs')}
            style={styles.contactBtn}
          >
            <Text style={styles.contactBtnText}>Contact Support Team →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  heading: {
    ...typography.h2,
    fontSize: 20,
    color: colors.darkText,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  faqList: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md + 2,
  },
  questionText: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
    flex: 1,
    marginRight: spacing.sm,
  },
  answerBox: {
    paddingHorizontal: spacing.md + 2,
    paddingBottom: spacing.md + 2,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  answerText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  supportBox: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
  },
  supportTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.darkText,
    marginBottom: 4,
  },
  supportSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  contactBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.round,
  },
  contactBtnText: {
    ...typography.button,
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
});
