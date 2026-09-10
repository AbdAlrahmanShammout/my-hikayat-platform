import { findHostByTestId, pressHost, renderElement } from '@/test/render-element';
import { Button } from '@/ui/primitives/button';

describe('Button', () => {
  it('forwards testID and invokes onPress', () => {
    const onPress = jest.fn();
    const tree = renderElement(
      <Button label="Sign In" onPress={onPress} testID="auth-sign-in-submit" />,
    );
    pressHost(findHostByTestId(tree, 'auth-sign-in-submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not press when disabled', () => {
    const onPress = jest.fn();
    const tree = renderElement(
      <Button label="Save" onPress={onPress} isDisabled testID="btn-disabled" />,
    );
    const pressable = findHostByTestId(tree, 'btn-disabled');
    expect(pressable.props.disabled).toBe(true);
    expect(pressable.props.accessibilityState).toEqual({ disabled: true, busy: false });
  });
});
