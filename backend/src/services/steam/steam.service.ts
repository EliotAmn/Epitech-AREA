import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@prisma/client';

import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl } from '@/common/tools';
import { AchievementUnlocked } from '@/services/steam/actions/achievement-unlocked';
import { FriendCountChanged } from '@/services/steam/actions/friend-count-changed';
import { GamePlayed } from '@/services/steam/actions/game-played';
import { NewGameOwned } from '@/services/steam/actions/new-game-owned';
import { StatusChanged } from '@/services/steam/actions/status-changed';

const logger = new Logger('SteamService');

async function oauth_callback(
  userService: UserService,
  params: { [key: string]: string },
): Promise<boolean> {
  // Log all parameters to debug
  logger.debug(`OAuth callback received for user ${userService.user_id}`);
  logger.debug(`All params: ${JSON.stringify(Object.keys(params))}`);
  
  // Steam OpenID returns parameters with dots, try both formats
  const steamId = 
    params['openid.claimed_id'] || 
    params.openid_claimed_id as string | undefined;
  
  logger.debug(`Steam ID raw value: ${steamId}`);

  if (!steamId)
    throw new BadRequestException('Steam ID is missing from OpenID response');

  // Extract Steam ID from the OpenID URL
  // Format: https://steamcommunity.com/openid/id/[STEAM_ID]
  const steamIdMatch = steamId.match(/\/id\/(\d+)$/);
  if (!steamIdMatch || !steamIdMatch[1]) {
    throw new BadRequestException('Invalid Steam ID format');
  }

  const extractedSteamId = steamIdMatch[1];
  logger.log(`OAuth successful for user ${userService.user_id}`);
  logger.debug(`Extracted Steam ID: ${extractedSteamId}`);

  userService.service_config = {
    ...((userService.service_config as object) || {}),
    steam_id: extractedSteamId,
  };

  return true;
}

export default class SteamService implements ServiceDefinition {
  name = 'steam';
  label = 'Steam';
  color = '#1b2838';
  logo =
    'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg';
  mandatory_env_vars = ['STEAM_API_KEY'];
  oauth_url = buildOpenIdUrl();
  oauth_callback = oauth_callback;
  description =
    'Connect your Steam account to track gaming achievements, playtime, friend changes, and library updates.';
  actions = [
    AchievementUnlocked,
    GamePlayed,
    StatusChanged,
    FriendCountChanged,
    NewGameOwned,
  ];
  reactions = []; // Steam Web API is read-only without Partner access
}

function buildOpenIdUrl(): string {
  const redirectUri = buildServiceRedirectUrl('steam');
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': redirectUri,
    'openid.realm': redirectUri.replace(/\/callback\/steam$/, ''),
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}
