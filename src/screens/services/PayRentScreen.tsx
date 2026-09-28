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
import { useBooking } from '../../context/BookingContext';
import { AppHeader } from '../../components/common/AppHeader';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { formatIndianCurrency } from '../../components/common/PriceDisplay';
import { Icon } from '../../components/common/Icon';

import { PaymentPendingModal } from '../../components/common/PaymentPendingModal';

type Props = NativeStackScreenProps<RootStackParamList, 'PayRent'>;

export const PayRentScreen: React.FC<Props> = ({ navigation }) => {
  const { rentPayments } = useBooking();

  const [propertyTitle, setPropertyTitle] = useState('Luxury 3 BHK Penthouse Indiranagar');
  const [landlordName, setLandlordName] = useState('Vikram Malhotra');
  const [landlordUpi, setLandlordUpi] = useState('vikram.malhotra@okaxis');
  const [rentAmount, setRentAmount] = useState('68000');
  const [maintenanceAmount, setMaintenanceAmount] = useState('4500');
  const [showPendingModal, setShowPendingModal] = useState(false);

  const rentNum = Number(rentAmount) || 0;
  const maintNum = Number(maintenanceAmount) || 0;
  const convenienceFee = 149;
  const totalPayable = rentNum + maintNum + convenienceFee;

  const handlePayRent = () => {
    if (!landlordName.trim() || !landlordUpi.trim() || rentNum <= 0) {
      Alert.alert('Incomplete Details', 'Please enter valid landlord details and rent amount.');
      return;
    }
    setShowPendingModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Pay Rent & Maintenance" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mock Notice */}
          <View style={styles.mockBanner}>
            <Icon name="info" size={16} color={colors.primaryDark} />
            <Text style={styles.mockBannerText}>
              🧪 Demo Gateway: Generates realistic landlord receipts without debiting bank accounts.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.cardHeader}>Landlord & Property Details</Text>

            <FormField
              label="Property / Society Name"
              value={propertyTitle}
              onChangeText={setPropertyTitle}
              placeholder="e.g. Prestige Heights Flat 402"
              required
            />

            <FormField
              label="Landlord Full Name"
              value={landlordName}
              onChangeText={setLandlordName}
              placeholder="e.g. Vikram Malhotra"
              required
              leftIcon={<Icon name="user" size={18} color={colors.textSecondary} />}
            />

            <FormField
              label="Landlord UPI ID / VPA"
              value={landlordUpi}
              onChangeText={setLandlordUpi}
              placeholder="e.g. landlord@okaxis"
              required
              autoCapitalize="none"
              leftIcon={<Icon name="credit-card" size={18} color={colors.textSecondary} />}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="Monthly Rent (₹)"
                  value={rentAmount}
                  onChangeText={setRentAmount}
                  keyboardType="number-pad"
                  required
                />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <FormField
                  label="Maintenance (₹)"
                  value={maintenanceAmount}
                  onChangeText={setMaintenanceAmount}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Bill breakdown summary */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Base Rent</Text>
                <Text style={styles.breakdownVal}>{formatIndianCurrency(rentNum)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Society Maintenance</Text>
                <Text style={styles.breakdownVal}>{formatIndianCurrency(maintNum)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Convenience Fee & Insurance</Text>
                <Text style={styles.breakdownVal}>{formatIndianCurrency(convenienceFee)}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalVal}>{formatIndianCurrency(totalPayable)}</Text>
              </View>
            </View>

            <Button
              title={`Pay Now • ${formatIndianCurrency(totalPayable)}`}
              onPress={handlePayRent}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>

          {/* Past Payments History */}
          <Text style={styles.historyTitle}>Past Rent Receipts & History</Text>
          {rentPayments.map((pay) => (
            <View key={pay.id} style={styles.historyCard}>
              <View style={styles.historyTop}>
                <View>
                  <Text style={styles.historyMonth}>{pay.monthYear}</Text>
                  <Text style={styles.historyLandlord}>To: {pay.landlordName}</Text>
                </View>
                <View style={styles.successPill}>
                  <Icon name="check" size={12} color={colors.successDark} strokeWidth={3} />
                  <Text style={styles.successPillText}>Paid</Text>
                </View>
              </View>

              <View style={styles.historyBottom}>
                <Text style={styles.historyAmount}>{formatIndianCurrency(pay.totalPaid)}</Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('Download Receipt', `Invoice ${pay.transactionRef} sent to email.`)
                  }
                  style={styles.receiptLink}
                >
                  <Icon name="info" size={14} color={colors.primaryDark} />
                  <Text style={styles.receiptLinkText}>Download Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      <PaymentPendingModal
        visible={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        title="Rent Transfer Gateway"
        featureName="Direct Landlord Rent Payment"
        amount={totalPayable}
        description={`Paying ₹${totalPayable.toLocaleString('en-IN')} to ${landlordName} (${landlordUpi}) requires verified Razorpay/UPI gateway rails. Instant transfers and tax receipts will be generated once payment credentials are configured.`}
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
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningTint,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#FEDF89',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  mockBannerText: {
    ...typography.caption,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  cardHeader: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  breakdownCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  breakdownVal: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.darkText,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.xs + 2,
    marginTop: 4,
  },
  totalLabel: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.darkText,
  },
  totalVal: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '800',
    color: colors.darkText,
  },
  historyTitle: {
    ...typography.subtitle,
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: spacing.md,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  historyMonth: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
  },
  historyLandlord: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.round,
    gap: 3,
  },
  successPillText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.successDark,
  },
  historyBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  historyAmount: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '800',
    color: colors.darkText,
  },
  receiptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  receiptLinkText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
