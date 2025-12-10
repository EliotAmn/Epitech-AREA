import {Controller, Get, InternalServerErrorException, Req} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type {Request} from "express";
import axios from "axios";
import SpotifyService from "@/services/spotify/spotify.service";
import {UserServiceService} from "@/modules/user_service/userservice.service";

@ApiTags('services/spotify')
@Controller('services/spotify')
export class SpotifyController {
  constructor(
      private readonly userserviceService: UserServiceService,
  ) {}

    @Get('oauth/callback')
    async oauthCallback(@Req() req: Request & { user: { sub: string } }) {
        // Handle Spotify OAuth callback
        const userId = req.user?.sub;
        // Get the authorization code from query parameters
        const authorizationCode = req.query.code as string;

        if (!authorizationCode) {
            return { error: 'Authorization code is missing' };
        }

        // Call spotify with the authorization code and userId to exchange for tokens
        const res = await axios.post('https://accounts.spotify.com/api/token', {
            code: authorizationCode,
            redirect_uri: `${process.env.APP_URL}/api/services/spotify/oauth/callback`,
            grant_type: 'authorization_code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        });

        if (res.status !== 200) {
            return { error: 'Failed to exchange authorization code for tokens' };
        }

        const tokens = res.data;
        // Store tokens associated with the userId in your database (not implemented here)
        const accessToken = tokens.access_token as string;
        const refreshToken = tokens.refresh_token as string;

        // Store tokens on user service
        const userservice = await this.userserviceService.createOrFind(userId, SpotifyService.name);

        if (!userservice)
            throw new InternalServerErrorException('Failed to create or find user service');

        this.userserviceService.setConfigProperty(userservice, 'access_token', accessToken);
        this.userserviceService.setConfigProperty(userservice, 'refresh_token', refreshToken);

        return { message: 'Spotify account connected successfully' };

    }
}
