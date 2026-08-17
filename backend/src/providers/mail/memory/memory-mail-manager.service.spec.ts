import { MemoryMailManagerService } from './memory-mail-manager.service';

describe('MemoryMailManagerService', () => {
  let memoryMailManagerService: MemoryMailManagerService;

  beforeEach(() => {
    memoryMailManagerService = new MemoryMailManagerService();
  });

  it('records sent messages for later inspection', async () => {
    await memoryMailManagerService.send({
      to: 'new-admin@example.com',
      subject: 'You are invited to administer Noory',
      text: 'Open the invitation link to set your password.',
    });
    expect(memoryMailManagerService.readSentMessages()).toEqual([
      {
        to: 'new-admin@example.com',
        subject: 'You are invited to administer Noory',
        text: 'Open the invitation link to set your password.',
        html: undefined,
      },
    ]);
  });
});
