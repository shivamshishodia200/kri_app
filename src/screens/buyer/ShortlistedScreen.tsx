import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useProperty } from '../../context/PropertyContext';
import { PropertyCardVertical } from '../../components/property/PropertyCardVertical';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';

export const ShortlistedScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { shortlistedProperties, toggleShortlist } = useProperty();
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'buy'>('all');

  const filteredProperties = shortlistedProperties.filter((p) => {
    if (filterType === 'all') return true;
    return p.listingType === filterType;
  });

  const rentCount = shortlistedProperties.filter((p) => p.listingType === 'rent').length;
  const buyCount = shortlistedProperties.filter((p) => p.listingType === 'buy').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Luxury Midnight Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleBlock}>
            <View style={styles.badgePill}>
              <Icon name="heart-filled" size={12} color={colors.primary} />
              <Text style={styles.badgePillText}>SAVED COLLECTION</Text>
            </View>
            <Text style={styles.headerTitle}>Shortlisted Properties</Text>
            <Text style={styles.headerSubtitle}>
              {shortlistedProperties.length} handpicked homes & commercial spaces
            </Text>
          </View>

          {shortlistedProperties.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.clearBtn}
              onPress={() => {
                Alert.alert(
                  'Clear Saved Properties',
                  'Are you sure you want to remove all saved properties from your shortlist?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear All',
                      style: 'destructive',
                      onPress: () => {
                        shortlistedProperties.forEach((p) => toggleShortlist(p.id));
                      },
                    },
                  ]
                );
              }}
            >
              <Icon name="trash" size={15} color="#EF4444" />
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        {shortlistedProperties.length > 0 && (
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabChip, filterType === 'all' && styles.tabChipActive]}
              onPress={() => setFilterType('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabChipText, filterType === 'all' && styles.tabChipTextActive]}>
                All ({shortlistedProperties.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabChip, filterType === 'rent' && styles.tabChipActive]}
              onPress={() => setFilterType('rent')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabChipText, filterType === 'rent' && styles.tabChipTextActive]}>
                For Rent ({rentCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabChip, filterType === 'buy' && styles.tabChipActive]}
              onPress={() => setFilterType('buy')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabChipText, filterType === 'buy' && styles.tabChipTextActive]}>
                For Buy ({buyCount})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <PropertyCardVertical
              property={item}
              onPress={() =>
                navigation.navigate('PropertyDetail', {
                  propertyId: item.id,
                  property: item,
                })
              }
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="heart"
              title="No Shortlisted Homes"
              description="Explore verified listings and tap the heart icon to save your favorite apartments and villas here for easy comparison."
              actionTitle="Discover Properties"
              onAction={() => navigation.navigate('SearchListings')}
            />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0B0F19',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
    gap: 6,
    marginBottom: 8,
  },
  badgePillText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 13,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  clearAllText: {
    ...typography.caption,
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 11,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    ...typography.caption,
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
  },
  tabChipTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  emptyContainer: {
    paddingTop: 60,
  },
});
