import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/common/constants/password.constant';
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
} from '@/modules/user/consts/display-name.constant';

export class RegisterRequestDto {
  @ApiProperty({
    description: 'Email address used to sign in',
    example: 'reader@example.com',
    format: 'email',
  })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  email!: string;

  @ApiProperty({
    description: 'Display name used for greetings. First name is derived from the first token.',
    example: 'Aisha Rahimah',
    minLength: DISPLAY_NAME_MIN_LENGTH,
    maxLength: DISPLAY_NAME_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(DISPLAY_NAME_MIN_LENGTH)
  @MaxLength(DISPLAY_NAME_MAX_LENGTH)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return value.trim().replace(/\s+/g, ' ');
  })
  displayName!: string;

  @ApiProperty({
    description: 'Account password',
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
