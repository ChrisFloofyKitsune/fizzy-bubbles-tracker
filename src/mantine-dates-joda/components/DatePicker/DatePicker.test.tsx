import React from "react";
import { render, screen } from "@testing-library/react";
import {
  checkAccessibility,
  itSupportsSystemProps,
  itSupportsInputProps,
  itSupportsFocusEvents,
} from "../../@mantine-tests";
import { DatePicker, DatePickerProps } from "./DatePicker";
import { LocalDate } from "@js-joda/core";

const defaultProps: DatePickerProps = {};

describe("@mantine/dates/DatePicker", () => {
  itSupportsInputProps(DatePicker, defaultProps, "DatePicker");
  itSupportsFocusEvents(DatePicker, defaultProps, "input");
  checkAccessibility([<DatePicker label="date picker" key={1} />]);
  itSupportsSystemProps({
    component: DatePicker,
    props: defaultProps,
    displayName: "@mantine/dates/DatePicker",
    refType: HTMLInputElement,
    excludeOthers: true,
  });

  it("sets label on DatePickerBase based on inputFormat prop", () => {
    render(
      <DatePicker value={LocalDate.of(2021, 7, 13)} inputFormat="MM/YY" />
    );
    expect(screen.getByRole("textbox")).toHaveValue("07/21");
  });
});
