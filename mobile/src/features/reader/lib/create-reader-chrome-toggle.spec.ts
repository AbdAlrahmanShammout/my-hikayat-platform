import { createReaderChromeToggle } from '@/features/reader/lib/create-reader-chrome-toggle';

describe('createReaderChromeToggle', () => {
  it('posts a tap message and ignores drags and links', () => {
    const actual = createReaderChromeToggle();
    expect(actual.message).toBe('reader-toggle-chrome');
    expect(actual.nextMessage).toBe('reader-swipe-next');
    expect(actual.previousMessage).toBe('reader-swipe-previous');
    expect(actual.script).toContain(`postMessage(message)`);
    expect(actual.script).toContain(`'${actual.nextMessage}'`);
    expect(actual.script).toContain(`'${actual.previousMessage}'`);
    expect(actual.script).toContain(`'${actual.message}'`);
    expect(actual.script).toContain("node.tagName === 'A'");
    expect(actual.script).toContain('moved');
  });
});
