import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import objectSupport from "dayjs/plugin/objectSupport";

dayjs.extend(utc);
dayjs.extend(objectSupport);

export function toUTCDate(dayjsDate: Dayjs): Date {
  return new Date(
    Date.UTC(dayjsDate.year(), dayjsDate.month(), dayjsDate.date())
  );
}

export function toUTCDayjs(date?: Date | null | undefined): Dayjs {
  return !date
    ? dayjs.utc()
    : dayjs.utc({
        year: date.getUTCFullYear(),
        month: date.getUTCMonth(),
        day: date.getUTCDate(),
      });
}
