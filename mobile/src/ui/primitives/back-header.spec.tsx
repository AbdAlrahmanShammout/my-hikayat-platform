import { findHostByTestId, pressHost, renderElement } from '@/test/render-element';
import { BackHeader } from '@/ui/primitives/back-header';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('BackHeader', () => {
  it('delegates back presses to the parent callback', () => {
    const onPressBack = jest.fn();
    const tree = renderElement(
      <BackHeader title="Settings" onPressBack={onPressBack} backTestID="settings-back-button" />,
    );
    pressHost(findHostByTestId(tree, 'settings-back-button'));
    expect(onPressBack).toHaveBeenCalledTimes(1);
    expect(tree.root.findByProps({ children: 'Settings' })).toBeTruthy();
  });
});
