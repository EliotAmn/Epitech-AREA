import { Logger } from '@nestjs/common';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('DateTimeService');

export class EveryHourAtAction extends ServiceActionDefinition {
  name = 'date_time.every_hour_at';
  label = 'Every hour at';
  description = 'Triggered every hour at a specific minute';
  poll_interval = 60; // Check every minute
  output_params: ParameterDefinition[] = [
    {
      name: 'current_time',
      type: ParameterType.STRING,
      label: 'Current Time',
      description: 'The current time when triggered',
      required: true,
    },
    {
      name: 'current_hour',
      type: ParameterType.NUMBER,
      label: 'Current Hour',
      description: 'The current hour when triggered',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'minute',
      type: ParameterType.NUMBER,
      label: 'Minute',
      description: 'Minute of the hour (0-59)',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastTriggerHour: null, lastTriggerMinute: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Get the configured minute from input params
    const targetMinute = (sconf.config?.minute as number) ?? 0; // Default to 0 if not set

    const lastTriggerHour = sconf.cache?.lastTriggerHour as number | null;
    const lastTriggerMinute = sconf.cache?.lastTriggerMinute as number | null;

    logger.debug(
      `Checking EveryHourAt: Current ${currentHour}:${currentMinute}, Target minute ${targetMinute}`,
    );

    // Check if current minute matches target minute and it's a different hour or minute than last trigger
    const isTargetMinute = currentMinute === targetMinute;
    const isDifferentTime =
      lastTriggerHour !== currentHour || lastTriggerMinute !== currentMinute;
    const shouldTrigger = isTargetMinute && isDifferentTime;

    if (shouldTrigger) {
      logger.log(`EveryHourAt triggered at ${currentHour}:${currentMinute}`);

      return Promise.resolve({
        triggered: true,
        parameters: {
          current_time: {
            type: ParameterType.STRING,
            value: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
          },
          current_hour: {
            type: ParameterType.NUMBER,
            value: currentHour,
          },
        },
        cache: {
          lastTriggerHour: currentHour,
          lastTriggerMinute: currentMinute,
        },
      });
    }

    return Promise.resolve({
      triggered: false,
      parameters: {},
      cache: { lastTriggerHour, lastTriggerMinute },
    });
  }
}
