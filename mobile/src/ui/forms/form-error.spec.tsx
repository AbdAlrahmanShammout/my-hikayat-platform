import { findHostByTestId, renderElement } from '@/test/render-element';
import { FormError } from '@/ui/forms/form-error';

describe('FormError', () => {
  it('exposes the message as an alert', () => {
    const tree = renderElement(
      <FormError message="Could not sign in. Check your email and password." testID="auth-form-error" />,
    );
    const banner = findHostByTestId(tree, 'auth-form-error');
    expect(banner.props.accessibilityRole).toBe('alert');
    expect(
      tree.root.findByProps({
        children: 'Could not sign in. Check your email and password.',
      }),
    ).toBeTruthy();
  });
});
