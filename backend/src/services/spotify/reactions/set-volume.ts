import { Logger } from '@nestjs/common';
import axios from 'axios';

import {
  ParameterType,
  ServiceReactionDefinition,
} from '@/common/service.types';
import type {
  ParameterDefinition,
  ParameterValue,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('SpotifyService');

export class SetVolume extends ServiceReactionDefinition {
  name = 'spotify.set_volume';
  label = 'Set Volume';
  description = 'Set Spotify playback volume (0-100)';
  input_params: ParameterDefinition[] = [
    {
      name: 'volume',
      type: ParameterType.NUMBER,
      label: 'Volume',
      description: 'Volume level (0-100)',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const volume = params.volume?.value as number;

    if (!accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    // Validate volume range
    if (volume < 0 || volume > 100) {
      logger.error(`Invalid volume value: ${volume}`);
      throw new Error('Volume must be between 0 and 100');
    }

    logger.debug(`Setting Spotify volume to: ${volume}`);

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${Math.round(volume)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      logger.log(`Successfully set volume to ${volume}`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to set volume: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to set volume: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
