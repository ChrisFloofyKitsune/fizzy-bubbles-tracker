import { isOutside } from "./is-outside";
import { LocalDate, YearMonth } from "@js-joda/core";

describe("@mantine/dates/Day/is-outside", () => {
  it("detects dates that are outside of given month", () => {
    expect(isOutside(LocalDate.of(2021, 1, 30), YearMonth.of(2021, 2))).toBe(
      true
    );
    expect(isOutside(LocalDate.of(2021, 2, 1), YearMonth.of(2021, 1))).toBe(
      true
    );
  });

  it("detects dates that are inside given month", () => {
    expect(isOutside(LocalDate.of(2021, 1, 14), YearMonth.of(2021, 1))).toBe(
      false
    );
    expect(isOutside(LocalDate.of(2021, 1, 5), YearMonth.of(2021, 1))).toBe(
      false
    );
  });
});
