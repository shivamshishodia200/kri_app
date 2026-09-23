import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { formatIndianCurrency } from '../../components/common/PriceDisplay';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export const BookingConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { bookings } = useBooking();

  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success animation circle */}
        <View style={styles.successCircle}>
          <Icon name="check" size={48} color={colors.darkText} strokeWidth={3} />
        </View>

        <Text style={styles.successTitle}>Service Slot Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Booking Reference ID: <Text style={styles.boldRef}>{booking.id}</Text>
        </Text>

        {/* Demo payment notice */}
        <View style={styles.mockNotice}>
          <Text style={styles.mockNoticeText}>
            🧪 Mock Payment / Booking: Slot reserved in demo mode. No actual debit occurred.
          </Text>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Booking Summary</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{booking.serviceTitle}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{booking.category}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Scheduled Date</Text>
            <Text style={styles.value}>{booking.scheduledDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Time Slot</Text>
            <Text style={styles.value}>{booking.scheduledTimeSlot}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value} numberOfLines={2}>
              {booking.address}, {booking.city}
            </Text>
          </View>

          {booking.assignedProfessional && (
            <View style={styles.proRow}>
              <View style={styles.proAvatar}>
                <Icon name="user" size={18} color={colors.primaryDark} />
              </View>
              <View>
                <Text style={styles.proName}>{booking.assignedProfessional.name}</Text>
                <Text style={styles.proPhone}>
                  {booking.assignedProfessional.phone} • ⭐ {booking.assignedProfessional.rating}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Estimated Price</Text>
            <Text style={styles.totalValue}>{formatIndianCurrency(booking.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title="View All My Bookings"
            variant="primary"
            size="lg"
            onPress={() => navigation.replace('MyBookings')}
            fullWidth
            style={{ marginBottom: spacing.md }}
          />

          <Button
            title="Back to Home"
            variant="outline"
            size="md"
            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
            fullWidth
          />
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
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  successTitle: {
    ...typography.h2,
    fontSize: 22,
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  boldRef: {
    fontWeight: '700',
    color: colors.darkText,
  },
  mockNotice: {
    backgroundColor: colors.warningTint,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#FEDF89',
    marginBottom: spacing.lg,
    width: '100%',
  },
  mockNoticeText: {
    ...typography.caption,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 16,
  },
  detailsCard: {
    width: '100%',
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 2,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.darkText,
    flex: 1.5,
    textAlign: 'right',
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm + 2,
    borderRadius: radii.lg,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  proAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proName: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  proPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  totalLabel: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.darkText,
  },
  totalValue: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: '800',
    color: colors.darkText,
  },
  actionsContainer: {
    width: '100%',
  },
});
