import { Text } from 'react-native';

import { pressHost, renderElement } from '@/test/render-element';
import { BottomSheet } from '@/ui/layout/bottom-sheet';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 20, left: 0 }),
}));

describe('BottomSheet', () => {
  it('renders children and dismisses from the scrim without owning confirm actions', () => {
    const onDismiss = jest.fn();
    const tree = renderElement(
      <BottomSheet isVisible onDismiss={onDismiss} testID="sheet-root" accessibilityLabel="Confirm">
        <Text>Sign out and remove downloads?</Text>
      </BottomSheet>,
    );
    expect(tree.root.findByProps({ testID: 'sheet-root' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Sign out and remove downloads?' })).toBeTruthy();
    pressHost(tree.root.findByProps({ accessibilityLabel: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
