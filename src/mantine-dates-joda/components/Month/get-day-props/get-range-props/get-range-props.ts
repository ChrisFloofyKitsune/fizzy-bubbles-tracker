import { LocalDate } from "@js-joda/core";

export function getRangeProps(
  date: LocalDate,
  range?: [LocalDate, LocalDate] | [null, null] | null[]
) {
  if (
    !Array.isArray(range) ||
    range.some((val) => !(val instanceof LocalDate))
  ) {
    return {
      firstInRange: false,
      lastInRange: false,
      inRange: false,
      selectedInRange: false,
    };
  }

  const [start, end] = range as [LocalDate, LocalDate];
  const firstInRange = date.isEqual(start);
  const lastInRange = date.isEqual(end);
  const inRange = date.compareTo(start) >= 0 && date.compareTo(end) <= 0;

  return {
    firstInRange,
    lastInRange,
    inRange,
    selectedInRange: firstInRange || lastInRange,
  };
}
