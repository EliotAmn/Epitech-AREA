import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface SteamAchievement {
  apiname: string;
  achieved: number;
  unlocktime: number;
  name?: string;
  description?: string;
}

interface SteamPlayerAchievementsResponse {
  playerstats: {
    steamID: string;
    gameName: string;
    achievements?: SteamAchievement[];
    success: boolean;
  };
}

const logger = new Logger('SteamService');

export class AchievementUnlocked extends ServiceActionDefinition {
  name = 'steam.achievement_unlocked';
  label = 'On achievement unlocked';
  description = 'Triggered when a new achievement is unlocked in a game';
  poll_interval = 60; // Check every minute
  output_params: ParameterDefinition[] = [
    {
      name: 'achievement_name',
      type: ParameterType.STRING,
      label: 'Achievement Name',
      description: 'The name of the unlocked achievement',
      required: true,
    },
    {
      name: 'achievement_description',
      type: ParameterType.STRING,
      label: 'Achievement Description',
      description: 'The description of the achievement',
      required: false,
    },
    {
      name: 'game_name',
      type: ParameterType.STRING,
      label: 'Game Name',
      description: 'The name of the game',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'app_id',
      type: ParameterType.STRING,
      label: 'Game App ID',
      description: 'The Steam App ID of the game to monitor',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastAchievements: [] });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const steamId = sconf.config.steam_id as string | undefined;
    const appId = sconf.config.app_id as string | undefined;

    logger.debug(`Polling achievements for Steam ID: ${steamId}, App ID: ${appId}`);

    if (!steamId || !appId) {
      logger.debug('Missing Steam ID or App ID, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastAchievements = (sconf.cache?.lastAchievements as string[]) || [];
    const apiKey = process.env.STEAM_API_KEY;

    return new Promise((resolve) => {
      axios
        .get<SteamPlayerAchievementsResponse>(
          `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/`,
          {
            params: {
              appid: appId,
              key: apiKey,
              steamid: steamId,
            },
          },
        )
        .then((resp) => {
          logger.debug(`Steam API response status: ${resp.status}`);

          const data = resp.data;
          if (!data?.playerstats?.success || !data.playerstats.achievements) {
            logger.debug('No achievements data or request failed');
            return resolve({ triggered: false, parameters: {} });
          }

          const achievements = data.playerstats.achievements;
          const unlockedAchievements = achievements
            .filter((ach) => ach.achieved === 1)
            .map((ach) => ach.apiname);

          // Find newly unlocked achievements
          const newAchievements = unlockedAchievements.filter(
            (name) => !lastAchievements.includes(name),
          );

          if (newAchievements.length === 0) {
            logger.debug('No new achievements unlocked');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastAchievements: unlockedAchievements },
            });
          }

          // Get the first new achievement details
          const newAchievement = achievements.find(
            (ach) => ach.apiname === newAchievements[0],
          );

          logger.log(
            `New achievement unlocked: ${newAchievement?.name || newAchievement?.apiname}`,
          );

          resolve({
            triggered: true,
            parameters: {
              achievement_name: {
                type: ParameterType.STRING,
                value: newAchievement?.name || newAchievement?.apiname || 'Unknown',
              },
              achievement_description: {
                type: ParameterType.STRING,
                value: newAchievement?.description || '',
              },
              game_name: {
                type: ParameterType.STRING,
                value: data.playerstats.gameName || 'Unknown Game',
              },
            },
            cache: { lastAchievements: unlockedAchievements },
          });
        })
        .catch((error) => {
          logger.error(`Failed to fetch achievements: ${error.message}`);
          return resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
