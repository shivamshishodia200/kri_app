import { INITIAL_PROPERTIES } from '../mock/propertiesData';
import { ListingStatus, Property } from '../types/property';

export type ContactEntitlementResult =
  | { allowed: true; phone: string; whatsapp?: string; email?: string }
  | { allowed: false; reason: 'backend_unavailable' | 'not_entitled' };

const mockDelay = (milliseconds = 120) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export const redactPropertyContact = (property: Property): Property => ({
  ...property,
  owner: {
    ...property.owner,
    phone: '',
    whatsapp: undefined,
    email: undefined,
  },
});

export const ownerVisibleStatus = (property: Property): ListingStatus => {
  if (property.approvalSource === 'backend') return property.status;
  return property.status === 'published' ? 'under_review' : property.status;
};

export const propertyService = {
  source: 'mock' as const,

  async getProperties(): Promise<Property[]> {
    await mockDelay();
    return INITIAL_PROPERTIES.map(redactPropertyContact);
  },

  async getUserProperties(userId: string, properties: Property[]): Promise<Property[]> {
    await mockDelay();
    if (!userId) return [];

    const ownerIds = new Set([userId]);
    if (userId === 'usr-default-101') {
      ownerIds.add('owner-101');
      ownerIds.add('usr-current-user');
    }

    return properties
      .filter((property) => ownerIds.has(property.owner.id))
      .map((property) => ({
        ...redactPropertyContact(property),
        status: ownerVisibleStatus(property),
      }));
  },

  async setFavorite(_propertyId: string, _saved: boolean): Promise<void> {
    await mockDelay(80);
  },

  async checkContactEntitlement(_propertyId: string): Promise<ContactEntitlementResult> {
    await mockDelay(80);
    return { allowed: false, reason: 'backend_unavailable' };
  },
};

export async function persistFavoriteToggle(
  propertyId: string,
  wasSaved: boolean,
  applySavedState: (saved: boolean) => void,
  syncFavorite: (id: string, saved: boolean) => Promise<void> = propertyService.setFavorite,
): Promise<boolean> {
  applySavedState(!wasSaved);
  try {
    await syncFavorite(propertyId, !wasSaved);
    return true;
  } catch {
    applySavedState(wasSaved);
    return false;
  }
}