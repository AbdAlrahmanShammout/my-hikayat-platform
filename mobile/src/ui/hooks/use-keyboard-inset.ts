import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform, type KeyboardEvent } from 'react-native';

const NO_KEYBOARD_INSET = 0;
const MIN_KEYBOARD_INSET = 80;
const FALLBACK_KEYBOARD_INSET = 320;

/**
 * Returns the on-screen keyboard height on Android.
 * Edge-to-edge windows are not resized, and some devices report a zero height,
 * so the inset is taken from the larger of the reported height and the distance
 * from the keyboard top to the bottom of the window.
 */
export function useKeyboardInset(): number {
  const [keyboardInset, setKeyboardInset] = useState<number>(NO_KEYBOARD_INSET);
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event: KeyboardEvent) => {
      setKeyboardInset(resolveKeyboardInset(event));
    });
    const frameSubscription = Keyboard.addListener(
      'keyboardDidChangeFrame',
      (event: KeyboardEvent) => {
        setKeyboardInset(resolveKeyboardInset(event));
      },
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardInset(NO_KEYBOARD_INSET);
    });
    return () => {
      showSubscription.remove();
      frameSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  return keyboardInset;
}

function resolveKeyboardInset(event: KeyboardEvent): number {
  const windowHeight: number = Dimensions.get('window').height;
  const reportedHeight: number = event.endCoordinates.height;
  const heightFromTop: number = windowHeight - event.endCoordinates.screenY;
  const measuredInset: number = Math.max(reportedHeight, heightFromTop);
  if (measuredInset < MIN_KEYBOARD_INSET) {
    return NO_KEYBOARD_INSET;
  }
  if (measuredInset >= windowHeight) {
    return FALLBACK_KEYBOARD_INSET;
  }
  return measuredInset;
}
