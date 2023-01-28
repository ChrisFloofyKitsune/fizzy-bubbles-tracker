import React from "react";
import { DefaultProps } from "@mantine/core";
import { formatMonthLabel } from "./format-month-label/format-month-label";
import { isMonthInRange } from "../MonthPicker/is-month-in-range/is-month-in-range";
import {
  CalendarHeader,
  CalendarHeaderStylesNames,
} from "../CalendarHeader/CalendarHeader";
import {
  Month,
  MonthProps,
  DayKeydownPayload,
  MonthStylesNames,
} from "../../Month";
import { LocalDate, YearMonth } from "@js-joda/core";

export type MonthsListStylesNames =
  | CalendarHeaderStylesNames
  | MonthStylesNames;

export interface MonthsListProps
  extends DefaultProps<MonthsListStylesNames>,
    Omit<MonthProps, "styles" | "classNames" | "daysRefs" | "onDayKeyDown"> {
  amountOfMonths: number;
  paginateBy: number;
  month: YearMonth;
  locale: string;
  allowLevelChange: boolean;
  daysRefs: React.RefObject<HTMLButtonElement[][][]>;
  onMonthChange(month: YearMonth): void;
  onNextLevel(): void;
  onDayKeyDown(
    monthIndex: number,
    payload: DayKeydownPayload,
    event: React.KeyboardEvent<HTMLButtonElement>
  ): void;
  __staticSelector?: string;
  nextMonthLabel?: string;
  previousMonthLabel?: string;
  labelFormat?: string;
  weekdayLabelFormat?: string;
  renderDay?(date: LocalDate): React.ReactNode;
}

export function MonthsList({
  amountOfMonths,
  paginateBy,
  month,
  locale,
  minDate,
  maxDate,
  allowLevelChange,
  size,
  daysRefs,
  onMonthChange,
  onNextLevel,
  onDayKeyDown,
  classNames,
  styles,
  __staticSelector = "MonthsList",
  nextMonthLabel,
  previousMonthLabel,
  labelFormat,
  weekdayLabelFormat,
  preventFocus,
  renderDay,
  unstyled,
  __stopPropagation,
  ...others
}: MonthsListProps) {
  const nextMonth = month.plusMonths(amountOfMonths);
  const previousMonth = month.minusMonths(1);

  const months = Array(amountOfMonths)
    .fill(0)
    .map((_, index) => {
      const monthDate = month.plusMonths(index);
      return (
        <div key={index}>
          <CalendarHeader
            hasNext={
              index + 1 === amountOfMonths &&
              isMonthInRange({ month: nextMonth, minDate, maxDate })
            }
            hasPrevious={
              index === 0 &&
              isMonthInRange({ month: previousMonth, minDate, maxDate })
            }
            label={formatMonthLabel({
              month: monthDate,
              locale,
              format: labelFormat ?? "MMMM",
            })}
            onNext={() => onMonthChange(month.plusMonths(paginateBy))}
            onPrevious={() => onMonthChange(month.minusMonths(paginateBy))}
            onNextLevel={onNextLevel}
            nextLevelDisabled={!allowLevelChange}
            size={size}
            classNames={classNames}
            styles={styles}
            __staticSelector={__staticSelector}
            nextLabel={nextMonthLabel}
            previousLabel={previousMonthLabel}
            preventLevelFocus={index > 0}
            preventFocus={preventFocus}
            unstyled={unstyled}
            __stopPropagation={__stopPropagation}
          />

          <Month
            month={monthDate}
            daysRefs={daysRefs.current?.[index]}
            onDayKeyDown={(...args) => onDayKeyDown(index, ...args)}
            size={size}
            minDate={minDate}
            maxDate={maxDate}
            classNames={classNames}
            styles={styles}
            __staticSelector={__staticSelector}
            locale={locale}
            focusable={index === 0}
            preventFocus={preventFocus}
            renderDay={renderDay}
            weekdayLabelFormat={weekdayLabelFormat}
            unstyled={unstyled}
            __stopPropagation={__stopPropagation}
            {...others}
          />
        </div>
      );
    });

  return <>{months}</>;
}

MonthsList.displayName = "@mantine/dates/MonthsList";
