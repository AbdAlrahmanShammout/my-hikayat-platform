import { ValidationErrorObject } from '@/common/exceptions/validation-error-object.type';

export type GeneralTypeExceptionInput = {
  readonly message: string;
  readonly code: string;
  readonly statusCode: number;
  readonly userFriendly: boolean;
  readonly stack?: string;
  readonly validationErrorObjects?: ValidationErrorObject[];
};

export class GeneralTypeException {
  readonly message: string;
  readonly code: string;
  readonly statusCode: number;
  readonly userFriendly: boolean;
  readonly stack?: string;
  readonly validationErrorObjects?: ValidationErrorObject[];

  constructor(data: GeneralTypeExceptionInput) {
    this.message = data.message;
    this.code = data.code;
    this.statusCode = data.statusCode;
    this.userFriendly = data.userFriendly;
    this.stack = data.stack;
    this.validationErrorObjects = data.validationErrorObjects;
  }
}
