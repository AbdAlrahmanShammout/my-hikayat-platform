import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AuthorDashboardSummaryService } from '@/modules/monetization/author-dashboard-summary.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

import { DashboardAuthorController } from './dashboard.author.controller';

function createSampleAuthor(): UserEntity {
  return new UserEntity({
    id: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    email: 'author@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.AUTHOR,
    isPublisher: true,
  });
}

describe('DashboardAuthorController', () => {
  let dashboardAuthorController: DashboardAuthorController;
  let mockAuthorDashboardSummaryService: { getAuthorDashboardSummary: jest.Mock };

  beforeEach(async () => {
    mockAuthorDashboardSummaryService = { getAuthorDashboardSummary: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [DashboardAuthorController],
      providers: [
        { provide: AuthorDashboardSummaryService, useValue: mockAuthorDashboardSummaryService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    dashboardAuthorController = moduleRef.get(DashboardAuthorController);
  });

  it('maps the principal onto the summary service without an owner query', async () => {
    mockAuthorDashboardSummaryService.getAuthorDashboardSummary.mockResolvedValue({
      totalBooks: 4,
      publishedBooks: 2,
      pendingReviewBooks: 1,
      totalReadingMinutes: 1.5,
      authorCents: 7000,
    });
    const actualResponse = await dashboardAuthorController.getAuthorDashboardSummary(
      createSampleAuthor(),
    );
    expect(mockAuthorDashboardSummaryService.getAuthorDashboardSummary).toHaveBeenCalledWith({
      ownerId: 3,
    });
    expect(actualResponse.totalBooks).toBe(4);
    expect(actualResponse.publishedBooks).toBe(2);
    expect(actualResponse.pendingReviewBooks).toBe(1);
    expect(actualResponse.totalReadingMinutes).toBe(1.5);
    expect(actualResponse.authorCents).toBe(7000);
  });
});
