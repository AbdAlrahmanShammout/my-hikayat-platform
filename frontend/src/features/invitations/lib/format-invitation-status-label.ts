const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  revoked: 'Revoked',
  expired: 'Expired',
};

/**
 * Presents a backend invitation status without changing its meaning.
 */
export function formatInvitationStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
