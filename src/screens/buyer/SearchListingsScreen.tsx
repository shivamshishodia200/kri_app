import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useProperty } from '../../context/PropertyContext';
import { Property, ListingType } from '../../types/property';
import { SearchBar } from '../../components/common/SearchBar';
import { PropertyCardVertical } from '../../components/property/PropertyCardVertical';
import { PropertyCardHorizontal } from '../../components/property/PropertyCardHorizontal';
import { FilterModal } from '../../components/property/FilterModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'SearchListings'>;

export const SearchListingsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { filter, setFilter, resetFilter, filteredProperties } = useProperty();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [searchText, setSearchText] = useState(filter.query || '');

  useEffect(() => {
    if (route.params?.initialFilter) {
      setFilter((prev) => ({ ...prev, ...route.params?.initialFilter }));
    }
  }, [route.params?.initialFilter]);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setFilter((prev) => ({ ...prev, query: text }));
  };

  const handleClearSearch = () => {
    setSearchText('');
    setFilter((prev) => ({ ...prev, query: '' }));
  };

  const toggleListingType = (type: ListingType) => {
    setFilter((prev) => ({ ...prev, listingType: type }));
  };

  const removeFilterTag = (key: string, value?: any) => {
    if (key === 'bhk') {
      setFilter((prev) => ({
        ...prev,
        bedrooms: (prev.bedrooms || []).filter((b) => b !== value),
      }));
    } else if (key === 'propertyType') {
      setFilter((prev) => ({
        ...prev,
        propertyTypes: (prev.propertyTypes || []).filter((t) => t !== value),
      }));
    } else if (key === 'furnishing') {
      setFilter((prev) => ({
        ...prev,
        furnishing: (prev.furnishing || []).filter((f) => f !== value),
      }));
    } else if (key === 'verifiedOnly') {
      setFilter((prev) => ({ ...prev, verifiedOnly: false }));
    }
  };

  const activeFiltersCount =
    (filter.bedrooms?.length || 0) +
    (filter.propertyTypes?.length || 0) +
    (filter.furnishing?.length || 0) +
    (filter.amenities?.length || 0) +
    (filter.verifiedOnly ? 1 : 0);

  const renderPropertyItem = ({ item }: { item: Property }) => {
    if (viewMode === 'horizontal') {
      return (
        <PropertyCardHorizontal
          property={item}
          onPress={() =>
            navigation.navigate('PropertyDetail', {
              propertyId: item.id,
              property: item,
            })
          }
        />
      );
    }
    return (
      <PropertyCardVertical
        property={item}
        onPress={() =>
          navigation.navigate('PropertyDetail', {
            propertyId: item.id,
            property: item,
          })
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={24} color={colors.darkText} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchText}
            onChangeText={handleSearchChange}
            onClear={handleClearSearch}
            onFilterPress={() => setFilterModalVisible(true)}
            hasActiveFilters={activeFiltersCount > 0}
            placeholder="Locality, landmark, BHK..."
          />
        </View>
      </View>

      {/* Purpose Tabs & View Mode Row */}
      <View style={styles.controlsRow}>
        <View style={styles.purposeTabs}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleListingType('rent')}
            style={[
              styles.purposeTab,
              filter.listingType === 'rent' && styles.purposeTabActive,
            ]}
          >
            <Text
              style={[
                styles.purposeText,
                filter.listingType === 'rent' && styles.purposeTextActive,
              ]}
            >
              Rent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleListingType('buy')}
            style={[
              styles.purposeTab,
              filter.listingType === 'buy' && styles.purposeTabActive,
            ]}
          >
            <Text
              style={[
                styles.purposeText,
                filter.listingType === 'buy' && styles.purposeTextActive,
              ]}
            >
              Buy
            </Text>
          </TouchableOpacity>
        </View>

        {/* View Layout Toggle */}
        <View style={styles.layoutToggle}>
          <TouchableOpacity
            onPress={() => setViewMode('vertical')}
            style={[
              styles.layoutButton,
              viewMode === 'vertical' && styles.layoutButtonActive,
            ]}
          >
            <Icon
              name="grid"
              size={16}
              color={viewMode === 'vertical' ? colors.darkText : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('horizontal')}
            style={[
              styles.layoutButton,
              viewMode === 'horizontal' && styles.layoutButtonActive,
            ]}
          >
            <Icon
              name="list"
              size={16}
              color={viewMode === 'horizontal' ? colors.darkText : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filter Chips Scroll */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeTagsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              ...(filter.bedrooms || []).map((b) => ({
                id: `bhk-${b}`,
                label: `${b} BHK`,
                onRemove: () => removeFilterTag('bhk', b),
              })),
              ...(filter.propertyTypes || []).map((t) => ({
                id: `type-${t}`,
                label: t,
                onRemove: () => removeFilterTag('propertyType', t),
              })),
              ...(filter.furnishing || []).map((f) => ({
                id: `furn-${f}`,
                label: f,
                onRemove: () => removeFilterTag('furnishing', f),
              })),
              ...(filter.verifiedOnly
                ? [
                    {
                      id: 'verified',
                      label: 'Verified Only',
                      onRemove: () => removeFilterTag('verifiedOnly'),
                    },
                  ]
                : []),
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={item.onRemove}
                style={styles.activeTag}
              >
                <Text style={styles.activeTagText}>{item.label}</Text>
                <Icon name="close" size={12} color={colors.darkText} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.tagsContent}
          />
        </View>
      )}

      {/* Results Header Count */}
      <View style={styles.resultsCountRow}>
        <Text style={styles.resultsCountText}>
          Found <Text style={styles.boldText}>{filteredProperties.length}</Text> properties in{' '}
          {filter.category === 'commercial' ? 'Commercial' : 'Residential'}
        </Text>
        {activeFiltersCount > 0 && (
          <TouchableOpacity onPress={resetFilter}>
            <Text style={styles.clearAllText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Properties List */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={renderPropertyItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No Properties Found"
            description="We could not find matching properties for your active filters. Try adjusting your price range or locality."
            actionTitle="Reset All Filters"
            onAction={resetFilter}
          />
        }
      />

      {/* Filter Bottom Sheet Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filter={filter}
        onApply={(newFilter) => setFilter(newFilter)}
        onReset={resetFilter}
      />
    </SafeAreaView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainer: {
    flex: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  purposeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  purposeTab: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  purposeTabActive: {
    backgroundColor: colors.primary,
  },
  purposeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  purposeTextActive: {
    color: colors.darkText,
    fontWeight: '700',
  },
  layoutToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  layoutButton: {
    padding: spacing.xs + 2,
    borderRadius: radii.sm,
  },
  layoutButtonActive: {
    backgroundColor: colors.surface,
    elevation: 1,
  },
  activeTagsContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tagsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    gap: 4,
  },
  activeTagText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.darkText,
  },
  resultsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  resultsCountText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  boldText: {
    color: colors.darkText,
    fontWeight: '700',
  },
  clearAllText: {
    ...typography.bodySmall,
    color: colors.danger,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
