import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookAssetDeliveryService } from '@/modules/book-asset/book-asset-delivery.service';
import { BookAssetDeliveryGrant } from '@/modules/book-asset/defs/book-asset-service.defs';
import { CreateBookAssetDeliveryGrantResponseDto } from '@/modules/book-asset/dto/response/create-book-asset-delivery-grant-response.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Books')
@Controller('reader/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookAssetReaderController {
  constructor(private readonly bookAssetDeliveryService: BookAssetDeliveryService) {}

  @Post(':bookId/delivery-grant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Issue a short-lived URL to download the encrypted source file',
  })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: CreateBookAssetDeliveryGrantResponseDto })
  async createSourceDeliveryGrant(
    @Param('bookId', ParseIntPipe) bookId: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CreateBookAssetDeliveryGrantResponseDto> {
    const grant: BookAssetDeliveryGrant =
      await this.bookAssetDeliveryService.createSourceDeliveryGrant({
        bookId,
        userId: currentUser.id,
      });
    return new CreateBookAssetDeliveryGrantResponseDto(grant);
  }
}
