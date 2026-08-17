import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

export async function deleteUsersByEmail(
  prismaProviderService: PrismaProviderService,
  emailOrEmails: string | readonly string[],
): Promise<void> {
  const emails: string[] = typeof emailOrEmails === 'string' ? [emailOrEmails] : [...emailOrEmails];
  await prismaProviderService.auditLog.deleteMany({
    where: { actor: { email: { in: emails } } },
  });
  await prismaProviderService.adminInvitation.deleteMany({
    where: {
      OR: [{ email: { in: emails } }, { invitedBy: { email: { in: emails } } }],
    },
  });
  await prismaProviderService.user.deleteMany({
    where: { email: { in: emails } },
  });
}
