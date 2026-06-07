import { addDays, isAfter } from "date-fns";

const GRACE_PERIOD_DAYS = 7;

/** Returns the date when the grace period ends (expiresAt + 7 days). */
export function calculateGracePeriodEnd(expiresAt: Date): Date {
  return addDays(expiresAt, GRACE_PERIOD_DAYS);
}

/**
 * Returns whether we're currently in the grace period:
 * expiresAt has passed, but gracePeriodEndsAt has not.
 */
export function isInGracePeriod(expiresAt: Date): boolean {
  const now = new Date();
  const graceEnd = calculateGracePeriodEnd(expiresAt);
  return isAfter(now, expiresAt) && !isAfter(now, graceEnd);
}

/**
 * Returns whether a license with the given status/dates allows access.
 * - active → always valid
 * - expired → valid only during grace period
 * - suspended / not_found → never valid
 */
export function computeValid(status: string, expiresAt: Date | null): boolean {
  if (status === "active") return true;
  if (status === "expired" && expiresAt && isInGracePeriod(expiresAt))
    return true;
  return false;
}
