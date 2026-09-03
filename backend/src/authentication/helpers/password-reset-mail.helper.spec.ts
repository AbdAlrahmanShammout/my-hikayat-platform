import { buildPasswordResetDeepLink, buildPasswordResetMail } from './password-reset-mail.helper';

describe('password reset mail helper', () => {
  it('builds a reader deep link with an encoded token', () => {
    expect(buildPasswordResetDeepLink('a+b/c')).toBe(
      'reader://reset-password?token=a%2Bb%2Fc',
    );
  });

  it('includes the token and deep link in the email body', () => {
    const actual = buildPasswordResetMail({
      email: 'reader@example.com',
      token: 'recovery.jwt',
      publicOrigin: 'http://localhost:5173/',
      expiresIn: '1h',
    });
    expect(actual.to).toBe('reader@example.com');
    expect(actual.subject.toLowerCase()).toContain('reset');
    expect(actual.text).toContain('reader://reset-password?token=recovery.jwt');
    expect(actual.text).toContain('recovery.jwt');
    expect(actual.text.toLowerCase()).not.toContain('passwordhash');
  });
});
