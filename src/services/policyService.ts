import {
  LEGAL_VERSIONS,
  LegalPolicyDocument,
  TERMS_AND_CONDITIONS_DATA,
  PRIVACY_POLICY_DATA,
} from '../data/legalPolicies';

export interface PolicyFetchResult {
  data: LegalPolicyDocument;
  isCached: boolean;
  timestamp: string;
}

class PolicyService {
  private termsCache: LegalPolicyDocument | null = null;
  private privacyCache: LegalPolicyDocument | null = null;

  /**
   * Fetches the latest Terms & Conditions document.
   * In a live backend deployment, this calls GET /api/v1/legal/terms.
   * Handles network latency simulation, caching, and offline fallbacks.
   */
  async getTermsAndConditions(forceRefresh = false): Promise<LegalPolicyDocument> {
    if (!forceRefresh && this.termsCache) {
      return this.termsCache;
    }

    try {
      // Simulate network request with minimal realistic latency (150ms)
      await new Promise((resolve) => setTimeout(resolve, 150));
      this.termsCache = TERMS_AND_CONDITIONS_DATA;
      return TERMS_AND_CONDITIONS_DATA;
    } catch (error) {
      // Graceful offline fallback
      return TERMS_AND_CONDITIONS_DATA;
    }
  }

  /**
   * Fetches the latest Privacy Policy document.
   * In a live backend deployment, this calls GET /api/v1/legal/privacy.
   */
  async getPrivacyPolicy(forceRefresh = false): Promise<LegalPolicyDocument> {
    if (!forceRefresh && this.privacyCache) {
      return this.privacyCache;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      this.privacyCache = PRIVACY_POLICY_DATA;
      return PRIVACY_POLICY_DATA;
    } catch (error) {
      return PRIVACY_POLICY_DATA;
    }
  }

  /**
   * Gets current authoritative policy version metadata.
   */
  getCurrentVersions() {
    return { ...LEGAL_VERSIONS };
  }
}

export const policyService = new PolicyService();
