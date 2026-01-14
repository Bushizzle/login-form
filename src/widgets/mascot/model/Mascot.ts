import type {
  MascotState,
  EyePosition,
  MascotConfig,
  EyelidState,
} from './types';
import styles from './mascot.module.pcss';
import {
  SQUINT_THRESHOLD,
  EXPAND_THRESHOLD,
  IDLE_THRESHOLD_MS,
  POKE_DURATION_MS,
  BLINK_DURATION_MS,
  PUPIL_OFFSET_MULTIPLIER,
  POINTER_DELTA_DIVISOR,
  REDDEN_THRESHOLD,
  THINKING_ANIMATION_DURATION_MS,
  THINKING_ANIMATION_AMPLITUDE_PX,
} from './constants';
import { TimerBag } from './timers';
import { GlanceScheduler } from './glances';
import { BlinkScheduler } from './blinkScheduler';
import { createGlanceScheduler } from './createGlanceScheduler';
import { createBlinkScheduler } from './createBlinkScheduler';
import { resolveRuntimeConfig } from './runtimeConfig';
import { onPointerActivity } from './pointerIdle';
import {
  resolveStateWithVeryClose,
  resolveEyelidFromProximity,
} from './behavior';
import {
  startWindowPointerTracking,
  type WindowPointerTrackingController,
  type PointerMetrics,
} from './windowPointerTracking';
import { createMascotDom, destroyMascotDom, type MascotDom } from '../lib/dom';
import { renderMascot, type MascotView } from '../lib/render';

interface MascotMountConfig {
  container: HTMLElement;
}

/**
 * Interactive eye mascot that responds to user interactions.
 * Standalone service, independent of React.
 */
export class Mascot {
  private state: MascotState = 'neutral';
  private position: EyePosition = { x: 0, y: 0 };
  private isPoked = false;
  private pokeCount = 0;
  private eyelidState: EyelidState = 'open';
  private isGlancing = false;
  private lastPointerPosition: EyePosition | null = null;
  private lastPointerMoveTimeRef = { value: Date.now() };
  private isCursorIdleRef = { value: false };
  private isCursorClose = false;
  private isCursorVeryClose = false;
  private previousStateBeforeVeryClose: MascotState | null = null;
  private isBlinking = false;
  private isExplicitlySquinting = false;
  private config: Required<MascotConfig>;
  private thinkingAnimationFrame: number | null = null;
  private thinkingStartTime: number | null = null;

  private timers = new TimerBag();
  private container: HTMLElement | null = null;
  private dom: MascotDom | null = null;
  private isPointerTrackingEnabled = true;
  private pointerCtrl: WindowPointerTrackingController | null = null;
  private glance: GlanceScheduler | null = null;
  private blinkScheduler: BlinkScheduler | null = null;

  constructor(config: MascotConfig = {}) {
    this.config = {
      eyeClampX: config.eyeClampX ?? 20,
      eyeClampY: config.eyeClampY ?? 15,
      reducedMotion: config.reducedMotion ?? false,
      isTouchDevice: config.isTouchDevice ?? false,
    };
  }

  mount(config: MascotMountConfig): void {
    const { container } = config;
    this.container = container;
    this.config = resolveRuntimeConfig(this.config);

    this.dom = createMascotDom({
      container,
      styles,
      onPoke: () => {
        this.poke();
      },
      testId: 'mascot-eye-button',
    });

    this.glance = createGlanceScheduler({
      timers: this.timers,
      config: this.config,
      getState: () => ({
        isCursorVeryClose: this.isCursorVeryClose,
        isPoked: this.isPoked,
        isGlancing: this.isGlancing,
        isCursorIdle: this.isCursorIdleRef.value,
        isCursorClose: this.isCursorClose,
        position: this.position,
        lastPointerPosition: this.lastPointerPosition,
      }),
      setState: (patch) => {
        if (patch.isGlancing !== undefined) {
          this.isGlancing = patch.isGlancing;
        }
        if (patch.position !== undefined) {
          this.position = patch.position;
        }
        if (patch.lastPointerPosition !== undefined) {
          this.lastPointerPosition = patch.lastPointerPosition;
        }
      },
      render: () => this.render(),
      randomDelay: (min, max) => this.calculateRandomDelay(min, max),
    });

    this.blinkScheduler = createBlinkScheduler({
      timers: this.timers,
      shouldBlink: () => !this.isPoked && !this.isBlinking && this.eyelidState === 'open',
      doBlink: () => this.blink(),
      randomDelay: (min, max) => this.calculateRandomDelay(min, max),
    });

    if (!this.config.isTouchDevice) {
      this.startPointerTracking();
      this.glance.start();
    }

    this.render();
    this.blinkScheduler.start();
  }

  unmount(): void {
    this.timers.clearAll();
    this.stopPointerTracking();
    this.stopThinkingAnimation();

    this.glance?.stop();
    this.glance = null;
    this.blinkScheduler?.stop();
    this.blinkScheduler = null;

    if (this.container) {
      destroyMascotDom({
        container: this.container,
        styles,
      });
    }

    this.container = null;
    this.dom = null;
  }

  getState(): MascotState {
    return this.state;
  }

  getPosition(): EyePosition {
    return this.position;
  }

  getEyelidState(): EyelidState {
    return this.eyelidState;
  }

  setState(newState: MascotState): void {
    const result = resolveStateWithVeryClose({
      current: this.state,
      requested: newState,
      isVeryClose: this.isCursorVeryClose,
      previousRequested: this.previousStateBeforeVeryClose,
    });

    this.previousStateBeforeVeryClose = result.previousRequested;

    if (this.state !== result.next) {
      const wasThinking = this.state === 'thinking';
      const willBeThinking = result.next === 'thinking';
      
      this.state = result.next;
      
      // When entering thinking state, set squinting eyelids, disable tracking, reset position and start animation
      if (willBeThinking && this.eyelidState !== 'thinking') {
        this.eyelidState = 'thinking';
        this.disablePointerTracking();
        this.position = { x: 0, y: 0 };
        this.startThinkingAnimation();
      } else if (wasThinking && !willBeThinking) {
        // When leaving thinking state, restore open eyelids, enable tracking and stop animation
        this.stopThinkingAnimation();
        this.enablePointerTracking();
        if (!this.isPoked && !this.isBlinking && !this.isExplicitlySquinting) {
          this.eyelidState = 'open';
        }
      }
      
      this.render();
    }
  }

  poke(): void {
    this.isPoked = true;
    this.pokeCount += 1;
    this.setState('poke');
    this.eyelidState = 'closed';

    this.timers.set('poke', () => {
      this.isPoked = false;
      this.eyelidState = 'open';
      this.render();
    }, POKE_DURATION_MS);

    this.render();
  }

  blink(): void {
    if (this.isBlinking) {
      return;
    }

    if (this.eyelidState !== 'open') {
      return;
    }

    this.isBlinking = true;
    this.eyelidState = 'blinking';
    this.render();

    this.timers.set('blink', () => {
      if (this.isBlinking) {
        this.eyelidState = 'open';
        this.isBlinking = false;
        this.render();
      }
    }, BLINK_DURATION_MS);
  }

  /**
   * Clamp position within eye movement limits
   */
  private clampPosition(pos: EyePosition): EyePosition {
    return {
      x: Math.max(
        -this.config.eyeClampX,
        Math.min(this.config.eyeClampX, pos.x)
      ),
      y: Math.max(
        -this.config.eyeClampY,
        Math.min(this.config.eyeClampY, pos.y)
      ),
    };
  }

  private canChangeEyelidState(): boolean {
    return !this.isPoked && !this.isBlinking && this.eyelidState !== 'blinking';
  }

  lookAt(pos: EyePosition): void {
    if (this.config.reducedMotion) {
      return;
    }

    const clampedPos = this.clampPosition(pos);

    // Don't update position if currently glancing at center
    // But store the position for after glance
    if (this.isGlancing) {
      this.lastPointerPosition = clampedPos;
      return;
    }

    this.position = clampedPos;
    // Update last pointer position for potential glance return
    this.lastPointerPosition = clampedPos;
    this.render();
  }

  setEyelidState(state: EyelidState): void {
    if (!this.canChangeEyelidState()) {
      return;
    }
    this.eyelidState = state;
    // Track if squinting is explicitly set (e.g., from form focus)
    this.isExplicitlySquinting = state === 'squinting';
    this.render();
  }

  openEyelids(): void {
    if (!this.canChangeEyelidState()) {
      return;
    }
    this.eyelidState = 'open';
    this.isExplicitlySquinting = false;
    this.render();
  }

  private updateEyelidStateFromProximity(): void {
    const nextEyelid = resolveEyelidFromProximity({
      current: this.eyelidState,
      isPoked: this.isPoked,
      isBlinking: this.isBlinking,
      isCursorClose: this.isCursorClose,
      isExplicitlySquinting: this.isExplicitlySquinting,
    });

    if (this.eyelidState !== nextEyelid) {
      this.eyelidState = nextEyelid;
      this.render();
    }
  }

  private restoreStateFromVeryClose(): void {
    if (this.previousStateBeforeVeryClose !== null) {
      this.setState(this.previousStateBeforeVeryClose);
      this.previousStateBeforeVeryClose = null;
    }
    this.isCursorVeryClose = false;
  }

  private startPointerTracking(): void {
    if (!this.container || this.config.isTouchDevice) {
      return;
    }

    if (this.pointerCtrl) {
      return;
    }

    this.pointerCtrl = startWindowPointerTracking({
      getContainer: () => this.container,
      isEnabled: () => !!this.container && !!this.dom && this.isPointerTrackingEnabled,
      onMetrics: (m) => this.handlePointerMetrics(m),
    });
  }

  private stopPointerTracking(): void {
    this.timers.clear('pointerIdle');
    this.restoreStateFromVeryClose();
    this.pointerCtrl?.stop();
    this.pointerCtrl = null;
  }

  private handlePointerMetrics(m: PointerMetrics): void {
    if (!this.container || !this.dom || !this.isPointerTrackingEnabled) {
      return;
    }

    onPointerActivity({
      timers: this.timers,
      idleKey: 'pointerIdle',
      idleThresholdMs: IDLE_THRESHOLD_MS,
      lastMoveAt: this.lastPointerMoveTimeRef,
      isIdle: this.isCursorIdleRef,
      onExitIdle: () => {
        this.glance?.reschedule();
      },
      onEnterIdle: () => {
        this.glance?.reschedule();
      },
    });

    const { deltaX, deltaY, distance } = m;
    const wasCursorClose = this.isCursorClose;
    const wasCursorVeryClose = this.isCursorVeryClose;
    this.isCursorClose = distance < SQUINT_THRESHOLD;
    this.isCursorVeryClose = distance < EXPAND_THRESHOLD;

    if (wasCursorVeryClose !== this.isCursorVeryClose) {
      if (this.isCursorVeryClose) {
        this.previousStateBeforeVeryClose = this.state;
        this.setState('alert');
        this.glance?.reschedule();
      } else {
        this.restoreStateFromVeryClose();
        this.glance?.reschedule();
      }
    }

    if (wasCursorClose !== this.isCursorClose) {
      this.glance?.reschedule();
    }

    this.updateEyelidStateFromProximity();

    this.lookAt({
      x: deltaX / POINTER_DELTA_DIVISOR,
      y: deltaY / POINTER_DELTA_DIVISOR,
    });
  }

  enablePointerTracking(): void {
    this.isPointerTrackingEnabled = true;
    if (!this.pointerCtrl && this.container && !this.config.isTouchDevice) {
      this.startPointerTracking();
    }
  }

  disablePointerTracking(): void {
    this.isPointerTrackingEnabled = false;
    this.restoreStateFromVeryClose();
  }

  private render(): void {
    if (!this.dom) {
      return;
    }

    const view: MascotView = {
      position: this.position,
      state: this.state,
      eyelidState: this.eyelidState,
      pokeCount: this.pokeCount,
    };

    renderMascot({
      dom: this.dom,
      styles,
      view,
      pupilOffsetMultiplier: PUPIL_OFFSET_MULTIPLIER,
      reddenThreshold: REDDEN_THRESHOLD,
    });
  }



  private calculateRandomDelay(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private startThinkingAnimation(): void {
    if (this.config.reducedMotion || !this.dom) {
      return;
    }

    this.stopThinkingAnimation();
    this.thinkingStartTime = Date.now();

    const animate = (): void => {
      if (!this.dom || this.state !== 'thinking') {
        this.stopThinkingAnimation();
        return;
      }

      const elapsed = Date.now() - (this.thinkingStartTime ?? 0);
      const cycle = (elapsed % THINKING_ANIMATION_DURATION_MS) / THINKING_ANIMATION_DURATION_MS;
      const offset = Math.sin(cycle * Math.PI * 2) * THINKING_ANIMATION_AMPLITUDE_PX;

      this.dom.iris.style.setProperty('--thinking-offset-x', `${offset}px`);
      this.thinkingAnimationFrame = requestAnimationFrame(animate);
    };

    this.thinkingAnimationFrame = requestAnimationFrame(animate);
  }

  private stopThinkingAnimation(): void {
    if (this.thinkingAnimationFrame !== null) {
      cancelAnimationFrame(this.thinkingAnimationFrame);
      this.thinkingAnimationFrame = null;
    }
    this.thinkingStartTime = null;
    if (this.dom) {
      this.dom.iris.style.removeProperty('--thinking-offset-x');
    }
  }

  destroy(): void {
    this.unmount();
  }
}
