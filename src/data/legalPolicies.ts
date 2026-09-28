export interface PolicySection {
  id: string;
  title: string;
  content: string[];
}

export interface LegalPolicyDocument {
  title: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  isOfficialApproved: boolean;
  legalReviewNotice: string;
  summary: string;
  sections: PolicySection[];
}

export const LEGAL_VERSIONS = {
  termsVersion: '2.4.0',
  privacyVersion: '2.4.0',
  effectiveDate: 'September 1, 2026',
  lastUpdated: 'September 24, 2026',
};

export const TERMS_AND_CONDITIONS_DATA: LegalPolicyDocument = {
  title: 'Terms & Conditions',
  version: LEGAL_VERSIONS.termsVersion,
  effectiveDate: LEGAL_VERSIONS.effectiveDate,
  lastUpdated: LEGAL_VERSIONS.lastUpdated,
  isOfficialApproved: false, // Clearly marked placeholder/review status
  legalReviewNotice:
    'REVIEW DRAFT: This document represents the current operational terms for Kirayedar24 platform users. Official legal sign-off is maintained by Kirayedar24 Legal & Compliance.',
  summary:
    'These Terms & Conditions govern your access to and use of the Kirayedar24 mobile application, websites, and property-related technology services.',
  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: [
        'By creating an account, browsing listings, or using any services provided by Kirayedar24 ("we", "our", "us"), you agree to be bound by these Terms and Conditions and our Privacy Policy.',
        'If you do not agree to these terms, you must not proceed with account creation or access our platform services.',
        'Users must be at least 18 years of age or the age of legal majority in their jurisdiction to register and enter into rental contracts.',
      ],
    },
    {
      id: 'user-roles',
      title: '2. User Accounts & Multi-Role Responsibilities',
      content: [
        'Kirayedar24 supports accounts for Tenants/Buyers and Property Owners/Landlords. You agree to provide true, accurate, current, and complete registration information.',
        'You are responsible for maintaining the confidentiality of your login credentials and OTP codes. You accept full responsibility for all activities that occur under your account.',
        'Owners and landlords warrant that they possess lawful title, authority, or valid power of attorney to list, lease, or sell the advertised properties.',
      ],
    },
    {
      id: 'zero-brokerage',
      title: '3. Direct Marketplace & Zero-Brokerage Model',
      content: [
        'Kirayedar24 operates as an online marketplace connecting property seekers directly with verified property owners and certified service partners.',
        'We do not act as a real estate broker or property manager unless explicitly stated under a specialized managed-living agreement.',
        'Users agree not to charge unsolicited middleman commissions or broker fees on verified direct-owner listings.',
      ],
    },
    {
      id: 'listing-audits',
      title: '4. Physical Audit & Listing Verification',
      content: [
        'While Kirayedar24 conducts digital checks, document audits, and geolocation tagging for verified properties, tenants and buyers are advised to physically inspect properties and review title deeds before signing lease agreements.',
        'Submitting fraudulent, duplicate, or misrepresentative property listings is strictly prohibited and results in immediate account suspension and blacklisting.',
      ],
    },
    {
      id: 'payments',
      title: '5. Rental Payments, Invoices & HRA Receipts',
      content: [
        'All payment transactions processed through the Kirayedar24 platform utilize 256-bit bank-grade encryption via certified payment gateway partners.',
        'Digital rent receipts and payment confirmations generated through the app are legally compliant for HRA income tax claim submissions in India.',
        'Kirayedar24 is not liable for offline cash transactions conducted outside the platform.',
      ],
    },
    {
      id: 'cancellation',
      title: '6. Home Services & Cancellation Policy',
      content: [
        'Ancillary services including Packers & Movers, Deep Cleaning, and Painting are fulfilled by certified third-party service partners.',
        'Cancellations made at least 24 hours prior to scheduled appointment times are eligible for full refunds.',
      ],
    },
    {
      id: 'liability',
      title: '7. Limitation of Liability & Disclaimers',
      content: [
        'The Kirayedar24 platform and services are provided on an "as is" and "as available" basis without warranties of any kind.',
        'To the maximum extent permitted by applicable Indian law, Kirayedar24 shall not be liable for indirect, incidental, punitive, or consequential damages arising from property lease disputes between tenants and owners.',
      ],
    },
    {
      id: 'governing-law',
      title: '8. Governing Law & Dispute Resolution',
      content: [
        'These Terms shall be governed by and construed in accordance with the laws of India.',
        'Any dispute, controversy, or claim arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.',
      ],
    },
  ],
};

export const PRIVACY_POLICY_DATA: LegalPolicyDocument = {
  title: 'Privacy Policy',
  version: LEGAL_VERSIONS.privacyVersion,
  effectiveDate: LEGAL_VERSIONS.effectiveDate,
  lastUpdated: LEGAL_VERSIONS.lastUpdated,
  isOfficialApproved: false, // Clearly marked placeholder/review status
  legalReviewNotice:
    'REVIEW DRAFT: This privacy policy outlines data handling practices for Kirayedar24 under the Digital Personal Data Protection Act (DPDPA). Official legal sign-off is maintained by Kirayedar24 Data Governance.',
  summary:
    'Your privacy is vital to us. This policy details what personal data we collect, how we secure it, and how your contact information is shared exclusively with verified parties.',
  sections: [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content: [
        'Personal Information: Full name, phone number, email address, role selection (Buyer/Tenant or Owner/Landlord), and profile pictures.',
        'Property & Transaction Details: Listing addresses, floor plans, rent amounts, security deposits, and booking invoice history.',
        'Device & Usage Data: IP address, device model, operating system version, and app interaction logs for fraud prevention.',
        'Consent Records: Exact policy version accepted, marketing opt-in preference, and server-authoritative acceptance timestamps.',
      ],
    },
    {
      id: 'usage',
      title: '2. How We Use Your Information',
      content: [
        'To authenticate user identities and verify accounts through 6-digit OTP verification.',
        'To connect buyers and tenants directly with property owners upon explicit inquiry or visit scheduling.',
        'To generate digital rent receipts, tenancy contracts, and HRA tax documentation.',
        'To send essential transaction notifications, appointment reminders, and security alerts.',
        'To deliver optional promotional offers and platform updates only when marketing consent has been explicitly granted.',
      ],
    },
    {
      id: 'sharing',
      title: '3. Contact Masking & Information Sharing',
      content: [
        'We do NOT sell, rent, or trade your personal contact information to third-party data brokers or advertisers.',
        'Owners and tenants only receive direct contact coordinates once an inquiry is actively initiated and accepted.',
        'Users can enable phone number masking in Settings → Privacy & Security for enhanced anonymity.',
      ],
    },
    {
      id: 'security',
      title: '4. Data Security & Encryption Standards',
      content: [
        'All data in transit is protected using TLS 1.3 encryption, and data at rest is secured using AES-256 bit encryption protocols.',
        'Server infrastructure complies with ISO/IEC 27001 security standards and local Indian data residency regulations.',
      ],
    },
    {
      id: 'user-rights',
      title: '5. Your Rights & Data Portability',
      content: [
        'Access & Export: You can request a full machine-readable archive of your personal data via Settings → Privacy & Security.',
        'Correction & Erasure: You have the right to correct inaccurate profile details or request permanent account deletion at any time.',
        'Withdrawal of Consent: You may opt out of optional marketing communications at any time without impacting your core platform access.',
      ],
    },
    {
      id: 'contact-dpo',
      title: '6. Grievance Officer & Contact',
      content: [
        'If you have questions regarding this Privacy Policy or wish to exercise your data rights, please contact our Data Protection Officer at privacy@kirayedar24.com or through the in-app Help Center.',
        'Kirayedar24 Technologies Pvt. Ltd., Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103, India.',
      ],
    },
  ],
};
