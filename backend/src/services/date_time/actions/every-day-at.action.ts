import { Logger } from '@nestjs/common';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('DateTimeService');

export class EveryDayAtAction extends ServiceActionDefinition {
  name = 'date_time.every_day_at';
  label = 'Every day at';
  description = 'Triggered every day at a specific time';
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
      name: 'current_date',
      type: ParameterType.STRING,
      label: 'Current Date',
      description: 'The current date when triggered',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'hour',
      type: ParameterType.NUMBER,
      label: 'Hour',
      description: 'Hour of the day (0-23)',
      required: true,
    },
    {
      name: 'minute',
      type: ParameterType.NUMBER,
      label: 'Minute',
      description: 'Minute of the hour (0-59)',
      required: true,
    },
  ];

  reload_cache(): Promise<Record<string, unknown>> {
    return Promise.resolve({ lastTriggerDate: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get the configured time from input params
    const targetHour = (sconf.config?.hour as number) ?? 23; // Default to 23 if not set
    const targetMinute = (sconf.config?.minute as number) ?? 59; // Default to 59 if not set

    const lastTriggerDate = sconf.cache?.lastTriggerDate as string | null;

    logger.debug(
      `Checking EveryDayAt: Current ${currentHour}:${currentMinute}, Target ${targetHour}:${targetMinute}`,
    );

    // Check if current time matches target time
    const isTargetTime =
      currentHour === targetHour && currentMinute === targetMinute;
    const shouldTrigger = isTargetTime && lastTriggerDate !== currentDateStr;

    if (shouldTrigger) {
      logger.log(`EveryDayAt triggered at ${currentHour}:${currentMinute}`);

      return Promise.resolve({
        triggered: true,
        parameters: {
          current_time: {
            type: ParameterType.STRING,
            value: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
          },
          current_date: {
            type: ParameterType.STRING,
            value: currentDateStr,
          },
        },
        cache: { lastTriggerDate: currentDateStr },
      });
    }

    return Promise.resolve({
      triggered: false,
      parameters: {},
      cache: { lastTriggerDate },
    });
  }
}
