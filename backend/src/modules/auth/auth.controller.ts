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
import { ApiTags } from '@nestjs/swagger';

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
    userPayload: any,
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
  googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: { user?: unknown }) {
    const profile = req.user;
    if (!profile) throw new BadRequestException('Invalid provider response');
    const result = await this.oauthService.handleProviderCallback(
      'google',
      profile,
    );

    const frontend =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      '*';
    const origin = frontend === '*' ? '*' : frontend.replace(/\/$/, '');

    const grant = await this.oauthService.createGrant(result.access_token);

    return this.buildRedirectHtmlWithGrant(result.user, grant, origin);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {}

  @Get('github/redirect')
  @UseGuards(AuthGuard('github'))
  async githubRedirect(@Req() req: { user?: unknown }) {
    const profile = req.user;
    if (!profile) throw new BadRequestException('Invalid provider response');
    const result = await this.oauthService.handleProviderCallback(
      'github',
      profile,
    );

    const frontend =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      '*';
    const origin = frontend === '*' ? '*' : frontend.replace(/\/$/, '');

    const grant = await this.oauthService.createGrant(result.access_token);

    return this.buildRedirectHtmlWithGrant(result.user, grant, origin);
  }

  @Get('oauth/consume')
  async consumeGrant(@Query('code') code: string) {
    if (!code) throw new BadRequestException('code required');
    const token = await this.oauthService.consumeGrant(code);
    if (!token) throw new BadRequestException('Invalid or expired code');
    return { access_token: token };
  }

  @Post('oauth/:provider/authorize')
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
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }
}
