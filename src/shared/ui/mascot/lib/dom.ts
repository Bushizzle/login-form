import { BLINK_DURATION_MS } from '../model/constants';

export interface MascotDom {
  root: HTMLDivElement;
  eye: HTMLDivElement;
  iris: HTMLDivElement;
  pupil: HTMLDivElement;
  eyelidTop: HTMLDivElement;
  eyelidBottom: HTMLDivElement;
}

interface CreateMascotDomParams {
  container: HTMLElement;
  styles: Record<string, string | undefined>;
  onPoke: () => void;
  testId?: string;
}

/**
 * Create mascot DOM structure.
 *
 * @param params - Configuration for DOM creation
 * @returns Mascot DOM elements
 */
export function createMascotDom(params: CreateMascotDomParams): MascotDom {
  const { container, styles, onPoke, testId } = params;

  if (typeof styles.container === 'string') {
    container.classList.add(styles.container);
  }
  container.setAttribute('aria-hidden', 'true');

  const root = document.createElement('div');
  root.className = styles.eyeButton ?? '';
  if (testId) {
    root.setAttribute('data-testid', testId);
  }
  root.addEventListener('pointerdown', onPoke);

  const eye = document.createElement('div');
  eye.className = styles.eye ?? '';

  const iris = document.createElement('div');
  iris.className = styles.iris ?? '';

  const pupil = document.createElement('div');
  pupil.className = styles.pupil ?? '';

  const eyelidTop = document.createElement('div');
  eyelidTop.className = styles.eyelidTop ?? '';

  const eyelidBottom = document.createElement('div');
  eyelidBottom.className = styles.eyelidBottom ?? '';

  iris.appendChild(pupil);
  eye.appendChild(iris);
  eye.appendChild(eyelidTop);
  eye.appendChild(eyelidBottom);
  root.appendChild(eye);
  container.appendChild(root);

  container.style.setProperty('--mascot-blink-ms', `${BLINK_DURATION_MS}ms`);

  return {
    root,
    eye,
    iris,
    pupil,
    eyelidTop,
    eyelidBottom,
  };
}

interface DestroyMascotDomParams {
  container: HTMLElement;
  styles: Record<string, string | undefined>;
}

/**
 * Destroy mascot DOM structure and clean up.
 *
 * @param params - Configuration for DOM destruction
 */
export function destroyMascotDom(params: DestroyMascotDomParams): void {
  const { container, styles } = params;

  container.innerHTML = '';

  if (typeof styles.container === 'string') {
    container.classList.remove(styles.container);
  }

  container.removeAttribute('aria-hidden');
  container.style.removeProperty('--mascot-blink-ms');
}

