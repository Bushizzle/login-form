import type { MascotState, EyelidState } from './types';

/**
 * Resolve mascot state considering "very close" override logic.
 *
 * When cursor is very close (< 30px), state is overridden by 'alert'.
 * The requested state is stored and restored when cursor moves away.
 * Exception: 'poke' state always wins.
 */
export function resolveStateWithVeryClose(params: {
  current: MascotState;
  requested: MascotState;
  isVeryClose: boolean;
  previousRequested: MascotState | null;
}): { next: MascotState; previousRequested: MascotState | null } {
  const { current, requested, isVeryClose, previousRequested } = params;

  if (requested === 'poke') {
    return { next: 'poke', previousRequested };
  }

  if (isVeryClose && requested !== 'alert') {
    return { next: current, previousRequested: requested };
  }

  return { next: requested, previousRequested };
}

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

