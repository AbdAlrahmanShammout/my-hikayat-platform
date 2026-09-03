import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Confirmation that the password was updated',
    example: 'Your password was updated. You can sign in with the new password.',
  })
  readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}
