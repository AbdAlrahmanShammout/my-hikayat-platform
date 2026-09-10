import { pressHost, renderElement } from '@/test/render-element';

import { RemoveOfflineDownloadSheet } from './remove-offline-download-sheet';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 20, left: 0 }),
}));

describe('RemoveOfflineDownloadSheet', () => {
  it('keeps confirm and cancel in the parent', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const tree = renderElement(
      <RemoveOfflineDownloadSheet
        bookTitle="Night Market"
        isRemoving={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(tree.root.findByProps({ children: 'Remove download?' })).toBeTruthy();
    pressHost(tree.root.findByProps({ accessibilityLabel: 'Remove download' }));
    pressHost(tree.root.findByProps({ accessibilityLabel: 'Keep it' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
