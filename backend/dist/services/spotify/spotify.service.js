"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const tools_1 = require("../../common/tools");
const playing_state_updated_1 = require("./actions/playing-state-updated");
async function oauth_callback(userService, params) {
    const authorizationCode = params.code;
    if (!authorizationCode)
        throw new common_1.BadRequestException('Authorization code is missing');
    const redirectUri = (0, tools_1.buildServiceRedirectUrl)('spotify');
    const formData = new URLSearchParams();
    formData.append('code', authorizationCode);
    formData.append('redirect_uri', redirectUri);
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    formData.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET);
    try {
        const res = await axios_1.default.post('https://accounts.spotify.com/api/token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        if (res.status !== 200)
            throw new common_1.UnauthorizedException('Failed to exchange authorization code for tokens');
        const tokens = res.data;
        const accessToken = tokens.access_token;
        const refreshToken = tokens.refresh_token;
        console.log('✅ Spotify OAuth successful!');
        userService.service_config = {
            ...(userService.service_config || {}),
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    catch (error) {
        const axiosError = error;
        console.error('=== SPOTIFY OAUTH ERROR ===');
        console.error('Error response:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        console.error('Error message:', axiosError.message);
        console.error('========================');
        const errorDetail = axiosError.response?.data?.error_description || axiosError.message;
        throw new common_1.UnauthorizedException(`Spotify OAuth failed: ${errorDetail}`);
    }
    return true;
}
class SpotifyService {
    name = 'spotify';
    label = 'Spotify';
    mandatory_env_vars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
    oauth_url = (0, tools_1.buildUrlParameters)('https://accounts.spotify.com/authorize', {
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: (0, tools_1.buildServiceRedirectUrl)('spotify'),
        scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing',
    });
    oauth_callback = oauth_callback;
    description = 'Connect your Spotify account to automate music-related tasks and enhance your listening experience.';
    actions = [playing_state_updated_1.PlayingStateUpdated];
    reactions = [];
}
exports.default = SpotifyService;
//# sourceMappingURL=spotify.service.js.map