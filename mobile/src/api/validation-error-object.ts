/**
 * Field-level validation error from the NestJS exception envelope.
 */
export type ValidationErrorObject = {
  readonly property: string;
  readonly constraints: Readonly<Record<string, string>>;
};
