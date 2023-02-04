import { FirstDayOfWeek } from "../../types";
import { getStartOfWeek } from "../get-start-of-week/get-start-of-week";
import { DateTimeFormatter, LocalDate, ZoneId } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";
export function getWeekdaysNames(
  locale: string,
  firstDayOfWeek: FirstDayOfWeek = "sunday",
  format: string = "EE"
) {
  const names: string[] = [];
  const date = getStartOfWeek(LocalDate.now(ZoneId.UTC), firstDayOfWeek);
  const formatter = DateTimeFormatter.ofPattern(format).withLocale(
    new Locale(locale)
  );

  for (let i = 0; i < 7; i += 1) {
    names.push(
      date
        .plusDays(i)
        .format(formatter)
        .slice(0, format === "EE" ? 2 : undefined)
    );
  }

  return names;
}
