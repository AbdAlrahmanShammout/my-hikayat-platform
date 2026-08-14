export type CreateUserServiceInput = {
  readonly email: string;
  readonly passwordHash: string;
};

export type EnablePublisherCapabilityServiceInput = {
  readonly userId: number;
};
