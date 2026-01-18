import { Logger } from '@nestjs/common';
import axios from 'axios';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

type SpotifyPlayerResponse = {
  device?: {
    id?: string;
    name?: string;
  } | null;
};

const logger = new Logger('SpotifyService');

export class DeviceChanged extends ServiceActionDefinition {
  name = 'spotify.device_changed';
  label = 'On device changed';
  description = 'Triggered when the active playback device changes';
  poll_interval = 10;
  output_params: ParameterDefinition[] = [
    {
      name: 'device_name',
      type: ParameterType.STRING,
      label: 'Device Name',
      description: 'The name of the new active device',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastDeviceId: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    logger.debug(
      `Polling device change, access token present: ${!!accessToken}`,
    );

    if (!accessToken) {
      logger.debug('No access token, skipping poll');
      return Promise.resolve({ triggered: false, parameters: {} });
    }

    const lastDeviceId = sconf.cache?.lastDeviceId as string | null;

    return new Promise((resolve) => {
      axios
        .get<SpotifyPlayerResponse>('https://api.spotify.com/v1/me/player', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((resp) => {
          if (resp.status === 204)
            return resolve({ triggered: false, parameters: {} });
          const data = resp.data;
          if (!data || !data.device)
            return resolve({ triggered: false, parameters: {} });

          const deviceId = data.device.id as string;
          const deviceName = data.device.name as string;

          if (lastDeviceId === null) {
            return resolve({
              triggered: false,
              parameters: {},
              cache: { lastDeviceId: deviceId },
            });
          }

          if (lastDeviceId !== deviceId) {
            logger.log(`Device changed from ${lastDeviceId} to ${deviceId}`);
            return resolve({
              triggered: true,
              parameters: {
                device_name: { type: ParameterType.STRING, value: deviceName },
              },
              cache: { lastDeviceId: deviceId },
            });
          }

          return resolve({
            triggered: false,
            parameters: {},
            cache: { lastDeviceId: deviceId },
          });
        })
        .catch((err: unknown) => {
          logger.error(
            `Error polling Spotify device change: ${(err as Error).message}`,
          );
          resolve({ triggered: false, parameters: {} });
        });
    });
  }
}
