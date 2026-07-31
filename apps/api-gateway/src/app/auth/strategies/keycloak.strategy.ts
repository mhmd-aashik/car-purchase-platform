import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import JwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser, JwtPayload } from '../types';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwksUri = process.env.KEYCLOAK_JWKS_URI;
    if (!jwksUri) {
      throw new Error('KEYCLOAK_JWKS_URI environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKeyProvider: JwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      userId: payload.sub,
      username: payload.preferred_username,
      email: payload.email ?? '',
      roles: payload.realm_access?.roles ?? [],
    };
  }
}
