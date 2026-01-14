import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { startWindowPointerTracking } from '../infra/pointer';

describe('startWindowPointerTracking', () => {
  let container: HTMLElement;
  let onMetrics: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    onMetrics = vi.fn();
    vi.useFakeTimers();

    // Mock getBoundingClientRect
    container.getBoundingClientRect = vi.fn(() => ({
      left: 50,
      top: 50,
      width: 100,
      height: 100,
      right: 150,
      bottom: 150,
      x: 50,
      y: 50,
      toJSON: vi.fn(),
    })) as unknown as () => DOMRect;
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  it('should call onMetrics with correct delta and distance', () => {
    const controller = startWindowPointerTracking({
      getContainer: () => container,
      isEnabled: () => true,
      onMetrics,
    });

    const event = document.createEvent('Event');
    event.initEvent('pointermove', true, true);
    Object.defineProperty(event, 'clientX', { value: 100, writable: false });
    Object.defineProperty(event, 'clientY', { value: 100, writable: false });

    window.dispatchEvent(event as PointerEvent);
    vi.runAllTimers();

    expect(onMetrics).toHaveBeenCalled();
    const call = onMetrics.mock.calls[0]?.[0] as { deltaX: number; deltaY: number; distance: number } | undefined;
    if (call) {
      expect(call.deltaX).toBe(0);
      expect(call.deltaY).toBe(0);
      expect(call.distance).toBe(0);
    }

    controller.stop();
  });

  it('should calculate distance correctly', () => {
    const controller = startWindowPointerTracking({
      getContainer: () => container,
      isEnabled: () => true,
      onMetrics,
    });

    const event = document.createEvent('Event');
    event.initEvent('pointermove', true, true);
    Object.defineProperty(event, 'clientX', { value: 150, writable: false });
    Object.defineProperty(event, 'clientY', { value: 150, writable: false });

    window.dispatchEvent(event as PointerEvent);
    vi.runAllTimers();

    expect(onMetrics).toHaveBeenCalled();
    const call = onMetrics.mock.calls[0]?.[0] as { deltaX: number; deltaY: number; distance: number } | undefined;
    if (call) {
      expect(call.deltaX).toBe(50);
      expect(call.deltaY).toBe(50);
      expect(call.distance).toBeCloseTo(70.71, 1);
    }

    controller.stop();
  });

  it('should not call onMetrics when disabled', () => {
    const controller = startWindowPointerTracking({
      getContainer: () => container,
      isEnabled: () => false,
      onMetrics,
    });

    const event = document.createEvent('Event');
    event.initEvent('pointermove', true, true);
    Object.defineProperty(event, 'clientX', { value: 100, writable: false });
    Object.defineProperty(event, 'clientY', { value: 100, writable: false });

    window.dispatchEvent(event as PointerEvent);
    vi.runAllTimers();

    expect(onMetrics).not.toHaveBeenCalled();

    controller.stop();
  });

  it('should not call onMetrics when container is null', () => {
    const controller = startWindowPointerTracking({
      getContainer: () => null,
      isEnabled: () => true,
      onMetrics,
    });

    const event = document.createEvent('Event');
    event.initEvent('pointermove', true, true);
    Object.defineProperty(event, 'clientX', { value: 100, writable: false });
    Object.defineProperty(event, 'clientY', { value: 100, writable: false });

    window.dispatchEvent(event as PointerEvent);
    vi.runAllTimers();

    expect(onMetrics).not.toHaveBeenCalled();

    controller.stop();
  });

  it('should throttle events with rAF', () => {
    const controller = startWindowPointerTracking({
      getContainer: () => container,
      isEnabled: () => true,
      onMetrics,
    });

    const event1 = document.createEvent('Event');
    event1.initEvent('pointermove', true, true);
    Object.defineProperty(event1, 'clientX', { value: 100, writable: false });
    Object.defineProperty(event1, 'clientY', { value: 100, writable: false });

    const event2 = document.createEvent('Event');
    event2.initEvent('pointermove', true, true);
    Object.defineProperty(event2, 'clientX', { value: 150, writable: false });
    Object.defineProperty(event2, 'clientY', { value: 150, writable: false });

    window.dispatchEvent(event1 as PointerEvent);
    window.dispatchEvent(event2 as PointerEvent);

    vi.runAllTimers();

    expect(onMetrics).toHaveBeenCalledTimes(1);

    controller.stop();
  });

  it('should stop tracking when stop is called', () => {
    const controller = startWindowPointerTracking({
      getContainer: () => container,
      isEnabled: () => true,
      onMetrics,
    });

    controller.stop();

    const event = document.createEvent('Event');
    event.initEvent('pointermove', true, true);
    Object.defineProperty(event, 'clientX', { value: 100, writable: false });
    Object.defineProperty(event, 'clientY', { value: 100, writable: false });

    window.dispatchEvent(event as PointerEvent);
    vi.runAllTimers();

    expect(onMetrics).not.toHaveBeenCalled();
  });
});

