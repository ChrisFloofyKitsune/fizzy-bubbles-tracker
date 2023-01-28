import { itSupportsSystemProps } from "../../@mantine-tests";
import { Calendar, CalendarProps } from "./Calendar";
import { LocalDate, YearMonth, ZoneId } from "@js-joda/core";

const defaultProps: CalendarProps = {
  month: YearMonth.now(ZoneId.UTC),
  value: LocalDate.now(ZoneId.UTC),
};

describe("@mantine/dates/Calendar", () => {
  itSupportsSystemProps({
    component: Calendar,
    props: defaultProps,
    displayName: "@mantine/dates/Calendar",
  });
});
