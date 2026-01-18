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

export class StartPlayback extends ServiceReactionDefinition {
  name = 'spotify.start_playback';
  label = 'Start playback (URI)';
  description =
    'Start playback for a given Spotify URI (track, album, or playlist)';
  input_params: ParameterDefinition[] = [
    {
      name: 'uri',
      type: ParameterType.STRING,
      label: 'Spotify URI',
      description:
        'Spotify URI to play (spotify:track:<id> or spotify:playlist:<id>)',
      required: true,
    },
    {
      name: 'position_ms',
      type: ParameterType.NUMBER,
      label: 'Position (ms)',
      description: 'Optional start position in ms for tracks',
      required: false,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const uri = params.uri?.value as string;
    const pos = params.position_ms?.value as number | undefined;

    if (!accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    if (!uri) {
      logger.error('uri parameter missing');
      throw new Error('uri is required');
    }

    // Build body based on uri type
    const body: {
      uris?: string[];
      context_uri?: string;
      position_ms?: number;
    } = {};
    if (uri.startsWith('spotify:track:')) {
      body.uris = [uri];
      if (typeof pos === 'number') body.position_ms = Math.round(pos);
    } else if (
      uri.startsWith('spotify:album:') ||
      uri.startsWith('spotify:playlist:')
    ) {
      body.context_uri = uri;
    } else {
      // fallback: try as uri in uris
      body.uris = [uri];
    }

    try {
      await axios.put('https://api.spotify.com/v1/me/player/play', body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      logger.log(`Started playback for ${uri}`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to start playback: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to start playback: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
