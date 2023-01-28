import { DateTimeFormatter, YearMonth } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";

export function getMonthsNames(locale: string, format: string = "MMM") {
  const names: string[] = [];
  const month = YearMonth.of(2020, 1);
  const formatter = DateTimeFormatter.ofPattern(format).withLocale(
    new Locale(locale)
  );

  for (let i = 0; i < 12; i += 1) {
    names.push(month.plusMonths(i).format(formatter));
  }

  return names;
}
