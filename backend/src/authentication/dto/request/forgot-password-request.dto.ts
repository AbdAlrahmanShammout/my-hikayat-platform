import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({
    description: 'Email address for the account to recover',
    example: 'reader@example.com',
    format: 'email',
  })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  email!: string;
}
