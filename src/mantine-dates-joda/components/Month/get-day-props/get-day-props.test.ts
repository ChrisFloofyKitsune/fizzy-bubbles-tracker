import { LocalDate, YearMonth } from "@js-joda/core";
import { getDayProps } from "./get-day-props";

const defaultProps = {
  date: LocalDate.of(2021, 11 + 1, 9),
  month: YearMonth.of(2021, 11 + 1),
  hasValue: false,
  value: null,
  minDate: null,
  maxDate: null,
  excludeDate: () => false,
  disableOutsideEvents: false,
  range: [null, null],
  weekendDays: [6, 7],
};

const defaultResult = {
  disabled: false,
  firstInRange: false,
  inRange: false,
  lastInRange: false,
  outside: false,
  selected: false,
  selectedInRange: false,
  weekend: false,
};

describe("@mantine/dates/Day/get-day-props", () => {
  it("detects selected date", () => {
    expect(
      getDayProps({
        ...defaultProps,
        hasValue: true,
        date: LocalDate.of(2021, 12, 8),
        value: LocalDate.of(2021, 12, 8),
      })
    ).toStrictEqual({
      ...defaultResult,
      selected: true,
    });

    expect(
      getDayProps({
        ...defaultProps,
        hasValue: true,
        date: LocalDate.of(2021, 11 + 1, 8),
        value: LocalDate.of(2022, 1, 8),
      })
    ).toStrictEqual({
      ...defaultResult,
      selected: false,
    });
  });

  it("detects outside date", () => {
    expect(
      getDayProps({
        ...defaultProps,
        date: LocalDate.of(2021, 11 + 1, 9),
        month: YearMonth.of(2021, 11 + 1),
      })
    ).toStrictEqual({
      ...defaultResult,
      outside: false,
    });

    expect(
      getDayProps({
        ...defaultProps,
        date: LocalDate.of(2021, 10 + 1, 9),
        month: YearMonth.of(2021, 11 + 1),
      })
    ).toStrictEqual({
      ...defaultResult,
      outside: true,
    });
  });

  it("detects disabled date", () => {
    const disabledResults = { ...defaultResult, disabled: true };
    expect(
      getDayProps({ ...defaultProps, minDate: LocalDate.of(2040, 1 + 1, 1) })
    ).toStrictEqual(disabledResults);
    expect(
      getDayProps({ ...defaultProps, maxDate: LocalDate.of(2000, 1 + 1, 1) })
    ).toStrictEqual(disabledResults);
    expect(
      getDayProps({ ...defaultProps, excludeDate: () => true })
    ).toStrictEqual(disabledResults);
    expect(
      getDayProps({
        ...defaultProps,
        disableOutsideEvents: true,
        date: LocalDate.of(2021, 10 + 1, 9),
        month: YearMonth.of(2021, 11 + 1),
      })
    ).toStrictEqual({ ...disabledResults, outside: true });
  });

  it("returns correct range properties", () => {
    const range: [LocalDate, LocalDate] = [
      LocalDate.of(2021, 1, 1),
      LocalDate.of(2021, 1, 15),
    ];
    const rangeResults = { ...defaultResult, inRange: true };
    expect(
      getDayProps({
        ...defaultProps,
        range,
        date: LocalDate.of(2021, 1, 5),
        month: YearMonth.of(2021, 1),
      })
    ).toStrictEqual(rangeResults);

    expect(
      getDayProps({
        ...defaultProps,
        range,
        date: LocalDate.of(2021, 1, 1),
        month: YearMonth.of(2021, 1),
      })
    ).toStrictEqual({
      ...rangeResults,
      firstInRange: true,
      selectedInRange: true,
    });

    expect(
      getDayProps({
        ...defaultProps,
        range,
        date: LocalDate.of(2021, 1, 15),
        month: YearMonth.of(2021, 1),
      })
    ).toStrictEqual({
      ...rangeResults,
      lastInRange: true,
      selectedInRange: true,
    });
  });

  it("detects weekend", () => {
    expect(
      getDayProps({ ...defaultProps, date: LocalDate.of(2021, 11 + 1, 11) })
    ).toStrictEqual({
      ...defaultResult,
      weekend: true,
    });
    expect(
      getDayProps({ ...defaultProps, date: LocalDate.of(2021, 12, 12) })
    ).toStrictEqual({
      ...defaultResult,
      weekend: true,
    });
    expect(
      getDayProps({ ...defaultProps, date: LocalDate.of(2021, 11 + 1, 8) })
    ).toStrictEqual({
      ...defaultResult,
      weekend: false,
    });
  });
});
