import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { checkAccessibility } from "../../../@mantine-tests";
import { MonthsList, MonthsListProps } from "./MonthsList";
import { YearMonth } from "@js-joda/core";

const defaultProps: MonthsListProps = {
  amountOfMonths: 1,
  paginateBy: 1,
  month: YearMonth.of(2021, 12),
  locale: "en",
  allowLevelChange: true,
  daysRefs: { current: [[]] } as any,
  onMonthChange: () => {},
  onNextLevel: () => {},
  onDayKeyDown: () => {},
  nextMonthLabel: "test-next-month",
  previousMonthLabel: "test-previous-month",
};

describe("@mantine/dates/MonthsList", () => {
  checkAccessibility([
    <MonthsList {...defaultProps} amountOfMonths={1} key={1} />,
    <MonthsList {...defaultProps} amountOfMonths={2} key={2} />,
    <MonthsList {...defaultProps} amountOfMonths={3} key={3} />,
  ]);

  it("calls onNextLevel when level label is clicked", async () => {
    const spy = jest.fn();
    const { container } = render(
      <MonthsList {...defaultProps} onNextLevel={spy} />
    );
    await userEvent.click(
      container.querySelector(".mantine-MonthsList-calendarHeaderLevel")!
    );
    expect(spy).toHaveBeenCalled();
  });

  it("sets CalendarHeader label based on current selected month and labelFormat", () => {
    render(
      <MonthsList
        {...defaultProps}
        month={YearMonth.of(2021, 12)}
        labelFormat="MMMM YYYY"
      />
    );
    expect(screen.getByText("December 2021")).toBeInTheDocument();
  });

  it("calls onMonthChange when next/previous buttons are clicked", async () => {
    const spy = jest.fn();
    render(
      <MonthsList
        {...defaultProps}
        month={YearMonth.of(2021, 12)}
        onMonthChange={spy}
      />
    );
    const nextControl = screen.getByLabelText("test-next-month");
    const previousControl = screen.getByLabelText("test-previous-month");
    await userEvent.click(nextControl);
    expect(spy).toHaveBeenLastCalledWith(YearMonth.of(2022, 1));
    await userEvent.click(previousControl);
    expect(spy).toHaveBeenLastCalledWith(YearMonth.of(2021, 11));
  });

  it("renders correct amount of months", () => {
    const { container: two } = render(
      <MonthsList {...defaultProps} amountOfMonths={2} />
    );
    const { container: three } = render(
      <MonthsList {...defaultProps} amountOfMonths={3} />
    );
    const { container: four } = render(
      <MonthsList {...defaultProps} amountOfMonths={4} />
    );

    expect(two.querySelectorAll(".mantine-MonthsList-month")).toHaveLength(2);
    expect(three.querySelectorAll(".mantine-MonthsList-month")).toHaveLength(3);
    expect(four.querySelectorAll(".mantine-MonthsList-month")).toHaveLength(4);
  });

  it("has correct displayName", () => {
    expect(MonthsList.displayName).toStrictEqual("@mantine/dates/MonthsList");
  });
});
