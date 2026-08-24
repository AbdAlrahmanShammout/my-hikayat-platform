import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import { Throttle } from '@nestjs/throttler';

import { DEFAULT_THROTTLE_NAME } from '@/common/constants/http-surface.constant';
import { LoggedInUser } from '@/common/decorators/requests/logged-in-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookAssetContentKeyService } from '@/modules/book-asset/book-asset-content-key.service';
import { BookAssetDeliveryService } from '@/modules/book-asset/book-asset-delivery.service';
import { BOOK_CONTENT_KEY } from '@/modules/book-asset/book-content-key.constant';
import {
  BookAssetContentKey,
  BookAssetDeliveryGrant,
} from '@/modules/book-asset/defs/book-asset-service.defs';
import { CreateBookAssetContentKeyRequestDto } from '@/modules/book-asset/dto/request/create-book-asset-content-key-request.dto';
import { CreateBookAssetContentKeyResponseDto } from '@/modules/book-asset/dto/response/create-book-asset-content-key-response.dto';
import { CreateBookAssetDeliveryGrantResponseDto } from '@/modules/book-asset/dto/response/create-book-asset-delivery-grant-response.dto';
import { UserEntity } from '@/modules/user/entity/user.entity';

@ApiTags('Reader - Books')
@Controller('reader/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookAssetReaderController {
  constructor(
    private readonly bookAssetDeliveryService: BookAssetDeliveryService,
    private readonly bookAssetContentKeyService: BookAssetContentKeyService,
  ) {}

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

  @Post(':bookId/content-key')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    [DEFAULT_THROTTLE_NAME]: {
      ttl: BOOK_CONTENT_KEY.throttleTtlMs,
      limit: BOOK_CONTENT_KEY.throttleLimit,
    },
  })
  @ApiOperation({
    summary:
      'Issue the per-asset content key (DEK) for an open entitled reading session. Never returns the master key.',
  })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiBody({ type: CreateBookAssetContentKeyRequestDto })
  @ApiResponse({ status: 200, type: CreateBookAssetContentKeyResponseDto })
  async createSourceContentKey(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() body: CreateBookAssetContentKeyRequestDto,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<CreateBookAssetContentKeyResponseDto> {
    const contentKey: BookAssetContentKey =
      await this.bookAssetContentKeyService.createSourceContentKey({
        bookId,
        userId: currentUser.id,
        sessionId: body.sessionId,
      });
    return new CreateBookAssetContentKeyResponseDto(contentKey);
  }
}
