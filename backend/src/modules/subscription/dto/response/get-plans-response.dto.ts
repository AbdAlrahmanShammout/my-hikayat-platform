import { ApiProperty } from '@nestjs/swagger';

import { PlanPage } from '@/modules/subscription/defs/plan-repository.defs';
import { PlanResponse } from '@/modules/subscription/dto/response/model/plan.response';

export class GetPlansResponseDto {
  @ApiProperty({ type: () => [PlanResponse] })
  plans: PlanResponse[];

  @ApiProperty({ description: 'Total plans matching the filter', example: 2 })
  total: number;

  constructor(page: PlanPage, options: { readonly includeStripePriceId?: boolean } = {}) {
    this.plans = page.entities.map(
      (entity) => new PlanResponse(entity, { includeStripePriceId: options.includeStripePriceId }),
    );
    this.total = page.total;
  }
}
