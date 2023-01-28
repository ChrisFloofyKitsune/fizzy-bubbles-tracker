import { getEndOfWeek } from "./get-end-of-week";
import { LocalDate } from "@js-joda/core";

describe("@mantine/dates/get-end-of-week", () => {
  it("returns end of the week", () => {
    const endOfWeek = getEndOfWeek(LocalDate.of(2021, 7, 28), "monday");
    expect(endOfWeek).toStrictEqual(LocalDate.of(2021, 8, 1));
  });
  it("returns end of week for first day of week - sunday", () => {
    const endOfWeek = getEndOfWeek(LocalDate.of(2021, 7, 28), "sunday");
    expect(endOfWeek).toStrictEqual(LocalDate.of(2021, 7, 31));
  });
  test("last week of Feb 2021", () => {
    const endOfWeekMonday = getEndOfWeek(LocalDate.of(2021, 2, 28), "monday");
    expect(endOfWeekMonday).toStrictEqual(LocalDate.of(2021, 2, 28));

    const endOfWeekSunday = getEndOfWeek(LocalDate.of(2021, 2, 28), "sunday");
    expect(endOfWeekSunday).toStrictEqual(LocalDate.of(2021, 3, 6));
  });
});
