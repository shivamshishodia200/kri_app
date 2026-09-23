import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useProperty } from '../../context/PropertyContext';
import { useChat } from '../../context/ChatContext';
import { PropertyCarousel } from '../../components/property/PropertyCarousel';
import { PriceDisplay, formatIndianCurrency } from '../../components/common/PriceDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { InquiryModal } from '../../components/property/InquiryModal';
import { Icon } from '../../components/common/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyDetail'>;

export const PropertyDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { propertyId, property: propFromParam } = route.params;
  const { getPropertyById, isShortlisted, toggleShortlist } = useProperty();
  const { startOrGetThreadForProperty } = useChat();

  const property = propFromParam || getPropertyById(propertyId);
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);

  if (!property) {
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Property details unavailable</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const saved = isShortlisted(property.id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${property.title}" in ${property.location.locality}, ${property.location.city} on Kirayedar24: ₹${property.price.toLocaleString('en-IN')}`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleCallOwner = () => {
    Alert.alert(
      'Direct Landlord Call',
      `Connecting call to verified ${property.owner.role} ${property.owner.name} at ${property.owner.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            Linking.openURL(`tel:${property.owner.phone.replace(/[^0-9+]/g, '')}`).catch(() => {
              Alert.alert('Calling unavailable on device/simulator');
            });
          },
        },
      ]
    );
  };

  const handleStartChat = () => {
    const threadId = startOrGetThreadForProperty(
      property.id,
      property.title,
      property.price,
      property.images[0] || '',
      property.owner
    );
    navigation.navigate('ChatDetail', {
      threadId,
      title: property.owner.name,
      participantName: property.owner.name,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating Top Header Controls */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.headerCircleBtn}
        >
          <Icon name="chevron-left" size={22} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleShare}
            style={styles.headerCircleBtn}
          >
            <Icon name="share" size={19} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleShortlist(property.id)}
            style={[styles.headerCircleBtn, saved && styles.headerCircleBtnSaved]}
          >
            <Icon
              name={saved ? 'heart-filled' : 'heart'}
              size={20}
              color={saved ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Photo Gallery Carousel */}
        <View style={styles.carouselWrapper}>
          <PropertyCarousel images={property.images} height={320} />
          {/* Verification Badge Over Image */}
          <View style={styles.imageOverlayBadge}>
            <Icon name="shield-check" size={13} color={colors.primary} />
            <Text style={styles.imageOverlayText}>100% VERIFIED BY KIRAYEDAR24</Text>
          </View>
        </View>

        {/* Property Main Content Body */}
        <View style={styles.mainCard}>
          {/* Top Badges */}
          <View style={styles.topBadgesRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {property.listingType === 'rent' ? 'FOR RENT' : 'FOR SALE'}
              </Text>
            </View>
            <View style={styles.zeroBrokerageBadge}>
              <Icon name="sparkles" size={12} color="#027A48" />
              <Text style={styles.zeroBrokerageText}>0% BROKERAGE</Text>
            </View>
            {property.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>FEATURED</Text>
              </View>
            )}
          </View>

          {/* Title & Locality */}
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <View style={styles.locationRow}>
            <Icon name="map-pin" size={15} color={colors.primaryDark} />
            <Text style={styles.locationText}>
              {property.location.address || `${property.location.locality}, ${property.location.city}`}
            </Text>
          </View>

          {/* Pricing Box */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>
                {property.listingType === 'rent' ? 'Monthly Rent' : 'Expected Price'}
              </Text>
              <PriceDisplay
                price={property.price}
                listingType={property.listingType}
                size="lg"
                textStyle={{ color: '#0F172A' }}
              />
            </View>

            {property.securityDeposit ? (
              <View style={styles.depositBox}>
                <Text style={styles.depositLabel}>Deposit</Text>
                <Text style={styles.depositValue}>
                  {formatIndianCurrency(property.securityDeposit)}
                </Text>
              </View>
            ) : null}

            {property.maintenancePrice ? (
              <View style={styles.depositBox}>
                <Text style={styles.depositLabel}>Maintenance</Text>
                <Text style={styles.depositValue}>
                  ₹{property.maintenancePrice.toLocaleString('en-IN')}/mo
                </Text>
              </View>
            ) : null}
          </View>

          {/* Key Property Specs Matrix */}
          <View style={styles.specsGrid}>
            <View style={styles.specCard}>
              <View style={styles.specIconBox}>
                <Icon name="bed" size={18} color={colors.primaryDark} />
              </View>
              <Text style={styles.specValue}>{property.bedrooms} BHK</Text>
              <Text style={styles.specLabel}>Bedrooms</Text>
            </View>

            <View style={styles.specCard}>
              <View style={styles.specIconBox}>
                <Icon name="bath" size={18} color={colors.primaryDark} />
              </View>
              <Text style={styles.specValue}>{property.bathrooms}</Text>
              <Text style={styles.specLabel}>Bathrooms</Text>
            </View>

            <View style={styles.specCard}>
              <View style={styles.specIconBox}>
                <Icon name="square-area" size={18} color={colors.primaryDark} />
              </View>
              <Text style={styles.specValue}>{property.areaSqFt}</Text>
              <Text style={styles.specLabel}>sq.ft Builtup</Text>
            </View>

            <View style={styles.specCard}>
              <View style={styles.specIconBox}>
                <Icon name="home" size={18} color={colors.primaryDark} />
              </View>
              <Text style={styles.specValue} numberOfLines={1}>
                {property.furnishing.replace('_', ' ')}
              </Text>
              <Text style={styles.specLabel}>Furnishing</Text>
            </View>
          </View>

          {/* Landlord / Owner Verified Card */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerCardTop}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerAvatarText}>{property.owner.name[0]}</Text>
              </View>
              <View style={styles.ownerInfo}>
                <View style={styles.ownerNameRow}>
                  <Text style={styles.ownerName}>{property.owner.name}</Text>
                  <View style={styles.ownerVerifiedPill}>
                    <Icon name="check-circle" size={12} color="#12B76A" />
                    <Text style={styles.ownerVerifiedText}>Verified Landlord</Text>
                  </View>
                </View>
                <Text style={styles.ownerSub}>
                  Direct Property Owner • ⚡ Fast Responder (under 15m)
                </Text>
              </View>
            </View>

            <View style={styles.ownerActionsRow}>
              <TouchableOpacity
                style={styles.callOwnerButton}
                onPress={handleCallOwner}
                activeOpacity={0.8}
              >
                <Icon name="phone" size={15} color="#0F172A" />
                <Text style={styles.callOwnerText}>Call Owner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatOwnerButton}
                onPress={handleStartChat}
                activeOpacity={0.8}
              >
                <Icon name="chat" size={15} color="#FFFFFF" />
                <Text style={styles.chatOwnerText}>Chat on App</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>About this Property</Text>
            <Text style={styles.descriptionText}>{property.description}</Text>
          </View>

          {/* Amenities & Highlights */}
          {property.amenities.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Society Amenities & Features</Text>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((amenity, idx) => (
                  <View key={idx} style={styles.amenityChip}>
                    <Icon name="check-circle" size={14} color={colors.primaryDark} />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Zero Brokerage Trust Banner */}
          <View style={styles.brokerageShield}>
            <View style={styles.brokerageShieldIcon}>
              <Icon name="shield-check" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.brokerageShieldTitle}>Kirayedar24 Zero Brokerage</Text>
              <Text style={styles.brokerageShieldSubtitle}>
                No middlemen, no hidden commissions. You deal 100% directly with verified property owners.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceBlock}>
          <Text style={styles.bottomPriceLabel}>Total Rent</Text>
          <Text style={styles.bottomPriceValue}>
            {formatIndianCurrency(property.price)}
            <Text style={styles.bottomMonth}>/mo</Text>
          </Text>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => setInquiryModalVisible(true)}
            activeOpacity={0.85}
          >
            <Icon name="calendar" size={16} color="#0F172A" />
            <Text style={styles.secondaryActionText}>Schedule Visit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={handleStartChat}
            activeOpacity={0.85}
          >
            <Icon name="chat" size={16} color="#0F172A" />
            <Text style={styles.primaryActionText}>Inquire Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Inquiry Modal */}
      <InquiryModal
        visible={inquiryModalVisible}
        onClose={() => setInquiryModalVisible(false)}
        property={property}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 24,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCircleBtnSaved: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#EF4444',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  carouselWrapper: {
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
  },
  imageOverlayText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    ...typography.badge,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  zeroBrokerageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A6F4C5',
  },
  zeroBrokerageText: {
    ...typography.badge,
    color: '#027A48',
    fontSize: 10,
    fontWeight: '800',
  },
  featuredBadge: {
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
  },
  featuredBadgeText: {
    ...typography.badge,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
  },
  propertyTitle: {
    ...typography.h2,
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  locationText: {
    ...typography.bodyMedium,
    color: '#64748B',
    fontSize: 14,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  priceLabel: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  depositBox: {
    alignItems: 'flex-end',
  },
  depositLabel: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  depositValue: {
    ...typography.subtitle,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 14,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  specCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  specValue: {
    ...typography.subtitle,
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  specLabel: {
    ...typography.caption,
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  ownerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
  },
  ownerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ownerAvatarText: {
    ...typography.h3,
    color: '#0F172A',
    fontWeight: '800',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerName: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  ownerVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ownerVerifiedText: {
    ...typography.badge,
    fontSize: 9,
    color: '#12B76A',
    fontWeight: '700',
  },
  ownerSub: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  ownerActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callOwnerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 12,
  },
  callOwnerText: {
    ...typography.caption,
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 12,
  },
  chatOwnerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 12,
  },
  chatOwnerText: {
    ...typography.caption,
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 12,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionHeading: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  descriptionText: {
    ...typography.bodyMedium,
    color: '#475569',
    lineHeight: 22,
    fontSize: 14,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amenityText: {
    ...typography.caption,
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 12,
  },
  brokerageShield: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
  },
  brokerageShieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brokerageShieldTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  brokerageShieldSubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomPriceBlock: {},
  bottomPriceLabel: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomPriceValue: {
    ...typography.h3,
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '800',
  },
  bottomMonth: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryActionText: {
    ...typography.badge,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryActionText: {
    ...typography.badge,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    ...typography.h3,
    color: '#FFFFFF',
    marginBottom: 16,
  },
});
