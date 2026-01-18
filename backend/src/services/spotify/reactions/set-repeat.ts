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

export class SetRepeat extends ServiceReactionDefinition {
  name = 'spotify.set_repeat';
  label = 'Set repeat mode';
  description = 'Set repeat mode: off, context, or track';
  input_params: ParameterDefinition[] = [
    {
      name: 'mode',
      type: ParameterType.SELECT,
      label: 'Repeat mode',
      description: 'Repeat mode to set',
      required: true,
      options: [
        { label: 'Off', value: 'off' },
        { label: 'Context', value: 'context' },
        { label: 'Track', value: 'track' },
      ],
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const mode = params.mode?.value as string;

    if (!accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    if (!mode) {
      logger.error('mode parameter missing');
      throw new Error('mode is required');
    }

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/repeat?state=${encodeURIComponent(mode)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      logger.log(`Set repeat mode to ${mode}`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to set repeat mode: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to set repeat mode: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
