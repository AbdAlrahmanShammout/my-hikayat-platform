import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminDashboardSummaryService } from '@/modules/monetization/admin-dashboard-summary.service';

import { DashboardAdminController } from './dashboard.admin.controller';

describe('DashboardAdminController', () => {
  let dashboardAdminController: DashboardAdminController;
  let mockAdminDashboardSummaryService: { getAdminDashboardSummary: jest.Mock };

  beforeEach(async () => {
    mockAdminDashboardSummaryService = { getAdminDashboardSummary: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [DashboardAdminController],
      providers: [
        { provide: AdminDashboardSummaryService, useValue: mockAdminDashboardSummaryService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    dashboardAdminController = moduleRef.get(DashboardAdminController);
  });

  it('returns the platform summary without query filters', async () => {
    mockAdminDashboardSummaryService.getAdminDashboardSummary.mockResolvedValue({
      totalUsers: 10,
      totalPublishers: 3,
      totalBooks: 8,
      publishedBooks: 5,
      pendingReviewBooks: 2,
      totalReadingMinutes: 1.5,
    });
    const actualResponse = await dashboardAdminController.getAdminDashboardSummary();
    expect(mockAdminDashboardSummaryService.getAdminDashboardSummary).toHaveBeenCalledWith();
    expect(actualResponse.totalUsers).toBe(10);
    expect(actualResponse.totalPublishers).toBe(3);
    expect(actualResponse.totalBooks).toBe(8);
    expect(actualResponse.publishedBooks).toBe(5);
    expect(actualResponse.pendingReviewBooks).toBe(2);
    expect(actualResponse.totalReadingMinutes).toBe(1.5);
  });
});
