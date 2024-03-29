import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { itSupportsSystemProps } from "../../@mantine-tests";
import { Month, MonthProps } from "./Month";
import { LocalDate, YearMonth, ZoneId } from "@js-joda/core";

const defaultProps: MonthProps = {
  month: YearMonth.of(2021, 12),
  value: LocalDate.of(2021, 12, 5),
  firstDayOfWeek: "monday",
};

describe("@mantine/dates/Month", () => {
  itSupportsSystemProps<any>({
    component: Month,
    props: defaultProps,
    displayName: "@mantine/dates/Month",
    refType: HTMLTableElement,
  });

  it("renders correct amount of weekdays", () => {
    const { container } = render(<Month month={YearMonth.now(ZoneId.UTC)} />);
    expect(
      container.querySelectorAll(".mantine-Month-weekdayCell")
    ).toHaveLength(7);
  });

  it("renders correct amount of days", () => {
    const { container } = render(
      <Month month={YearMonth.of(2021, 2)} firstDayOfWeek="monday" />
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(4);
    expect(container.querySelectorAll("tbody td")).toHaveLength(28);

    const { container: firstDayOfWeekSunday } = render(
      <Month month={YearMonth.of(2021, 2)} firstDayOfWeek="sunday" />
    );
    expect(firstDayOfWeekSunday.querySelectorAll("tbody tr")).toHaveLength(5);
    expect(firstDayOfWeekSunday.querySelectorAll("tbody td")).toHaveLength(35);
  });

  it("assigns values to given daysRefs", () => {
    const daysRefs: HTMLButtonElement[][] = [];
    render(
      <Month
        {...defaultProps}
        month={YearMonth.of(2021, 12)}
        daysRefs={daysRefs}
      />
    );
    expect(daysRefs.length).toBe(5);
    expect(daysRefs.every((list) => list.length === 7)).toBe(true);
    expect(
      daysRefs.every((list) =>
        list.every((date) => date instanceof HTMLButtonElement)
      )
    ).toBe(true);
  });

  it("adds styles when month days are within range", () => {
    const { container: withoutRange } = render(
      <Month month={YearMonth.of(2021, 12)} />
    );
    const { container: withRange } = render(
      <Month
        month={YearMonth.of(2021, 12)}
        range={[LocalDate.of(2021, 12, 5), LocalDate.of(2021, 12, 15)]}
      />
    );

    expect(withRange.querySelectorAll("[data-first-in-range]")).toHaveLength(1);
    expect(withRange.querySelectorAll("[data-last-in-range]")).toHaveLength(1);
    expect(withRange.querySelectorAll("[data-in-range]")).toHaveLength(11);

    expect(withoutRange.querySelectorAll("[data-first-in-range]")).toHaveLength(
      0
    );
    expect(withoutRange.querySelectorAll("[data-last-in-range]")).toHaveLength(
      0
    );
    expect(withoutRange.querySelectorAll("[data-in-range]")).toHaveLength(0);
  });

  it("does not add styles when month days outside of range", () => {
    const { container } = render(
      <Month
        month={YearMonth.of(2021, 12)}
        range={[LocalDate.of(2021, 11, 5), LocalDate.of(2021, 11, 15)]}
      />
    );

    expect(container.querySelectorAll("[data-first-in-range]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-last-in-range]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-in-range]")).toHaveLength(0);
  });

  it("adds partial range styles", () => {
    const { container } = render(
      <Month
        month={YearMonth.of(2021, 12)}
        range={[LocalDate.of(2021, 12, 25), LocalDate.of(2022, 1, 15)]}
        firstDayOfWeek="monday"
      />
    );

    expect(container.querySelectorAll("[data-first-in-range]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-last-in-range]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-in-range]")).toHaveLength(9);
  });

  it("calls onChange with Date object when Day is clicked", async () => {
    const spy = jest.fn();
    render(<Month month={YearMonth.of(2021, 12)} onChange={spy} />);
    await userEvent.click(screen.getAllByRole("button")[0]);
    expect(spy).toHaveBeenCalledWith(LocalDate.of(2021, 11, 28));
  });

  it("handles mouseenter events correctly on Day", async () => {
    const spy = jest.fn();
    render(<Month month={YearMonth.of(2021, 12)} onDayMouseEnter={spy} />);
    await userEvent.hover(screen.getAllByRole("button")[0]);
    expect(spy).toHaveBeenCalledWith(
      LocalDate.of(2021, 11, 28),
      expect.anything()
    );
  });

  it("sets Day style based on dayStyle function", () => {
    render(
      <Month {...defaultProps} dayStyle={() => ({ background: "red" })} />
    );
    expect(screen.getAllByRole("button")[0]).toHaveStyle({ background: "red" });
  });

  it("sets Day className based on dayClassName function", () => {
    render(<Month {...defaultProps} dayClassName={() => "test-class"} />);
    expect(screen.getAllByRole("button")[0]).toHaveClass("test-class");
  });

  it("displays selected date", () => {
    render(
      <Month
        month={YearMonth.of(2021, 12)}
        value={LocalDate.of(2021, 12, 5)}
        firstDayOfWeek="monday"
      />
    );
    const days = screen.getAllByRole("button");
    expect(days[6]).toHaveAttribute("data-selected");
    expect(days[7]).not.toHaveAttribute("data-selected");
    expect(days[5]).not.toHaveAttribute("data-selected");
  });

  it("changes first day of week based on prop", () => {
    const { container: sunday } = render(
      <Month {...defaultProps} firstDayOfWeek="sunday" locale="en" />
    );
    const { container: monday } = render(
      <Month {...defaultProps} firstDayOfWeek="monday" locale="en" />
    );

    expect(
      sunday.querySelectorAll(".mantine-Month-weekdayCell")[0].textContent
    ).toBe("Su");
    expect(
      sunday.querySelectorAll(".mantine-Month-weekdayCell")[6].textContent
    ).toBe("Sa");

    expect(
      monday.querySelectorAll(".mantine-Month-weekdayCell")[0].textContent
    ).toBe("Mo");
    expect(
      monday.querySelectorAll(".mantine-Month-weekdayCell")[6].textContent
    ).toBe("Su");
  });

  it("does not render weekdays if hideWeekdays is true", () => {
    const { container: withWeekdays } = render(
      <Month {...defaultProps} hideWeekdays={false} />
    );
    const { container: withoutWeekdays } = render(
      <Month {...defaultProps} hideWeekdays />
    );
    expect(withWeekdays.querySelectorAll("thead")).toHaveLength(1);
    expect(withoutWeekdays.querySelectorAll("thead")).toHaveLength(0);
  });

  it("renders weekday names with given locale", () => {
    const { container: en } = render(<Month {...defaultProps} locale="en" />);

    expect(en.querySelector("th")?.textContent).toBe("Mo");
  });

  it("renders weekday labels with custom format in given locale", () => {
    const { container: en } = render(
      <Month {...defaultProps} weekdayLabelFormat="EEE" />
    );

    expect(en.querySelector("th")?.textContent).toBe("Mon");
  });
});
