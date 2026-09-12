import { isVideoMediaUrl } from './is-video-media-url';

describe('isVideoMediaUrl', () => {
  it('detects mp4 paths', () => {
    expect(isVideoMediaUrl('https://cdn.example.com/auth/cover.mp4')).toBe(true);
  });

  it('treats gifs as images', () => {
    expect(isVideoMediaUrl('https://cdn.example.com/auth/cover.gif')).toBe(false);
  });
});
