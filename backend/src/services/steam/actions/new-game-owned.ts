import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url: string;
}

interface SteamOwnedGamesResponse {
  response: {
    game_count: number;
    games: SteamGame[];
  };
}

const logger = new Logger('SteamService');

export class NewGameOwned extends ServiceActionDefinition {
  name = 'steam.new_game_owned';
  label = 'On new game owned';
  description = 'Triggered when a new game is added to the library';
  poll_interval = 3600; // Check every hour
  output_params: ParameterDefinition[] = [
    {
      name: 'game_name',
      type: ParameterType.STRING,
      label: 'Game Name',
      description: 'Name of the new game',
      required: true,
    },
    {
      name: 'app_id',
      type: ParameterType.STRING,
      label: 'App ID',
      description: 'Steam App ID of the game',
      required: true,
    },
    {
      name: 'total_games',
      type: ParameterType.NUMBER,
      label: 'Total Games',
      description: 'Total number of games in library',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ gameIds: [] });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const steamId = sconf.config.steam_id as string | undefined;

    logger.debug(`Polling game library for Steam ID: ${steamId}`);

    if (!steamId) {
      logger.debug('Missing Steam ID, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const cachedGameIds = (sconf.cache?.gameIds as number[]) || [];
    const apiKey = process.env.STEAM_API_KEY;

    return new Promise((resolve) => {
      axios
        .get<SteamOwnedGamesResponse>(
          `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`,
          {
            params: {
              key: apiKey,
              steamid: steamId,
              include_appinfo: 1,
              include_played_free_games: 1,
            },
          },
        )
        .then((resp) => {
          logger.debug(`Steam API response status: ${resp.status}`);

          const data = resp.data;
          if (!data?.response?.games) {
            logger.debug('No games data found');
            return resolve({ triggered: false, parameters: {} });
          }

          const games = data.response.games;
          const currentGameIds = games.map((g) => g.appid);

          // First poll, just store the game IDs
          if (cachedGameIds.length === 0) {
            logger.debug(`Initial library size: ${currentGameIds.length} games`);
            return resolve({
              triggered: false,
              parameters: {},
              cache: { gameIds: currentGameIds },
            });
          }

          // Find new games (in current but not in cached)
          const newGameIds = currentGameIds.filter(
            (id) => !cachedGameIds.includes(id),
          );

          if (newGameIds.length === 0) {
            logger.debug('No new games detected');
            return resolve({
              triggered: false,
              parameters: {},
              cache: { gameIds: currentGameIds },
            });
          }

          // Get the first new game details
          const newGame = games.find((g) => g.appid === newGameIds[0]);

          if (!newGame) {
            return resolve({
              triggered: false,
              parameters: {},
              cache: { gameIds: currentGameIds },
            });
          }

          logger.log(
            `New game detected: ${newGame.name} (App ID: ${newGame.appid})`,
          );

          resolve({
            triggered: true,
            parameters: {
              game_name: {
                type: ParameterType.STRING,
                value: newGame.name,
              },
              app_id: {
                type: ParameterType.STRING,
                value: newGame.appid.toString(),
              },
              total_games: {
                type: ParameterType.NUMBER,
                value: currentGameIds.length,
              },
            },
            cache: { gameIds: currentGameIds },
          });
        })
        .catch((error) => {
          logger.error(`Failed to fetch game library: ${error.message}`);
          return resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
