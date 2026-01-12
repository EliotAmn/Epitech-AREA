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

export class SkipTrack extends ServiceReactionDefinition {
  name = 'spotify.skip_track';
  label = 'Next / Previous Track';
  description = 'Skip to next or previous track';
  input_params: ParameterDefinition[] = [
    {
      name: 'direction',
      type: ParameterType.SELECT,
      label: 'Direction',
      description: 'Select next or previous',
      required: true,
      options: [
        { label: 'Next', value: 'next' },
        { label: 'Previous', value: 'previous' },
      ],
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const direction = params.direction?.value as string;

    if (!accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    logger.debug(`Executing skip track: ${direction}`);

    try {
      const endpoint =
        direction === 'next'
          ? 'https://api.spotify.com/v1/me/player/next'
          : 'https://api.spotify.com/v1/me/player/previous';

      await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      logger.log(`Successfully skipped to ${direction} track`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to skip track: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to skip track: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
