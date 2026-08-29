import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PlanPage } from '@/modules/subscription/defs/plan-repository.defs';
import { CreatePlanRequestDto } from '@/modules/subscription/dto/request/create-plan-request.dto';
import { ListPlansRequestDto } from '@/modules/subscription/dto/request/list-plans-request.dto';
import { UpdatePlanRequestDto } from '@/modules/subscription/dto/request/update-plan-request.dto';
import { GetPlansResponseDto } from '@/modules/subscription/dto/response/get-plans-response.dto';
import { PlanResponse } from '@/modules/subscription/dto/response/model/plan.response';
import { PlanEntity } from '@/modules/subscription/entity/plan.entity';
import { PlanService } from '@/modules/subscription/plan.service';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Plans')
@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class PlanAdminController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @ApiOperation({ summary: 'Register a catalog plan (Stripe price for paid plans)' })
  @ApiBody({ type: CreatePlanRequestDto })
  @ApiResponse({ status: 201, type: PlanResponse })
  async createPlan(@Body() body: CreatePlanRequestDto): Promise<PlanResponse> {
    const entity: PlanEntity = await this.planService.createPlan({
      name: body.name,
      description: body.description,
      kind: body.kind,
      slug: body.slug,
      stripePriceId: body.stripePriceId,
    });
    return new PlanResponse(entity, { includeStripePriceId: true });
  }

  @Get()
  @ApiOperation({ summary: 'List subscription catalog plans' })
  @ApiResponse({ status: 200, type: GetPlansResponseDto })
  async listPlans(@Query() query: ListPlansRequestDto): Promise<GetPlansResponseDto> {
    const page: PlanPage = await this.planService.listPlans({
      limit: query.limit,
      offset: query.offset,
      kind: query.kind,
    });
    return new GetPlansResponseDto(page, { includeStripePriceId: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription catalog plan' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: PlanResponse })
  async getPlan(@Param('id', ParseIntPipe) id: number): Promise<PlanResponse> {
    const entity: PlanEntity = await this.planService.getPlanById(id);
    return new PlanResponse(entity, { includeStripePriceId: true });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plan display fields and optional Stripe price' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePlanRequestDto })
  @ApiResponse({ status: 200, type: PlanResponse })
  async updatePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePlanRequestDto,
  ): Promise<PlanResponse> {
    const entity: PlanEntity = await this.planService.updatePlan({
      id,
      name: body.name,
      description: body.description,
      stripePriceId: body.stripePriceId,
    });
    return new PlanResponse(entity, { includeStripePriceId: true });
  }
}
