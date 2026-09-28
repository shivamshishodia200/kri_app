export type ConsentSubmissionResult<T> =
  | { accepted: false }
  | { accepted: true; result: T };

export async function submitWithRequiredConsent<T>(
  accepted: boolean,
  submit: () => T | Promise<T>,
): Promise<ConsentSubmissionResult<T>> {
  if (!accepted) return { accepted: false };
  return { accepted: true, result: await submit() };
}