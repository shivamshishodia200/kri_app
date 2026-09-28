import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { PropertyFilter, FurnishingStatus, PropertyType, ListingType, PropertyCategory } from '../../types/property';
import { Button } from '../common/Button';
import { FilterChip } from '../common/FilterChip';
import { Icon } from '../common/Icon';

import { getIndianStates, getCitiesForState, getLocalitiesForCity } from '../../data/locationData';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filter: PropertyFilter;
  onApply: (newFilter: PropertyFilter) => void;
  onReset: () => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  'Apartment',
  'Flat',
  'Room',
  'PG',
  'Commercial Space',
  'Villa',
  'Independent House',
  'Studio',
  'Office Space',
  'Shop / Showroom',
];

const FURNISHING_OPTIONS: FurnishingStatus[] = [
  'Furnished',
  'Semi-Furnished',
  'Unfurnished',
];

const AMENITIES_LIST = [
  'Swimming Pool',
  'Gym & Clubhouse',
  '24/7 Power Backup',
  'EV Charging Station',
  'Gated Security',
  'Private Terrace',
  'Central AC',
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filter,
  onApply,
  onReset,
}) => {
  const [localFilter, setLocalFilter] = useState<PropertyFilter>(filter);

  const toggleListingType = (type: ListingType) => {
    setLocalFilter((prev) => ({ ...prev, listingType: type }));
  };

  const toggleCategory = (cat: PropertyCategory) => {
    setLocalFilter((prev) => ({ ...prev, category: cat }));
  };

  const toggleBedroom = (bhk: number) => {
    const current = localFilter.bedrooms || [];
    const updated = current.includes(bhk)
      ? current.filter((b) => b !== bhk)
      : [...current, bhk];
    setLocalFilter((prev) => ({ ...prev, bedrooms: updated }));
  };

  const toggleFurnishing = (furn: FurnishingStatus) => {
    const current = localFilter.furnishing || [];
    const updated = current.includes(furn)
      ? current.filter((f) => f !== furn)
      : [...current, furn];
    setLocalFilter((prev) => ({ ...prev, furnishing: updated }));
  };

  const togglePropertyType = (type: PropertyType) => {
    const current = localFilter.propertyTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setLocalFilter((prev) => ({ ...prev, propertyTypes: updated }));
  };

  const toggleAmenity = (amenity: string) => {
    const current = localFilter.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setLocalFilter((prev) => ({ ...prev, amenities: updated }));
  };

  const toggleVerifiedOnly = () => {
    setLocalFilter((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }));
  };

  const handleApply = () => {
    onApply(localFilter);
    onClose();
  };

  const handleReset = () => {
    onReset();
    setLocalFilter({
      listingType: 'rent',
      category: 'residential',
      query: '',
      minPrice: 0,
      maxPrice: 500000,
      bedrooms: [],
      furnishing: [],
      propertyTypes: [],
      amenities: [],
      verifiedOnly: false,
      sortBy: 'popular',
    });
    onClose();
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
          <Text style={styles.headerTitle}>Filters & Sort</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Rent vs Buy Purpose */}
          <Text style={styles.sectionTitle}>I Want To</Text>
          <View style={styles.segmentRow}>
            {(['rent', 'buy'] as ListingType[]).map((type) => (
              <TouchableOpacity
                key={type}
                activeOpacity={0.8}
                onPress={() => toggleListingType(type)}
                style={[
                  styles.segmentButton,
                  localFilter.listingType === type && styles.segmentButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    localFilter.listingType === type && styles.segmentTextActive,
                  ]}
                >
                  {type === 'rent' ? 'Rent a Home / Office' : 'Buy a Property'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Residential vs Commercial */}
          <Text style={styles.sectionTitle}>Property Category</Text>
          <View style={styles.segmentRow}>
            {(['residential', 'commercial'] as PropertyCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => toggleCategory(cat)}
                style={[
                  styles.segmentButton,
                  localFilter.category === cat && styles.segmentButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    localFilter.category === cat && styles.segmentTextActive,
                  ]}
                >
                  {cat === 'residential' ? '🏡 Residential' : '🏢 Commercial'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* State / Region */}
          <Text style={styles.sectionTitle}>State / Region</Text>
          <View style={styles.chipsRow}>
            {getIndianStates().map((st) => {
              const isSelected = localFilter.state === st;
              return (
                <FilterChip
                  key={st}
                  label={st}
                  selected={isSelected}
                  onPress={() =>
                    setLocalFilter((prev) => ({
                      ...prev,
                      state: prev.state === st ? '' : st,
                      city: '', // reset city when state changes
                    }))
                  }
                />
              );
            })}
          </View>

          {/* City Selector */}
          <Text style={styles.sectionTitle}>
            City {localFilter.state ? `(${localFilter.state})` : ''}
          </Text>
          <View style={styles.chipsRow}>
            {getCitiesForState(localFilter.state || 'Delhi NCR').map((c) => {
              const isSelected = localFilter.city === c;
              return (
                <FilterChip
                  key={c}
                  label={c}
                  selected={isSelected}
                  onPress={() =>
                    setLocalFilter((prev) => ({
                      ...prev,
                      city: prev.city === c ? '' : c,
                    }))
                  }
                />
              );
            })}
          </View>

          {/* Bedrooms / BHK */}
          <Text style={styles.sectionTitle}>Bedrooms (BHK)</Text>
          <View style={styles.chipsRow}>
            {[1, 2, 3, 4].map((bhk) => {
              const isSelected = (localFilter.bedrooms || []).includes(bhk);
              return (
                <FilterChip
                  key={bhk}
                  label={`${bhk} BHK`}
                  selected={isSelected}
                  onPress={() => toggleBedroom(bhk)}
                />
              );
            })}
          </View>

          {/* Property Type */}
          <Text style={styles.sectionTitle}>Property Type</Text>
          <View style={styles.chipsRow}>
            {PROPERTY_TYPES.map((type) => {
              const isSelected = (localFilter.propertyTypes || []).includes(type);
              return (
                <FilterChip
                  key={type}
                  label={type}
                  selected={isSelected}
                  onPress={() => togglePropertyType(type)}
                />
              );
            })}
          </View>

          {/* Furnishing Status */}
          <Text style={styles.sectionTitle}>Furnishing</Text>
          <View style={styles.chipsRow}>
            {FURNISHING_OPTIONS.map((furn) => {
              const isSelected = (localFilter.furnishing || []).includes(furn);
              return (
                <FilterChip
                  key={furn}
                  label={furn}
                  selected={isSelected}
                  onPress={() => toggleFurnishing(furn)}
                />
              );
            })}
          </View>

          {/* Sort By */}
          <Text style={styles.sectionTitle}>Sort Results By</Text>
          <View style={styles.chipsRow}>
            {[
              { label: '🔥 Most Popular', val: 'popular' },
              { label: '✨ Recently Added', val: 'newest' },
              { label: '💵 Price: Low to High', val: 'price_asc' },
              { label: '💎 Price: High to Low', val: 'price_desc' },
            ].map((sortItem) => {
              const isSelected = localFilter.sortBy === sortItem.val;
              return (
                <FilterChip
                  key={sortItem.val}
                  label={sortItem.label}
                  selected={isSelected}
                  onPress={() => setLocalFilter((p) => ({ ...p, sortBy: sortItem.val as any }))}
                />
              );
            })}
          </View>

          {/* Verified Only Switch */}
          <View style={styles.verifiedRow}>
            <View>
              <Text style={styles.verifiedTitle}>Verified Listings Only</Text>
              <Text style={styles.verifiedSubtitle}>Show only physically verified properties</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleVerifiedOnly}
              style={[
                styles.toggleSwitch,
                localFilter.verifiedOnly && styles.toggleSwitchActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  localFilter.verifiedOnly && styles.toggleKnobActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.chipsRow}>
            {AMENITIES_LIST.map((amenity) => {
              const isSelected = (localFilter.amenities || []).includes(amenity);
              return (
                <FilterChip
                  key={amenity}
                  label={amenity}
                  selected={isSelected}
                  onPress={() => toggleAmenity(amenity)}
                />
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            title="Apply Filters"
            onPress={handleApply}
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
  resetText: {
    ...typography.bodyMedium,
    color: colors.danger,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.darkText,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifiedTitle: {
    ...typography.subtitle,
    color: colors.darkText,
    fontWeight: '700',
  },
  verifiedSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderDark,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
