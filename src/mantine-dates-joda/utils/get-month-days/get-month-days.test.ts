import { LocalDate, YearMonth } from "@js-joda/core";
import { getMonthDays } from "./get-month-days";

describe("@mantine/dates/get-month-days", () => {
  it("returns all month days for given date", () => {
    // February 2021 is ideal month (4 weeks, month starts on monday and ends on sunday)
    const monthDays = getMonthDays(YearMonth.of(2021, 2), "monday");
    expect(monthDays).toHaveLength(4);

    expect(monthDays[0][1]).toStrictEqual(LocalDate.of(2021, 2, 2));
    expect(monthDays[0][2]).toStrictEqual(LocalDate.of(2021, 2, 3));
    expect(monthDays[1][0]).toStrictEqual(LocalDate.of(2021, 2, 8));
    expect(monthDays[2][0]).toStrictEqual(LocalDate.of(2021, 2, 15));
    expect(
      monthDays[monthDays.length - 1][monthDays[0].length - 1]
    ).toStrictEqual(LocalDate.of(2021, 3, 1).minusDays(1));
  });
  it("returns all month days for given date, first day of week - sunday", () => {
    const monthDays = getMonthDays(YearMonth.of(2021, 2), "sunday");
    expect(monthDays).toHaveLength(5);

    expect(monthDays[0][0]).toStrictEqual(LocalDate.of(2021, 1, 31));
    expect(monthDays[0][2]).toStrictEqual(LocalDate.of(2021, 2, 2));
    expect(monthDays[0][3]).toStrictEqual(LocalDate.of(2021, 2, 3));
    expect(monthDays[1][1]).toStrictEqual(LocalDate.of(2021, 2, 8));
    expect(monthDays[2][1]).toStrictEqual(LocalDate.of(2021, 2, 15));
    expect(monthDays[monthDays.length - 1][0]).toStrictEqual(
      LocalDate.of(2021, 2, 28)
    );
  });
  it("returns outside days for given month", () => {
    // April 2021 has outside days in the beginning and end of month
    const monthDays = getMonthDays(YearMonth.of(2021, 4), "monday");

    expect(monthDays).toHaveLength(5);
    expect(monthDays[0][0]).toStrictEqual(LocalDate.of(2021, 3, 29));
    expect(monthDays[0][1]).toStrictEqual(LocalDate.of(2021, 3, 30));
    expect(
      monthDays[monthDays.length - 1][monthDays[0].length - 1].toEpochDay()
    ).toStrictEqual(LocalDate.of(2021, 5, 2).toEpochDay());
  });
  it("returns outside days for given month, first day of the week - sunday", () => {
    const monthDays = getMonthDays(YearMonth.of(2021, 4), "sunday");

    expect(monthDays).toHaveLength(5);
    expect(monthDays[0][0]).toStrictEqual(LocalDate.of(2021, 3, 28));
    expect(monthDays[0][1]).toStrictEqual(LocalDate.of(2021, 3, 29));
    expect(
      monthDays[monthDays.length - 1][monthDays[0].length - 1]
    ).toStrictEqual(LocalDate.of(2021, 5, 1));
  });
});
