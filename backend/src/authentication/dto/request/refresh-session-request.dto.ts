import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshSessionRequestDto {
  @ApiProperty({
    description: 'Refresh token issued with the access session',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
