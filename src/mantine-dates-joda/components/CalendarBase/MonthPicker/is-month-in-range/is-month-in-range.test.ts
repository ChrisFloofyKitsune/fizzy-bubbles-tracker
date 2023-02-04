import { isMonthInRange } from "./is-month-in-range";
import { LocalDate, YearMonth } from "@js-joda/core";

describe("@mantine/dates/MonthPicker/is-month-in-range", () => {
  it("detects that month is in range when minDate and maxDate are not defined", () => {
    expect(isMonthInRange({ month: YearMonth.of(2021, 2) })).toBe(true);
  });

  it("detects that month is in range when minDate is defined", () => {
    expect(
      isMonthInRange({
        month: YearMonth.of(2021, 2),
        minDate: LocalDate.of(2020, 2, 1),
      })
    ).toBe(true);
  });

  it("detects that month is in range when maxDate is defined", () => {
    expect(
      isMonthInRange({
        month: YearMonth.of(2021, 1),
        maxDate: LocalDate.of(2022, 1, 1),
      })
    ).toBe(true);
  });

  it("detects that month is in range when both minDate and maxDate are defined", () => {
    expect(
      isMonthInRange({
        month: YearMonth.of(2021, 1),
        minDate: LocalDate.of(2020, 1, 1),
        maxDate: LocalDate.of(2022, 1, 1),
      })
    ).toBe(true);
  });

  it("detects that month is out of range based on minDate", () => {
    expect(
      isMonthInRange({
        month: YearMonth.of(2021, 1),
        minDate: LocalDate.of(2022, 1, 1),
      })
    ).toBe(false);
  });

  it("detects that month is out of range based on maxDate", () => {
    expect(
      isMonthInRange({
        month: YearMonth.of(2023, 1),
        maxDate: LocalDate.of(2022, 1, 1),
      })
    ).toBe(false);
  });

  it("handles edge cases correctly", () => {
    expect(
      isMonthInRange({
        month: YearMonth.of(2021, 2),
        minDate: LocalDate.of(2021, 2, 13),
      })
    ).toBe(true);
    expect(
      isMonthInRange({
        month: YearMonth.of(2021, 1),
        minDate: LocalDate.of(2021, 2, 13),
      })
    ).toBe(false);

    expect(
      isMonthInRange({
        month: YearMonth.of(2021, 2),
        maxDate: LocalDate.of(2022, 2, 13),
      })
    ).toBe(true);
    expect(
      isMonthInRange({
        month: YearMonth.of(2021, 3),
        maxDate: LocalDate.of(2022, 2, 13),
      })
    ).toBe(true);
  });
});
