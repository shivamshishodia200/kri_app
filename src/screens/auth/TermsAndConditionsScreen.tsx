import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'TermsAndConditions'>;

export const TermsAndConditionsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Terms & Conditions" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>1. Introduction & Acceptance</Text>
        <Text style={styles.paragraph}>
          Welcome to Kirayedar24, a property marketplace application owned and operated by Kirayedar24 Technologies. By accessing or using our mobile application, website, and related property services, you agree to be bound by these Terms of Service.
        </Text>

        <Text style={styles.sectionTitle}>2. Verified Listings & User Content</Text>
        <Text style={styles.paragraph}>
          Owners and agents represent and warrant that all property information, pricing, images, and documents uploaded are authentic and accurate. Kirayedar24 conducts physical and digital verification audits, but users are advised to inspect physical premises before entering into binding lease agreements.
        </Text>

        <Text style={styles.sectionTitle}>3. Direct Communication & Zero Brokerage</Text>
        <Text style={styles.paragraph}>
          Kirayedar24 facilitates direct peer-to-peer communication between buyers, tenants, owners, and verified partners. We do not charge unwarranted broker commissions on verified direct owner listings.
        </Text>

        <Text style={styles.sectionTitle}>4. Rental Payments & Digital Invoicing</Text>
        <Text style={styles.paragraph}>
          Rent and utility payments processed through the app are secured with bank-grade encryption. Rent receipts generated are valid for tax deductions (HRA claims) as per applicable tax laws.
        </Text>

        <Text style={styles.sectionTitle}>5. Privacy & Data Protection</Text>
        <Text style={styles.paragraph}>
          We value your privacy. Personal contact details are only shared with relevant property owners or service professionals upon explicit user request or confirmed appointment booking.
        </Text>
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
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  paragraph: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
});
