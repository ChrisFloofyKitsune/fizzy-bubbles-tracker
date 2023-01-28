import { DateTimeFormatter, YearMonth } from "@js-joda/core";

export function formatYear(year: number, format: string) {
  const formatter = DateTimeFormatter.ofPattern(format.replaceAll("Y", "y"));
  return YearMonth.of(year, 1).format(formatter);
}
