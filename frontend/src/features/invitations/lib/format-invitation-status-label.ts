import type { components } from '@/generated/admin';

type InvitationStatus = components['schemas']['AdminInvitationResponse']['status'];

const STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
};

/**
 * Presents a backend invitation status without changing its meaning.
 */
export function formatInvitationStatusLabel(status: InvitationStatus): string {
  return STATUS_LABELS[status];
}
