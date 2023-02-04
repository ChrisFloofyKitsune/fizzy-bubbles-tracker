import { getStartOfWeek } from "./get-start-of-week";
import { LocalDate } from "@js-joda/core";

describe("@mantine/dates/get-start-of-week", () => {
  it("returns start of week", () => {
    const startOfWeek = getStartOfWeek(LocalDate.of(2021, 3, 5), "monday");
    expect(startOfWeek).toStrictEqual(LocalDate.of(2021, 3, 1));
  });
  it("returns start of week, first day of the week - sunday", () => {
    const startOfWeek = getStartOfWeek(LocalDate.of(2021, 3, 5), "sunday");
    expect(startOfWeek).toStrictEqual(LocalDate.of(2021, 2, 28));
  });
  it("asking for start of week via monday in monday mode should return same date", () => {
    const startOfWeek = getStartOfWeek(LocalDate.of(2021, 2, 22), "monday");
    expect(startOfWeek).toStrictEqual(LocalDate.of(2021, 2, 22));
  });
  it("asking for start of week via sunday in sunday mode should return same date", () => {
    const startOfWeek = getStartOfWeek(LocalDate.of(2021, 2, 21), "sunday");
    expect(startOfWeek).toStrictEqual(LocalDate.of(2021, 2, 21));
  });
});
