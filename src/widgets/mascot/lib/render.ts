import type { MascotDom } from './dom';
import type { EyePosition, MascotState, EyelidState } from '../model/types';

export interface MascotView {
  position: EyePosition;
  state: MascotState;
  eyelidState: EyelidState;
  pokeCount: number;
}

interface RenderMascotParams {
  dom: MascotDom;
  styles: Record<string, string | undefined>;
  view: MascotView;
  pupilOffsetMultiplier: number;
  reddenThreshold: number;
}

const ALL_MASCOT_STATES: readonly MascotState[] = [
  'neutral',
  'alert',
  'relaxed',
  'poke',
  'thinking',
] as const;

const EYELID_STATE_MAP: Record<EyelidState, string> = {
  open: '',
  closed: 'mascot--closed',
  squinting: 'mascot--squinting',
  squintingLight: 'mascot--squintingLight',
  blinking: 'mascot--blinking',
  thinking: 'mascot--thinking',
};

/**
 * Apply position to iris and pupil elements.
 */
function applyPosition(
  dom: MascotDom,
  position: EyePosition,
  pupilOffsetMultiplier: number
): void {
  const positionX = `${position.x}px`;
  const positionY = `${position.y}px`;
  dom.iris.style.setProperty('--pupil-x', positionX);
  dom.iris.style.setProperty('--pupil-y', positionY);

  const pupilOffsetX = `${position.x * pupilOffsetMultiplier}px`;
  const pupilOffsetY = `${position.y * pupilOffsetMultiplier}px`;
  dom.pupil.style.setProperty('--pupil-offset-x', pupilOffsetX);
  dom.pupil.style.setProperty('--pupil-offset-y', pupilOffsetY);
}

/**
 * Apply mascot state to pupil element.
 */
function applyPupilState(
  dom: MascotDom,
  styles: Record<string, string | undefined>,
  state: MascotState
): void {
  ALL_MASCOT_STATES.forEach((stateClass) => {
    const cssClass = styles[stateClass as keyof typeof styles];
    if (cssClass && typeof cssClass === 'string') {
      dom.pupil.classList.remove(cssClass);
    }
  });

  const currentStateClass = styles[state as keyof typeof styles];
  if (currentStateClass && typeof currentStateClass === 'string') {
    dom.pupil.classList.add(currentStateClass);
  }
}

/**
 * Apply eyelid state to eyelid elements.
 */
function applyEyelids(dom: MascotDom, eyelidState: EyelidState): void {
  const eyelidStates: EyelidState[] = [
    'closed',
    'squinting',
    'squintingLight',
    'blinking',
    'thinking',
  ];

  eyelidStates.forEach((state) => {
    const globalClass = EYELID_STATE_MAP[state];
    if (globalClass && dom.eyelidTop && dom.eyelidBottom) {
      dom.eyelidTop.classList.remove(globalClass);
      dom.eyelidBottom.classList.remove(globalClass);
    }
  });

  if (eyelidState !== 'open') {
    const globalClass = EYELID_STATE_MAP[eyelidState];
    if (globalClass && dom.eyelidTop && dom.eyelidBottom) {
      dom.eyelidTop.classList.add(globalClass);
      dom.eyelidBottom.classList.add(globalClass);
      if (eyelidState === 'blinking') {
        void dom.eyelidTop.offsetHeight;
      }
    }
  }
}

/**
 * Apply redden state to eye element.
 */
function applyRedden(
  dom: MascotDom,
  pokeCount: number,
  reddenThreshold: number
): void {
  if (pokeCount >= reddenThreshold) {
    dom.eye.classList.add('mascot--reddened');
  } else {
    dom.eye.classList.remove('mascot--reddened');
  }
}

/**
 * Apply thinking state to iris element.
 */
function applyThinkingState(dom: MascotDom, state: MascotState): void {
  if (state === 'thinking') {
    dom.iris.classList.add('thinking');
  } else {
    dom.iris.classList.remove('thinking');
  }
}

/**
 * Render mascot view to DOM.
 *
 * @param params - Render parameters
 */
export function renderMascot(params: RenderMascotParams): void {
  const { dom, styles, view, pupilOffsetMultiplier, reddenThreshold } = params;

  applyPosition(dom, view.position, pupilOffsetMultiplier);
  applyPupilState(dom, styles, view.state);
  applyEyelids(dom, view.eyelidState);
  applyRedden(dom, view.pokeCount, reddenThreshold);
  applyThinkingState(dom, view.state);
}

