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
  playtime_2weeks?: number;
}

interface SteamOwnedGamesResponse {
  response: {
    game_count: number;
    games: SteamGame[];
  };
}

interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  gameextrainfo?: string;
  gameid?: string;
}

interface SteamPlayerSummariesResponse {
  response: {
    players: SteamPlayerSummary[];
  };
}

const logger = new Logger('SteamService');

export class GamePlayed extends ServiceActionDefinition {
  name = 'steam.game_played';
  label = 'On game played';
  description = 'Triggered when a specific game is being played';
  poll_interval = 30; // Check every 30 seconds
  output_params: ParameterDefinition[] = [
    {
      name: 'game_name',
      type: ParameterType.STRING,
      label: 'Game Name',
      description: 'The name of the game being played',
      required: true,
    },
    {
      name: 'player_name',
      type: ParameterType.STRING,
      label: 'Player Name',
      description: 'The Steam username',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'game_filter',
      type: ParameterType.STRING,
      label: 'Game Name Filter (Optional)',
      description: 'Leave empty to trigger on any game, or specify a game name',
      required: false,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ currentlyPlaying: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const steamId = sconf.config.steam_id as string | undefined;
    const gameFilter = sconf.config.game_filter as string | undefined;

    logger.debug(`Polling game status for Steam ID: ${steamId}`);

    if (!steamId) {
      logger.debug('Missing Steam ID, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastPlayingGame = sconf.cache?.currentlyPlaying as string | null;
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
          const currentGame = player.gameextrainfo;

          if (!currentGame) {
            logger.debug('Player is not currently in a game');
            // Update cache to indicate no game is being played
            return resolve({
              triggered: false,
              parameters: {},
              cache: { currentlyPlaying: null },
            });
          }

          // Check if this is a new game session (different from last poll)
          if (currentGame === lastPlayingGame) {
            logger.debug(`Still playing same game: ${currentGame}`);
            return resolve({ triggered: false, parameters: {} });
          }

          // Check if game matches filter (if provided)
          if (gameFilter && !currentGame.toLowerCase().includes(gameFilter.toLowerCase())) {
            logger.debug(`Game ${currentGame} doesn't match filter ${gameFilter}`);
            return resolve({
              triggered: false,
              parameters: {},
              cache: { currentlyPlaying: currentGame },
            });
          }

          logger.log(`New game session detected: ${currentGame}`);

          resolve({
            triggered: true,
            parameters: {
              game_name: {
                type: ParameterType.STRING,
                value: currentGame,
              },
              player_name: {
                type: ParameterType.STRING,
                value: player.personaname || 'Unknown Player',
              },
            },
            cache: { currentlyPlaying: currentGame },
          });
        })
        .catch((error) => {
          logger.error(`Failed to fetch player status: ${error.message}`);
          return resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
