import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class CreateAdminInvitationRequestDto {
  @ApiProperty({
    description: 'Email address that may accept the admin invitation',
    example: 'new-admin@example.com',
    format: 'email',
  })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email!: string;
}
