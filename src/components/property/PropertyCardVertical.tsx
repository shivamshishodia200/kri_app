import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { Property } from '../../types/property';
import { useProperty } from '../../context/PropertyContext';
import { PriceDisplay } from '../common/PriceDisplay';
import { StatusBadge } from '../common/StatusBadge';
import { Icon } from '../common/Icon';

interface PropertyCardVerticalProps {
  property: Property;
  onPress: () => void;
  style?: ViewStyle;
  cardWidth?: number;
  onContactPress?: () => void;
}

export const PropertyCardVertical: React.FC<PropertyCardVerticalProps> = ({
  property,
  onPress,
  style,
  cardWidth,
  onContactPress,
}) => {
  const { isShortlisted, toggleShortlist } = useProperty();
  const [favoritePending, setFavoritePending] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const saved = isShortlisted(property.id);

  const mainImage = property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  const handleFavoritePress = async (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (favoritePending) return;
    setFavoritePending(true);
    const savedSuccessfully = await toggleShortlist(property.id);
    setFavoritePending(false);
    if (!savedSuccessfully) Alert.alert('Saved properties', 'Could not sync this favorite. Please retry.');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        cardWidth ? { width: cardWidth } : { width: '100%' },
        style,
      ]}
    >
      {/* Property Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: mainImage }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
        {imageFailed && <View style={styles.imageFallback}><Icon name="building" size={28} color={colors.textSecondary} /></View>}

        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          <StatusBadge
            type={property.listingType === 'rent' ? 'rent' : 'buy'}
            showIcon={false}
          />
          {property.isFeatured && (
            <StatusBadge type="featured" showIcon={true} />
          )}
        </View>

        {/* Shortlist Heart Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFavoritePress}
          disabled={favoritePending}
          style={[styles.heartButton, favoritePending && styles.favoritePending]}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved properties' : 'Save property'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon
            name={saved ? 'heart-filled' : 'heart'}
            size={18}
            color={saved ? colors.danger : colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Image count badge */}
        <View style={styles.imageCountBadge}>
          <Text style={styles.imageCountText}>📷 {property.images.length}</Text>
        </View>
      </View>

      {/* Property Details */}
      <View style={styles.detailsContainer}>
        {/* Price Row */}
        <View style={styles.priceRow}>
          <PriceDisplay
            price={property.price}
            listingType={property.listingType}
            size="md"
          />
          {property.isVerified && (
            <StatusBadge type="verified" showIcon={true} />
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Icon name="map-pin" size={13} color={colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.location.locality}, {property.location.city}
          </Text>
        </View>

        {/* Specs Pill Row */}
        <View style={styles.specsRow}>
          {property.bedrooms > 0 && (
            <View style={styles.specItem}>
              <Icon name="bed" size={13} color={colors.textSecondary} />
              <Text style={styles.specText}>{property.bedrooms} BHK</Text>
            </View>
          )}

          <View style={styles.specItem}>
            <Icon name="bath" size={13} color={colors.textSecondary} />
            <Text style={styles.specText}>{property.bathrooms} Bath</Text>
          </View>

          <View style={styles.specItem}>
            <Icon name="square-area" size={13} color={colors.textSecondary} />
            <Text style={styles.specText}>{property.areaSqFt} sqft</Text>
          </View>
        </View>

        {onContactPress && (
          <View style={styles.actionRow}>
            <Text style={styles.detailsHint}>View property details</Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={(event) => {
                event.stopPropagation();
                onContactPress();
              }}
              accessibilityRole="button"
              accessibilityLabel="Request property contact access"
            >
              <Icon name="lock" size={14} color={colors.darkText} />
              <Text style={styles.contactText}>Contact</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  imageContainer: {
    height: 175,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surfaceSubtle,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  topBadgesRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  favoritePending: {
    opacity: 0.55,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: spacing.xs + 2,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.round,
  },
  imageCountText: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 4,
  },
  locationText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  detailsHint: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  contactButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  contactText: {
    ...typography.caption,
    color: colors.darkText,
    fontWeight: '700',
  },
});
