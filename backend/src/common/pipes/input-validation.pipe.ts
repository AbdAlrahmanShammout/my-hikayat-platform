import { Injectable, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

import { ErrorKind } from '@/common/exceptions/error-kind.enum';
import { ValidationErrorObject } from '@/common/exceptions/validation-error-object.type';
import { ValidationExceptions } from '@/common/exceptions/validation.exception';

@Injectable()
export class InputValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[]) =>
        new ValidationExceptions({
          message: 'Invalid input',
          code: 'BAD_USER_INPUT',
          kind: ErrorKind.VALIDATION,
          validationErrorObjects: InputValidationPipe.getFactoryErrors(validationErrors),
        }),
    });
  }

  static getFactoryErrors(
    validationErrors: ValidationError[],
    parentProperty = '',
  ): ValidationErrorObject[] {
    return validationErrors.flatMap((error: ValidationError) => {
      const property: string =
        parentProperty === '' ? error.property : `${parentProperty}.${error.property}`;
      const current: ValidationErrorObject[] =
        error.constraints === undefined ? [] : [{ property, constraints: error.constraints }];
      const nested: ValidationErrorObject[] =
        error.children === undefined || error.children.length === 0
          ? []
          : InputValidationPipe.getFactoryErrors(error.children, property);
      return [...current, ...nested];
    });
  }
}
