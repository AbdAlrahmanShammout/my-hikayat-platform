import { ErrorKind } from '@/common/exceptions/error-kind.enum';

import { MailFailureException } from './mail-failure.exception';

describe('MailFailureException', () => {
  it('reports a mail dependency failure without an HTTP status', () => {
    const actualException = new MailFailureException();
    expect(actualException.kind).toBe(ErrorKind.DEPENDENCY_FAILURE);
    expect(actualException.code).toBe('MAIL_FAILURE');
    expect(actualException.userFriendly).toBe(false);
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
