import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  personastate: number;
  profileurl: string;
  gameextrainfo?: string;
}

interface SteamPlayerSummariesResponse {
  response: {
    players: SteamPlayerSummary[];
  };
}

const logger = new Logger('SteamService');

export class StatusChanged extends ServiceActionDefinition {
  name = 'steam.status_changed';
  label = 'On status change';
  description = 'Triggered when player online/offline status changes';
  poll_interval = 60; // Check every minute
  output_params: ParameterDefinition[] = [
    {
      name: 'player_name',
      type: ParameterType.STRING,
      label: 'Player Name',
      description: 'The Steam username',
      required: true,
    },
    {
      name: 'new_status',
      type: ParameterType.STRING,
      label: 'New Status',
      description: 'The new online status (Online, Offline, Away, Busy, etc.)',
      required: true,
    },
    {
      name: 'status_code',
      type: ParameterType.NUMBER,
      label: 'Status Code',
      description: 'Numeric status code',
      required: false,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastStatus: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const steamId = sconf.config.steam_id as string | undefined;

    logger.debug(`Polling status change for Steam ID: ${steamId}`);

    if (!steamId) {
      logger.debug('Missing Steam ID, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastStatus = sconf.cache?.lastStatus as number | null;
    const apiKey = process.env.STEAM_API_KEY;

    return new Promise((resolve) => {
      axios
        .get<SteamPlayerSummariesResponse>(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`,
          {
            params: {
              key: apiKey,
              steamids: steamId,
            },
          },
        )
        .then((resp) => {
          logger.debug(`Steam API response status: ${resp.status}`);

          const data = resp.data;
          if (!data?.response?.players || data.response.players.length === 0) {
            logger.debug('No player data found');
            return resolve({ triggered: false, parameters: {} });
          }

          const player = data.response.players[0];
          const currentStatus = player.personastate;

          // Check if status changed
          if (lastStatus !== null && currentStatus === lastStatus) {
            logger.debug(`Status unchanged: ${currentStatus}`);
            return resolve({ triggered: false, parameters: {} });
          }

          const statusMap: Record<number, string> = {
            0: 'Offline',
            1: 'Online',
            2: 'Busy',
            3: 'Away',
            4: 'Snooze',
            5: 'Looking to trade',
            6: 'Looking to play',
          };

          const statusText = statusMap[currentStatus] || 'Unknown';
          const lastStatusText = lastStatus !== null ? statusMap[lastStatus] : 'Unknown';

          logger.log(
            `Status changed from ${lastStatus !== null ? statusMap[lastStatus] : 'Unknown'} to ${statusText}`,
          );

          if (lastStatus === null || lastStatusText === 'Unknown') {
            logger.log('Initial status poll, not triggering action');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastStatus: currentStatus },
            });
          }

          resolve({
            triggered: true,
            parameters: {
              player_name: {
                type: ParameterType.STRING,
                value: player.personaname || 'Unknown Player',
              },
              new_status: {
                type: ParameterType.STRING,
                value: statusText,
              },
              status_code: {
                type: ParameterType.NUMBER,
                value: currentStatus,
              },
            },
            cache: { lastStatus: currentStatus },
          });
        })
        .catch((error) => {
          logger.error(`Failed to fetch player status: ${error.message}`);
          return resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
