import { LocalDate, YearMonth } from "@js-joda/core";

interface IsMonthInRange {
  month: YearMonth;
  minDate?: LocalDate;
  maxDate?: LocalDate;
}

export function isMonthInRange({ month, minDate, maxDate }: IsMonthInRange) {
  const hasMinDate = minDate instanceof LocalDate;
  const hasMaxDate = maxDate instanceof LocalDate;

  if (!hasMaxDate && !hasMinDate) {
    return true;
  }

  const endOfMonth = month.atEndOfMonth();
  const startOfMonth = month.atDay(1);
  const maxInRange = hasMaxDate ? startOfMonth.isBefore(maxDate) : true;
  const minInRange = hasMinDate ? endOfMonth.isAfter(minDate) : true;
  return maxInRange && minInRange;
}
