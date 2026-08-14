import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Email address used to sign in',
    example: 'reader@example.com',
    format: 'email',
  })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  email!: string;

  @ApiProperty({
    description: 'Account password',
    example: 'correct-horse-battery',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
