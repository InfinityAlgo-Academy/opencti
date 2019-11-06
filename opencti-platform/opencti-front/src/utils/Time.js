import moment from 'moment-timezone';
import countdown from 'countdown';

const dayDateFormat = 'MMMM Do YYYY';
const timeDateFormat = 'HH:mm:ss';
const defaultDateFormat = 'YYYY-MM-DD';
const yearDateFormat = 'YYYY';

export const ONE_MINUTE = 60 * 1000;
export const FIVE_SECONDS = 5000;
export const TEN_SECONDS = FIVE_SECONDS * 2;
export const ONE_SECOND = 1000;

export const parse = (date) => moment(date);

export const now = () => moment().format();

export const dayAgo = () => moment()
  .subtract(1, 'days')
  .format();

export const monthsAgo = (number) => moment()
  .subtract(number, 'months')
  .format();

export const dateMonthsAgo = (date, number) => moment(date)
  .subtract(number, 'months')
  .format();

export const dateMonthsAfter = (date, number) => moment(date)
  .add(number, 'months')
  .format();

export const yearsAgo = (number) => moment()
  .subtract(number, 'years')
  .format();

export const dayFormat = (data) => (data && data !== '-' ? parse(data).format(dayDateFormat) : '');

export const yearFormat = (data) => (data && data !== '-' ? parse(data).format(yearDateFormat) : '');

export const currentYear = () => yearFormat(now());

export const timeDiff = (start, end) => parse(start).diff(parse(end));

export const timeFormat = (data) => (data && data !== '-' ? parse(data).format(timeDateFormat) : '');

export const dateFormat = (data, specificFormat) => (data && data !== '-'
  ? parse(data).format(specificFormat || defaultDateFormat)
  : '');

export const dateToISO = (date) => {
  const momentDate = parse(date);
  return momentDate.isValid() ? momentDate.format() : 'invalid-date';
};

export const dateFromNow = (dateString) => (dateString ? countdown(parse(dateString).toDate()).toString() : '');

export const convertToCountdown = (durationInMillis) => {
  if (durationInMillis === null) return '-';
  const end = now();
  const start = moment(end).subtract(durationInMillis, 'ms');
  return countdown(start.toDate(), end.toDate()).toString();
};

export const logDate = () => now().format('HH:mm:ss.SSS');
