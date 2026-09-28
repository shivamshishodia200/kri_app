import { SubscriptionPlan } from '../types/booking';

export function isSubscriptionActive(
  plan: SubscriptionPlan | null | undefined,
  now = Date.now(),
): boolean {
  if (!plan?.expiresAt) return false;
  const expiry = Date.parse(plan.expiresAt);
  return Number.isFinite(expiry) && expiry > now;
}