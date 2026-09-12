import { Linking } from 'react-native';

/**
 * Opens an admin-configured http(s) URL. Returns false when the URL cannot be opened.
 */
export async function openLegalUrl(url: string): Promise<boolean> {
  const trimmed: string = url.trim();
  if (trimmed.length === 0) {
    return false;
  }
  const canOpen: boolean = await Linking.canOpenURL(trimmed);
  if (!canOpen) {
    return false;
  }
  await Linking.openURL(trimmed);
  return true;
}
