import { FirstDayOfWeek } from "../../types";
import { ChronoField, DayOfWeek, LocalDate } from "@js-joda/core";

export function getStartOfWeek(
  date: LocalDate,
  firstDayOfWeek: FirstDayOfWeek = "sunday"
) {
  if (firstDayOfWeek === "monday") {
    return date.with(ChronoField.DAY_OF_WEEK, 1);
  } else if (date.dayOfWeek() === DayOfWeek.SUNDAY) {
    return date;
  } else {
    return date.minusWeeks(1).with(ChronoField.DAY_OF_WEEK, 7);
  }
}
