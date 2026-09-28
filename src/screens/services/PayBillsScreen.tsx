import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { formatIndianCurrency } from '../../components/common/PriceDisplay';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'PayBills'>;

interface UtilityCategory {
  id: string;
  name: string;
  icon: string;
  providerPlaceholder: string;
  idLabel: string;
  sampleAmount: string;
}

const UTILITY_CATEGORIES: UtilityCategory[] = [
  {
    id: 'electricity',
    name: 'Electricity',
    icon: 'sparkles',
    providerPlaceholder: 'e.g. BESCOM / Tata Power / Adani',
    idLabel: 'Consumer Account Number (CA)',
    sampleAmount: '2450',
  },
  {
    id: 'water',
    name: 'Water Supply',
    icon: 'bath',
    providerPlaceholder: 'e.g. BWSSB Bangalore / BMC Mumbai',
    idLabel: 'Water Connection / RR Number',
    sampleAmount: '820',
  },
  {
    id: 'gas',
    name: 'Piped Gas',
    icon: 'home',
    providerPlaceholder: 'e.g. GAIL Gas / Mahanagar Gas / IGL',
    idLabel: 'Customer Identification Number (BP)',
    sampleAmount: '680',
  },
  {
    id: 'maintenance',
    name: 'Society Maintenance',
    icon: 'building',
    providerPlaceholder: 'e.g. Prestige Palm Gated Society',
    idLabel: 'Flat / Unit Number',
    sampleAmount: '4500',
  },
  {
    id: 'broadband',
    name: 'Broadband & WiFi',
    icon: 'sliders',
    providerPlaceholder: 'e.g. Airtel Xstream / JioFiber / ACT',
    idLabel: 'Registered Broadband ID',
    sampleAmount: '1199',
  },
];

import { PaymentPendingModal } from '../../components/common/PaymentPendingModal';

export const PayBillsScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory>(UTILITY_CATEGORIES[0]);
  const [provider, setProvider] = useState('BESCOM Bangalore Electricity');
  const [consumerNumber, setConsumerNumber] = useState('0882194002');
  const [billAmount, setBillAmount] = useState(selectedCategory.sampleAmount);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const amountNum = Number(billAmount) || 0;

  const handleSelectCategory = (cat: UtilityCategory) => {
    setSelectedCategory(cat);
    setBillAmount(cat.sampleAmount);
    if (cat.id === 'electricity') setProvider('BESCOM Bangalore Electricity');
    else if (cat.id === 'water') setProvider('BWSSB Water Board');
    else if (cat.id === 'gas') setProvider('GAIL Piped Natural Gas');
    else if (cat.id === 'maintenance') setProvider('Prestige Lakeview Society RWA');
    else if (cat.id === 'broadband') setProvider('Airtel Xstream Fiber');
  };

  const handlePayBill = () => {
    if (!consumerNumber.trim() || amountNum <= 0) {
      Alert.alert('Incomplete Info', 'Please enter your consumer number and bill amount.');
      return;
    }
    setShowPendingModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Pay Utility Bills" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Categories Horizontal Picker */}
          <Text style={styles.sectionLabel}>Select Bill Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {UTILITY_CATEGORIES.map((cat) => {
              const active = cat.id === selectedCategory.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Icon
                    name={cat.icon as any}
                    size={15}
                    color={active ? '#0F172A' : colors.textSecondary}
                  />
                  <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Icon name={selectedCategory.icon as any} size={20} color={colors.primaryDark} />
              </View>
              <View>
                <Text style={styles.cardTitle}>{selectedCategory.name} Payment</Text>
                <Text style={styles.cardSubtitle}>Direct BBPS instant bill settlement</Text>
              </View>
            </View>

            <FormField
              label="Biller / Board Name"
              value={provider}
              onChangeText={setProvider}
              placeholder={selectedCategory.providerPlaceholder}
              required
            />

            <FormField
              label={selectedCategory.idLabel}
              value={consumerNumber}
              onChangeText={setConsumerNumber}
              placeholder="Enter consumer / account ID"
              keyboardType="default"
              required
            />

            <FormField
              label="Bill Amount (₹)"
              value={billAmount}
              onChangeText={setBillAmount}
              placeholder="e.g. 2500"
              keyboardType="number-pad"
              required
            />

            {/* Total summary */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bill Amount</Text>
                <Text style={styles.summaryValue}>{formatIndianCurrency(amountNum)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Convenience Fee</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>FREE (₹0)</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>{formatIndianCurrency(amountNum)}</Text>
              </View>
            </View>

            <Button
              title={`Pay ${formatIndianCurrency(amountNum)} Now`}
              variant="primary"
              size="lg"
              onPress={handlePayBill}
              fullWidth
              style={{ marginTop: spacing.md }}
              icon={<Icon name="credit-card" size={18} color="#0F172A" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PaymentPendingModal
        visible={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        title="BBPS Utility Bill Payment"
        featureName={`${selectedCategory.name} (${provider})`}
        amount={amountNum}
        description={`Direct BBPS settlement for ${selectedCategory.name} (Account: ${consumerNumber}) requires active payment gateway authentication. Transactions will be processed once live backend credentials are configured.`}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  sectionLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  categoriesRow: {
    gap: 8,
    paddingBottom: spacing.md,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  categoryPillText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 17,
    color: colors.darkText,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryRowTotal: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.darkText,
  },
  totalLabel: {
    ...typography.subtitle,
    fontWeight: '800',
    color: colors.darkText,
  },
  totalValue: {
    ...typography.h3,
    color: colors.primaryDark,
    fontSize: 18,
  },
});
