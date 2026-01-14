import { Link, type LinkProps } from 'react-router-dom';
import styles from './AppLink.module.pcss';

type AppLinkVariant = 'default' | 'muted';

export interface AppLinkProps extends LinkProps {
  variant?: AppLinkVariant;
}

export function AppLink({ variant = 'default', className = '', ...props }: AppLinkProps): JSX.Element {
  const variantClass = variant === 'muted' ? styles.muted : '';
  return <Link {...props} className={`${styles.link} ${variantClass} ${className}`} />;
}


