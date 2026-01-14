import type { EyelidState } from '../types';

/**
 * Resolve eyelid state based on proximity and current conditions.
 *
 * Considers:
 * - Poke/blinking states (block changes)
 * - Cursor proximity (squintingLight)
 * - Explicit squinting (from form focus)
 */
export function resolveEyelidFromProximity(params: {
  current: EyelidState;
  isPoked: boolean;
  isBlinking: boolean;
  isCursorClose: boolean;
  isExplicitlySquinting: boolean;
}): EyelidState {
  const { current, isPoked, isBlinking, isCursorClose, isExplicitlySquinting } = params;

  if (isPoked || isBlinking) {
    return current;
  }

  if (isCursorClose) {
    if (!isExplicitlySquinting && current !== 'squinting' && current !== 'squintingLight') {
      return 'squintingLight';
    }
    return current;
  }

  if (!isExplicitlySquinting && (current === 'squinting' || current === 'squintingLight')) {
    return 'open';
  }

  return current;
}


