import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import axios from 'axios';
import type { Response } from 'express';

import { CreateUserDto, isAuthPlatform } from '../user/dto/create-user.dto';
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
  @ApiOperation({ summary: 'Start Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google consent page' })
  googleAuth(@Res() res: Response) {
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const appUrl = this.configService.get<string>('APP_URL') || '';
    if (!clientID) throw new BadRequestException('Google OAuth not configured');

    const callbackURL = `${appUrl.replace(/\/$/, '')}/auth/google/redirect`;
    const scope = encodeURIComponent(
      'email profile https://www.googleapis.com/auth/gmail.send',
    );
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientID,
    )}&redirect_uri=${encodeURIComponent(callbackURL)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    return res.redirect(url);
  }

  @Get('google/redirect')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Returns an HTML page that posts grant_code to the frontend',
  })
  async googleRedirect(
    @Query('code') code: string,
    @Query('error') error: string,
  ) {
    if (error) throw new BadRequestException(error);
    if (!code) throw new BadRequestException('Missing code');

    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const appUrl = this.configService.get<string>('APP_URL') || '';
    const redirectUri = `${appUrl.replace(/\/$/, '')}/auth/google/redirect`;
    if (!clientID || !clientSecret) {
      throw new BadRequestException('Google OAuth not configured');
    }

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientID);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    const tokenResp = await axios.post(
      'https://oauth2.googleapis.com/token',
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    const tokens = tokenResp.data as Record<string, any>;
    const accessToken = tokens.access_token as string | undefined;
    const refreshToken = tokens.refresh_token as string | undefined;

    if (!accessToken)
      throw new BadRequestException('Failed to obtain access token');

    type GoogleUser = {
      id: string;
      email?: string;
      name?: string;
      [key: string]: any;
    };

    const userResp = await axios.get<GoogleUser>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const { id, email, name } = userResp.data;

    const expiresIn =
      typeof tokens.expires_in === 'number'
        ? tokens.expires_in
        : typeof tokens.expires_in === 'string' &&
            /^[0-9]+$/.test(tokens.expires_in)
          ? parseInt(tokens.expires_in, 10)
          : undefined;

    const profile = {
      provider: 'google',
      id,
      email,
      displayName: name,
      accessToken,
      refreshToken,
      raw: userResp.data,
      expires_in: expiresIn,
    };

    return this.handleProviderRedirect('google', { user: profile });
  }

  @Get('github')
  @ApiOperation({ summary: 'Start GitHub OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub consent page' })
  githubAuth(@Res() res: Response) {
    const clientID = this.configService.get<string>('GITHUB_CLIENT_ID');
    const appUrl = this.configService.get<string>('APP_URL') || '';
    if (!clientID) throw new BadRequestException('GitHub OAuth not configured');

    const callbackURL = `${appUrl.replace(/\/$/, '')}/auth/github/redirect`;
    const scope = encodeURIComponent('read:user user:email');
    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientID,
    )}&redirect_uri=${encodeURIComponent(callbackURL)}&scope=${scope}`;
    return res.redirect(url);
  }

  @Get('github/redirect')
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Returns an HTML page that posts grant_code to the frontend',
  })
  async githubRedirect(
    @Query('code') code: string,
    @Query('error') error: string,
  ) {
    if (error) throw new BadRequestException(error);
    if (!code) throw new BadRequestException('Missing code');

    const clientID = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    const appUrl = this.configService.get<string>('APP_URL') || '';
    const redirectUri = `${appUrl.replace(/\/$/, '')}/auth/github/redirect`;
    if (!clientID || !clientSecret) {
      throw new BadRequestException('GitHub OAuth not configured');
    }

    const tokenResp = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientID,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      },
      { headers: { Accept: 'application/json' } },
    );

    const tokens = tokenResp.data as Record<string, any>;
    const accessToken = tokens.access_token as string | undefined;
    if (!accessToken)
      throw new BadRequestException('Failed to obtain access token');

    type GitHubUser = {
      id: string | number;
      email?: string | null;
      name?: string | null;
      login?: string;
      [key: string]: any;
    };

    const userResp = await axios.get<GitHubUser>(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    // GitHub email may require separate call; try to extract primary email if present
    let email: string | undefined =
      typeof userResp.data.email === 'string' ? userResp.data.email : undefined;
    if (!email) {
      try {
        const emailsResp = await axios.get<
          Array<{ email: string; primary?: boolean; verified?: boolean }>
        >('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });
        const primary =
          (emailsResp.data || []).find((e) => e.primary) ||
          emailsResp.data?.[0];
        email = primary?.email;
      } catch {
        // ignore
      }
    }

    const profile = {
      provider: 'github',
      id: userResp.data.id,
      email,
      displayName: userResp.data.name || userResp.data.login,
      accessToken,
      refreshToken: undefined,
      raw: userResp.data,
    };

    return this.handleProviderRedirect('github', { user: profile });
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
      this.configService.get<string>('MOBILE_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      '*';
    const origin = frontend === '*' ? '*' : frontend.replace(/\/$/, '');

    const grant = this.oauthService.createGrant(result.access_token);

    const rawUser = result.user as Partial<Record<string, unknown>>;
    const candidate = rawUser
      ? (rawUser as Record<string, unknown>)['auth_platform']
      : undefined;
    const auth_platform = isAuthPlatform(candidate) ? candidate : undefined;

    const userDto: Partial<CreateUserDto> = {
      ...(rawUser as Partial<CreateUserDto>),
      auth_platform,
    };

    return this.buildRedirectHtmlWithGrant(userDto, grant, origin);
  }
}
