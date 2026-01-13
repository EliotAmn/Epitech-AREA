import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface TwitchFollowerResponse {
  data: Array<{
    user_id: string;
    user_login: string;
    user_name: string;
    followed_at: string;
  }>;
  total: number;
  pagination: {
    cursor?: string;
  };
}

const logger = new Logger('TwitchService');

export class NewFollower extends ServiceActionDefinition {
  name = 'twitch.new_follower';
  label = 'On new follower';
  description = 'Triggered when someone new follows your Twitch channel';
  poll_interval = 60; // Poll every 60 seconds
  output_params: ParameterDefinition[] = [
    {
      name: 'follower_name',
      type: ParameterType.STRING,
      label: 'Follower Name',
      description: 'The display name of the new follower',
      required: true,
    },
    {
      name: 'follower_login',
      type: ParameterType.STRING,
      label: 'Follower Login',
      description: 'The login username of the new follower',
      required: true,
    },
    {
      name: 'followed_at',
      type: ParameterType.STRING,
      label: 'Followed At',
      description: 'When the user followed',
      required: true,
    },
    {
      name: 'total_followers',
      type: ParameterType.NUMBER,
      label: 'Total Followers',
      description: 'The total number of followers',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastFollowerIds: [], lastFollowerCount: null });
  }

  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    const twitchUserId = sconf.config.twitch_user_id as string | undefined;

    logger.debug(
      `Polling new followers, access token present: ${!!accessToken}, user ID: ${twitchUserId}`,
    );

    if (!accessToken || !twitchUserId) {
      logger.debug('No access token or Twitch user ID, skipping poll');
      return { triggered: false, parameters: {} };
    }

    const lastFollowerIds = (sconf.cache?.lastFollowerIds as string[]) || [];
    const lastFollowerCount = sconf.cache?.lastFollowerCount as
      | number
      | null
      | undefined;
    const hasInitializedCache =
      lastFollowerCount !== null && lastFollowerCount !== undefined;

    logger.debug(
      `Cache state - lastFollowerIds: ${lastFollowerIds.length}, lastFollowerCount: ${lastFollowerCount}, initialized: ${hasInitializedCache}`,
    );

    try {
      // Get the list of followers
      const followersRes = await axios.get<TwitchFollowerResponse>(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${twitchUserId}&first=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID!,
          },
        },
      );

      const followers = followersRes.data.data;
      const totalFollowers = followersRes.data.total;
      const currentFollowerIds = followers.map((f) => f.user_id);

      logger.debug(
        `Found ${followers.length} recent followers, total: ${totalFollowers}`,
      );

      // Find new followers (not in the last known list)
      const newFollowers = followers.filter(
        (f) => !lastFollowerIds.includes(f.user_id),
      );

      logger.debug(
        `New followers detected in this poll: ${newFollowers.length}`,
      );

      // Only trigger if we have previous data and there are new followers
      let triggered = false;
      let newestFollower = followers[0];

      // Trigger if:
      // 1. We have previous follower count data (cache was initialized from a previous poll)
      // 2. There are new follower IDs not seen before
      // 3. Total count increased
      if (
        hasInitializedCache &&
        newFollowers.length > 0 &&
        totalFollowers > lastFollowerCount
      ) {
        triggered = true;
        newestFollower = newFollowers[0];
        logger.log(
          `New follower detected: ${newestFollower.user_name} (${newestFollower.user_login})`,
        );
      } else if (hasInitializedCache) {
        logger.debug(
          `No trigger: newFollowers=${newFollowers.length}, totalFollowers=${totalFollowers}, lastCount=${lastFollowerCount}`,
        );
      } else {
        logger.debug('First poll - initializing cache, no trigger');
      }

      const outputParams = {
        follower_name: {
          type: ParameterType.STRING,
          value: newestFollower?.user_name || '',
        },
        follower_login: {
          type: ParameterType.STRING,
          value: newestFollower?.user_login || '',
        },
        followed_at: {
          type: ParameterType.STRING,
          value: newestFollower?.followed_at || '',
        },
        total_followers: {
          type: ParameterType.NUMBER,
          value: totalFollowers,
        },
      };

      return {
        triggered,
        parameters: triggered ? outputParams : {},
        cache: {
          lastFollowerIds: currentFollowerIds,
          lastFollowerCount: totalFollowers,
        },
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        logger.error(
          `Error polling Twitch followers: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`,
        );
      } else if (err instanceof Error) {
        logger.error(`Error polling Twitch followers: ${err.message}`);
      }
      return { triggered: false, parameters: {} };
    }
  }
}
