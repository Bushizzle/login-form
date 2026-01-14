import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GlanceScheduler, type GlanceDeps } from '../model/schedulers/glance/GlanceScheduler';
import { TimerBag } from '../infra/timers';

describe('GlanceScheduler', () => {
  let timers: TimerBag;
  let deps: GlanceDeps;

  beforeEach(() => {
    vi.useFakeTimers();
    timers = new TimerBag();

    deps = {
      timers,
      reducedMotion: () => false,
      isTouchDevice: () => false,
      isVeryClose: () => false,
      isPoked: () => false,
      isGlancing: () => false,
      isCursorIdle: () => false,
      isCursorClose: () => false,
      getPosition: () => ({ x: 5, y: 5 }),
      setPosition: vi.fn(),
      getLastPointerPosition: () => null,
      setLastPointerPosition: vi.fn(),
      setGlancing: vi.fn(),
      requestRender: vi.fn(),
      randomDelay: (min: number, max: number) => (min + max) / 2,
      delays: {
        durationMin: 500,
        durationMax: 1000,
        idleMin: 2000,
        idleMax: 3000,
        closeMin: 1000,
        closeMax: 2000,
        farMin: 6000,
        farMax: 10000,
      },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('start', () => {
    it('should schedule next glance', () => {
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      expect(timers.has('randomGlance')).toBe(true);
    });

    it('should not schedule if reducedMotion is enabled', () => {
      deps.reducedMotion = () => true;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      expect(timers.has('randomGlance')).toBe(false);
    });

    it('should not schedule if touch device', () => {
      deps.isTouchDevice = () => true;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      expect(timers.has('randomGlance')).toBe(false);
    });

    it('should not schedule if very close', () => {
      deps.isVeryClose = () => true;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      expect(timers.has('randomGlance')).toBe(false);
    });
  });

  describe('stop', () => {
    it('should clear all timers', () => {
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();
      scheduler.stop();

      expect(timers.has('randomGlance')).toBe(false);
      expect(timers.has('glanceHold')).toBe(false);
    });
  });

  describe('reschedule', () => {
    it('should clear and reschedule', () => {
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();
      scheduler.reschedule();

      expect(timers.has('randomGlance')).toBe(true);
    });
  });

  describe('computeDelay', () => {
    it('should use idle delay when cursor is idle', () => {
      deps.isCursorIdle = () => true;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      vi.advanceTimersByTime(2500);
      expect(deps.setPosition).toHaveBeenCalled();
    });

    it('should use close delay when cursor is close', () => {
      deps.isCursorClose = () => true;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      vi.advanceTimersByTime(1500);
      expect(deps.setPosition).toHaveBeenCalled();
    });

    it('should use far delay when cursor is far', () => {
      deps.isCursorIdle = () => false;
      deps.isCursorClose = () => false;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      vi.advanceTimersByTime(8000);
      expect(deps.setPosition).toHaveBeenCalled();
    });
  });

  describe('glanceAtCenter', () => {
    it('should glance at center when scheduled', () => {
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      vi.advanceTimersByTime(8000);

      expect(deps.setGlancing).toHaveBeenCalledWith(true);
      expect(deps.setPosition).toHaveBeenCalledWith({ x: 0, y: 0 });
      expect(deps.requestRender).toHaveBeenCalled();
    });

    it('should not glance if already glancing', () => {
      deps.isGlancing = () => true;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      vi.advanceTimersByTime(8000);

      expect(deps.setGlancing).not.toHaveBeenCalled();
    });

    it('should not glance if poked', () => {
      deps.isPoked = () => true;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      vi.advanceTimersByTime(8000);

      expect(deps.setGlancing).not.toHaveBeenCalled();
    });

    it('should save position before glancing', () => {
      deps.getLastPointerPosition = () => null;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      vi.advanceTimersByTime(8000);

      expect(deps.setLastPointerPosition).toHaveBeenCalledWith({ x: 5, y: 5 });
    });

    it('should restore position after glance', () => {
      const savedPosition = { x: 10, y: 10 };
      deps.getLastPointerPosition = () => savedPosition;
      const scheduler = new GlanceScheduler(deps);
      scheduler.start();

      vi.advanceTimersByTime(8000);
      vi.advanceTimersByTime(750);

      expect(deps.setGlancing).toHaveBeenCalledWith(false);
      expect(deps.setPosition).toHaveBeenCalledWith(savedPosition);
    });
  });
});

