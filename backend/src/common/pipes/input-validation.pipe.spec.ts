import { IsNotEmpty, IsString } from 'class-validator';
import type { ValidationError } from 'class-validator';

import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { ValidationExceptions } from '@/common/exceptions/validation.exception';
import { InputValidationPipe } from '@/common/pipes/input-validation.pipe';

class SampleRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

describe('InputValidationPipe', () => {
  const pipe = new InputValidationPipe();

  it('flattens nested validation errors into dotted property paths', () => {
    const nestedError: ValidationError = {
      property: 'address',
      children: [
        {
          property: 'city',
          constraints: { isString: 'city must be a string' },
          children: [],
        },
      ],
    };
    const actualErrors = InputValidationPipe.getFactoryErrors([nestedError]);
    expect(actualErrors).toEqual([
      { property: 'address.city', constraints: { isString: 'city must be a string' } },
    ]);
  });

  it('throws ValidationExceptions for invalid input', async () => {
    const act = (): Promise<unknown> =>
      pipe.transform({ title: 1 }, { type: 'body', metatype: SampleRequestDto });
    await expect(act()).rejects.toBeInstanceOf(ValidationExceptions);
    await expect(act()).rejects.toMatchObject({
      code: 'BAD_USER_INPUT',
      kind: ErrorKind.VALIDATION,
    });
  });

  it('strips properties that are not declared on the DTO', async () => {
    const actualResult = await pipe.transform(
      { title: 'ok', extra: 'nope' },
      { type: 'body', metatype: SampleRequestDto },
    );
    expect(actualResult).toEqual({ title: 'ok' });
    expect(actualResult).not.toHaveProperty('extra');
  });
});
