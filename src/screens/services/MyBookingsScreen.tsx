import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useBooking } from '../../context/BookingContext';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatIndianCurrency } from '../../components/common/PriceDisplay';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'MyBookings'>;

const STATUS_FILTERS = ['All', 'Scheduled', 'Completed', 'Cancelled'];

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const { bookings, cancelBooking } = useBooking();
  const [activeTab, setActiveTab] = useState('All');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    return b.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Cancel Service Appointment',
      'Are you sure you want to cancel this booking? There are no cancellation penalties.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Slot',
          style: 'destructive',
          onPress: () => cancelBooking(bookingId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="My Service Bookings"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ServicesCatalog')}
            style={styles.newBookBtn}
          >
            <Icon name="plus" size={16} color={colors.darkText} strokeWidth={2.5} />
            <Text style={styles.newBookText}>Book New</Text>
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {STATUS_FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabBtn,
              activeTab === tab && styles.tabBtnActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <StatusBadge type={item.status} />
              <Text style={styles.refId}>ID: {item.id}</Text>
            </View>

            <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
            <Text style={styles.categoryText}>Category: {item.category}</Text>

            <View style={styles.slotBox}>
              <View style={styles.slotRow}>
                <Icon name="calendar" size={14} color={colors.primaryDark} />
                <Text style={styles.slotText}>{item.scheduledDate}</Text>
              </View>
              <View style={styles.slotRow}>
                <Icon name="clock" size={14} color={colors.primaryDark} />
                <Text style={styles.slotText}>{item.scheduledTimeSlot}</Text>
              </View>
            </View>

            <View style={styles.addressRow}>
              <Icon name="map-pin" size={14} color={colors.textSecondary} />
              <Text style={styles.addressText} numberOfLines={1}>
                {item.address}, {item.city}
              </Text>
            </View>

            {item.assignedProfessional && (
              <View style={styles.proBox}>
                <Text style={styles.proLabel}>Assigned Lead:</Text>
                <Text style={styles.proName}>
                  {item.assignedProfessional.name} ({item.assignedProfessional.phone})
                </Text>
              </View>
            )}

            <View style={styles.footerRow}>
              <View>
                <Text style={styles.priceLabel}>Payable Amount</Text>
                <Text style={styles.priceValue}>{formatIndianCurrency(item.totalAmount)}</Text>
              </View>

              {item.status === 'scheduled' && (
                <Button
                  title="Cancel Booking"
                  variant="danger"
                  size="sm"
                  onPress={() => handleCancel(item.id)}
                />
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="No Bookings in this tab"
            description="You don't have any appointments in this status."
            actionTitle="Explore Services"
            onAction={() => navigation.navigate('ServicesCatalog')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  newBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.round,
    gap: 4,
  },
  newBookText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.darkText,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs + 2,
  },
  tabBtn: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.darkText,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  refId: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  serviceTitle: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  slotBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.lg,
    marginBottom: spacing.xs + 2,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.darkText,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  addressText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  proBox: {
    backgroundColor: colors.primarySubtle,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  proLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  proName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.darkText,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  priceLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  priceValue: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '800',
    color: colors.darkText,
  },
});
