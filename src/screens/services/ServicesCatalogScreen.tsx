import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useBooking } from '../../context/BookingContext';
import { ServiceItem } from '../../types/booking';
import { AppHeader } from '../../components/common/AppHeader';
import { ServiceCard } from '../../components/services/ServiceCard';
import { BookingModal } from '../../components/services/BookingModal';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'ServicesCatalog'>;

const CATEGORIES = [
  'All Services',
  'Packers & Movers',
  'Deep Cleaning',
  'Rent Agreement & Legal',
  'Home Painting',
  'Electrician & Plumber',
  'Pest Control',
];

export const ServicesCatalogScreen: React.FC<Props> = ({ navigation }) => {
  const { services } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [activeBookingService, setActiveBookingService] = useState<ServiceItem | null>(null);

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'All Services') return true;
    return s.category === selectedCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Home & Relocation Services"
        subtitle="Verified experts with 100% price transparency"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyBookings')}
            style={styles.myBookingsBtn}
          >
            <Icon name="calendar" size={18} color={colors.darkText} />
            <Text style={styles.myBookingsText}>Bookings</Text>
          </TouchableOpacity>
        }
      />

      {/* Category Pills */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trust banner */}
      <View style={styles.trustBanner}>
        <Icon name="shield-check" size={16} color={colors.success} />
        <Text style={styles.trustText}>
          Backed by Kirayedar24 Assurance: Zero hidden fees & free rework guarantee.
        </Text>
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            onBookPress={() => setActiveBookingService(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Booking Sheet Modal */}
      {activeBookingService && (
        <BookingModal
          visible={Boolean(activeBookingService)}
          service={activeBookingService}
          onClose={() => setActiveBookingService(null)}
          onSuccess={(bookingId) => {
            setActiveBookingService(null);
            navigation.navigate('BookingConfirmation', { bookingId });
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  myBookingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.round,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  myBookingsText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  categoriesContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pillsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
  },
  categoryPill: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  categoryText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.darkText,
    fontWeight: '700',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successTint,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 3,
    gap: spacing.sm,
  },
  trustText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.successDark,
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
