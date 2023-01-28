import { LocalDate } from "@js-joda/core";

export function isWeekend(date: LocalDate, weekendDays = [6, 7]) {
  return weekendDays.includes(date.dayOfWeek().value());
}
