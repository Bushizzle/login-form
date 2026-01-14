/**
 * Mascot states - affect appearance
 */
export type MascotState =
  | 'neutral'
  | 'alert'
  | 'relaxed'
  | 'poke'
  | 'thinking';

/**
 * Eye position for pointer tracking
 */
export interface EyePosition {
  x: number;
  y: number;
}

/**
 * Mascot configuration
 */
export interface MascotConfig {
  eyeClampX?: number;
  eyeClampY?: number;
  reducedMotion?: boolean;
  isTouchDevice?: boolean; // If true, disables pointer tracking and glance frequency changes
}

/**
 * Eyelid state
 */
export type EyelidState = 'open' | 'closed' | 'squinting' | 'squintingLight' | 'blinking' | 'thinking';

