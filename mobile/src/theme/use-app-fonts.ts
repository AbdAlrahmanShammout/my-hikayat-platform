import {
  Fraunces_400Regular_Italic,
  Fraunces_700Bold_Italic,
} from '@expo-google-fonts/fraunces';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';

/**
 * Loads Direction B Google fonts. Returns true once load finishes (success or fallback).
 */
export function useAppFonts(): boolean {
  const [areFontsLoaded, fontError] = useFonts({
    Fraunces_400Regular_Italic,
    Fraunces_700Bold_Italic,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  return areFontsLoaded || fontError !== null;
}
