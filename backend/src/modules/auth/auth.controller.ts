import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { OauthService } from './oauth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OauthService,
    private readonly configService: ConfigService,
  ) {}

  private buildRedirectHtmlWithGrant(
    userPayload: Partial<CreateUserDto>,
    grantCode: string,
    origin: string,
  ) {
    const safeOriginForRedirect = origin === '*' ? '/' : origin;
    return `<!doctype html>
<html>
  <head><meta charset="utf-8"/></head>
  <body>
    <script>
      (function(){
        try {
          const payload = ${JSON.stringify(userPayload || {})};
          const grant = ${JSON.stringify(grantCode)};
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage({ user: payload, grant_code: grant }, ${JSON.stringify(origin)});
            } catch(e) { console.error('postMessage failed', e); }
            setTimeout(() => window.close(), 100);
            return;
          }
          // same-tab: redirect to frontend with grant code in hash (no token in URL)
          const redirectTo = ${JSON.stringify(safeOriginForRedirect)} + '#oauth_code=' + encodeURIComponent(grant);
          window.location.replace(redirectTo);
        } catch(e) {
          console.error('OAuth redirect handling failed', e);
          document.body.innerText = 'Authentication completed. You can close this window and return to the app.';
        }
      })();
    </script>
  </body>
</html>`;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Start Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google consent page' })
  googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Returns an HTML page that posts grant_code to the frontend',
  })
  async googleRedirect(@Req() req: { user?: unknown }) {
    return this.handleProviderRedirect('google', req);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Start GitHub OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub consent page' })
  githubAuth() {}

  @Get('github/redirect')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Returns an HTML page that posts grant_code to the frontend',
  })
  async githubRedirect(@Req() req: { user?: unknown }) {
    return this.handleProviderRedirect('github', req);
  }

  @Get('oauth/consume')
  @ApiOperation({
    summary: 'Consume an OAuth grant code to receive an access token',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Grant code returned by the provider redirect',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns access_token when code is valid',
  })
  @ApiResponse({ status: 400, description: 'Missing or invalid code' })
  consumeGrant(@Query('code') code: string) {
    if (!code) throw new BadRequestException('code required');
    const token = this.oauthService.consumeGrant(code);
    if (!token) throw new BadRequestException('Invalid or expired code');
    return { access_token: token };
  }

  @Post('oauth/:provider/authorize')
  @ApiOperation({ summary: 'Get provider authorize URL for frontend' })
  @ApiParam({ name: 'provider', description: 'Provider name (google|github)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a URL to start OAuth flow',
  })
  @ApiResponse({ status: 400, description: 'Unsupported provider' })
  authorize(@Param('provider') provider: string) {
    const allowed = ['google', 'github'];
    if (!allowed.includes(provider)) {
      throw new BadRequestException('Unsupported provider');
    }

    const appUrl = this.configService.get<string>('APP_URL') || '';
    const url = `${appUrl.replace(/\/$/, '')}/auth/${provider}`;
    return { url };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Returns JWT access token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created and may return token or user info',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  private async handleProviderRedirect(
    provider: string,
    req: { user?: unknown },
  ) {
    const profile = req.user;
    if (!profile) throw new BadRequestException('Invalid provider response');

    const result = await this.oauthService.handleProviderCallback(
      provider,
      profile,
    );

    const frontend =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      '*';
    const origin = frontend === '*' ? '*' : frontend.replace(/\/$/, '');

    const grant = this.oauthService.createGrant(result.access_token);

    return this.buildRedirectHtmlWithGrant(result.user, grant, origin);
  }
}
