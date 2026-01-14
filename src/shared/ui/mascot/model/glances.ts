import type { EyePosition } from './types';
import type { TimerBag } from './timers';

export interface GlanceDelays {
  durationMin: number;
  durationMax: number;
  idleMin: number;
  idleMax: number;
  closeMin: number;
  closeMax: number;
  farMin: number;
  farMax: number;
}

export interface GlanceDeps {
  timers: TimerBag;
  reducedMotion: () => boolean;
  isTouchDevice: () => boolean;
  isVeryClose: () => boolean;
  isPoked: () => boolean;
  isGlancing: () => boolean;
  isCursorIdle: () => boolean;
  isCursorClose: () => boolean;
  getPosition: () => EyePosition;
  setPosition: (pos: EyePosition) => void;
  getLastPointerPosition: () => EyePosition | null;
  setLastPointerPosition: (pos: EyePosition | null) => void;
  setGlancing: (value: boolean) => void;
  requestRender: () => void;
  randomDelay: (min: number, max: number) => number;
  delays: GlanceDelays;
}

export class GlanceScheduler {
  constructor(private d: GlanceDeps) {}

  start(): void {
    this.scheduleNext();
  }

  stop(): void {
    this.d.timers.clear('randomGlance');
    this.d.timers.clear('glanceHold');
  }

  reschedule(): void {
    this.d.timers.clear('randomGlance');
    this.scheduleNext();
  }

  private scheduleNext(): void {
    if (this.d.reducedMotion() || this.d.isTouchDevice()) {
      return;
    }

    if (this.d.isVeryClose()) {
      return;
    }

    const delay = this.computeDelay();

    this.d.timers.set(
      'randomGlance',
      () => {
        if (!this.d.isPoked() && !this.d.isGlancing()) {
          this.glanceAtCenter();
        }
        this.scheduleNext();
      },
      delay
    );
  }

  private computeDelay(): number {
    const { delays, randomDelay } = this.d;

    if (this.d.isCursorIdle()) {
      return randomDelay(delays.idleMin, delays.idleMax);
    }

    if (this.d.isCursorClose()) {
      return randomDelay(delays.closeMin, delays.closeMax);
    }

    return randomDelay(delays.farMin, delays.farMax);
  }

  private glanceAtCenter(): void {
    if (this.d.isGlancing() || this.d.reducedMotion() || this.d.isTouchDevice()) {
      return;
    }

    if (!this.d.getLastPointerPosition()) {
      this.d.setLastPointerPosition({ ...this.d.getPosition() });
    }

    this.d.setGlancing(true);
    this.d.setPosition({ x: 0, y: 0 });
    this.d.requestRender();

    const { delays, randomDelay } = this.d;
    const duration = randomDelay(delays.durationMin, delays.durationMax);

    this.d.timers.set('glanceHold', () => {
      this.d.setGlancing(false);

      const back = this.d.getLastPointerPosition();
      if (back) {
        this.d.setPosition(back);
        this.d.requestRender();
      }
    }, duration);
  }
}
