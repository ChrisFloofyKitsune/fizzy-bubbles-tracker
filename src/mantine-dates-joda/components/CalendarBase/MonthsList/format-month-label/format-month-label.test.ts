import { formatMonthLabel } from "./format-month-label";
import { YearMonth } from "@js-joda/core";

describe("@mantine/dates/MonthsList/format-month-label", () => {
  it("formats label with given format and locale", () => {
    expect(
      formatMonthLabel({
        month: YearMonth.of(2021, 12),
        locale: "en",
        format: "MMMM YYYY",
      })
    ).toBe("December 2021");
    expect(
      formatMonthLabel({
        month: YearMonth.of(2021, 12),
        locale: "en",
        format: "MMM yyyy",
      })
    ).toBe("Dec 2021");
  });
});
