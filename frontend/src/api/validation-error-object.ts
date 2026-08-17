export type ValidationErrorObject = {
  readonly property: string;
  readonly constraints: Record<string, string>;
};
