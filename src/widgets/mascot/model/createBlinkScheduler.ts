import { BlinkScheduler } from './blinkScheduler';
import type { TimerBag } from './timers';
import { BLINK_DELAY_MIN_MS, BLINK_DELAY_MAX_MS } from './constants';

export interface BlinkSchedulerDeps {
  timers: TimerBag;
  shouldBlink: () => boolean;
  doBlink: () => void;
  randomDelay: (min: number, max: number) => number;
}

export function createBlinkScheduler(deps: BlinkSchedulerDeps): BlinkScheduler {
  return new BlinkScheduler({
    timers: deps.timers,
    minMs: BLINK_DELAY_MIN_MS,
    maxMs: BLINK_DELAY_MAX_MS,
    shouldBlink: deps.shouldBlink,
    doBlink: deps.doBlink,
    randomDelay: deps.randomDelay,
  });
}

