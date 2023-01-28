import { FirstDayOfWeek } from "../../types";
import { getStartOfWeek } from "../get-start-of-week/get-start-of-week";
import { getEndOfWeek } from "../get-end-of-week/get-end-of-week";
import { LocalDate, YearMonth } from "@js-joda/core";

export function getMonthDays(
  month: YearMonth,
  firstDayOfWeek: FirstDayOfWeek = "sunday"
): LocalDate[][] {
  const date = getStartOfWeek(month.atDay(1), firstDayOfWeek);
  const endDate = getEndOfWeek(month.atEndOfMonth(), firstDayOfWeek);
  const weeks: LocalDate[][] = [];

  let currentDay = date;
  while (currentDay.compareTo(endDate) <= 0) {
    const days: LocalDate[] = [];

    for (let i = 0; i < 7; i += 1) {
      days.push(LocalDate.from(currentDay));
      currentDay = currentDay.plusDays(1);
    }

    weeks.push(days);
  }

  return weeks;
}
