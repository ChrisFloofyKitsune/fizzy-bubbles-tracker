import { isDisabled } from "./is-disabled";
import { LocalDate } from "@js-joda/core";

const date = LocalDate.of(2021, 11 + 1, 9);

describe("@mantine/dates/is-disabled", () => {
  it("detects that date is disabled it it is before min", () => {
    expect(isDisabled({ date, minDate: LocalDate.of(2022, 11 + 1, 9) })).toBe(
      true
    );
    expect(isDisabled({ date, minDate: LocalDate.of(2020, 11 + 1, 9) })).toBe(
      false
    );
  });

  it("detects that date is disabled it it is after max", () => {
    expect(isDisabled({ date, maxDate: LocalDate.of(2020, 11 + 1, 9) })).toBe(
      true
    );
    expect(isDisabled({ date, maxDate: LocalDate.of(2022, 11 + 1, 9) })).toBe(
      false
    );
  });

  it("detects that date is disabled it excludeDate returns true", () => {
    expect(isDisabled({ date, excludeDate: () => true })).toBe(true);
    expect(isDisabled({ date, excludeDate: () => false })).toBe(false);
  });

  it("detects that date is disabled if outside events are disabled and date is outside", () => {
    expect(
      isDisabled({ date, outside: true, disableOutsideEvents: true })
    ).toBe(true);
    expect(
      isDisabled({ date, outside: false, disableOutsideEvents: true })
    ).toBe(false);
    expect(
      isDisabled({ date, outside: true, disableOutsideEvents: false })
    ).toBe(false);
  });
});
