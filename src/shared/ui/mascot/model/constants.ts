/**
 * Mascot constants
 */

// Distance thresholds (in pixels)
export const SQUINT_THRESHOLD = 100; // pixels - distance for squinting
export const EXPAND_THRESHOLD = 30; // pixels - distance for pupil expansion

// Time thresholds (in milliseconds)
export const IDLE_THRESHOLD_MS = 5000; // milliseconds - cursor idle detection
export const POKE_DURATION_MS = 2000; // milliseconds - poke duration
export const BLINK_DURATION_MS = 400; // milliseconds - blink animation duration

// Blink timing (in milliseconds)
export const BLINK_DELAY_MIN_MS = 1500; // milliseconds - minimum delay between blinks
export const BLINK_DELAY_MAX_MS = 4000; // milliseconds - maximum delay between blinks

// Glance timing (in milliseconds)
export const GLANCE_DURATION_MIN_MS = 500; // milliseconds - minimum glance duration
export const GLANCE_DURATION_MAX_MS = 1000; // milliseconds - maximum glance duration
export const GLANCE_DELAY_IDLE_MIN_MS = 2000; // milliseconds - minimum delay when cursor idle
export const GLANCE_DELAY_IDLE_MAX_MS = 3000; // milliseconds - maximum delay when cursor idle
export const GLANCE_DELAY_CLOSE_MIN_MS = 1000; // milliseconds - minimum delay when cursor close
export const GLANCE_DELAY_CLOSE_MAX_MS = 2000; // milliseconds - maximum delay when cursor close
export const GLANCE_DELAY_FAR_MIN_MS = 6000; // milliseconds - minimum delay when cursor far
export const GLANCE_DELAY_FAR_MAX_MS = 10000; // milliseconds - maximum delay when cursor far

// Movement multipliers
export const PUPIL_OFFSET_MULTIPLIER = 0.15; // multiplier for pupil offset relative to iris
export const POINTER_DELTA_DIVISOR = 10; // divisor for pointer movement sensitivity

// Poke count threshold
export const REDDEN_THRESHOLD = 2; // number of pokes before eye reddens (after 2 pokes, on 3rd poke eye reddens)

// Thinking animation constants
export const THINKING_ANIMATION_DURATION_MS = 1500; // milliseconds - thinking animation cycle duration
export const THINKING_ANIMATION_AMPLITUDE_PX = 6; // pixels - thinking animation horizontal movement amplitude

