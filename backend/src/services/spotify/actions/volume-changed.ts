import { Logger } from '@nestjs/common';
import axios, { type AxiosResponse } from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('SpotifyService');

interface SpotifyPlayerResponse {
  device?: { volume_percent?: number } | null;
}

export class VolumeChanged extends ServiceActionDefinition {
  name = 'spotify.volume_changed';
  label = 'On volume changed';
  description = 'Triggered when the device volume changes';
  poll_interval = 10;
  output_params: ParameterDefinition[] = [
    {
      name: 'volume',
      type: ParameterType.NUMBER,
      label: 'Volume',
      description: 'Current device volume (0-100)',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastVolume: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    logger.debug(
      `Polling volume change, access token present: ${!!accessToken}`,
    );

    if (!accessToken) {
      logger.debug('No access token, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastVolume = sconf.cache?.lastVolume as number | null;
    logger.debug(`Last volume from cache: ${lastVolume}`);

    return new Promise((resolve) => {
      axios
        .get('https://api.spotify.com/v1/me/player', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((resp: AxiosResponse<SpotifyPlayerResponse>) => {
          if (resp.status === 204)
            return resolve({ triggered: false, parameters: {} });
          const data = resp.data;
          if (!data || !data.device)
            return resolve({ triggered: false, parameters: {} });

          const currentVolume = data.device.volume_percent as number;

          if (lastVolume === null) {
            // initialize cache
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastVolume: currentVolume },
            });
          }

          if (currentVolume !== lastVolume) {
            logger.log(`Volume changed from ${lastVolume} to ${currentVolume}`);
            return resolve({
              triggered: true,
              parameters: {
                volume: { type: ParameterType.NUMBER, value: currentVolume },
              },
              cache: { lastVolume: currentVolume },
            });
          }

          return resolve({
            triggered: false,
            parameters: {},
            cache: { lastVolume: currentVolume },
          });
        })
        .catch((err: unknown) => {
          logger.error(
            `Error polling Spotify volume change: ${(err as Error).message}`,
          );
          resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
