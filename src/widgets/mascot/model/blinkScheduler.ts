import type { TimerBag } from './timers';

export interface BlinkSchedulerDeps {
  timers: TimerBag;
  minMs: number;
  maxMs: number;
  shouldBlink: () => boolean;
  doBlink: () => void;
  randomDelay: (min: number, max: number) => number;
}

/**
 * Scheduler for random blinking animation.
 */
export class BlinkScheduler {
  constructor(private d: BlinkSchedulerDeps) {}

  start(): void {
    this.scheduleNext();
  }

  stop(): void {
    this.d.timers.clear('randomBlink');
  }

  private scheduleNext(): void {
    const delay = this.d.randomDelay(this.d.minMs, this.d.maxMs);
    this.d.timers.set('randomBlink', () => {
      if (this.d.shouldBlink()) {
        this.d.doBlink();
      }
      this.scheduleNext();
    }, delay);
  }
}

