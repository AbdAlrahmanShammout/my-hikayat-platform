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
import { CategoryService } from '@/modules/category/category.service';
import { CategoryPage } from '@/modules/category/defs/category-repository.defs';
import { CreateCategoryRequestDto } from '@/modules/category/dto/request/create-category-request.dto';
import { ListCategoriesRequestDto } from '@/modules/category/dto/request/list-categories-request.dto';
import { UpdateCategoryRequestDto } from '@/modules/category/dto/request/update-category-request.dto';
import { GetCategoriesResponseDto } from '@/modules/category/dto/response/get-categories-response.dto';
import { CategoryResponse } from '@/modules/category/dto/response/model/category.response';
import { CategoryEntity } from '@/modules/category/entity/category.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Admin - Categories')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class CategoryAdminController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a category with an optional slug and revenue weight' })
  @ApiBody({ type: CreateCategoryRequestDto })
  @ApiResponse({ status: 201, type: CategoryResponse })
  async createCategory(@Body() body: CreateCategoryRequestDto): Promise<CategoryResponse> {
    const entity: CategoryEntity = await this.categoryService.createCategory({
      name: body.name,
      slug: body.slug,
      categoryWeight: body.categoryWeight,
    });
    return new CategoryResponse(entity);
  }

  @Get()
  @ApiOperation({ summary: 'List categories including configured revenue weights' })
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a category including its configured revenue weight' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CategoryResponse })
  async getCategory(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponse> {
    const entity: CategoryEntity = await this.categoryService.getCategoryById(id);
    return new CategoryResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update the configured revenue weight for a category' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCategoryRequestDto })
  @ApiResponse({ status: 200, type: CategoryResponse })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryRequestDto,
  ): Promise<CategoryResponse> {
    const entity: CategoryEntity = await this.categoryService.updateCategory({
      id,
      categoryWeight: body.categoryWeight,
    });
    return new CategoryResponse(entity);
  }
}
