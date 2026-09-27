import {
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';

/**
 * Loads Roboto for titles and Nunito for UI. Returns true once load finishes.
 */
export function useAppFonts(): boolean {
  const [areFontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  return areFontsLoaded || fontError !== null;
}
