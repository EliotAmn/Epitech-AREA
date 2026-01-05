import {ServiceDefinition} from '@/common/service.types';
import {buildServiceRedirectUrl, buildUrlParameters} from '@/common/tools';
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
    const formData = new URLSearchParams();
    formData.append('code', authorizationCode);
    formData.append('redirect_uri', buildServiceRedirectUrl('spotify'));
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', process.env.SPOTIFY_CLIENT_ID!);
    formData.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET!);

    const res = await axios.post('https://accounts.spotify.com/api/token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (res.status !== 200)
        throw new UnauthorizedException("Failed to exchange authorization code for tokens");
    const tokens = res.data;
    // Store tokens associated with the userId in your database (not implemented here)
    const accessToken = tokens.access_token as string;
    const refreshToken = tokens.refresh_token as string;

    // Note: We can't use 'this' here in a standalone function
    // The userService config will be updated by the controller after this returns
    userService.service_config = {
        ...((userService.service_config as object) || {}),
        access_token: accessToken,
        refresh_token: refreshToken,
    };

    return true;
}

export default class SpotifyService implements ServiceDefinition {
    name = 'spotify';
    label = 'Spotify';
    mandatory_env_vars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
    oauth_url = buildUrlParameters('https://accounts.spotify.com/authorize', {
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: buildServiceRedirectUrl("spotify"),
        scope:
            'user-read-playback-state user-modify-playback-state user-read-currently-playing',
    });
    oauth_callback = oauth_callback;
    description =
        'Connect your Spotify account to automate music-related tasks and enhance your listening experience.';
    actions = [PlayingStateUpdated];
    reactions = [];
}
