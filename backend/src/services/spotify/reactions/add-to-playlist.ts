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

export class AddToPlaylist extends ServiceReactionDefinition {
  name = 'spotify.add_to_playlist';
  label = 'Add current track to playlist';
  description = 'Add the currently playing track to a specified playlist';
  input_params: ParameterDefinition[] = [
    {
      name: 'playlist_id',
      type: ParameterType.STRING,
      label: 'Playlist ID',
      description: 'Spotify Playlist ID to add the track to',
      required: true,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config?.access_token;
    if (typeof accessToken !== 'string' || !accessToken) {
      logger.error('No access token available for Spotify');
      throw new Error('No access token available');
    }

    const playlistId =
      params.playlist_id && typeof params.playlist_id.value === 'string'
        ? params.playlist_id.value
        : undefined;

    if (!playlistId) {
      logger.error('playlist_id parameter missing');
      throw new Error('playlist_id is required');
    }

    // Get current track (typed to avoid any)
    const playerResp = await axios.get<{ item?: { id?: string } } | null>(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (playerResp.status === 204 || !playerResp.data) {
      logger.warn('No current playing track to add');
      return;
    }

    const data = playerResp.data;
    if (!data || !data.item || typeof data.item.id !== 'string') {
      logger.warn('No current playing track to add');
      return;
    }

    const trackId = data.item.id;
    const uri = `spotify:track:${trackId}`;

    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}/tracks`,
        { uris: [uri] },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      logger.log(`Added track ${trackId} to playlist ${playlistId}`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      logger.error(
        `Failed to add track to playlist: ${JSON.stringify(err.response?.data)}`,
      );
      throw new Error(
        `Failed to add track to playlist: ${err.response?.status}`,
      );
    }
  }

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }
}
