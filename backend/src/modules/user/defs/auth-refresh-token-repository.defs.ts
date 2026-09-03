export type CreateAuthRefreshTokenRepoInput = {
  readonly userId: number;
  readonly tokenHash: string;
  readonly expiresAt: Date;
};
