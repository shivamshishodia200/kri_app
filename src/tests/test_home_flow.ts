import { INITIAL_PROPERTIES } from '../mock/propertiesData';
import {
  persistFavoriteToggle,
  propertyService,
} from '../services/propertyService';
import { isSubscriptionActive } from '../services/subscriptionService';
import { SubscriptionPlan } from '../types/booking';

async function runHomeFlowTests() {
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, label: string) => {
    if (condition) {
      console.log(`PASS: ${label}`);
      passed++;
    } else {
      console.error(`FAIL: ${label}`);
      failed++;
    }
  };

  const publicProperties = await propertyService.getProperties();
  assert(
    publicProperties.length === INITIAL_PROPERTIES.length &&
      publicProperties.every((property) =>
        !property.owner.phone && !property.owner.whatsapp && !property.owner.email
      ),
    'Public mock property reads redact owner phone, WhatsApp and email'
  );

  const demoOwnerProperties = await propertyService.getUserProperties(
    'usr-default-101',
    publicProperties
  );
  assert(
    demoOwnerProperties.length > 0 &&
      demoOwnerProperties.every((property) => property.status !== 'published'),
    'Demo owner listings load but unverified fixture publication is shown as under review'
  );

  const locallyAddedProperty = {
    ...publicProperties[0],
    id: 'local-owner-listing',
    owner: { ...publicProperties[0].owner, id: 'usr-current-user' },
    status: 'under_review' as const,
  };
  const demoOwnerWithNewListing = await propertyService.getUserProperties(
    'usr-default-101',
    [...publicProperties, locallyAddedProperty]
  );
  assert(
    demoOwnerWithNewListing.some((property) => property.id === 'local-owner-listing'),
    'Seeded owner can see listings created locally under the current-user identity'
  );

  const unknownOwnerProperties = await propertyService.getUserProperties('unknown-user', publicProperties);
  assert(unknownOwnerProperties.length === 0, 'Unknown user has no owner listings');

  const anotherOwnerProperty = {
    ...publicProperties[0],
    id: 'another-owner-listing',
    owner: { ...publicProperties[0].owner, id: 'owner-account-456' },
    status: 'under_review' as const,
  };
  const anotherOwnerProperties = await propertyService.getUserProperties(
    'owner-account-456',
    [...publicProperties, anotherOwnerProperty]
  );
  assert(
    anotherOwnerProperties.length === 1 && anotherOwnerProperties[0].id === 'another-owner-listing',
    'Owner property loading supports non-demo account IDs without cross-account leakage'
  );

  const entitlement = await propertyService.checkContactEntitlement('prop-1');
  assert(!entitlement.allowed, 'Contact unlock fails closed without backend entitlement');

  let favoriteSaved = true;
  let favoriteApiCalls = 0;
  const failedFavorite = await persistFavoriteToggle(
    'prop-1',
    favoriteSaved,
    (saved) => { favoriteSaved = saved; },
    async () => {
      favoriteApiCalls++;
      throw new Error('Simulated favorite API outage');
    }
  );
  assert(
    !failedFavorite && favoriteApiCalls === 1 && favoriteSaved,
    'Favorite API failure rolls optimistic removal back to the saved state'
  );

  let savedFromSuccess = false;
  const successfulFavorite = await persistFavoriteToggle(
    'prop-2',
    false,
    (saved) => { savedFromSuccess = saved; },
    async (_id, saved) => { savedFromSuccess = saved; }
  );
  assert(successfulFavorite && savedFromSuccess, 'Successful favorite request leaves property saved');

  const fixedNow = Date.parse('2026-09-28T12:00:00.000Z');
  const plan: SubscriptionPlan = {
    id: 'sub-test',
    name: 'Demo plan',
    tagline: 'Test fixture',
    price: 1,
    billingPeriod: 'monthly',
    listingLimit: 1,
    features: [],
  };
  assert(!isSubscriptionActive(plan, fixedNow), 'Owner listing plan without server expiry is inactive');
  assert(
    !isSubscriptionActive({ ...plan, expiresAt: '2026-09-28T11:59:59.000Z' }, fixedNow),
    'Expired owner listing subscription is inactive'
  );
  assert(
    isSubscriptionActive({ ...plan, expiresAt: '2026-09-29T12:00:00.000Z' }, fixedNow),
    'Owner listing subscription with future expiry is active'
  );
  assert(
    !isSubscriptionActive({ ...plan, expiresAt: 'not-a-date' }, fixedNow),
    'Invalid subscription expiry fails closed'
  );

  console.log(`HOME FLOW SUMMARY: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runHomeFlowTests().catch((error) => {
  console.error(error);
  process.exit(1);
});