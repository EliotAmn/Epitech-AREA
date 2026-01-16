import { Logger } from '@nestjs/common';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('DateTimeService');

export class EveryMonthOnAction extends ServiceActionDefinition {
  name = 'date_time.every_month_on';
  label = 'Every month on the';
  description = 'Triggered on a specific day of the month at a specific time';
  poll_interval = 60; // Check every minute
  output_params: ParameterDefinition[] = [
    {
      name: 'current_date',
      type: ParameterType.STRING,
      label: 'Current Date',
      description: 'The current date when triggered',
      required: true,
    },
    {
      name: 'day_of_month',
      type: ParameterType.NUMBER,
      label: 'Day of Month',
      description: 'The day of the month when triggered',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'day',
      type: ParameterType.NUMBER,
      label: 'Day',
      description: 'Day of the month (1-31)',
      required: true,
    },
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
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get the configured day and time from input params
    const targetDay = (sconf.config?.day as number) ?? 1; // Default to 1st day of month
    const targetHour = (sconf.config?.hour as number) ?? 0; // Default to midnight
    const targetMinute = (sconf.config?.minute as number) ?? 0; // Default to 0 minutes

    const lastTriggerDate = sconf.cache?.lastTriggerDate as string | null;

    logger.debug(
      `Checking EveryMonthOn: Current day ${currentDay}, time ${currentHour}:${currentMinute}, Target day ${targetDay}, time ${targetHour}:${targetMinute}`,
    );

    // Check if current day matches target day and current time matches target time
    const isTargetDay = currentDay === targetDay;
    const isTargetTime =
      currentHour === targetHour && currentMinute === targetMinute;
    const shouldTrigger =
      isTargetDay && isTargetTime && lastTriggerDate !== currentDateStr;

    if (shouldTrigger) {
      logger.log(
        `EveryMonthOn triggered on day ${currentDay} at ${currentHour}:${currentMinute}`,
      );

      return Promise.resolve({
        triggered: true,
        parameters: {
          current_date: {
            type: ParameterType.STRING,
            value: currentDateStr,
          },
          day_of_month: {
            type: ParameterType.NUMBER,
            value: currentDay,
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
