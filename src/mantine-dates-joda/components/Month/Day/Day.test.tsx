import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  checkAccessibility,
  itSupportsClassName,
  itSupportsRef,
  itSupportsStyle,
  itSupportsOthers,
} from "../../../@mantine-tests";
import { Day, DayProps } from "./Day";
import { LocalDate, ZoneId } from "@js-joda/core";

const defaultProps: DayProps = {
  value: LocalDate.now(ZoneId.UTC),
  selected: true,
  outside: false,
  weekend: false,
  disabled: false,
  hasValue: true,
  firstInRange: false,
  lastInRange: false,
  inRange: false,
  fullWidth: false,
  firstInMonth: false,
  size: "sm" as const,
  onKeyDown: () => {},
  onMouseEnter: () => {},
};

describe("@mantine/core/Month/Day", () => {
  checkAccessibility([<Day {...defaultProps} key={1} />]);
  itSupportsClassName(Day, defaultProps);
  itSupportsStyle(Day, defaultProps);
  itSupportsOthers(Day, defaultProps);
  itSupportsRef(Day, defaultProps, HTMLButtonElement);

  it("calls onMouseEnter with date and event", () => {
    const spy = jest.fn();
    render(<Day {...defaultProps} onMouseEnter={spy} />);
    userEvent.hover(screen.getByRole("button")).then(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(defaultProps.value, expect.anything());
    });
  });

  it("sets data-mantine-stop-propagation attribute if stopPropagation prop is true", () => {
    render(<Day {...defaultProps} stopPropagation />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-mantine-stop-propagation",
      "true"
    );
  });

  it("render correct label with given date value", () => {
    render(<Day {...defaultProps} />);
    expect(screen.getByRole("button").textContent).toBe(
      defaultProps.value.dayOfMonth().toString()
    );
  });

  it("has correct displayName", () => {
    expect(Day.displayName).toStrictEqual("@mantine/core/Day");
  });

  it("renders correctly with a renderDay function", () => {
    const renderDay = (date: LocalDate) => (
      <div>
        <span>{date.dayOfMonth()}</span>
        <span>Rendered custom day</span>
      </div>
    );
    render(<Day {...defaultProps} renderDay={renderDay} />);

    const today = LocalDate.now(ZoneId.UTC).dayOfMonth();
    expect(screen.getByText(today)).toBeInTheDocument();
    expect(screen.getByText("Rendered custom day")).toBeInTheDocument();
  });
});
