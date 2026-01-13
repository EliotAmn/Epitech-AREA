import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface SteamFriend {
  steamid: string;
  relationship: string;
  friend_since: number;
}

interface SteamFriendListResponse {
  friendslist: {
    friends: SteamFriend[];
  };
}

const logger = new Logger('SteamService');

export class FriendCountChanged extends ServiceActionDefinition {
  name = 'steam.friend_count_changed';
  label = 'On friend count change';
  description = 'Triggered when a friend is added or removed';
  poll_interval = 300; // Check every 5 minutes
  output_params: ParameterDefinition[] = [
    {
      name: 'friend_count',
      type: ParameterType.NUMBER,
      label: 'Friend Count',
      description: 'Current number of friends',
      required: true,
    },
    {
      name: 'change',
      type: ParameterType.STRING,
      label: 'Change Type',
      description: 'Whether friends were added or removed',
      required: true,
    },
    {
      name: 'count_diff',
      type: ParameterType.NUMBER,
      label: 'Count Difference',
      description: 'Number of friends added or removed',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastFriendCount: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const steamId = sconf.config.steam_id as string | undefined;

    logger.debug(`Polling friend count for Steam ID: ${steamId}`);

    if (!steamId) {
      logger.debug('Missing Steam ID, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastFriendCount = sconf.cache?.lastFriendCount as number | null;
    const apiKey = process.env.STEAM_API_KEY;

    return new Promise((resolve) => {
      axios
        .get<SteamFriendListResponse>(
          `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/`,
          {
            params: {
              key: apiKey,
              steamid: steamId,
              relationship: 'friend',
            },
          },
        )
        .then((resp) => {
          logger.debug(`Steam API response status: ${resp.status}`);

          const data = resp.data;
          if (!data?.friendslist?.friends) {
            logger.debug('No friend list data found');
            return resolve({ triggered: false, parameters: {} });
          }

          const currentFriendCount = data.friendslist.friends.length;

          // First poll, just store the count
          if (lastFriendCount === null) {
            logger.debug(`Initial friend count: ${currentFriendCount}`);
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastFriendCount: currentFriendCount },
            });
          }

          // Check if count changed
          if (currentFriendCount === lastFriendCount) {
            logger.debug(`Friend count unchanged: ${currentFriendCount}`);
            return resolve({ triggered: false, parameters: {} });
          }

          const diff = currentFriendCount - lastFriendCount;
          const changeType = diff > 0 ? 'added' : 'removed';

          logger.log(
            `Friend count changed from ${lastFriendCount} to ${currentFriendCount} (${changeType} ${Math.abs(diff)})`,
          );

          resolve({
            triggered: true,
            parameters: {
              friend_count: {
                type: ParameterType.NUMBER,
                value: currentFriendCount,
              },
              change: {
                type: ParameterType.STRING,
                value: changeType,
              },
              count_diff: {
                type: ParameterType.NUMBER,
                value: Math.abs(diff),
              },
            },
            cache: { lastFriendCount: currentFriendCount },
          });
        })
        .catch((error) => {
          logger.error(`Failed to fetch friend list: ${error.message}`);
          return resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
