import type { MascotConfig } from '../../model/types';

/**
 * Resolve runtime configuration by detecting user preferences.
 */
export function resolveRuntimeConfig(base: Required<MascotConfig>): Required<MascotConfig> {
  let reducedMotion = base.reducedMotion;
  let isTouchDevice = base.isTouchDevice;

  if (!reducedMotion && typeof window !== 'undefined' && window.matchMedia) {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  if (!isTouchDevice && typeof window !== 'undefined') {
    isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - msMaxTouchPoints is IE-specific
      (navigator.msMaxTouchPoints ?? 0) > 0;
  }

  return { ...base, reducedMotion, isTouchDevice };
}

