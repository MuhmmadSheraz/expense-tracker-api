import {
  endOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  startOfDay,
} from 'date-fns';

export enum DateRangeType {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export function getDateRange(type: DateRangeType): {
  startDate: Date;
  endDate: Date;
} {
  const today = new Date();
  let startDate: Date;
  let endDate: Date = today;

  switch (type) {
    case DateRangeType.TODAY:
      startDate = startOfDay(today);
      endDate = endOfDay(today);
      break;
    case DateRangeType.WEEK:
      startDate = startOfWeek(today);
      endDate = today;
      break;
    case DateRangeType.MONTH:
      startDate = startOfMonth(today);
      endDate = today;
      break;
    case DateRangeType.YEAR:
      startDate = startOfYear(today);
      endDate = today;
      break;
    default:
      startDate = startOfDay(today);
      endDate = endOfDay(today);
      break;
  }

  return { startDate, endDate };
}
