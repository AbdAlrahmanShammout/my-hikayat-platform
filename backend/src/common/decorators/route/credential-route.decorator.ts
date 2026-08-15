import { SetMetadata } from '@nestjs/common';

export const IS_CREDENTIAL_ROUTE_KEY = 'isCredentialRoute';
export const CredentialRoute = () => SetMetadata(IS_CREDENTIAL_ROUTE_KEY, true);
