import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function EyeIcon(props: IconProps): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path d="M4 12c2.8 2.8 5.8 4 8 4s5.2-1.2 8-4" />
      <path d="M9.3 16.1l-.5 1.3" />
      <path d="M12 16.6v1.5" />
      <path d="M14.7 16.1l.5 1.3" />
    </svg>
  );
}


