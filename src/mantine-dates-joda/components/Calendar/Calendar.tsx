import React from "react";
import { useComponentDefaultProps } from "@mantine/core";
import { CalendarBase, CalendarBaseProps } from "../CalendarBase/CalendarBase";
import { LocalDate } from "@js-joda/core";

export interface CalendarProps<Multiple extends boolean = false>
  extends Omit<
    CalendarBaseProps,
    | "value"
    | "onChange"
    | "isDateInRange"
    | "isDateFirstInRange"
    | "isDateLastInRange"
  > {
  multiple?: Multiple;
  value?: Multiple extends true ? LocalDate[] : LocalDate | null;
  onChange?(
    value: Multiple extends true ? LocalDate[] : LocalDate | null
  ): void;
}

const defaultProps: Partial<CalendarProps> = {
  __staticSelector: "Calendar",
};

export function Calendar<Multiple extends boolean = false>(
  props: CalendarProps<Multiple>
) {
  const {
    __staticSelector = "Calendar",
    multiple,
    value,
    onChange,
    ...others
  } = useComponentDefaultProps("Calendar", defaultProps, props as any);

  const handleChange = (date: LocalDate) => {
    if (!multiple) {
      return onChange(date);
    }

    const isSelected = value.some((val: LocalDate) => val.isEqual(date));
    return onChange(
      isSelected
        ? value.filter((val: LocalDate) => val.isEqual(date))
        : [...value, date]
    );
  };

  return (
    <CalendarBase
      __staticSelector={__staticSelector}
      onChange={handleChange}
      value={value}
      {...others}
    />
  );
}

Calendar.displayName = "@mantine/dates/Calendar";
