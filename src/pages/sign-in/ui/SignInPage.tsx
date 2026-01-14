import { useState, useRef, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { SignInForm } from 'features/auth/sign-in';
import { useSignInForm } from 'features/auth/sign-in/model/useSignInForm';
import { Mascot } from 'shared/ui/mascot';
import styles from './SignInPage.module.pcss';

export function SignInPage(): JSX.Element {
  const form = useSignInForm();
  const passwordValue = useWatch({ control: form.control, name: 'password', defaultValue: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const mascotContainerRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<Mascot | null>(null);

  useEffect(() => {
    if (!mascotContainerRef.current) {
      return;
    }

    const mascot = new Mascot();
    mascotRef.current = mascot;

    mascot.mount({
      container: mascotContainerRef.current,
    });

    return () => {
      mascot.destroy();
      mascotRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mascotRef.current) {
      return;
    }

    // Set thinking state when form is loading
    if (form.state.isLoading) {
      mascotRef.current.setState('thinking');
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!mascotRef.current) {
        return;
      }

      const eyelidState = mascotRef.current.getEyelidState();
      if (eyelidState === 'blinking') {
        return;
      }

      let newState: 'neutral' | 'relaxed' = 'neutral';

      if (isPasswordVisible && passwordValue.length > 0) {
        newState = 'relaxed';
      }

      mascotRef.current.setState(newState);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [passwordValue, isPasswordVisible, form.state.isLoading]);

  return (
    <div className={styles.page} data-testid="sign-in-page">
      <div
        ref={mascotContainerRef}
        aria-hidden="true"
        data-testid="mascot-container"
      />
      <SignInForm
        register={form.register}
        handleSubmit={form.handleSubmit}
        formState={form.formState}
        state={form.state}
        onSubmit={form.onSubmit}
        clearError={form.clearError}
        onPasswordVisibilityChange={setIsPasswordVisible}
        onEmailFocus={() => {
          mascotRef.current?.lookAt({ x: 0, y: 8 });
        }}
        onEmailBlur={() => {
          mascotRef.current?.lookAt({ x: 0, y: 0 });
        }}
        onPasswordFocus={() => {
          if (!mascotRef.current) return;
          mascotRef.current.disablePointerTracking();
          mascotRef.current.setEyelidState('squinting');
          mascotRef.current.lookAt({ x: 10, y: 0 });
        }}
        onPasswordBlur={() => {
          if (!mascotRef.current) return;
          mascotRef.current.enablePointerTracking();
          mascotRef.current.openEyelids();
          mascotRef.current.lookAt({ x: 0, y: 0 });
        }}
      />
    </div>
  );
}
