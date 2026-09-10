import { findHostByTestId, pressHost, renderElement } from '@/test/render-element';

import { ReaderChromeButton } from './reader-chrome-button';

describe('ReaderChromeButton', () => {
  it('forwards testID and does not press when disabled', () => {
    const onPress = jest.fn();
    const enabled = renderElement(
      <ReaderChromeButton
        label="›"
        accessibilityLabel="Next chapter"
        testID="reader-next-chapter"
        onPress={onPress}
      />,
    );
    pressHost(findHostByTestId(enabled, 'reader-next-chapter'));
    expect(onPress).toHaveBeenCalledTimes(1);
    const disabledPress = jest.fn();
    const disabled = renderElement(
      <ReaderChromeButton
        label="‹"
        accessibilityLabel="Previous chapter"
        testID="reader-prev-chapter"
        isDisabled
        onPress={disabledPress}
      />,
    );
    expect(findHostByTestId(disabled, 'reader-prev-chapter').props.disabled).toBe(true);
  });
});
