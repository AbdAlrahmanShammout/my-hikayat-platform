import { ApiProperty } from '@nestjs/swagger';

import { AUTH_TOKEN_TYPE } from '@/authentication/consts';
import { AuthSession } from '@/authentication/defs/auth-service.defs';
import { UserResponse } from '@/modules/user/dto/response/model/user.response';

export class AuthSessionResponseDto {
  @ApiProperty({
    description: 'Signed access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  accessToken: string;

  @ApiProperty({ description: 'Token type for the Authorization header', example: AUTH_TOKEN_TYPE })
  tokenType: string;

  @ApiProperty({ description: 'Access-token lifetime', example: '15m' })
  expiresIn: string;

  @ApiProperty({ type: () => UserResponse })
  user: UserResponse;

  constructor(session: AuthSession) {
    this.accessToken = session.accessToken;
    this.tokenType = AUTH_TOKEN_TYPE;
    this.expiresIn = session.expiresIn;
    this.user = new UserResponse(session.user);
  }
}
