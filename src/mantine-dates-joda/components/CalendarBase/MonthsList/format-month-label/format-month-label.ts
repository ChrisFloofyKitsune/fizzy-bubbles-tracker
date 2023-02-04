import { upperFirst } from "@mantine/hooks";
import { DateTimeFormatter, YearMonth } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";

interface FormatMonthLabel {
  month: YearMonth;
  locale: string;
  format: string;
}

export function formatMonthLabel({ month, locale, format }: FormatMonthLabel) {
  const formatter = DateTimeFormatter.ofPattern(
    format.replaceAll("Y", "y")
  ).withLocale(new Locale(locale));
  return upperFirst(month.format(formatter));
}
