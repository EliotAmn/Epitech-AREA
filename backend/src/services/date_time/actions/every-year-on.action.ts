import { Logger } from '@nestjs/common';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('DateTimeService');

export class EveryYearOnAction extends ServiceActionDefinition {
  name = 'date_time.every_year_on';
  label = 'Every year on';
  description = 'Triggered on a specific date and time every year';
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
      name: 'month',
      type: ParameterType.NUMBER,
      label: 'Month',
      description: 'The month when triggered (1-12)',
      required: true,
    },
    {
      name: 'day',
      type: ParameterType.NUMBER,
      label: 'Day',
      description: 'The day of the month when triggered',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'month',
      type: ParameterType.NUMBER,
      label: 'Month',
      description: 'Month (1-12)',
      required: true,
    },
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
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get the configured date and time from input params
    const targetMonth = (sconf.config?.month as number) ?? 1; // Default to January
    const targetDay = (sconf.config?.day as number) ?? 1; // Default to 1st day
    const targetHour = (sconf.config?.hour as number) ?? 0; // Default to midnight
    const targetMinute = (sconf.config?.minute as number) ?? 0; // Default to 0 minutes

    const lastTriggerDate = sconf.cache?.lastTriggerDate as string | null;

    logger.debug(
      `Checking EveryYearOn: Current ${currentMonth}/${currentDay}, time ${currentHour}:${currentMinute}, Target ${targetMonth}/${targetDay}, time ${targetHour}:${targetMinute}`,
    );

    // Check if current date matches target date and current time matches target time
    const isTargetDate =
      currentMonth === targetMonth && currentDay === targetDay;
    const isTargetTime =
      currentHour === targetHour && currentMinute === targetMinute;
    const shouldTrigger =
      isTargetDate && isTargetTime && lastTriggerDate !== currentDateStr;

    if (shouldTrigger) {
      logger.log(
        `EveryYearOn triggered on ${currentMonth}/${currentDay} at ${currentHour}:${currentMinute}`,
      );

      return Promise.resolve({
        triggered: true,
        parameters: {
          current_date: {
            type: ParameterType.STRING,
            value: currentDateStr,
          },
          month: {
            type: ParameterType.NUMBER,
            value: currentMonth,
          },
          day: {
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
