import { ServiceDefinition } from '@/common/service.types';
import { buildUrlParameters } from '@/common/tools';
import { PlayingStateUpdated } from '@/services/spotify/actions/playing-state-updated';

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
  description =
    'Connect your Spotify account to automate music-related tasks and enhance your listening experience.';
  actions = [PlayingStateUpdated];
  reactions = [];
}
