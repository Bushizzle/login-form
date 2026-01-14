import type { TimerBag } from '../timers/TimerBag';

export interface PointerIdleParams {
  timers: TimerBag;
  idleKey: 'pointerIdle';
  idleThresholdMs: number;
  lastMoveAt: { value: number };
  isIdle: { value: boolean };
  onExitIdle: () => void;
  onEnterIdle: () => void;
}

/**
 * Handle pointer activity and manage idle state.
 */
export function onPointerActivity(params: PointerIdleParams): void {
  const {
    timers,
    idleKey,
    idleThresholdMs,
    lastMoveAt,
    isIdle,
    onExitIdle,
    onEnterIdle,
  } = params;

  lastMoveAt.value = Date.now();

  if (isIdle.value) {
    isIdle.value = false;
    timers.clear(idleKey);
    onExitIdle();
  }

  timers.clear(idleKey);
  timers.set(idleKey, () => {
    const dt = Date.now() - lastMoveAt.value;
    if (dt >= idleThresholdMs && !isIdle.value) {
      isIdle.value = true;
      onEnterIdle();
    }
  }, idleThresholdMs);
}

