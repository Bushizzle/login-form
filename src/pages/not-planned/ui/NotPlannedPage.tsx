import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLink } from 'shared/ui';
import styles from './NotPlannedPage.module.pcss';

const DEFAULT_FEATURE = 'This feature';

export function NotPlannedPage(): JSX.Element {
  const [searchParams] = useSearchParams();

  const feature = useMemo(() => {
    const value = searchParams.get('feature');
    return value && value.trim().length > 0 ? value : DEFAULT_FEATURE;
  }, [searchParams]);

  return (
    <div className={styles.page} data-testid="not-planned-page">
      <h2 className={styles.title}>{feature}</h2>
      <p className={styles.text}>This functionality is not planned as part of this demo.</p>
      <div className={styles.actions}>
        <AppLink to="/">Back to sign in</AppLink>
      </div>
    </div>
  );
}


