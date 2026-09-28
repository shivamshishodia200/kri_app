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

interface PropertyCardHorizontalProps {
  property: Property;
  onPress: () => void;
  style?: ViewStyle;
  showStatusBadge?: boolean;
  onContactPress?: () => void;
}

export const PropertyCardHorizontal: React.FC<PropertyCardHorizontalProps> = ({
  property,
  onPress,
  style,
  showStatusBadge = false,
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
      style={[styles.card, style]}
    >
      {/* Thumbnail */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: mainImage }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
        {imageFailed && <View style={styles.imageFallback}><Icon name="building" size={24} color={colors.textSecondary} /></View>}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFavoritePress}
          disabled={favoritePending}
          style={[styles.heartButton, favoritePending && styles.favoritePending]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved properties' : 'Save property'}
        >
          <Icon
            name={saved ? 'heart-filled' : 'heart'}
            size={16}
            color={saved ? colors.danger : colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <PriceDisplay
            price={property.price}
            listingType={property.listingType}
            size="sm"
          />
          {showStatusBadge ? (
            <StatusBadge type={property.status} showIcon={false} />
          ) : (
            <StatusBadge
              type={property.listingType === 'rent' ? 'rent' : 'buy'}
              showIcon={false}
            />
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Icon name="map-pin" size={12} color={colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.location.locality}, {property.location.city}
          </Text>
        </View>

        <View style={styles.specsRow}>
          {property.bedrooms > 0 && (
            <Text style={styles.specText}>{property.bedrooms} BHK • </Text>
          )}
          <Text style={styles.specText}>{property.areaSqFt} sqft • </Text>
          <Text style={styles.specText}>{property.furnishing}</Text>
        </View>
        {onContactPress && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={(event) => {
              event.stopPropagation();
              onContactPress();
            }}
            accessibilityRole="button"
            accessibilityLabel="Request property contact access"
          >
            <Icon name="lock" size={13} color={colors.darkText} />
            <Text style={styles.contactText}>Contact</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  imageContainer: {
    width: 110,
    height: 110,
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
  heartButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritePending: {
    opacity: 0.55,
  },
  detailsContainer: {
    flex: 1,
    padding: spacing.sm + 2,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 3,
  },
  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '500',
  },
  contactButton: {
    minHeight: 40,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  contactText: {
    ...typography.caption,
    color: colors.darkText,
    fontWeight: '700',
  },
});
