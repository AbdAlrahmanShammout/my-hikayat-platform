import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/common/constants/password.constant';

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'Recovery token from the password-reset email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'New account password',
    example: 'correct-horse-battery',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
