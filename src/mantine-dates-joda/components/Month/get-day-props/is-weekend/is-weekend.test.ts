import { isWeekend } from "./is-weekend";
import { LocalDate } from "@js-joda/core";

describe("@mantine/dates/Day/is-weekend", () => {
  it("correctly detects sunday and saturday as weekend", () => {
    expect(isWeekend(LocalDate.of(2021, 12, 11))).toBe(true);
    expect(isWeekend(LocalDate.of(2021, 12, 12))).toBe(true);
  });

  it("correctly detects all other days to not be a weekend", () => {
    expect(isWeekend(LocalDate.of(2021, 12, 6))).toBe(false);
    expect(isWeekend(LocalDate.of(2021, 12, 7))).toBe(false);
    expect(isWeekend(LocalDate.of(2021, 12, 8))).toBe(false);
    expect(isWeekend(LocalDate.of(2021, 12, 9))).toBe(false);
    expect(isWeekend(LocalDate.of(2021, 12, 10))).toBe(false);
  });
});
