import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const TermsScreen = ({ navigation, route }) => {
  const [accepted, setAccepted] = useState(false);
  
  // Safely get onAccept callback
  const onAccept = route?.params?.onAccept;

  const handleAccept = () => {
    if (onAccept && accepted) {
      onAccept();
    }
    navigation.goBack();
  };

  const termsContent = `TERMS AND CONDITIONS

Kirayedar24 provides this service to facilitate connections between property owners and tenants without brokerage fees. To access the service (including this site), acceptance of these terms and conditions ("Terms of Use") and our Privacy Policy is required.

SERVICE DESCRIPTION

This service offers Residents building-specific networks to foster neighborly interaction and knowledge sharing about the surrounding area.

1. Location Approach:
• Each user is permitted only one username and password, using the user's provided email address or contact number.
• We retain the right to verify this information prior to account activation.
• Account rejection or deactivation may occur if the account is deemed a brokerage account or for any other reason deemed appropriate by Kirayedar24.
• Users are responsible for maintaining password and account confidentiality and are liable for all activities performed under their password or account.
• Knowingly sharing login credentials may result in account suspension or termination.
• Unauthorized password or account use, or any security breach, must be reported immediately.
• We are not liable for losses resulting from password or account compromise or security breaches.

2. Membership Information:
• To register, please provide your full name, address, email address, phone number, and a chosen password.
• Your email address and/or phone number will serve as your login credentials.
• All registration information must be accurate and complete.
• This information will be publicly viewable on the website.
• We reserve the right to verify your ownership or tenancy status using the provided information.

3. Detailed Profile:
• Your Kirayedar24 profile must not contain telephone numbers (except where requested), or any photographs depicting nudity, profanity, obscenity, excessive violence, harassment, sexually explicit content, or other objectionable material.
• Kirayedar24 disclaims all responsibility and liability for user-generated content that may contain inappropriate material.
• We encourage you to assist us in maintaining a clean website by reporting any misuse of the service.

4. Locality Information:
• The platform incorporates local information sourced from third-party providers such as Google Maps.
• Kirayedar24 disclaims any responsibility for the accuracy, integrity, or quality of this third-party content.
• All interactions with businesses accessed via the service are solely the responsibility of the user and the respective business.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AGREEMENT BETWEEN KIRAYEDAR24 AND PROPERTY OWNERS

Terms and Conditions for Property Owners:

• Registration and Use of Services:
  - The Property Owner must register on Kirayedar24, providing accurate and up-to-date personal and property details.
  - The Property Owner agrees to pay the specified fee to Kirayedar24 for availing of its services.

• Property Listings:
  - The Property Owner is responsible for uploading authentic property photos and accurate descriptions of the property, including location, rental terms, and amenities.
  - Any misleading, fraudulent, or inaccurate information will lead to the suspension or termination of the Property Owner's account.

• Background Verification:
  - Kirayedar24 acts solely as a mediator between Property Owners and tenants.
  - Kirayedar24 does not conduct any background verification of tenants. The Property Owner is solely responsible for such verifications.

• Rental Agreements and Police Verification:
  - Before giving any property on rent, the Property Owner must ensure that the necessary rent agreements and police verification are completed.

• Communication with Tenants:
  - The Property Owner is solely responsible for responding to tenant inquiries and negotiating rental agreements.
  - The Property Owner acknowledges that Kirayedar24 is not a party to any rental agreement or contract entered into with the tenant.

• Compliance with Laws:
  - The Property Owner is responsible for ensuring that their property complies with all applicable local laws, including but not limited to building codes, rental regulations, and tax requirements.

• Payment Terms:
  - The Property Owner agrees to pay any listing or subscription fees as prescribed by Kirayedar24.
  - Fees paid to Kirayedar24 are non-refundable under any circumstances.

• Liability Disclaimer:
  - Kirayedar24 is not liable for any disputes, damages, or losses arising from the Property Owner's interactions with tenants.
  - Addendums or changes in rent amounts and security charges are solely the responsibility of the Property Owner and tenant.
  - Neither the tenant nor the Property Owner has the right to claim any payment disputes with Kirayedar24.

• Advance Payments:
  - Kirayedar24 will not be responsible for any advance payments made to Property Owners.
  - If tenants make any payments without viewing the property or obtaining confirmation from the Property Owner, the entire responsibility lies with the tenant.

• Completion of Tenancy Transaction:
  - The Property Owner shall provide Kirayedar24 with confirmation of the successful execution of the agreement and completion of the tenancy transaction.
  - The Property Owner must upload the tenancy agreement, possession certificate, and self-attested KYC documents of both the Property Owner and the Tenant.

• Termination of Services:
  - Kirayedar24 reserves the right to suspend or terminate the Property Owner's account in case of a breach of these terms and conditions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AGREEMENT BETWEEN KIRAYEDAR24 AND PROBABLE TENANTS

Terms and Conditions for Probable Tenants:

• Registration and Use of Services:
  - The Tenant must register on Kirayedar24, providing accurate and up-to-date personal details.
  - The Tenant agrees to pay the specified fee to Kirayedar24 for availing of its services.

• Property Search and Contact:
  - The Tenant can search for rental properties using the filters and information provided on the platform.
  - The Tenant is solely responsible for contacting the Property Owner and negotiating the rental agreement.

• Accuracy of Information:
  - Kirayedar24 does not guarantee the accuracy or authenticity of property listings.
  - The Tenant acknowledges that they must conduct their due diligence before entering into any rental agreement.

• Advance Payments:
  - Kirayedar24 will not be responsible for any advance payments made to Property Owners.
  - If tenants make any payments without viewing the property or obtaining confirmation from the Property Owner, the entire responsibility lies with the tenant.

• Rental Charges and Brokerage:
  - Kirayedar24 is only a browsing/searching platform for properties.
  - Kirayedar24 is not responsible for any rental charges or brokerage fees charged by the Property Owner.
  - Tenants must clarify such charges directly with the Property Owner.

• Addendums in Agreements:
  - Addendums or changes in rent amounts and security charges are solely the responsibility of the Tenant and Property Owner.
  - Kirayedar24 is not responsible for any changes in rent agreements or disputes arising from such changes.
  - Neither the Tenant nor the Property Owner has the right to claim any payment disputes with Kirayedar24.

• Compliance with Laws:
  - The Tenant is responsible for ensuring that their rental activities comply with all applicable local laws and regulations.

• Liability Disclaimer:
  - Kirayedar24 is not liable for any disputes, damages, or losses arising from interactions between the Tenant and the Property Owner.
  - The Tenant indemnifies Kirayedar24 against any claims, disputes, or legal actions initiated by the Property Owner or third parties.

• Completion of Tenancy Transaction:
  - The Tenant shall provide Kirayedar24 with confirmation of the successful execution of the agreement and completion of the tenancy transaction.
  - The Tenant must upload the tenancy agreement, possession certificate, and self-attested KYC documents of both the Property Owner and the Tenant.

• Termination of Services:
  - Kirayedar24 reserves the right to suspend or terminate the Tenant's account in case of a breach of these terms and conditions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIVACY POLICY

At Kirayedar24, we value your privacy and are committed to protecting your personal information.

1. INFORMATION WE COLLECT
• Name, email, phone number
• Location data for property searches
• Payment information (securely processed)
• Device information and IP address
• Usage data and preferences

2. HOW WE USE YOUR INFORMATION
• To provide and improve our services
• To process bookings and payments
• To communicate updates and offers
• To personalize user experience
• To prevent fraud and ensure security

3. INFORMATION SHARING
We DO NOT sell your personal data. We share only when:
• Required by law
• With your explicit consent
• With service providers (payment processors, etc.)
• To protect our rights and safety

4. DATA SECURITY
• We use encryption and secure servers
• Regular security audits
• Limited employee access
• Secure payment gateways

5. YOUR RIGHTS
You have the right to:
• Access your personal data
• Correct inaccurate information
• Request data deletion
• Opt-out of marketing communications
• Withdraw consent anytime

6. COOKIES & TRACKING
• We use cookies for functionality
• Analytics to improve services
• You can disable cookies in settings

7. THIRD-PARTY SERVICES
• We use Google Maps for location
• Payment gateways for transactions
• Analytics tools for insights

8. CHILDREN'S PRIVACY
Our service is not intended for users under 18. We do not knowingly collect data from children.

9. DATA RETENTION
We retain data as long as necessary for services or as required by law.

10. CONTACT US
For any concerns:
Email: support@kirayedar24.com
Website: https://kirayedar24.com

© 2024 Kirayedar24. All rights reserved.`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#f39c12" translucent={false} />
      
      {/* Header */}
      <LinearGradient
        colors={['#f39c12', '#d35400']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Terms & Privacy Policy</Text>
        
        <View style={styles.backButton} />
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.contentText}>{termsContent}</Text>
      </ScrollView>

      {/* Bottom Acceptance */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && (
              <Icon name="checkmark" size={18} color="#fff" />
            )}
          </View>
          <Text style={styles.checkboxText}>
            I accept the Terms & Conditions and Privacy Policy (Optional)
          </Text>
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          style={[styles.acceptButton, !accepted && styles.acceptButtonSecondary]}
          onPress={handleAccept}
          activeOpacity={0.85}
        >
          <Text style={[styles.acceptButtonText, !accepted && styles.acceptButtonSecondaryText]}>
            {accepted ? 'Agree & Continue' : 'Continue Reading'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TermsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEEE9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EFEEE9',
    borderBottomWidth: 1,
    borderBottomColor: '#D8D5CB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEEE9',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    shadowColor: '#1E293B',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#626B78',
    backgroundColor: '#EFEEE9',
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
  },
  bottomContainer: {
    backgroundColor: '#EFEEE9',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1.5,
    borderTopColor: '#D8D5CB',
    elevation: 6,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E5E3DC',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#D3D0C6',
    borderLeftColor: '#D3D0C6',
    borderBottomColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#FDB022',
    borderColor: '#D97706',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '600',
    lineHeight: 18,
  },
  acceptButton: {
    borderRadius: 14,
    backgroundColor: '#FDB022',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#FDE68A',
    borderLeftColor: '#FDE68A',
    borderBottomColor: '#D97706',
    borderRightColor: '#D97706',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    minHeight: 50,
  },
  acceptButtonSecondary: {
    backgroundColor: '#EFEEE9',
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  acceptButtonSecondaryText: {
    color: '#626B78',
  },
});
