import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ServiceItem } from '../../types/booking';
import { FormField } from '../common/FormField';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { formatIndianCurrency } from '../common/PriceDisplay';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  service: ServiceItem;
  onSuccess: (bookingId: string) => void;
}

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

const DATES = [
  { label: 'Today', date: '2026-09-23' },
  { label: 'Tomorrow', date: '2026-09-24' },
  { label: 'Fri, 25 Sep', date: '2026-09-25' },
  { label: 'Sat, 26 Sep', date: '2026-09-26' },
  { label: 'Sun, 27 Sep', date: '2026-09-27' },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  onClose,
  service,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { createBooking } = useBooking();

  const [selectedDate, setSelectedDate] = useState(DATES[1].date);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [address, setAddress] = useState('Flat 402, Green Glen Layout, Indiranagar');
  const [city, setCity] = useState(user?.city || 'Bangalore');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const convenienceFee = 99;
  const totalAmount = service.priceStartingAt + convenienceFee;

  const handleConfirmBooking = async () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter your complete service address.');
      return;
    }

    setLoading(true);
    const booking = await createBooking(service, selectedDate, selectedSlot, address, city);
    setLoading(false);

    onClose();
    onSuccess(booking.id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Service Slot</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          {/* Service Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceCategory}>Category: {service.category}</Text>
            <Text style={styles.serviceDuration}>⏱️ Approx Duration: {service.duration}</Text>
          </View>

          {/* Select Date */}
          <Text style={styles.sectionTitle}>1. Select Appointment Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
            {DATES.map((d) => (
              <TouchableOpacity
                key={d.date}
                activeOpacity={0.8}
                onPress={() => setSelectedDate(d.date)}
                style={[
                  styles.dateCard,
                  selectedDate === d.date && styles.dateCardActive,
                ]}
              >
                <Text
                  style={[
                    styles.dateLabel,
                    selectedDate === d.date && styles.dateLabelActive,
                  ]}
                >
                  {d.label}
                </Text>
                <Text
                  style={[
                    styles.dateSub,
                    selectedDate === d.date && styles.dateSubActive,
                  ]}
                >
                  {d.date.slice(5)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Select Time Slot */}
          <Text style={styles.sectionTitle}>2. Select Preferred Time Slot</Text>
          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                activeOpacity={0.8}
                onPress={() => setSelectedSlot(slot)}
                style={[
                  styles.slotButton,
                  selectedSlot === slot && styles.slotButtonActive,
                ]}
              >
                <Icon
                  name="clock"
                  size={14}
                  color={selectedSlot === slot ? colors.darkText : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot === slot && styles.slotTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Service Address */}
          <Text style={styles.sectionTitle}>3. Service Address</Text>
          <FormField
            label="Street Address / Flat No."
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Flat 301, Brigade Millennium, JP Nagar"
            required
            leftIcon={<Icon name="map-pin" size={18} color={colors.textSecondary} />}
          />

          <FormField
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Bangalore"
          />

          <FormField
            label="Special Instructions (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Please bring extra packing boxes or ladders"
          />

          {/* Price Breakdown */}
          <View style={styles.priceBreakdown}>
            <Text style={styles.breakdownTitle}>Price Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Service Base Price</Text>
              <Text style={styles.breakdownValue}>{formatIndianCurrency(service.priceStartingAt)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Convenience & Safety Fee</Text>
              <Text style={styles.breakdownValue}>{formatIndianCurrency(convenienceFee)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payable at Service</Text>
              <Text style={styles.totalValue}>{formatIndianCurrency(totalAmount)}</Text>
            </View>
            <Text style={styles.noticeText}>
              🛡️ Pay directly to verified professional after service completion with 100% satisfaction guarantee.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title={`Confirm Booking • ${formatIndianCurrency(totalAmount)}`}
            onPress={handleConfirmBooking}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.darkText,
  },
  body: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  summaryCard: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    marginBottom: spacing.lg,
  },
  serviceTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.darkText,
    marginBottom: 2,
  },
  serviceCategory: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  datesScroll: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  dateCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 90,
  },
  dateCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  dateLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dateLabelActive: {
    color: colors.darkText,
    fontWeight: '700',
  },
  dateSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateSubActive: {
    color: colors.darkText,
  },
  slotsGrid: {
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotButtonActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  slotText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  slotTextActive: {
    color: colors.darkText,
    fontWeight: '700',
  },
  priceBreakdown: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  breakdownTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  breakdownLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.darkText,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.darkText,
  },
  totalValue: {
    ...typography.h3,
    fontSize: 16,
    color: colors.darkText,
    fontWeight: '800',
  },
  noticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
