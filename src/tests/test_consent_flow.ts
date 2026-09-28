import { authBackendService } from '../services/authBackendService';
import { policyService } from '../services/policyService';
import { submitWithRequiredConsent } from '../services/consentSubmission';
import { LEGAL_VERSIONS } from '../data/legalPolicies';


async function runTests() {
  console.log('=== STARTING KIRAYEDAR24 LEGAL CONSENT FLOW TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. Policy Service Tests
  console.log('--- 1. Policy Service & Versions ---');
  const termsDoc = await policyService.getTermsAndConditions();
  assert(
    termsDoc.version === LEGAL_VERSIONS.termsVersion && termsDoc.sections.length > 0,
    'Terms & Conditions document loaded with correct version & structured sections'
  );

  const privacyDoc = await policyService.getPrivacyPolicy();
  assert(
    privacyDoc.version === LEGAL_VERSIONS.privacyVersion && privacyDoc.sections.length > 0,
    'Privacy Policy document loaded with correct version & structured sections'
  );

  assert(
    termsDoc.isOfficialApproved === false && Boolean(termsDoc.legalReviewNotice),
    'Policy text is clearly marked as review draft pending corporate legal sign-off'
  );

  // 2. Signup without required consent
  console.log('\n--- 2. Signup Validation & Rejection ---');
  let signupApiCalls = 0;
  const blockedSubmission = await submitWithRequiredConsent(false, async () => {
    signupApiCalls++;
    return authBackendService.initiateSignup({
      name: 'Amit Patel',
      email: 'amit@example.com',
      phone: '9988776655',
      role: 'buyer',
      consent: {
        termsAccepted: true,
        termsVersion: LEGAL_VERSIONS.termsVersion,
        privacyAccepted: true,
        privacyVersion: LEGAL_VERSIONS.privacyVersion,
      },
    });
  });
  assert(
    blockedSubmission.accepted === false && signupApiCalls === 0,
    'Signup without consent is blocked before the signup API is called'
  );

  const rejectRes1 = await authBackendService.initiateSignup({
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '9988776655',
    role: 'buyer',
    consent: {
      termsAccepted: false, // NOT ACCEPTED
      termsVersion: LEGAL_VERSIONS.termsVersion,
      privacyAccepted: true,
      privacyVersion: LEGAL_VERSIONS.privacyVersion,
    },
  });
  assert(
    rejectRes1.success === false && Boolean(rejectRes1.error),
    'Signup rejected on backend when termsAccepted is false'
  );

  const rejectRes2 = await authBackendService.initiateSignup({
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '9988776655',
    role: 'buyer',
    consent: {
      termsAccepted: true,
      termsVersion: '1.0.0-outdated', // VERSION MISMATCH
      privacyAccepted: true,
      privacyVersion: LEGAL_VERSIONS.privacyVersion,
    },
  });
  assert(
    rejectRes2.success === false && Boolean(rejectRes2.error),
    'Signup rejected on backend when consent version is outdated/mismatched'
  );

  // 3. Valid Signup with Legal Consent & Server-Generated Timestamp
  console.log('\n--- 3. Valid Signup & Pending Registration ---');
  const validSignupSubmission = await submitWithRequiredConsent(true, () => {
    signupApiCalls++;
    return authBackendService.initiateSignup({
      name: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      phone: '9876543219',
      role: 'owner',
      consent: {
        termsAccepted: true,
        termsVersion: LEGAL_VERSIONS.termsVersion,
        privacyAccepted: true,
        privacyVersion: LEGAL_VERSIONS.privacyVersion,
        marketingOptIn: true,
      },
    });
  });
  const validSignupRes = validSignupSubmission.accepted
    ? validSignupSubmission.result
    : { success: false };
  assert(
    validSignupSubmission.accepted && validSignupRes.success === true && signupApiCalls === 1,
    'Valid signup with full consent calls the signup API and creates pending registration'
  );

  const retryForm = {
    name: 'Pooja Sharma',
    email: 'pooja.sharma@example.com',
    phone: '9876543219',
    password: 'password123',
    termsAccepted: true,
  };
  const retryFormSnapshot = JSON.stringify(retryForm);
  let signupFailureReachedCaller = false;
  try {
    await submitWithRequiredConsent(retryForm.termsAccepted, async () => {
      throw new Error('Simulated signup API failure');
    });
  } catch {
    signupFailureReachedCaller = true;
  }
  assert(
    signupFailureReachedCaller && JSON.stringify(retryForm) === retryFormSnapshot,
    'A failed signup attempt leaves caller-owned form values and consent available for retry'
  );

  // 4. Resend OTP preserves pending registration & consent
  console.log('\n--- 4. OTP Resend Flow ---');
  const resendRes = await authBackendService.resendOtp('9876543219');
  assert(
    resendRes.success === true,
    'Resending OTP preserves the pending registration and accepted consent without requiring re-prompt'
  );

  // 5. OTP Verification & Account Activation
  console.log('\n--- 5. OTP Verification & Account Activation ---');
  // 5a. Bad OTP
  const badOtpRes = await authBackendService.verifySignupOtp('9876543219', '123');
  assert(badOtpRes.success === false, 'Invalid/Incomplete OTP does not activate account');

  // 5b. Good OTP
  const goodOtpRes = await authBackendService.verifySignupOtp('9876543219', '248900');
  assert(
    goodOtpRes.success === true && Boolean(goodOtpRes.user),
    'Valid OTP activates account successfully'
  );

  const user = goodOtpRes.user!;
  assert(user.role === 'owner', 'User role preserved as Owner / Landlord');
  assert(
    user.legalConsent?.termsAccepted === true &&
      user.legalConsent?.privacyAccepted === true &&
      user.legalConsent?.termsVersion === LEGAL_VERSIONS.termsVersion &&
      user.legalConsent?.privacyVersion === LEGAL_VERSIONS.privacyVersion &&
      user.legalConsent?.marketingOptIn === true &&
      Boolean(user.legalConsent?.acceptedAt),
    'In-memory simulated user record contains consent versions, a service timestamp, and opt-ins'
  );

  // 6. Existing User Login
  console.log('\n--- 6. Existing User Login ---');
  let loginApiCalls = 0;
  const deniedEmailLogin = await submitWithRequiredConsent(false, () => {
    loginApiCalls++;
    return authBackendService.login('pooja.sharma@example.com', 'owner');
  });
  const deniedPhoneLogin = await submitWithRequiredConsent(false, () => {
    loginApiCalls++;
    return authBackendService.login('9876543219', 'owner');
  });
  assert(
    !deniedEmailLogin.accepted && !deniedPhoneLogin.accepted && loginApiCalls === 0,
    'Unchecked consent blocks both email and phone login requests'
  );

  const allowedEmailLogin = await submitWithRequiredConsent(true, () =>
    authBackendService.login('pooja.sharma@example.com', 'owner')
  );
  const allowedPhoneLogin = await submitWithRequiredConsent(true, () =>
    authBackendService.login('9876543219', 'owner')
  );
  assert(
    allowedEmailLogin.accepted && allowedEmailLogin.result.success &&
      allowedPhoneLogin.accepted && allowedPhoneLogin.result.success,
    'Accepted consent allows email and phone login requests to continue'
  );

  const loginRes = await authBackendService.login('pooja.sharma@example.com', 'owner');
  assert(
    loginRes.success === true && loginRes.user?.id === user.id,
    'Existing user login functions smoothly without re-prompting signup consent'
  );

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
