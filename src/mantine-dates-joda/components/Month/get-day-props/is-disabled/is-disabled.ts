import { LocalDate } from "@js-joda/core";

interface IsDisabled {
  date: LocalDate;
  minDate?: LocalDate | null;
  maxDate?: LocalDate | null;
  excludeDate?(date: LocalDate): boolean;
  disableOutsideEvents?: boolean;
  outside?: boolean;
}

export function isDisabled({
  minDate,
  maxDate,
  excludeDate,
  disableOutsideEvents,
  date,
  outside,
}: IsDisabled) {
  const isAfterMax = maxDate instanceof LocalDate && maxDate.isBefore(date);
  const isBeforeMin = minDate instanceof LocalDate && minDate.isAfter(date);
  const shouldExclude = typeof excludeDate === "function" && excludeDate(date);
  const disabledOutside = !!disableOutsideEvents && !!outside;
  return isAfterMax || isBeforeMin || shouldExclude || disabledOutside;
}
