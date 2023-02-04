import { isSameMonth } from "./is-same-month";
import { LocalDate } from "@js-joda/core";

describe("@mantine/dates/is-same-month", () => {
  it("detects same month", () => {
    expect(
      isSameMonth(LocalDate.of(2021, 2, 1), LocalDate.of(2021, 2, 2))
    ).toBe(true);
    expect(
      isSameMonth(LocalDate.of(2021, 3, 1), LocalDate.of(2021, 2, 2))
    ).toBe(false);
    expect(
      isSameMonth(LocalDate.of(2022, 2, 2), LocalDate.of(2021, 2, 2))
    ).toBe(false);
  });
});
