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
import { Roles } from '@/common/decorators/route/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BookResponse } from '@/modules/book/dto/response/model/book.response';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookProcessingOrchestrationService } from '@/modules/book-processing/book-processing-orchestration.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserRole } from '@/modules/user/enum/general.enum';

@ApiTags('Author - Books')
@Controller('author/books')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AUTHOR, UserRole.ADMIN)
@ApiBearerAuth()
export class BookAuthorController {
  constructor(
    private readonly bookProcessingOrchestrationService: BookProcessingOrchestrationService,
  ) {}

  @Post(':bookId/submit-for-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process the book source if needed and submit it for editorial review' })
  @ApiParam({ name: 'bookId', type: Number })
  @ApiResponse({ status: 200, type: BookResponse })
  async submitForReview(
    @Param('bookId', ParseIntPipe) bookId: number,
    @LoggedInUser() currentUser: UserEntity,
  ): Promise<BookResponse> {
    const entity: BookEntity = await this.bookProcessingOrchestrationService.submitForReview({
      bookId,
      actorId: currentUser.id,
      actorRole: currentUser.role,
    });
    return new BookResponse(entity);
  }
}
