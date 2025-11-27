/**
 * Client-side Tier Utilities
 *
 * Provides helper functions for client components to detect and display
 * user plan information using Clerk's `has()` method from hooks.
 */

import type { PlanName } from "./tier-config";

/**
 * Get user's current plan using Clerk's has() function
 * 
 * @param hasFunction - The `has` function from useAuth() or useUser()
 * @returns Current plan name
 */
export function getCurrentPlan(
  hasFunction?: ((params: { plan?: string }) => boolean) | null
): PlanName {
  if (!hasFunction) return "free";
  
  if (hasFunction({ plan: "ultra" })) {
    return "ultra";
  }
  if (hasFunction({ plan: "pro" })) {
    return "pro";
  }
  return "free";
}

/**
 * Get the recommended upgrade plan for the current user
 * 
 * @param hasFunction - The `has` function from useAuth() or useUser()
 * @returns Recommended upgrade plan name or null if already on Ultra
 */
export function getUpgradePlan(
  hasFunction?: ((params: { plan?: string }) => boolean) | null
): PlanName | null {
  const currentPlan = getCurrentPlan(hasFunction);
  
  if (currentPlan === "free") return "pro";
  if (currentPlan === "pro") return "ultra";
  return null; // Already on Ultra
}

/**
 * Get upgrade CTA text based on current plan
 * 
 * @param hasFunction - The `has` function from useAuth() or useUser()
 * @returns CTA button text
 */
export function getUpgradeCTA(
  hasFunction?: ((params: { plan?: string }) => boolean) | null
): string {
  const upgradePlan = getUpgradePlan(hasFunction);
  
  if (upgradePlan === "pro") return "Upgrade to Pro";
  if (upgradePlan === "ultra") return "Upgrade to Ultra";
  return "Ultra Plan"; // Already on Ultra
}

