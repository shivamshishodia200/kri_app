import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

let pkg = {};
try { pkg = require('../../package.json'); } catch (e) { pkg = {}; }

const COLORS = {
  primary: '#FDB022',
  primaryDark: '#D97706',
  background: '#EFEEE9',
  white: '#FFFFFF',
  cardBg: '#EFEEE9',
  border: '#D8D5CB',
  text: '#2D3748',
  greyText: '#626B78',
  accent: '#06B6D4',
};

const AboutScreen = ({ navigation }) => {
  const appName = 'Kirayedar24';
  const version = pkg.version || '1.0.0';

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Icon name="home" size={50} color={COLORS.primary} />
          </View>
        </View>

        {/* App Name & Version */}
        <Text style={styles.appName}>{appName}</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>Version {version}</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>
            Kirayedar24 helps buyers, sellers and renters manage property listings and enquiries in one place.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Icon name="search-outline" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Find Properties</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="heart-outline" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Save Favorites</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="chatbubble-outline" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Quick Enquiry</Text>
          </View>
        </View>

        {/* Contact Support Button */}
        <TouchableOpacity 
          style={styles.supportButton} 
          onPress={() => openLink('mailto:support@kirayedar24.com')}
          activeOpacity={0.8}
        >
          <Icon name="mail-outline" size={20} color={COLORS.white} />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>Made with ❤️ in India</Text>
        <Text style={styles.copyrightText}>© 2024-2026 Kirayedar24. All rights reserved.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.background, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border,
  },
  backButton: { 
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    elevation: 2,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  content: { 
    flex: 1,
    padding: 20, 
    alignItems: 'center' 
  },
  logoContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    elevation: 3,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appName: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  versionBadge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#FFF8EB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDB022',
  },
  versionText: { 
    fontSize: 13, 
    color: COLORS.primaryDark, 
    fontWeight: '700',
  },
  descriptionCard: {
    marginTop: 20,
    padding: 18,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    width: '100%',
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  description: { 
    color: COLORS.greyText, 
    textAlign: 'center', 
    lineHeight: 24,
    fontSize: 15,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
    paddingVertical: 16,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.greyText,
    fontWeight: '500',
  },
  supportButton: { 
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  supportButtonText: { 
    fontWeight: '800',
    fontSize: 15,
    color: '#1E293B',
    marginLeft: 8,
  },
  footerText: {
    marginTop: 40,
    fontSize: 14,
    color: COLORS.greyText,
  },
  copyrightText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.greyText + '80',
  },
});

export default AboutScreen;
