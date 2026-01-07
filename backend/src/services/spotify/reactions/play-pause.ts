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

interface SpotifyPlayerState {
  is_playing: boolean;
  item: {
    id: string;
    name: string;
  } | null;
}

export class PlayPause extends ServiceReactionDefinition {
  name = 'spotify.play_pause';
  label = 'Play / Pause';
  description = 'Play or pause Spotify playback';
  input_params: ParameterDefinition[] = [
    {
      name: 'action',
      type: ParameterType.SELECT,
      label: 'Action',
      description: 'Select play or pause',
      required: true,
      options: [
        { label: 'Play', value: 'play' },
        { label: 'Pause', value: 'pause' },
        { label: 'Toggle', value: 'toggle' },
      ],
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const action = params.action?.value as string;

    if (!accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    logger.debug(`Executing play/pause action: ${action}`);

    try {
      let endpoint = '';

      if (action === 'play') {
        endpoint = 'https://api.spotify.com/v1/me/player/play';
      } else if (action === 'pause') {
        endpoint = 'https://api.spotify.com/v1/me/player/pause';
      } else if (action === 'toggle') {
        // Get current playback state
        const playerResp = await axios.get<SpotifyPlayerState>(
          'https://api.spotify.com/v1/me/player',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (playerResp.status === 204) {
          logger.warn('No active player to toggle');
          return;
        }

        const isPlaying = playerResp.data.is_playing;
        endpoint = isPlaying
          ? 'https://api.spotify.com/v1/me/player/pause'
          : 'https://api.spotify.com/v1/me/player/play';
      }

      if (!endpoint) {
        logger.error(`Invalid or unsupported Spotify play/pause action: ${action}`);
        throw new Error(`Invalid Spotify play/pause action: ${action}`);
      }
      await axios.put(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      logger.log(`Successfully executed ${action} action`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to execute play/pause: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to execute play/pause: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
