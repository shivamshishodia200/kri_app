import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MediaCard from './MediaCard';

export default function PropertyCard({ 
  title, 
  price, 
  location, 
  image, 
  photosAndVideo = [], 
  onPress,
  onMediaPress 
}) {
  // Prepare media items for MediaCard
  const mediaItems = photosAndVideo && photosAndVideo.length > 0 
    ? photosAndVideo.map(item => ({
        uri: item.uri || item,
        type: item.type || (item.uri?.includes('.mp4') || item.uri?.includes('.mov') ? 'video' : 'image')
      }))
    : image ? [{ uri: image, type: 'image' }] : [];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <MediaCard
        mediaItems={mediaItems}
        fallbackImage="https://via.placeholder.com/400x200/5da9f6/FFFFFF?text=Property+Image"
        imageStyle={styles.image}
        showControls={true}
        onMediaPress={onMediaPress}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceSymbol}>₹</Text>
          <Text style={styles.price}>{price}</Text>
        </View>
        <Text style={styles.location} numberOfLines={1}>{location}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EFEEE9',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    shadowColor: '#1E293B',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 170,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  priceSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FDB022',
    marginRight: 2,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FDB022',
  },
  location: {
    fontSize: 13,
    color: '#626B78',
    marginTop: 4,
  },
});

