import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface SpotifyTrack {
  name: string;
  id: string;
  artists: Array<{ name: string }>;
  album: { name: string };
}

interface SpotifyPlayerResponse {
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number;
  device: {
    id: string;
    name: string;
    type: string;
    volume_percent: number;
  };
}

const logger = new Logger('SpotifyService');

export class TrackChanged extends ServiceActionDefinition {
  name = 'spotify.track_changed';
  label = 'On track change';
  description = 'Triggered when the current track changes';
  poll_interval = 10;
  output_params: ParameterDefinition[] = [
    {
      name: 'song_name',
      type: ParameterType.STRING,
      label: 'Song Name',
      description: 'The name of the new song',
      required: true,
    },
    {
      name: 'artist_name',
      type: ParameterType.STRING,
      label: 'Artist Name',
      description: 'The name of the artist',
      required: true,
    },
    {
      name: 'album_name',
      type: ParameterType.STRING,
      label: 'Album Name',
      description: 'The name of the album',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastTrackId: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    logger.debug(
      `Polling track change, access token present: ${!!accessToken}`,
    );

    if (!accessToken) {
      logger.debug('No access token, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastTrackId = sconf.cache?.lastTrackId as string | null;
    logger.debug(`Last track ID from cache: ${lastTrackId}`);

    return new Promise((resolve) => {
      axios
        .get<SpotifyPlayerResponse>('https://api.spotify.com/v1/me/player', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((resp) => {
          logger.debug(`Spotify API response status: ${resp.status}`);

          if (resp.status === 204) {
            logger.debug('No active player (204 No Content)');
            return resolve({ triggered: false, parameters: {} });
          }

          const data = resp.data;
          if (!data || !data.item) {
            logger.debug('No data or item in response');
            return resolve({ triggered: false, parameters: {} });
          }

          const currentTrackId = data.item.id;
          const songName = data.item.name;
          const artistName = data.item.artists.map((a) => a.name).join(', ');
          const albumName = data.item.album.name;

          logger.debug(
            `Current track: ${songName} by ${artistName} (ID: ${currentTrackId})`,
          );

          let triggered = false;
          if (lastTrackId !== null && lastTrackId !== currentTrackId) {
            triggered = true;
            logger.log(
              `Track changed! New track: ${songName} by ${artistName}`,
            );
          }

          if (triggered) {
            resolve({
              triggered: true,
              parameters: {
                song_name: { type: ParameterType.STRING, value: songName },
                artist_name: { type: ParameterType.STRING, value: artistName },
                album_name: { type: ParameterType.STRING, value: albumName },
              },
              cache: { lastTrackId: currentTrackId },
            });
          } else {
            resolve({
              triggered: false,
              parameters: {},
              cache: { lastTrackId: currentTrackId },
            });
          }
        })
        .catch((err: Error) => {
          logger.error(`Error polling Spotify track change: ${err.message}`);
          resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
