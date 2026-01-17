import { Logger } from '@nestjs/common';

import { ParameterType, ServiceActionDefinition } from '@/common/service.types';
import type {
  ActionTriggerOutput,
  ParameterDefinition,
  ServiceConfig,
} from '@/common/service.types';

const logger = new Logger('DateTimeService');

export class EveryDayOfWeekAtAction extends ServiceActionDefinition {
  name = 'date_time.every_day_of_week_at';
  label = 'Every day of the week at';
  description = 'Triggered on specific days of the week at a specific time';
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
      name: 'day_of_week',
      type: ParameterType.STRING,
      label: 'Day of Week',
      description: 'The day of the week when triggered',
      required: true,
    },
  ];
  input_params: ParameterDefinition[] = [
    {
      name: 'days',
      type: ParameterType.SELECT,
      label: 'Days',
      description: 'Days of the week to trigger',
      required: true,
      options: [
        { label: 'Monday', value: '1' },
        { label: 'Tuesday', value: '2' },
        { label: 'Wednesday', value: '3' },
        { label: 'Thursday', value: '4' },
        { label: 'Friday', value: '5' },
        { label: 'Saturday', value: '6' },
        { label: 'Sunday', value: '0' },
      ],
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
    return Promise.resolve({ lastTriggerDay: null, lastTriggerTime: null });
  }

  poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDayOfWeek = now.getDay().toString(); // 0 (Sunday) to 6 (Saturday)
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Get the configured days and time from input params
    const targetDays = (sconf.config?.days as string[]) ?? [
      '1',
      '2',
      '3',
      '4',
      '5',
    ]; // Default to weekdays
    const targetHour = (sconf.config?.hour as number) ?? 9; // Default to 9 if not set
    const targetMinute = (sconf.config?.minute as number) ?? 0; // Default to 0 if not set

    const lastTriggerDay = sconf.cache?.lastTriggerDay as string | null;
    const lastTriggerTime = sconf.cache?.lastTriggerTime as string | null;

    logger.debug(
      `Checking EveryDayOfWeekAt: Current day ${currentDayOfWeek}, time ${currentTimeStr}, Target days ${targetDays.join(',')}, time ${targetHour}:${targetMinute}`,
    );

    // Check if current day is in target days and current time matches target time
    const isTargetDay = targetDays.includes(currentDayOfWeek);
    const isTargetTime =
      currentHour === targetHour && currentMinute === targetMinute;
    const isDifferentTrigger =
      lastTriggerDay !== currentDayOfWeek || lastTriggerTime !== currentTimeStr;
    const shouldTrigger = isTargetDay && isTargetTime && isDifferentTrigger;

    if (shouldTrigger) {
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayName = dayNames[now.getDay()];

      logger.log(
        `EveryDayOfWeekAt triggered on ${dayName} at ${currentTimeStr}`,
      );

      return Promise.resolve({
        triggered: true,
        parameters: {
          current_time: {
            type: ParameterType.STRING,
            value: currentTimeStr,
          },
          day_of_week: {
            type: ParameterType.STRING,
            value: dayName,
          },
        },
        cache: {
          lastTriggerDay: currentDayOfWeek,
          lastTriggerTime: currentTimeStr,
        },
      });
    }

    return Promise.resolve({
      triggered: false,
      parameters: {},
      cache: { lastTriggerDay, lastTriggerTime },
    });
  }
}
