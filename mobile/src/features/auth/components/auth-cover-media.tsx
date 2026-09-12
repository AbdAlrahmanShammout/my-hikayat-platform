import type { JSX } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { isVideoMediaUrl } from '@/features/auth/lib/is-video-media-url';
import { theme } from '@/theme/theme';

type AuthCoverMediaProps = {
  readonly url: string;
};

/**
 * Admin-configured Sign in/up cover GIF or muted looping video.
 */
export function AuthCoverMedia({ url }: AuthCoverMediaProps): JSX.Element {
  if (isVideoMediaUrl(url)) {
    return <AuthCoverVideo url={url} />;
  }
  return (
    <Image
      source={{ uri: url }}
      style={styles.media}
      resizeMode="cover"
      accessibilityElementsHidden
      testID="auth-cover-media-image"
    />
  );
}

function AuthCoverVideo({ url }: AuthCoverMediaProps): JSX.Element {
  const player = useVideoPlayer(url, (nextPlayer) => {
    nextPlayer.loop = true;
    nextPlayer.muted = true;
    nextPlayer.play();
  });
  return (
    <View style={styles.media} testID="auth-cover-media-video">
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.canvasWarm,
    marginTop: theme.spacing.md,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
