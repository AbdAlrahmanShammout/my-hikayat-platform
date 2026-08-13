import { ResourceNotFoundException } from './resource-not-found.exception';
import { ErrorKind } from './error-kind.enum';

describe('ResourceNotFoundException', () => {
  it('names the missing resource without an HTTP status', () => {
    const actualException = new ResourceNotFoundException('Book', 7);
    expect(actualException.kind).toBe(ErrorKind.NOT_FOUND);
    expect(actualException.code).toBe('RESOURCE_NOT_FOUND');
    expect(actualException.userFriendly).toBe(true);
    expect(actualException.message).toBe('Book with identifier 7 was not found');
    expect(actualException).not.toHaveProperty('statusCode');
  });
});
