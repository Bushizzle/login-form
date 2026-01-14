export interface PointerMetrics {
  deltaX: number;
  deltaY: number;
  distance: number;
}

export interface WindowPointerTrackingController {
  stop(): void;
}

export function startWindowPointerTracking(params: {
  getContainer: () => HTMLElement | null;
  isEnabled: () => boolean;
  onMetrics: (m: PointerMetrics) => void;
}): WindowPointerTrackingController {
  let rafPending = false;
  let lastEvent: PointerEvent | null = null;

  const handler = (e: PointerEvent): void => {
    if (!params.isEnabled()) {
      return;
    }

    lastEvent = e;

    if (rafPending) {
      return;
    }

    rafPending = true;

    requestAnimationFrame(() => {
      rafPending = false;
      const ev = lastEvent;
      const container = params.getContainer();

      if (!ev || !container) {
        return;
      }

      if (!params.isEnabled()) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = ev.clientX - centerX;
      const deltaY = ev.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      params.onMetrics({ deltaX, deltaY, distance });
    });
  };

  window.addEventListener('pointermove', handler, { passive: true });

  return {
    stop(): void {
      window.removeEventListener('pointermove', handler);
      rafPending = false;
      lastEvent = null;
    },
  };
}
