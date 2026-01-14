import { Link, type LinkProps } from 'react-router-dom';
import styles from './AppLink.module.pcss';

type AppLinkVariant = 'default' | 'muted';
type AppLinkAppearance = 'link' | 'button';

export interface AppLinkProps extends LinkProps {
  variant?: AppLinkVariant;
  appearance?: AppLinkAppearance;
}

export function AppLink({
  variant = 'default',
  appearance = 'link',
  className = '',
  ...props
}: AppLinkProps): JSX.Element {
  const variantClass = variant === 'muted' ? styles.muted : '';
  const appearanceClass = appearance === 'button' ? styles.buttonLike : '';
  return <Link {...props} className={`${styles.link} ${variantClass} ${appearanceClass} ${className}`} />;
}


