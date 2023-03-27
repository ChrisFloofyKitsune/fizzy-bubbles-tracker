import { DateTimeFormatter } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";

export const LocalDateFormatter = DateTimeFormatter.ofPattern(
  "dd-MMM-yyyy"
).withLocale(Locale.ENGLISH);
