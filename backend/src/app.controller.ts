import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AppService } from './app.service';

@Controller('discord')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Step A: Redirect user to Discord to approve
  @Get('login')
  login(@Res() res: Response) {
    const url = this.appService.getDiscordAuthUrl();
    res.redirect(url);
  }

  // Step B: Discord redirects back here with a ?code=XYZ
  @Get('callback')
  async callback(@Query('code') code: string) {
    if (!code) return 'No code provided';

    // Exchange code for token
    const tokenData = await this.appService.getAccessToken(code);

    return {
      message: 'OAuth2 Successful',
      token_info: tokenData, // Contains access_token, refresh_token
    };
  }

  // Step C: Manually trigger a message send
  @Post('send-message')
  async sendMessage(@Body() body: { channelId: string; message: string }) {
    return this.appService.sendMessage(body.channelId, body.message);
  }
}
