import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { onPointerActivity } from '../infra/pointer';
import { TimerBag } from '../infra/timers';

describe('onPointerActivity', () => {
  let timers: TimerBag;
  let lastMoveAt: { value: number };
  let isIdle: { value: boolean };
  let onExitIdle: ReturnType<typeof vi.fn>;
  let onEnterIdle: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    timers = new TimerBag();
    lastMoveAt = { value: Date.now() };
    isIdle = { value: false };
    onExitIdle = vi.fn();
    onEnterIdle = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should update lastMoveAt timestamp', () => {
    const initialTime = Date.now();
    lastMoveAt.value = initialTime;

    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    expect(lastMoveAt.value).toBeGreaterThanOrEqual(initialTime);
  });

  it('should exit idle state and call onExitIdle when currently idle', () => {
    isIdle.value = true;

    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    expect(isIdle.value).toBe(false);
    expect(onExitIdle).toHaveBeenCalledTimes(1);
  });

  it('should not call onExitIdle when not idle', () => {
    isIdle.value = false;

    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    expect(onExitIdle).not.toHaveBeenCalled();
  });

  it('should schedule idle detection timer', () => {
    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    expect(timers.has('pointerIdle')).toBe(true);
  });

  it('should enter idle state and call onEnterIdle after threshold', () => {
    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    vi.advanceTimersByTime(1000);

    expect(isIdle.value).toBe(true);
    expect(onEnterIdle).toHaveBeenCalledTimes(1);
  });

  it('should not enter idle if pointer moves again before threshold', () => {
    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    vi.advanceTimersByTime(500);

    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    vi.advanceTimersByTime(500);

    expect(isIdle.value).toBe(false);
    expect(onEnterIdle).not.toHaveBeenCalled();
  });

  it('should clear existing timer before setting new one', () => {
    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    expect(timers.has('pointerIdle')).toBe(true);

    onPointerActivity({
      timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: 1000,
      lastMoveAt,
      isIdle,
      onExitIdle,
      onEnterIdle,
    });

    expect(timers.has('pointerIdle')).toBe(true);
  });
});

