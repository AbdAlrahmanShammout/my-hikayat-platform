import { focusManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

/**
 * Connects React Native AppState to TanStack Query focusManager (MOBILE-ARCHITECTURE §12.1).
 */
export function bindQueryFocusManager(): () => void {
  const onChange = (status: AppStateStatus): void => {
    focusManager.setFocused(status === 'active');
  };
  const subscription: NativeEventSubscription = AppState.addEventListener('change', onChange);
  onChange(AppState.currentState);
  return () => {
    subscription.remove();
  };
}
