import { ServiceDefinition } from '@/common/service.types';
import { EveryDayAtAction } from './actions/every-day-at.action';
import { EveryDayOfWeekAtAction } from './actions/every-day-of-week-at.action';
import { EveryHourAtAction } from './actions/every-hour-at.action';
import { EveryMonthOnAction } from './actions/every-month-on.action';
import { EveryYearOnAction } from './actions/every-year-on.action';

export default class DateTimeService implements ServiceDefinition {
  name = 'Date & Time';
  label = 'Date & Time';
  color = '#4285F4';
  logo = 'https://assets.ifttt.com/images/channels/3/icons/monochrome_large.webp';
  description = 'Date and time based triggers for scheduling actions';

  actions = [
    EveryDayAtAction,
    EveryHourAtAction,
    EveryDayOfWeekAtAction,
    EveryMonthOnAction,
    EveryYearOnAction,
  ];

  reactions = [];
}
