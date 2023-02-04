import { FirstDayOfWeek } from "../../types";
import { ChronoField, LocalDate } from "@js-joda/core";

export function getEndOfWeek(
  date: LocalDate,
  firstDayOfWeek: FirstDayOfWeek = "sunday"
) {
  if (firstDayOfWeek === "monday") {
    return date.with(ChronoField.DAY_OF_WEEK, 7);
  } else {
    return date.plusDays(1).with(ChronoField.DAY_OF_WEEK, 6);
  }
}
