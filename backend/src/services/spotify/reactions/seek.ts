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

export class Seek extends ServiceReactionDefinition {
  name = 'spotify.seek';
  label = 'Seek to position';
  description = 'Seek playback to a specific position (ms)';
  input_params: ParameterDefinition[] = [
    {
      name: 'position_ms',
      type: ParameterType.NUMBER,
      label: 'Position (ms)',
      description: 'Position in milliseconds to seek to',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const pos = Number(params.position_ms?.value);

    if (!accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    if (Number.isNaN(pos) || pos < 0) {
      logger.error('Invalid position_ms');
      throw new Error('position_ms must be a non-negative number');
    }

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/seek?position_ms=${Math.round(pos)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      logger.log(`Seeked to position ${pos}ms`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(`Failed to seek: ${JSON.stringify(err.response?.data)}`);
      throw new Error(`Failed to seek: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
