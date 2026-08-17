import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CategoryService } from '@/modules/category/category.service';
import { CategoryPage } from '@/modules/category/defs/category-repository.defs';
import { ListCategoriesRequestDto } from '@/modules/category/dto/request/list-categories-request.dto';
import { GetCategoriesResponseDto } from '@/modules/category/dto/response/get-categories-response.dto';

@ApiTags('Reader - Categories')
@Controller('reader/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoryReaderController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'List the admin-owned category taxonomy' })
  @ApiResponse({ status: 200, type: GetCategoriesResponseDto })
  async listCategories(
    @Query() query: ListCategoriesRequestDto,
  ): Promise<GetCategoriesResponseDto> {
    const page: CategoryPage = await this.categoryService.listCategories({
      limit: query.limit,
      offset: query.offset,
    });
    return new GetCategoriesResponseDto(page);
  }
}
