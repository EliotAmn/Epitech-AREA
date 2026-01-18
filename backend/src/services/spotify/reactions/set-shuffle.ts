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

export class SetShuffle extends ServiceReactionDefinition {
  name = 'spotify.set_shuffle';
  label = 'Set shuffle';
  description = 'Enable or disable shuffle';
  input_params: ParameterDefinition[] = [
    {
      name: 'enabled',
      type: ParameterType.SELECT,
      label: 'Shuffle',
      description: 'Enable or disable shuffle',
      required: true,
      options: [
        { label: 'Enable', value: 'true' },
        { label: 'Disable', value: 'false' },
      ],
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const enabled = params.enabled?.value as string;

    if (!accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    if (enabled !== 'true' && enabled !== 'false') {
      logger.error('enabled parameter invalid');
      throw new Error('enabled must be "true" or "false"');
    }

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/shuffle?state=${encodeURIComponent(enabled)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      logger.log(`Set shuffle to ${enabled}`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to set shuffle: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to set shuffle: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
