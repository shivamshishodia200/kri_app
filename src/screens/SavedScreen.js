import React, { useState, useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    StatusBar,
    Animated,
    Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { DeviceEventEmitter } from 'react-native';

// Import API services and helper functions
import { formatImageUrl, formatPrice } from '../services/propertyHelpers';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionModal from '../components/SubscriptionModal'; 
import propertyService from '../services/propertyapi';

// Fallback image URL when a property has no photo link
const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/180x180.png?text=No+Image';

const COLORS = {
    primary: "#FDB022",
    primaryDark: "#D97706",
    primaryLight: "#FFF8EB",
    background: "#EFEEE9",
    cardBg: "#EFEEE9",
    white: "#FFFFFF",
    textDark: "#2D3748",
    textMuted: "#626B78",
    borderHighlight: "#FFFFFF",
    borderShadow: "#D8D5CB",
    inputBg: "#E5E3DC",
    danger: "#EF4444",
    dangerLight: "#FEE2E2",
};

// Helper to safely convert any value to string (handles location objects)
const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.locality || value.city || value.state || value.pincode) {
      return [value.locality, value.city, value.state].filter(Boolean).join(', ') || fallback;
    }
    return JSON.stringify(value);
  }
  return String(value);
};

// Individual Animated Saved Card Item
const SavedPropertyCard = ({ item, onPress, onRemove, isRemoving }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleRemovePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            })
        ]).start(() => {
            onRemove(item.id);
        });
    };

    const imageSource = item.image && item.image.uri && item.image.uri !== DEFAULT_IMAGE_URL
        ? item.image
        : { uri: DEFAULT_IMAGE_URL };

    return (
        <TouchableOpacity 
            style={styles.cardRow}
            onPress={() => onPress(item)}
            activeOpacity={0.88}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={imageSource}
                    style={styles.imageRow}
                    defaultSource={{ uri: DEFAULT_IMAGE_URL }}
                    resizeMode="cover"
                />
                {item.tag ? (
                    <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText} numberOfLines={1}>{item.tag}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.infoRow}>
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity 
                            style={styles.favoriteButton} 
                            onPress={handleRemovePress}
                            disabled={isRemoving}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            {isRemoving ? (
                                <ActivityIndicator size="small" color={COLORS.danger} />
                            ) : (
                                <Icon name="heart" size={20} color={COLORS.danger} />
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <View style={styles.locationRow}>
                    <Icon name="location-outline" size={13} color={COLORS.textMuted} style={styles.locIcon} />
                    <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.pricePrefix}>Rent / Price</Text>
                        <Text style={styles.priceTextRow}>
                            {typeof item.price === 'number' ? formatPrice(item.price) : item.price}
                        </Text>
                    </View>

                    <View style={styles.viewDetailsPill}>
                        <Text style={styles.viewDetailsText}>View</Text>
                        <Icon name="chevron-forward" size={12} color={COLORS.primaryDark} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const SavedScreen = ({ navigation }) => {
    const { userHasPackage, setPropertyForSubscription, loadActiveSubscription } = useSubscription();
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    
    const [search, setSearch] = useState("");
    const [properties, setProperties] = useState([]); 
    const [loadingId, setLoadingId] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Load user role on mount
    useEffect(() => {
        const loadUserRole = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                setUserRole(role);
            } catch (error) {
                console.warn('Error loading user role:', error);
            }
        };
        loadUserRole();
    }, []);

    const loadSaved = useCallback(async () => {
        setLoading(true);
        try {
            const responseData = await propertyService.getSavedProperties(); 
            let data = [];

            if (responseData && responseData.savedProperties && Array.isArray(responseData.savedProperties)) {
                data = responseData.savedProperties;
            } else if (Array.isArray(responseData.data)) {
                data = responseData.data;
            } else if (Array.isArray(responseData)) {
                data = responseData;
            }
            
            if (Array.isArray(data)) {
                data = data.filter(Boolean); 

                const mapped = data.map(p => {
                    const primaryLocation = p.propertyLocation || p.location || p.address || 'Unknown Location';
                    const primaryType = p.propertyType || p.type || p.tag || '';
                    
                    let imageUrl = DEFAULT_IMAGE_URL;

                    if (p.photos && Array.isArray(p.photos) && p.photos.length > 0) {
                        const firstPhoto = p.photos[0];
                        const rawPath = typeof firstPhoto === 'string' 
                            ? firstPhoto 
                            : (firstPhoto?.url || firstPhoto?.uri || firstPhoto);
                        if (rawPath) imageUrl = formatImageUrl(rawPath);
                    } else if (p.photosAndVideo && p.photosAndVideo.length > 0) {
                        const firstPhoto = p.photosAndVideo[0];
                        const rawPath = typeof firstPhoto === 'string' 
                            ? firstPhoto 
                            : (firstPhoto?.url || firstPhoto?.uri || firstPhoto);
                        if (rawPath) imageUrl = formatImageUrl(rawPath);
                    } else if (p.images && p.images.length > 0) {
                        const firstImage = p.images[0];
                        const rawPath = typeof firstImage === 'string' 
                            ? firstImage 
                            : (firstImage?.url || firstImage?.uri || firstImage);
                        if (rawPath) imageUrl = formatImageUrl(rawPath);
                    } else if (p.image) {
                        const rawPath = typeof p.image === 'string' ? p.image : p.image?.url || p.image?.uri;
                        if (rawPath) imageUrl = formatImageUrl(rawPath);
                    }

                    return {
                        id: p._id || p.id || p.propertyId || String(p._id || Date.now()),
                        title: safeString(p.description || p.title || p.name, 'Untitled Property'),
                        price: p.price || p.listPrice || p.sellingPrice || 'N/A', 
                        location: safeString(primaryLocation, 'Unknown Location'),
                        image: { uri: imageUrl },
                        tag: safeString(primaryType, ''),
                        isSaved: true,
                        originalData: p,
                    };
                });
                setProperties(mapped);
            } else {
                setProperties([]);
            }
        } catch (err) {
            console.error('Error loading saved properties:', err);
            Alert.alert("Error", err.message || "Failed to load shortlisted properties. Please check your network or API status.");
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSaved();
    }, [loadSaved]);

    // Listen for save/remove events from other screens
    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('savedListUpdated', () => {
            loadSaved();
        });
        return () => sub.remove();
    }, [loadSaved]);

    useFocusEffect(
        useCallback(() => {
            if (!loading) {
                loadSaved();
            }
            return () => {};
        }, [loadSaved, loading])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadSaved();
        } catch (e) {
            console.error('Refresh failed', e);
        } finally {
            setRefreshing(false);
        }
    };

    const handleRemoveProperty = useCallback((propertyId) => {
        Alert.alert(
            "Remove from Shortlist",
            "Are you sure you want to remove this property from your shortlisted list?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Remove", 
                    style: "destructive",
                    onPress: async () => {
                        setLoadingId(propertyId);
                        try {
                            // Optimistic UI update
                            setProperties(prev => prev.filter(item => item.id !== propertyId));
                            await propertyService.removeSavedProperty(propertyId); 
                            // Notify other screens (e.g. Home)
                            DeviceEventEmitter.emit('savedListUpdated', { propertyId, isSaved: false });
                        } catch (error) {
                            console.error("Remove Property failed:", error);
                            Alert.alert("Error", error.message || "Failed to remove property. Please retry.");
                            await loadSaved();
                        } finally {
                            setLoadingId(null);
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    }, [loadSaved]);

    const filteredProperties = properties.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.tag.toLowerCase().includes(search.toLowerCase())
    );

    const handlePropertyPress = (item) => {
        const isOwner = userRole && userRole.toLowerCase() === 'owner';
        
        if (isOwner) {
            const propertyData = item.originalData || item;
            navigation.navigate('PropertyDetailsScreen', { 
                propertyId: item.id,
                property: propertyData 
            });
            return;
        }
        
        if (!userHasPackage) {
            setPropertyForSubscription(item.originalData || item);
            setShowSubscriptionModal(true);
            return;
        }
        
        const propertyData = item.originalData || item;
        navigation.navigate('PropertyDetailsScreen', { 
            propertyId: item.id,
            property: propertyData 
        });
    };

    const handleSubscriptionSuccess = () => {
        setShowSubscriptionModal(false);
        loadActiveSubscription();
    };

    const renderItem = ({ item }) => (
        <SavedPropertyCard
            item={item}
            onPress={handlePropertyPress}
            onRemove={handleRemoveProperty}
            isRemoving={loadingId === item.id}
        />
    );

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <Icon name="heart-dislike-outline" size={48} color={COLORS.danger} />
                </View>
                <Text style={styles.emptyTextTitle}>No Shortlisted Properties</Text>
                <Text style={styles.emptyTextSubtitle}>
                    Properties you bookmark will appear here for quick access and comparison.
                </Text>
                {userRole !== 'Owner' && userRole !== 'owner' && (
                    <TouchableOpacity 
                        style={styles.browseBtn} 
                        onPress={() => navigation.navigate('Home')}
                        activeOpacity={0.85}
                    >
                        <Icon name="search-outline" size={16} color="#1E293B" style={{ marginRight: 6 }} />
                        <Text style={styles.browseBtnText}>Explore Properties</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.headerRowTop}>
                    <View>
                        <Text style={styles.header}>Shortlisted</Text>
                        <Text style={styles.headerSubtitle}>Saved homes & rental spaces</Text>
                    </View>
                    <View style={styles.countPill}>
                        <Text style={styles.countText}>{properties.length} saved</Text>
                    </View>
                </View>

                {/* Inset Search Bar */}
                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={18} color={COLORS.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search saved properties..."
                        placeholderTextColor={COLORS.textMuted}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Icon name="close-circle" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Loading Indicator */}
                {loading && properties.length === 0 ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading shortlisted properties...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredProperties}
                        renderItem={renderItem}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListEmptyComponent={renderEmpty}
                    />
                )}

                {/* Subscription Modal */}
                <SubscriptionModal
                    visible={showSubscriptionModal}
                    onClose={() => setShowSubscriptionModal(false)}
                    onSuccess={handleSubscriptionSuccess}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
    },
    headerRowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 14,
    },
    header: {
        fontSize: 22,
        fontWeight: "800",
        color: COLORS.textDark,
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
        fontWeight: "500",
    },
    countPill: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    countText: {
        fontSize: 12,
        color: COLORS.primaryDark,
        fontWeight: "700",
    },

    // Inset Search Field
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.inputBg,
        paddingHorizontal: 14,
        borderRadius: 14,
        marginBottom: 14,
        borderTopWidth: 1.5,
        borderLeftWidth: 1.5,
        borderBottomWidth: 1.5,
        borderRightWidth: 1.5,
        borderTopColor: "#D0CDC4",
        borderLeftColor: "#D0CDC4",
        borderBottomColor: "#FFFFFF",
        borderRightColor: "#FFFFFF",
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.textDark,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    },

    listContent: {
        paddingBottom: 110,
    },

    // Neumorphic Card Item
    cardRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        marginBottom: 14,
        padding: 12,
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 3,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    imageContainer: {
        position: 'relative',
        width: 105,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#E2E0D8',
    },
    imageRow: {
        width: '100%',
        height: '100%',
    },
    tagBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: 'rgba(45, 55, 72, 0.85)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    infoRow: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textDark,
        marginRight: 6,
        lineHeight: 20,
    },
    favoriteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 2,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locIcon: {
        marginRight: 3,
    },
    location: {
        fontSize: 12,
        color: COLORS.textMuted,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 8,
    },
    priceContainer: {
        flex: 1,
    },
    pricePrefix: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    priceTextRow: {
        fontSize: 15,
        color: COLORS.primaryDark,
        fontWeight: '800',
    },
    viewDetailsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 2,
    },
    viewDetailsText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },

    // Empty & Loading States
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 24,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.dangerLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    emptyTextTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textDark,
        marginBottom: 6,
    },
    emptyTextSubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: 20,
    },
    browseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    browseBtnText: {
        color: '#1E293B',
        fontWeight: '800',
        fontSize: 14,
    },
});

export default SavedScreen;
