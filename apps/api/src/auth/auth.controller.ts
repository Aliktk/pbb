import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService, type AuthTokens, type PublicUser } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public, CurrentUser } from '../rbac/decorators';
import type { AuthUser } from '../rbac/auth-user';

/**
 * Staff authentication (§4). login/refresh/logout are public (they establish the session);
 * /me requires a valid access token - the global JwtAuthGuard enforces that.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Tight limit: password guessing and refresh-token abuse are the attacks that matter here.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Public()
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return this.auth.login(dto);
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Public()
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto): Promise<AuthTokens> {
    return this.auth.refresh(dto.refreshToken);
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): PublicUser {
    return this.auth.publicUser(user);
  }
}
