'use client';

import { useReducedMotion } from 'framer-motion';

/**
 * Hook that returns whether reduced motion is preferred, with optional override for tests
 * @param reducedMotionOverride - Force reduced motion state (useful for testing)
 * @returns boolean indicating if reduced motion is preferred
 */
export function useReduced(reducedMotionOverride?: boolean): boolean {
  const prefersReducedMotion = useReducedMotion();

  // Override takes precedence for deterministic testing
  if (reducedMotionOverride !== undefined) {
    return reducedMotionOverride;
  }

  return prefersReducedMotion ?? false;
}
