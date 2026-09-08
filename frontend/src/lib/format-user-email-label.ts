type UserEmailLabelSource = {
  readonly userId: number;
  readonly user?: {
    readonly email?: string;
  };
};

/**
 * Related user email when the API included it; otherwise the user id.
 */
export function formatUserEmailLabel(source: UserEmailLabelSource): string {
  if (source.user?.email !== undefined && source.user.email !== '') {
    return source.user.email;
  }
  return `User #${String(source.userId)}`;
}
