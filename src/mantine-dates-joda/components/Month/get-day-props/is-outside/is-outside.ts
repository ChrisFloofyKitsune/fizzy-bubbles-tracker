import { isSameMonth } from "../../../../utils";
import { LocalDate, YearMonth } from "@js-joda/core";

export function isOutside(date: LocalDate, month: YearMonth) {
  return !isSameMonth(date, month);
}
