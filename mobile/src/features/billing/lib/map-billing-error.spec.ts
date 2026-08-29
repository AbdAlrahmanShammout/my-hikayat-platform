import { ApiError } from '@/api/api-error';
import { mapBillingError } from '@/features/billing/lib/map-billing-error';

describe('mapBillingError', () => {
  it('maps trial already used with the server message', () => {
    const actual: string = mapBillingError(
      new ApiError({
        message: 'The free trial has already been used for this account',
        code: 'TRIAL_ALREADY_USED',
        statusCode: 409,
      }),
    );
    expect(actual).toContain('already been used');
  });

  it('maps trial not needed with the server message', () => {
    const actual: string = mapBillingError(
      new ApiError({
        message: 'Paid access is already active',
        code: 'TRIAL_NOT_NEEDED',
        statusCode: 409,
      }),
    );
    expect(actual).toContain('already active');
  });

  it('maps a generic failure when the error is unknown', () => {
    expect(mapBillingError(new Error('boom'))).toBe('Could not talk to billing right now.');
  });
});
