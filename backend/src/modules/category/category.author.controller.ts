import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CategoryService } from '@/modules/category/category.service';
import { CategoryPage } from '@/modules/category/defs/category-repository.defs';
import { ListCategoriesRequestDto } from '@/modules/category/dto/request/list-categories-request.dto';
import { GetCategoriesResponseDto } from '@/modules/category/dto/response/get-categories-response.dto';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Author - Categories')
@Controller('author/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AUTHOR, UserRole.ADMIN)
@ApiBearerAuth()
export class CategoryAuthorController {
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
