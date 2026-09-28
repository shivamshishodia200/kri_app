import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useProperty } from '../../context/PropertyContext';
import {
  ListingType,
  PropertyCategory,
  PropertyType,
  FurnishingStatus,
  KitchenType,
  TenantPreference,
  FoodPreference,
} from '../../types/property';
import { getIndianStates, getCitiesForState, getLocalitiesForCity } from '../../data/locationData';
import { AppHeader } from '../../components/common/AppHeader';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { FilterChip } from '../../components/common/FilterChip';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { formatIndianCurrency } from '../../components/common/PriceDisplay';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditProperty'>;

const STEPS = ['Basic Info', 'Location', 'Specs & Price', 'Photos & Amenities', 'Review'];

const SAMPLE_PHOTO_ASSETS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
];

const AMENITY_OPTIONS = [
  'Swimming Pool',
  'Gym & Clubhouse',
  '24/7 Power Backup',
  'EV Charging Station',
  'Private Terrace',
  'Children Play Area',
  'Gated Security',
  'Lift & Elevator',
  'Covered Parking',
  'Central AC',
];

export const AddEditPropertyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { propertyId, isEditing } = route.params || {};
  const { getPropertyById, addProperty, updateProperty } = useProperty();

  const existing = propertyId ? getPropertyById(propertyId) : undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [discardModalVisible, setDiscardModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic
  const [listingType, setListingType] = useState<ListingType>(existing?.listingType || 'rent');
  const [category, setCategory] = useState<PropertyCategory>(existing?.category || 'residential');
  const [propertyType, setPropertyType] = useState<PropertyType>(existing?.propertyType || 'Apartment');
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');

  // Step 2: Location
  const [stateName, setStateName] = useState(existing?.location.state || 'Delhi NCR');
  const [city, setCity] = useState(existing?.location.city || 'New Delhi');
  const [locality, setLocality] = useState(existing?.location.locality || '');
  const [address, setAddress] = useState(existing?.location.address || '');
  const [landmark, setLandmark] = useState(existing?.location.landmark || '');
  const [pincode, setPincode] = useState(existing?.location.pincode || '');
  const [floor, setFloor] = useState(existing?.floor || '3rd of 8 Floors');

  // Step 3: Features & Price
  const [price, setPrice] = useState(existing?.price ? String(existing.price) : '');
  const [maintenance, setMaintenance] = useState(existing?.maintenancePrice ? String(existing.maintenancePrice) : '3000');
  const [securityDeposit, setSecurityDeposit] = useState(existing?.securityDeposit ? String(existing.securityDeposit) : '150000');
  const [bedrooms, setBedrooms] = useState(existing?.bedrooms || 2);
  const [bathrooms, setBathrooms] = useState(existing?.bathrooms || 2);
  const [areaSqFt, setAreaSqFt] = useState(existing?.areaSqFt ? String(existing.areaSqFt) : '1250');
  const [furnishing, setFurnishing] = useState<FurnishingStatus>(existing?.furnishing || 'Semi-Furnished');
  const [kitchenType, setKitchenType] = useState<KitchenType>(existing?.kitchenType || 'Modular');
  const [preferredTenants, setPreferredTenants] = useState<TenantPreference[]>(
    existing?.preferredTenants || ['Family', 'Bachelors (Boys)', 'Bachelors (Girls)']
  );
  const [foodPreference, setFoodPreference] = useState<FoodPreference>(
    existing?.foodPreference || 'Any (Veg & Non-Veg)'
  );
  const [electricityIncluded, setElectricityIncluded] = useState<boolean>(existing?.electricityIncluded || false);
  const [waterIncluded, setWaterIncluded] = useState<boolean>(existing?.waterIncluded || true);
  const [facing, setFacing] = useState(existing?.facing || 'East Facing (Vastu)');
  const [parking, setParking] = useState(existing?.parking || '1 Covered Car Parking');

  // Step 4: Photos & Amenities
  const [selectedImages, setSelectedImages] = useState<string[]>(
    existing?.images || [SAMPLE_PHOTO_ASSETS[0], SAMPLE_PHOTO_ASSETS[1]]
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    existing?.amenities || ['24/7 Power Backup', 'Gated Security', 'Lift & Elevator']
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = (): boolean => {
    let errs: Record<string, string> = {};
    let valid = true;

    if (currentStep === 0) {
      if (!title.trim()) {
        errs.title = 'Listing title is required';
        valid = false;
      }
      if (!description.trim()) {
        errs.description = 'Property description is required';
        valid = false;
      }
    } else if (currentStep === 1) {
      if (!locality.trim()) {
        errs.locality = 'Locality / Area name is required';
        valid = false;
      }
      if (!address.trim()) {
        errs.address = 'Street address is required';
        valid = false;
      }
      if (!pincode.trim()) {
        errs.pincode = 'Pincode is required';
        valid = false;
      }
    } else if (currentStep === 2) {
      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        errs.price = 'Valid price is required';
        valid = false;
      }
      if (!areaSqFt || isNaN(Number(areaSqFt)) || Number(areaSqFt) <= 0) {
        errs.areaSqFt = 'Valid carpet area in SqFt is required';
        valid = false;
      }
    } else if (currentStep === 3) {
      if (selectedImages.length === 0) {
        Alert.alert('Photos Required', 'Please select at least one property photograph.');
        valid = false;
      }
    }

    setErrors(errs);
    return valid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      setDiscardModalVisible(true);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleSampleImage = (img: string) => {
    setSelectedImages((prev) =>
      prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
    );
  };

  const handleFinalSubmit = async (status: 'under_review' | 'draft' = 'under_review') => {
    setLoading(true);

    const propertyPayload = {
      title,
      description,
      listingType,
      category,
      propertyType,
      price: Number(price),
      maintenancePrice: Number(maintenance),
      securityDeposit: Number(securityDeposit),
      bedrooms,
      bathrooms,
      areaSqFt: Number(areaSqFt),
      furnishing,
      kitchenType,
      preferredTenants,
      foodPreference,
      electricityIncluded,
      waterIncluded,
      floor,
      facing,
      parking,
      location: {
        state: stateName,
        address,
        locality,
        city,
        landmark,
        pincode,
      },
      images: selectedImages,
      amenities: selectedAmenities,
    };

    if (isEditing && propertyId) {
      updateProperty(propertyId, { ...propertyPayload, status });
      setLoading(false);
      Alert.alert('Updated!', 'Property details have been successfully updated.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } else {
      await addProperty(propertyPayload);
      setLoading(false);
      Alert.alert(
        status === 'draft' ? 'Draft Saved! 💾' : 'Listing Submitted for Review! 📋',
        status === 'draft'
          ? 'Your listing has been saved as a local draft. You can complete and submit it whenever you are ready.'
          : 'Your listing has been submitted and is currently queued for Kirayedar24 verification audit. Admin approval is required before it goes live.',
        [{ text: 'View My Properties', onPress: () => navigation.navigate('MyProperties') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title={isEditing ? 'Edit Property' : 'Add New Property'}
        subtitle={`Step ${currentStep + 1} of 5: ${STEPS[currentStep]}`}
        onBack={handleBack}
      />

      {/* Progressive Step Progress Bar */}
      <View style={styles.progressContainer}>
        {STEPS.map((step, idx) => (
          <View
            key={idx}
            style={[
              styles.progressBarSegment,
              idx <= currentStep ? styles.progressActive : styles.progressInactive,
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 0: Basic Info */}
          {currentStep === 0 && (
            <View>
              <Text style={styles.stepTitle}>Property Purpose & Type</Text>

              {/* Purpose */}
              <Text style={styles.fieldLabel}>Listing Purpose</Text>
              <View style={styles.segmentRow}>
                {(['rent', 'buy'] as ListingType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setListingType(type)}
                    style={[
                      styles.segmentBtn,
                      listingType === type && styles.segmentBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        listingType === type && styles.segmentTextActive,
                      ]}
                    >
                      {type === 'rent' ? 'For Rent' : 'For Sale'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category */}
              <Text style={styles.fieldLabel}>Property Category</Text>
              <View style={styles.segmentRow}>
                {(['residential', 'commercial'] as PropertyCategory[]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.segmentBtn,
                      category === cat && styles.segmentBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        category === cat && styles.segmentTextActive,
                      ]}
                    >
                      {cat === 'residential' ? 'Residential' : 'Commercial'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Property Type Chips */}
              <Text style={styles.fieldLabel}>Property Type</Text>
              <View style={styles.chipsRow}>
                {(category === 'residential'
                  ? (['Apartment', 'Flat', 'Room', 'PG', 'Villa', 'Independent House', 'Studio'] as PropertyType[])
                  : (['Commercial Space', 'Office Space', 'Shop / Showroom', 'Warehouse', 'Plot / Land'] as PropertyType[])
                ).map((t) => (
                  <FilterChip
                    key={t}
                    label={t}
                    selected={propertyType === t}
                    onPress={() => setPropertyType(t)}
                  />
                ))}
              </View>

              <FormField
                label="Listing Title"
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="e.g. Spacious 3 BHK Gated Society Apartment"
                error={errors.title}
                required
              />

              <FormField
                label="Detailed Description"
                value={description}
                onChangeText={(d) => {
                  setDescription(d);
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Describe features, connectivity, water supply, and special highlights..."
                multiline
                numberOfLines={4}
                error={errors.description}
                required
              />
            </View>
          )}

          {/* STEP 1: Location */}
          {currentStep === 1 && (
            <View>
              <Text style={styles.stepTitle}>Property Location & Address</Text>

              {/* State Selector */}
              <Text style={styles.fieldLabel}>State / Region</Text>
              <View style={styles.chipsRow}>
                {getIndianStates().map((st) => (
                  <FilterChip
                    key={st}
                    label={st}
                    selected={stateName === st}
                    onPress={() => {
                      setStateName(st);
                      const availableCities = getCitiesForState(st);
                      if (availableCities.length > 0) {
                        setCity(availableCities[0]);
                        setLocality('');
                      }
                    }}
                  />
                ))}
              </View>

              {/* City Selector */}
              <Text style={styles.fieldLabel}>City ({stateName})</Text>
              <View style={styles.chipsRow}>
                {getCitiesForState(stateName).map((c) => (
                  <FilterChip
                    key={c}
                    label={c}
                    selected={city === c}
                    onPress={() => {
                      setCity(c);
                      setLocality('');
                    }}
                  />
                ))}
              </View>

              {/* Locality suggestions */}
              <Text style={styles.fieldLabel}>Popular Localities in {city}</Text>
              <View style={styles.chipsRow}>
                {getLocalitiesForCity(city, stateName).slice(0, 8).map((loc) => (
                  <FilterChip
                    key={loc}
                    label={loc}
                    selected={locality === loc}
                    onPress={() => {
                      setLocality(loc);
                      if (errors.locality) setErrors({ ...errors, locality: '' });
                    }}
                  />
                ))}
              </View>

              <FormField
                label="Locality / Sector / Area Name"
                value={locality}
                onChangeText={(l) => {
                  setLocality(l);
                  if (errors.locality) setErrors({ ...errors, locality: '' });
                }}
                placeholder="e.g. Indiranagar, Sector 62, Malviya Nagar"
                error={errors.locality}
                required
                leftIcon={<Icon name="map-pin" size={18} color={colors.textSecondary} />}
              />

              <FormField
                label="Complete Building Address / Flat No."
                value={address}
                onChangeText={(a) => {
                  setAddress(a);
                  if (errors.address) setErrors({ ...errors, address: '' });
                }}
                placeholder="e.g. Flat 302, Prestige Tower, 12th Main"
                error={errors.address}
                required
              />

              <FormField
                label="Nearby Landmark"
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g. Opposite Metro Station"
              />

              <FormField
                label="Pincode"
                value={pincode}
                onChangeText={(p) => {
                  setPincode(p);
                  if (errors.pincode) setErrors({ ...errors, pincode: '' });
                }}
                placeholder="e.g. 560038"
                keyboardType="number-pad"
                error={errors.pincode}
                required
              />

              <FormField
                label="Floor Details"
                value={floor}
                onChangeText={setFloor}
                placeholder="e.g. 4th of 10 Floors"
              />
            </View>
          )}

          {/* STEP 2: Features & Pricing */}
          {currentStep === 2 && (
            <View>
              <Text style={styles.stepTitle}>Pricing & Specifications</Text>

              <FormField
                label={listingType === 'rent' ? 'Monthly Rent (₹)' : 'Expected Total Price (₹)'}
                value={price}
                onChangeText={(p) => {
                  setPrice(p);
                  if (errors.price) setErrors({ ...errors, price: '' });
                }}
                placeholder="e.g. 35000"
                keyboardType="number-pad"
                error={errors.price}
                required
                leftIcon={<Icon name="credit-card" size={18} color={colors.textSecondary} />}
              />

              {listingType === 'rent' && (
                <>
                  <FormField
                    label="Security Deposit (₹)"
                    value={securityDeposit}
                    onChangeText={setSecurityDeposit}
                    placeholder="e.g. 150000"
                    keyboardType="number-pad"
                  />
                  <FormField
                    label="Monthly Maintenance (₹)"
                    value={maintenance}
                    onChangeText={setMaintenance}
                    placeholder="e.g. 3000"
                    keyboardType="number-pad"
                  />
                </>
              )}

              {category === 'residential' && (
                <>
                  <Text style={styles.fieldLabel}>Bedrooms (BHK)</Text>
                  <View style={styles.chipsRow}>
                    {[1, 2, 3, 4].map((bhk) => (
                      <FilterChip
                        key={bhk}
                        label={`${bhk} BHK`}
                        selected={bedrooms === bhk}
                        onPress={() => setBedrooms(bhk)}
                      />
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Bathrooms</Text>
                  <View style={styles.chipsRow}>
                    {[1, 2, 3, 4].map((bath) => (
                      <FilterChip
                        key={bath}
                        label={`${bath} Bath`}
                        selected={bathrooms === bath}
                        onPress={() => setBathrooms(bath)}
                      />
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Kitchen Type</Text>
                  <View style={styles.chipsRow}>
                    {(['Modular', 'Simple / Standard', 'Semi-Modular'] as KitchenType[]).map((k) => (
                      <FilterChip
                        key={k}
                        label={k}
                        selected={kitchenType === k}
                        onPress={() => setKitchenType(k)}
                      />
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Preferred Tenants</Text>
                  <View style={styles.chipsRow}>
                    {(['Family', 'Bachelors (Boys)', 'Bachelors (Girls)', 'Students', 'Any / All'] as TenantPreference[]).map(
                      (pref) => {
                        const isSelected = preferredTenants.includes(pref);
                        return (
                          <FilterChip
                            key={pref}
                            label={pref}
                            selected={isSelected}
                            onPress={() => {
                              setPreferredTenants((prev) =>
                                prev.includes(pref)
                                  ? prev.filter((p) => p !== pref)
                                  : [...prev, pref]
                              );
                            }}
                          />
                        );
                      }
                    )}
                  </View>

                  <Text style={styles.fieldLabel}>Food Preferences Allowed</Text>
                  <View style={styles.chipsRow}>
                    {(['Vegetarian Only', 'Any (Veg & Non-Veg)'] as FoodPreference[]).map((f) => (
                      <FilterChip
                        key={f}
                        label={f}
                        selected={foodPreference === f}
                        onPress={() => setFoodPreference(f)}
                      />
                    ))}
                  </View>
                </>
              )}

              <FormField
                label="Super Built-up Area (Sq.Ft)"
                value={areaSqFt}
                onChangeText={(a) => {
                  setAreaSqFt(a);
                  if (errors.areaSqFt) setErrors({ ...errors, areaSqFt: '' });
                }}
                placeholder="e.g. 1450"
                keyboardType="number-pad"
                error={errors.areaSqFt}
                required
                leftIcon={<Icon name="square-area" size={18} color={colors.textSecondary} />}
              />

              <Text style={styles.fieldLabel}>Furnishing Status</Text>
              <View style={styles.chipsRow}>
                {(['Furnished', 'Semi-Furnished', 'Unfurnished'] as FurnishingStatus[]).map(
                  (furn) => (
                    <FilterChip
                      key={furn}
                      label={furn}
                      selected={furnishing === furn}
                      onPress={() => setFurnishing(furn)}
                    />
                  )
                )}
              </View>

              <FormField
                label="Facing & Vastu"
                value={facing}
                onChangeText={setFacing}
                placeholder="e.g. North-East Facing"
              />

              <FormField
                label="Parking"
                value={parking}
                onChangeText={setParking}
                placeholder="e.g. 1 Covered Car & 1 Bike Parking"
              />
            </View>
          )}

          {/* STEP 3: Photos & Amenities */}
          {currentStep === 3 && (
            <View>
              <Text style={styles.stepTitle}>Photos & Amenities</Text>

              <Text style={styles.fieldLabel}>
                Property Photos ({selectedImages.length} selected)
              </Text>
              <Text style={styles.fieldHint}>
                Select high-resolution sample photos for your listing:
              </Text>

              <View style={styles.photosGrid}>
                {SAMPLE_PHOTO_ASSETS.map((img, idx) => {
                  const isSelected = selectedImages.includes(img);
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() => toggleSampleImage(img)}
                      style={[
                        styles.photoThumbCard,
                        isSelected && styles.photoThumbSelected,
                      ]}
                    >
                      <Image source={{ uri: img }} style={styles.photoThumb} />
                      <View
                        style={[
                          styles.photoCheckCircle,
                          isSelected && styles.photoCheckActive,
                        ]}
                      >
                        {isSelected && (
                          <Icon name="check" size={14} color={colors.darkText} strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Select Amenities</Text>
              <View style={styles.chipsRow}>
                {AMENITY_OPTIONS.map((amenity) => (
                  <FilterChip
                    key={amenity}
                    label={amenity}
                    selected={selectedAmenities.includes(amenity)}
                    onPress={() => toggleAmenity(amenity)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* STEP 4: Review & Submit */}
          {currentStep === 4 && (
            <View>
              <Text style={styles.stepTitle}>Review Listing Summary</Text>

              <View style={styles.reviewCard}>
                <View style={styles.reviewImagePreview}>
                  <Image
                    source={{ uri: selectedImages[0] || SAMPLE_PHOTO_ASSETS[0] }}
                    style={styles.reviewImg}
                  />
                  <View style={styles.reviewTypeBadge}>
                    <Text style={styles.reviewTypeBadgeText}>
                      {listingType === 'rent' ? 'For Rent' : 'For Sale'}
                    </Text>
                  </View>
                </View>

                <View style={styles.reviewDetails}>
                  <Text style={styles.reviewPrice}>
                    {formatIndianCurrency(Number(price))}
                    {listingType === 'rent' ? ' / month' : ''}
                  </Text>
                  <Text style={styles.reviewTitle}>{title}</Text>
                  <Text style={styles.reviewLocality}>
                    📍 {locality}, {city} ({stateName})
                  </Text>

                  <View style={styles.reviewSpecs}>
                    <Text style={styles.reviewSpecItem}>
                      {bedrooms} BHK • {areaSqFt} SqFt • {furnishing}
                    </Text>
                  </View>

                  <View style={styles.reviewAmenities}>
                    <Text style={styles.reviewAmenityTitle}>
                      {selectedAmenities.length} Amenities Included
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.auditNotice}>
                <Icon name="shield-check" size={20} color={colors.primaryDark} />
                <Text style={styles.auditNoticeText}>
                  Your listing will undergo verification review before being published. Admin approval is required for all public listings.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Actions Footer */}
      <View style={styles.footer}>
        {currentStep < STEPS.length - 1 ? (
          <Button
            title="Next Step →"
            variant="primary"
            size="lg"
            onPress={handleNext}
            fullWidth
          />
        ) : (
          <View style={styles.finalActionsRow}>
            <Button
              title="Save Draft"
              variant="outline"
              size="lg"
              onPress={() => handleFinalSubmit('draft')}
              style={{ flex: 1 }}
              disabled={loading}
            />
            <Button
              title={isEditing ? 'Update Listing' : 'Submit for Review'}
              variant="primary"
              size="lg"
              onPress={() => handleFinalSubmit('under_review')}
              style={{ flex: 1.5 }}
              loading={loading}
            />
          </View>
        )}
      </View>

      {/* Discard Modal */}
      <ConfirmationModal
        visible={discardModalVisible}
        title="Discard Property Draft?"
        message="You have unsaved changes in this listing. Are you sure you want to discard them?"
        confirmTitle="Discard"
        confirmVariant="danger"
        onClose={() => setDiscardModalVisible(false)}
        onConfirm={() => {
          setDiscardModalVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: colors.border,
  },
  progressBarSegment: {
    flex: 1,
  },
  progressActive: {
    backgroundColor: colors.primary,
  },
  progressInactive: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  stepTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.darkText,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  fieldHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  segmentBtnActive: {
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
    marginBottom: spacing.md,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  photoThumbCard: {
    width: '47%',
    height: 110,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.border,
  },
  photoThumbSelected: {
    borderColor: colors.primaryDark,
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoCheckCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCheckActive: {
    backgroundColor: colors.primary,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  reviewImagePreview: {
    height: 160,
    position: 'relative',
  },
  reviewImg: {
    width: '100%',
    height: '100%',
  },
  reviewTypeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.round,
  },
  reviewTypeBadgeText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.darkText,
    fontWeight: '700',
  },
  reviewDetails: {
    padding: spacing.md,
  },
  reviewPrice: {
    ...typography.h3,
    fontSize: 20,
    color: colors.darkText,
    marginBottom: 4,
  },
  reviewTitle: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  reviewLocality: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  reviewSpecs: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  reviewSpecItem: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewAmenities: {
    marginTop: spacing.xs,
  },
  reviewAmenityTitle: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  auditNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningTint,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#FEDF89',
    gap: spacing.sm,
  },
  auditNoticeText: {
    ...typography.caption,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  finalActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
