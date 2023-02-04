import { DayModifiers } from "../types";
import { isWeekend } from "./is-weekend/is-weekend";
import { isOutside } from "./is-outside/is-outside";
import { isDisabled } from "./is-disabled/is-disabled";
import { getRangeProps } from "./get-range-props/get-range-props";
import { LocalDate, YearMonth } from "@js-joda/core";

interface GetDayProps {
  /** Date associated with Day component */
  date: LocalDate;

  /** Month that is currently displayed */
  month: YearMonth;

  /** Does month have value prop? */
  hasValue: boolean;

  /** Min and max possible dates */
  maxDate?: LocalDate | null;
  minDate?: LocalDate | null;

  /** Currently selected date or an array of dates */
  value?: LocalDate | LocalDate[] | null;

  /** Function to determine if date should be excluded */
  excludeDate?(date: LocalDate): boolean;

  /** Should outside events be disabled */
  disableOutsideEvents?: boolean;

  /** Selected date range */
  range?: [LocalDate, LocalDate] | [null, null] | null[];

  /** Indices of weekend days */
  weekendDays?: number[];
}

export function getDayProps({
  date,
  month,
  hasValue,
  minDate,
  maxDate,
  value,
  excludeDate,
  disableOutsideEvents,
  range,
  weekendDays,
}: GetDayProps): DayModifiers {
  const outside = isOutside(date, month);
  const selected =
    hasValue &&
    !!value &&
    (Array.isArray(value)
      ? value.some((val) => date.isEqual(val))
      : date.isEqual(value));
  const { inRange, lastInRange, firstInRange, selectedInRange } = getRangeProps(
    date,
    range
  );

  return {
    disabled: isDisabled({
      minDate,
      maxDate,
      excludeDate,
      disableOutsideEvents,
      date,
      outside,
    }),
    weekend: isWeekend(date, weekendDays),
    selectedInRange,
    selected,
    inRange,
    firstInRange,
    lastInRange,
    outside,
  };
}
