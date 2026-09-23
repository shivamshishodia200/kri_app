import React, { useState, useEffect } from 'react';
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
import { useProperty } from '../../context/PropertyContext';
import { Property, ListingStatus } from '../../types/property';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'MyProperties'>;

const STATUS_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Listings' },
  { id: 'published', label: 'Active' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'draft', label: 'Drafts' },
];

export const MyPropertiesScreen: React.FC<Props> = ({ route, navigation }) => {
  const { myProperties, updatePropertyStatus, deleteProperty } = useProperty();
  const [activeTab, setActiveTab] = useState(route.params?.filterStatus || 'all');

  useEffect(() => {
    if (route.params?.filterStatus) {
      setActiveTab(route.params.filterStatus);
    }
  }, [route.params?.filterStatus]);

  const filteredList = myProperties.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const handleStatusChange = (property: Property, nextStatus: ListingStatus) => {
    updatePropertyStatus(property.id, nextStatus);
    Alert.alert('Status Updated', `Listing marked as ${nextStatus.replace('_', ' ')}.`);
  };

  const handleDelete = (property: Property) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to remove "${property.title}" permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProperty(property.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="My Properties"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddEditProperty')}
            style={styles.addIconBtn}
          >
            <Icon name="plus" size={20} color={colors.darkText} strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab(item.id)}
              style={[
                styles.tabItem,
                activeTab === item.id && styles.tabItemActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.id && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.propertyCard}>
            <View style={styles.cardHeader}>
              <StatusBadge type={item.status} />
              <Text style={styles.dateText}>
                Added: {item.createdAt.slice(0, 10)}
              </Text>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardLocation}>
              📍 {item.location.locality}, {item.location.city}
            </Text>

            <View style={styles.cardSpecsRow}>
              <PriceDisplay price={item.price} listingType={item.listingType} size="md" />
              <View style={styles.statsRow}>
                <Text style={styles.statText}>👁️ {item.viewsCount || 0} Views</Text>
                <Text style={styles.statText}>💬 {item.inquiriesCount || 0} Inquiries</Text>
              </View>
            </View>

            {/* Action Bar */}
            <View style={styles.cardActions}>
              <Button
                title="View"
                variant="outline"
                size="sm"
                onPress={() =>
                  navigation.navigate('PropertyDetail', {
                    propertyId: item.id,
                    property: item,
                  })
                }
              />
              <Button
                title="Edit"
                variant="secondary"
                size="sm"
                onPress={() =>
                  navigation.navigate('AddEditProperty', {
                    propertyId: item.id,
                    isEditing: true,
                  })
                }
                icon={<Icon name="edit" size={14} color={colors.primaryDark} />}
              />
              {item.status === 'published' ? (
                <Button
                  title="Mark Rented"
                  variant="outline"
                  size="sm"
                  onPress={() => handleStatusChange(item, 'rented_sold')}
                />
              ) : (
                <Button
                  title="Publish"
                  variant="primary"
                  size="sm"
                  onPress={() => handleStatusChange(item, 'published')}
                />
              )}
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteBtn}
              >
                <Icon name="trash" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="building"
            title="No Properties in this tab"
            description="You don't have any properties matching this status filter."
            actionTitle="+ Add New Property"
            onAction={() => navigation.navigate('AddEditProperty')}
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
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
  },
  tabItem: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabItemActive: {
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
  propertyCard: {
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
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  cardLocation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  deleteBtn: {
    padding: spacing.sm,
    backgroundColor: colors.dangerTint,
    borderRadius: radii.md,
    marginLeft: 'auto',
  },
});
