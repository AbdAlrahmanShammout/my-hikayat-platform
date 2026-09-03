import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Enumeration-safe acknowledgement shown whether or not the email exists',
    example:
      'If an account exists for that email, password reset instructions have been sent.',
  })
  readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}
