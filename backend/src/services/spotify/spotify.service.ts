import {ServiceDefinition} from '@/common/service.types';
import {buildUrlParameters} from '@/common/tools';
import {PlayingStateUpdated} from '@/services/spotify/actions/playing-state-updated';
import {UserService} from "@prisma/client";
import axios from "axios";
import {BadRequestException, UnauthorizedException} from "@nestjs/common";

async function oauth_callback(
    userService: UserService,
    params: { [key: string]: string },
): Promise<boolean> {
    const authorizationCode = params.code as string | undefined;
    if (!authorizationCode)
        throw new BadRequestException('Authorization code is missing');

    // Call spotify with the authorization code and userId to exchange for tokens
    const res = await axios.post('https://accounts.spotify.com/api/token', {
        code: authorizationCode,
        redirect_uri: `${process.env.APP_URL}/api/services/spotify/oauth/callback`,
        grant_type: 'authorization_code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    if (res.status !== 200)
        throw new UnauthorizedException("Failed to exchange authorization code for tokens");
    const tokens = res.data;
    // Store tokens associated with the userId in your database (not implemented here)
    const accessToken = tokens.access_token as string;
    const refreshToken = tokens.refresh_token as string;

    this.userserviceService.setConfigProperty(userService, 'access_token', accessToken);
    this.userserviceService.setConfigProperty(userService, 'refresh_token', refreshToken);

    return true;
}

export default class SpotifyService implements ServiceDefinition {
    name = 'spotify';
    label = 'Spotify';
    mandatory_env_vars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
    oauth_url = buildUrlParameters('https://accounts.spotify.com/authorize', {
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: `${process.env.APP_URL}/api/services/spotify/oauth/callback`,
        scope:
            'user-read-playback-state user-modify-playback-state user-read-currently-playing',
    });
    oauth_callback = oauth_callback;
    description =
        'Connect your Spotify account to automate music-related tasks and enhance your listening experience.';
    actions = [PlayingStateUpdated];
    reactions = [];
}
