import { GlanceScheduler } from './GlanceScheduler';
import type { TimerBag } from '../../../infra/timers/TimerBag';
import type { MascotConfig } from '../../types';
import {
  GLANCE_DURATION_MIN_MS,
  GLANCE_DURATION_MAX_MS,
  GLANCE_DELAY_IDLE_MIN_MS,
  GLANCE_DELAY_IDLE_MAX_MS,
  GLANCE_DELAY_CLOSE_MIN_MS,
  GLANCE_DELAY_CLOSE_MAX_MS,
  GLANCE_DELAY_FAR_MIN_MS,
  GLANCE_DELAY_FAR_MAX_MS,
} from '../../constants';

export interface GlanceSchedulerDeps {
  timers: TimerBag;
  config: Required<MascotConfig>;
  getState: () => {
    isCursorVeryClose: boolean;
    isPoked: boolean;
    isGlancing: boolean;
    isCursorIdle: boolean;
    isCursorClose: boolean;
    position: { x: number; y: number };
    lastPointerPosition: { x: number; y: number } | null;
  };
  setState: (patch: Partial<{
    isGlancing: boolean;
    position: { x: number; y: number };
    lastPointerPosition: { x: number; y: number } | null;
  }>) => void;
  render: () => void;
  randomDelay: (min: number, max: number) => number;
}

export function createGlanceScheduler(deps: GlanceSchedulerDeps): GlanceScheduler {
  return new GlanceScheduler({
    timers: deps.timers,
    reducedMotion: () => deps.config.reducedMotion,
    isTouchDevice: () => deps.config.isTouchDevice,
    isVeryClose: () => deps.getState().isCursorVeryClose,
    isPoked: () => deps.getState().isPoked,
    isGlancing: () => deps.getState().isGlancing,
    isCursorIdle: () => deps.getState().isCursorIdle,
    isCursorClose: () => deps.getState().isCursorClose,
    getPosition: () => deps.getState().position,
    setPosition: (pos) => deps.setState({ position: pos }),
    getLastPointerPosition: () => deps.getState().lastPointerPosition,
    setLastPointerPosition: (pos) => deps.setState({ lastPointerPosition: pos }),
    setGlancing: (v) => deps.setState({ isGlancing: v }),
    requestRender: () => deps.render(),
    randomDelay: deps.randomDelay,
    delays: {
      durationMin: GLANCE_DURATION_MIN_MS,
      durationMax: GLANCE_DURATION_MAX_MS,
      idleMin: GLANCE_DELAY_IDLE_MIN_MS,
      idleMax: GLANCE_DELAY_IDLE_MAX_MS,
      closeMin: GLANCE_DELAY_CLOSE_MIN_MS,
      closeMax: GLANCE_DELAY_CLOSE_MAX_MS,
      farMin: GLANCE_DELAY_FAR_MIN_MS,
      farMax: GLANCE_DELAY_FAR_MAX_MS,
    },
  });
}

