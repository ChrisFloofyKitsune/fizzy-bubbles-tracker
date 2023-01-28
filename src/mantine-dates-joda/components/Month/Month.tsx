import React, { useMemo, forwardRef } from "react";
import {
  DefaultProps,
  Text,
  Box,
  MantineSize,
  Selectors,
  useComponentDefaultProps,
} from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { FirstDayOfWeek } from "../../types";
import { getMonthDays, getWeekdaysNames } from "../../utils";
import { Day, DayStylesNames } from "./Day/Day";
import { getDayProps } from "./get-day-props/get-day-props";
import { DayKeydownPayload, DayModifiers } from "./types";
import useStyles from "./Month.styles";
import { LocalDate, YearMonth, ZoneId } from "@js-joda/core";

export interface MonthSettings {
  /** Adds className to day button based on date and modifiers */
  dayClassName?(date: LocalDate, modifiers: DayModifiers): string;

  /** Adds style to day button based on date and modifiers */
  dayStyle?(date: LocalDate, modifiers: DayModifiers): React.CSSProperties;

  /** When true dates that are outside of given month cannot be clicked or focused */
  disableOutsideEvents?: boolean;

  /** Minimum possible date */
  minDate?: LocalDate;

  /** Maximum possible date */
  maxDate?: LocalDate;

  /** Callback function to determine if day should be disabled */
  excludeDate?(date: LocalDate): boolean;

  /** Set to false to remove weekdays row */
  hideWeekdays?: boolean;

  /** Controls month days font-size and height */
  size?: MantineSize;

  /** Set to true to make calendar take 100% of container width */
  fullWidth?: boolean;

  /** Prevent focusing upon clicking */
  preventFocus?: boolean;

  /** Should focusable days have tabIndex={0}? */
  focusable?: boolean;

  /** Set first day of the week */
  firstDayOfWeek?: FirstDayOfWeek;

  /** Remove outside dates */
  hideOutsideDates?: boolean;

  /** Indices of weekend days */
  weekendDays?: number[];

  /** Should date be displayed as in range */
  isDateInRange?(date: LocalDate, modifiers: DayModifiers): boolean;

  /** Should date be displayed as first in range */
  isDateFirstInRange?(date: LocalDate, modifiers: DayModifiers): boolean;

  /** Should date be displayed as last in range */
  isDateLastInRange?(date: LocalDate, modifiers: DayModifiers): boolean;

  /** Internal: determines whether propagation in Modal and Drawer should be stopped, defaults to true */
  __stopPropagation?: boolean;
}

export type MonthStylesNames = Selectors<typeof useStyles> | DayStylesNames;

export interface MonthProps
  extends DefaultProps<MonthStylesNames>,
    MonthSettings,
    Omit<React.ComponentPropsWithoutRef<"table">, "onChange" | "value"> {
  /** Date at which month should be shown */
  month: YearMonth;

  /** Locale is used to get weekdays names with dayjs format */
  locale?: string;

  /** Selected date or an array of selected dates */
  value?: LocalDate | LocalDate[] | null;

  /** Selected range */
  range?: [LocalDate, LocalDate];

  /** Called when day is selected */
  onChange?(value: LocalDate): void;

  /** Static css selector base */
  __staticSelector?: string;

  /** Called when onMouseEnter event fired on day button */
  onDayMouseEnter?(date: LocalDate, event: React.MouseEvent): void;

  /** Get days buttons refs */
  daysRefs?: (HTMLButtonElement | null)[][];

  /** Called when keydown event is registered on day */
  onDayKeyDown?(
    payload: DayKeydownPayload,
    event: React.KeyboardEvent<HTMLButtonElement>
  ): void;

  /** Render day based on the date */
  renderDay?(date: LocalDate): React.ReactNode;

  /** dayjs label format for weekday heading */
  weekdayLabelFormat?: string;
}

const noop = () => false;

const defaultProps: Partial<MonthProps> = {
  disableOutsideEvents: false,
  hideWeekdays: false,
  __staticSelector: "Month",
  size: "sm",
  fullWidth: false,
  preventFocus: false,
  focusable: true,
  firstDayOfWeek: "sunday",
  hideOutsideDates: false,
  weekendDays: [6, 7],
  __stopPropagation: true,
};

export const Month = forwardRef<HTMLTableElement, MonthProps>((props, ref) => {
  const {
    className,
    month,
    value,
    onChange,
    disableOutsideEvents,
    locale,
    dayClassName,
    dayStyle,
    classNames,
    styles,
    minDate,
    maxDate,
    excludeDate,
    onDayMouseEnter,
    range,
    hideWeekdays,
    __staticSelector,
    size,
    fullWidth,
    preventFocus,
    focusable,
    firstDayOfWeek,
    onDayKeyDown,
    daysRefs,
    hideOutsideDates,
    isDateInRange = noop,
    isDateFirstInRange = noop,
    isDateLastInRange = noop,
    renderDay,
    weekdayLabelFormat,
    unstyled,
    weekendDays,
    __stopPropagation,
    ...others
  } = useComponentDefaultProps("Month", defaultProps, props);

  const { classes, cx, theme } = useStyles(
    { fullWidth: !!fullWidth },
    { classNames, styles, unstyled, name: __staticSelector! }
  );
  const finalLocale = locale || theme.datesLocale;
  const days = getMonthDays(month, firstDayOfWeek);

  const weekdays = getWeekdaysNames(
    finalLocale,
    firstDayOfWeek,
    weekdayLabelFormat
  ).map((weekday) => (
    <th className={classes.weekdayCell} key={weekday}>
      <Text size={size} className={classes.weekday}>
        {weekday.length >= 2 ? upperFirst(weekday) : weekday}
      </Text>
    </th>
  ));

  const hasValue = Array.isArray(value)
    ? value.every((item: any) => item instanceof LocalDate)
    : value instanceof LocalDate;

  const hasValueInMonthRange =
    value instanceof LocalDate &&
    value.compareTo(month.atDay(1)) >= 0 &&
    value.compareTo(month.atEndOfMonth()) <= 0;

  const firstIncludedDay = useMemo(
    () =>
      days
        .flatMap((_) => _)
        .find((date) => {
          const dayProps = getDayProps({
            date,
            month,
            hasValue,
            minDate,
            maxDate,
            value,
            excludeDate,
            disableOutsideEvents,
            range,
            weekendDays,
          });

          return !dayProps.disabled && !dayProps.outside;
        }) || YearMonth.now(ZoneId.UTC).atDay(1),
    []
  );

  const rows = days.map((row, rowIndex) => {
    const cells = row.map((date, cellIndex) => {
      const dayProps = getDayProps({
        date,
        month,
        hasValue,
        minDate,
        maxDate,
        value,
        excludeDate,
        disableOutsideEvents,
        range,
        weekendDays,
      });

      const onKeyDownPayload = { rowIndex, cellIndex, date };

      return (
        <td className={classes.cell} key={cellIndex}>
          <Day
            unstyled={unstyled}
            ref={(button) => {
              if (daysRefs) {
                if (!Array.isArray(daysRefs[rowIndex])) {
                  // eslint-disable-next-line no-param-reassign
                  daysRefs[rowIndex] = [];
                }

                // eslint-disable-next-line no-param-reassign
                daysRefs[rowIndex][cellIndex] = button;
              }
            }}
            onClick={() => typeof onChange === "function" && onChange(date)}
            onMouseDown={(event) => preventFocus && event.preventDefault()}
            value={date}
            outside={dayProps.outside}
            weekend={dayProps.weekend}
            inRange={dayProps.inRange || isDateInRange(date, dayProps)}
            firstInRange={
              dayProps.firstInRange || isDateFirstInRange(date, dayProps)
            }
            lastInRange={
              dayProps.lastInRange || isDateLastInRange(date, dayProps)
            }
            firstInMonth={date.isEqual(firstIncludedDay)}
            selected={dayProps.selected || dayProps.selectedInRange}
            hasValue={hasValueInMonthRange}
            onKeyDown={(event) =>
              typeof onDayKeyDown === "function" &&
              onDayKeyDown(onKeyDownPayload, event)
            }
            className={
              typeof dayClassName === "function"
                ? dayClassName(date, dayProps)
                : undefined
            }
            style={
              typeof dayStyle === "function"
                ? dayStyle(date, dayProps)
                : undefined
            }
            disabled={dayProps.disabled}
            onMouseEnter={
              typeof onDayMouseEnter === "function" ? onDayMouseEnter : noop
            }
            size={size!}
            fullWidth={!!fullWidth}
            focusable={focusable}
            hideOutsideDates={hideOutsideDates}
            __staticSelector={__staticSelector}
            styles={styles}
            classNames={classNames}
            renderDay={renderDay}
            stopPropagation={__stopPropagation}
          />
        </td>
      );
    });

    return <tr key={rowIndex}>{cells}</tr>;
  });

  return (
    <Box
      component="table"
      className={cx(classes.month, className)}
      ref={ref}
      {...others}
    >
      {!hideWeekdays && (
        <thead>
          <tr>{weekdays}</tr>
        </thead>
      )}
      <tbody>{rows}</tbody>
    </Box>
  );
});

Month.displayName = "@mantine/dates/Month";
