import { ChronoField, TemporalAccessor } from "@js-joda/core";

export function isSameMonth(
  date: TemporalAccessor,
  comparison: TemporalAccessor
) {
  return (
    date.isSupported(ChronoField.PROLEPTIC_MONTH) &&
    comparison.isSupported(ChronoField.PROLEPTIC_MONTH) &&
    date.get(ChronoField.PROLEPTIC_MONTH) ===
      comparison.get(ChronoField.PROLEPTIC_MONTH)
  );
}
