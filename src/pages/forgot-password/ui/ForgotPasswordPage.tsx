import { AppLink } from 'shared/ui';
import styles from './ForgotPasswordPage.module.pcss';

export function ForgotPasswordPage(): JSX.Element {
  return (
    <div className={styles.page} data-testid="forgot-password-page">
      <h2 className={styles.title}>Forgot password</h2>
      <p className={styles.text}>
        This functionality is not planned as part of this demo.
      </p>
      <div className={styles.actions}>
        <AppLink to="/">Back to sign in</AppLink>
      </div>
    </div>
  );
}


