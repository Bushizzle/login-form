import type { MascotState } from '../types';

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

