import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NeuScreen, NeuHeader, NeuCard } from '../components/neu';

const PrivacyPolicy = ({ navigation }) => {
  return (
    <NeuScreen
      header={
        <NeuHeader
          title="Privacy Policy"
          onBack={() => navigation.goBack()}
        />
      }
      scrollable={true}
      contentContainerStyle={styles.content}
    >
      <NeuCard variant="raised" style={styles.card} padding={20}>
        <Text style={styles.mainTitle}>Kirayedar24 Privacy Policy & Owner Agreement</Text>

        <Text style={styles.sectionTitle}>Registration and Use of Services</Text>
        <Text style={styles.listItem}>• The Property Owner must register on Kirayedar24, providing accurate and up-to-date personal and property details.</Text>
        <Text style={styles.listItem}>• The Property Owner agrees to pay the specified fee to Kirayedar24 for availing of its services.</Text>

        <Text style={styles.sectionTitle}>Property Listings</Text>
        <Text style={styles.listItem}>• The Property Owner is responsible for uploading authentic property photos and accurate descriptions of the property, including location, rental terms, and amenities.</Text>
        <Text style={styles.listItem}>• Any misleading, fraudulent, or inaccurate information will lead to the suspension or termination of the Property Owner's account.</Text>

        <Text style={styles.sectionTitle}>Background Verification</Text>
        <Text style={styles.listItem}>• Kirayedar24 acts solely as a mediator between Property Owners and tenants.</Text>
        <Text style={styles.listItem}>• Kirayedar24 does not conduct any background verification of tenants. The Property Owner is solely responsible for such verifications.</Text>

        <Text style={styles.sectionTitle}>Rental Agreements & Police Verification</Text>
        <Text style={styles.listItem}>• Before giving any property on rent, the Property Owner must ensure that the necessary rent agreements and police verification are completed.</Text>

        <Text style={styles.sectionTitle}>Communication with Tenants</Text>
        <Text style={styles.listItem}>• The Property Owner is solely responsible for responding to tenant inquiries and negotiating rental agreements.</Text>
        <Text style={styles.listItem}>• Kirayedar24 is not a party to any rental agreement or contract entered into with the tenant.</Text>

        <Text style={styles.sectionTitle}>Payment & Fees</Text>
        <Text style={styles.listItem}>• Listing and service fees paid to Kirayedar24 are strictly non-refundable.</Text>
        <Text style={styles.listItem}>• Neither tenant nor Property Owner has the right to claim payment disputes against Kirayedar24.</Text>
      </NeuCard>
    </NeuScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 14,
    marginBottom: 6,
  },
  listItem: {
    fontSize: 13,
    color: '#626B78',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default PrivacyPolicy;