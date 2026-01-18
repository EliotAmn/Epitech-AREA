import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface SpotifyPlayerResponse {
  progress_ms?: number;
  item?: {
    id?: string;
    name?: string;
  };
}

const logger = new Logger('SpotifyService');

export class PlaybackProgressPassed extends ServiceActionDefinition {
  name = 'spotify.playback_progress_passed';
  label = 'On playback progress passes X';
  description =
    'Triggered when the playback progress passes a configured ms threshold';
  poll_interval = 5;
  output_params: ParameterDefinition[] = [
    {
      name: 'song_name',
      type: ParameterType.STRING,
      label: 'Song Name',
      description: 'Song name',
      required: true,
    },
    {
      name: 'position_ms',
      type: ParameterType.NUMBER,
      label: 'Position (ms)',
      description: 'Playback position in ms',
      required: true,
    },
  ];

  input_params: ParameterDefinition[] = [
    {
      name: 'threshold_ms',
      type: ParameterType.NUMBER,
      label: 'Threshold (ms)',
      description: 'Trigger when playback passes this position in ms',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastTriggeredPosition: null, lastTrackId: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const threshold = Number(sconf.config.threshold_ms) || 0;
    if (!accessToken)
      return Promise.resolve({ triggered: false, parameters: {} });

    const lastTriggeredPosition = sconf.cache?.lastTriggeredPosition as
      | number
      | null;
    const lastTrackId = sconf.cache?.lastTrackId as string | null;

    return new Promise((resolve) => {
      axios
        .get<SpotifyPlayerResponse>('https://api.spotify.com/v1/me/player', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((resp) => {
          if (resp.status === 204)
            return resolve({ triggered: false, parameters: {} });
          const data = resp.data;
          if (!data || !data.item)
            return resolve({ triggered: false, parameters: {} });

          const pos = data.progress_ms as number;
          const trackId = data.item.id as string;
          const songName = data.item.name as string;

          // Reset trigger position when track changes
          const effectiveLastPos =
            trackId !== lastTrackId ? null : lastTriggeredPosition;

          if (effectiveLastPos === null && pos >= threshold) {
            logger.log(
              `Playback passed threshold ${threshold}ms for ${songName} at ${pos}ms`,
            );
            return resolve({
              triggered: true,
              parameters: {
                song_name: { type: ParameterType.STRING, value: songName },
                position_ms: { type: ParameterType.NUMBER, value: pos },
              },
              cache: { lastTriggeredPosition: pos, lastTrackId: trackId },
            });
          }

          if (
            effectiveLastPos !== null &&
            pos >= threshold &&
            effectiveLastPos < threshold
          ) {
            logger.log(
              `Playback passed threshold ${threshold}ms for ${songName} at ${pos}ms`,
            );
            return resolve({
              triggered: true,
              parameters: {
                song_name: { type: ParameterType.STRING, value: songName },
                position_ms: { type: ParameterType.NUMBER, value: pos },
              },
              cache: { lastTriggeredPosition: pos, lastTrackId: trackId },
            });
          }

          resolve({
            triggered: false,
            parameters: {},
            cache: {
              lastTriggeredPosition: effectiveLastPos,
              lastTrackId: trackId,
            },
          });
        })
        .catch((err: unknown) => {
          logger.error(
            `Error polling playback progress: ${(err as Error).message}`,
          );
          resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
