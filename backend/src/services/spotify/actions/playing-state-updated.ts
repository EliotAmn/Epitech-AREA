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

export class PlayingStateUpdated extends ServiceActionDefinition {
  name = 'spotify.playing_state_updated';
  label = 'On playing state updated';
  description = 'When the playing state is updated (play/pause)';
  poll_interval = 10;
  output_params: ParameterDefinition[] = [
    {
      name: 'song_name',
      type: ParameterType.STRING,
      label: 'Song Name',
      description: 'The name of the song',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'state',
      type: ParameterType.SELECT,
      label: 'Trigger on state',
      description: 'Select the playing state to trigger on',
      required: true,
      options: [
        { label: 'Play', value: 'play' },
        { label: 'Pause', value: 'pause' },
        { label: 'Both', value: 'both' },
      ],
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastPlayingState: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    logger.debug(`Polling for user, access token present: ${!!accessToken}`);

    if (!accessToken) {
      logger.debug('No access token, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    // Get per-user state from cache
    const lastPlayingState = sconf.cache?.lastPlayingState as
      | 'play'
      | 'pause'
      | null;
    logger.debug(`Last playing state from cache: ${lastPlayingState}`);

    return new Promise((resolve) => {
      axios
        .get<SpotifyPlayerResponse>('https://api.spotify.com/v1/me/player', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((resp) => {
          logger.debug(`Spotify API response status: ${resp.status}`);

          // Spotify returns 204 No Content when no player is active.
          // Explicitly handle this case before accessing resp.data.
          if (resp.status === 204) {
            logger.debug('No active player (204 No Content)');
            return resolve({ triggered: false, parameters: {} });
          }
          const data = resp.data;
          if (!data || !data.item) {
            logger.debug('No data or item in response');
            return resolve({ triggered: false, parameters: {} });
          }
          const isPlaying: boolean = data.is_playing;
          const songName: string = data.item.name;
          const currentState: 'play' | 'pause' = isPlaying ? 'play' : 'pause';
          const triggerState: string = (sconf.config.state as string) || 'both';

          logger.debug(`Current state: ${currentState}, Song: ${songName}`);
          logger.debug(`Trigger state config: ${triggerState}`);

          let triggered = false;
          if (lastPlayingState !== currentState) {
            logger.debug(
              `State changed from ${lastPlayingState} to ${currentState}`,
            );
            if (triggerState === 'both' || triggerState === currentState) {
              triggered = true;
              logger.log(
                `Trigger activated! State: ${currentState}, Song: ${songName}`,
              );
            }
          }

          if (triggered) {
            resolve({
              triggered: true,
              parameters: {
                song_name: { type: ParameterType.STRING, value: songName },
              },
              // Return updated cache to be persisted
              cache: { lastPlayingState: currentState },
            });
          } else {
            resolve({
              triggered: false,
              parameters: {},
              // Return updated cache to be persisted
              cache: { lastPlayingState: currentState },
            });
          }
        })
        .catch((err: Error) => {
          logger.error(`Error polling Spotify playing state: ${err.message}`);
          resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
