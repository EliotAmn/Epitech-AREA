import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ServiceReactionDefinition } from '@/common/service.types';
import type {
  ParameterDefinition,
  ParameterValue,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('SpotifyService');

export class SaveTrack extends ServiceReactionDefinition {
  name = 'spotify.save_track';
  label = 'Save / Like current track';
  description = 'Save the current track to the user library';
  input_params: ParameterDefinition[] = [];

  async execute(
    sconf: ServiceConfig,
    _params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    if (!accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    // Get current track
    const playerResp = await axios.get<{ item?: { id?: string } }>(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (playerResp.status === 204) {
      logger.warn('No current playing track to save');
      return;
    }

    const data = playerResp.data;
    if (!data || !data.item) {
      logger.warn('No current playing track to save');
      return;
    }

    const trackId = data.item.id as string;

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/tracks?ids=${encodeURIComponent(trackId)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      logger.log(`Saved track ${trackId} to user library`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to save track: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(`Failed to save track: ${err.response?.status}`);
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
