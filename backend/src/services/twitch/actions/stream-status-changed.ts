import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface TwitchStreamResponse {
  data: Array<{
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: string;
    title: string;
    viewer_count: number;
    started_at: string;
    thumbnail_url: string;
  }>;
}

interface TwitchUserResponse {
  data: Array<{
    id: string;
    login: string;
    display_name: string;
  }>;
}

const logger = new Logger('TwitchService');

export class StreamStatusChanged extends ServiceActionDefinition {
  name = 'twitch.stream_status_changed';
  label = 'On stream status change';
  description = 'Triggered when a specific user goes live or offline';
  poll_interval = 30;
  output_params: ParameterDefinition[] = [
    {
      name: 'streamer_name',
      type: ParameterType.STRING,
      label: 'Streamer Name',
      description: 'The display name of the streamer',
      required: true,
    },
    {
      name: 'stream_title',
      type: ParameterType.STRING,
      label: 'Stream Title',
      description: 'The title of the stream',
      required: true,
    },
    {
      name: 'game_name',
      type: ParameterType.STRING,
      label: 'Game Name',
      description: 'The game being played',
      required: true,
    },
    {
      name: 'viewer_count',
      type: ParameterType.NUMBER,
      label: 'Viewer Count',
      description: 'The number of viewers',
      required: true,
    },
    {
      name: 'is_live',
      type: ParameterType.BOOLEAN,
      label: 'Is Live',
      description: 'Whether the streamer is live',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'streamer_username',
      type: ParameterType.STRING,
      label: 'Streamer Username',
      description: 'The Twitch username of the streamer to monitor',
      required: true,
    },
    {
      name: 'trigger_on',
      type: ParameterType.SELECT,
      label: 'Trigger When',
      description: 'When to trigger the action',
      required: true,
      options: [
        { label: 'Goes Live', value: 'live' },
        { label: 'Goes Offline', value: 'offline' },
        { label: 'Both', value: 'both' },
      ],
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastStreamStatus: null, streamerId: null });
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const streamerUsername = sconf.config.streamer_username as
      | string
      | undefined;
    const triggerOn = (sconf.config.trigger_on as string) || 'both';

    logger.debug(
      `Polling stream status for ${streamerUsername}, access token present: ${!!accessToken}`,
    );

    if (!accessToken || !streamerUsername) {
      logger.debug('No access token or streamer username, skipping poll');
      return { triggered: false, parameters: {} };
    }

    const lastStreamStatus = sconf.cache?.lastStreamStatus as boolean | null;
    let streamerId = sconf.cache?.streamerId as string | null;

    try {
      if (!streamerId) {
        const userRes = await axios.get<TwitchUserResponse>(
          `https://api.twitch.tv/helix/users?login=${encodeURIComponent(streamerUsername)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Client-Id': process.env.TWITCH_CLIENT_ID!,
            },
          },
        );

        if (userRes.data.data.length === 0) {
          logger.warn(`Streamer ${streamerUsername} not found`);
          return { triggered: false, parameters: {} };
        }

        streamerId = userRes.data.data[0].id;
        logger.debug(`Resolved streamer ID: ${streamerId}`);
      }

      const streamRes = await axios.get<TwitchStreamResponse>(
        `https://api.twitch.tv/helix/streams?user_id=${streamerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID!,
          },
        },
      );

      const isLive = streamRes.data.data.length > 0;
      const streamData = streamRes.data.data[0];

      logger.debug(
        `Stream status for ${streamerUsername}: ${isLive ? 'LIVE' : 'OFFLINE'}`,
      );

      let triggered = false;
      if (lastStreamStatus !== null && lastStreamStatus !== isLive) {
        if (triggerOn === 'both') {
          triggered = true;
        } else if (triggerOn === 'live' && isLive) {
          triggered = true;
        } else if (triggerOn === 'offline' && !isLive) {
          triggered = true;
        }

        if (triggered) {
          logger.log(
            `Stream status changed for ${streamerUsername}: ${isLive ? 'LIVE' : 'OFFLINE'}`,
          );
        }
      }

      const outputParams = {
        streamer_name: {
          type: ParameterType.STRING,
          value: streamData?.user_name || streamerUsername,
        },
        stream_title: {
          type: ParameterType.STRING,
          value: streamData?.title || '',
        },
        game_name: {
          type: ParameterType.STRING,
          value: streamData?.game_name || '',
        },
        viewer_count: {
          type: ParameterType.NUMBER,
          value: streamData?.viewer_count || 0,
        },
        is_live: {
          type: ParameterType.BOOLEAN,
          value: isLive,
        },
      };

      return {
        triggered,
        parameters: triggered ? outputParams : {},
        cache: { lastStreamStatus: isLive, streamerId },
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        logger.error(
          `Error polling Twitch stream status: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`,
        );
      } else if (err instanceof Error) {
        logger.error(`Error polling Twitch stream status: ${err.message}`);
      }
      return { triggered: false, parameters: {} };
    }
  }
}
