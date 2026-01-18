import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

type SpotifyArtist = { name: string };
type SpotifyTrack = { id: string; name: string; artists: SpotifyArtist[] };
type SpotifyCurrentlyPlaying = { item: SpotifyTrack | null } | null;

const logger = new Logger('SpotifyService');

export class SpecificItemPlaying extends ServiceActionDefinition {
  name = 'spotify.specific_item_playing';
  label = 'On specific artist or track playing';
  description = 'Triggered when a specified artist or track starts playing';
  poll_interval = 10;
  output_params: ParameterDefinition[] = [
    {
      name: 'song_name',
      type: ParameterType.STRING,
      label: 'Song Name',
      description: 'Song name',
      required: true,
    },
    {
      name: 'artist_name',
      type: ParameterType.STRING,
      label: 'Artist',
      description: 'Artist name',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'match_type',
      type: ParameterType.SELECT,
      label: 'Match type',
      description: 'Match by track name or artist name',
      required: true,
      options: [
        { label: 'Track name', value: 'track' },
        { label: 'Artist name', value: 'artist' },
      ],
    },
    {
      name: 'value',
      type: ParameterType.STRING,
      label: 'Value',
      description: 'Track or artist name to match',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastTrackId: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    logger.debug(
      `Polling specific item playing, access token present: ${!!accessToken}`,
    );

    if (!accessToken) {
      logger.debug('No access token, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastTrackId = sconf.cache?.lastTrackId as string | null;
    const matchType = (sconf.config.match_type as string) || 'track';
    const value = (sconf.config.value as string) || '';

    return new Promise((resolve) => {
      axios
        .get<SpotifyCurrentlyPlaying>(
          'https://api.spotify.com/v1/me/player/currently-playing',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )
        .then((resp) => {
          if (resp.status === 204)
            return resolve({ triggered: false, parameters: {} });
          const data = resp.data;
          if (!data || !data.item)
            return resolve({ triggered: false, parameters: {} });

          const currentTrackId = data.item.id;
          const songName = data.item.name;
          const artistName = data.item.artists.map((a) => a.name).join(', ');

          if (lastTrackId !== currentTrackId) {
            let match = false;
            if (matchType === 'track') {
              match = songName.toLowerCase().includes(value.toLowerCase());
            } else {
              match = artistName.toLowerCase().includes(value.toLowerCase());
            }

            if (match) {
              logger.log(
                `Specific item match: ${value} on ${songName} by ${artistName}`,
              );
              return resolve({
                triggered: true,
                parameters: {
                  song_name: { type: ParameterType.STRING, value: songName },
                  artist_name: {
                    type: ParameterType.STRING,
                    value: artistName,
                  },
                },
                cache: { lastTrackId: currentTrackId },
              });
            }
          }

          resolve({
            triggered: false,
            parameters: {},
            cache: { lastTrackId: currentTrackId },
          });
        })
        .catch((err: unknown) => {
          logger.error(
            `Error polling Spotify specific item: ${(err as Error).message}`,
          );
          resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
