import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text } from "@mantine/core";
import { LocalDate, ZoneId } from "@js-joda/core";
import { LocalDateFormatter } from "~/util";
import { DatePicker } from "~/mantine-dates-joda";

export function createLocalDatePropConfig<T extends {}, P extends keyof T>(
  prop: P,
  headerLabel: string,
  order?: number
): PropConfigEntry<T, P, LocalDate> {
  return {
    headerLabel,
    order,
    viewComponent: (value: LocalDate) => (
      <Text
        key={"date-prop-view"}
        sx={{
          height: "2em",
          minWidth: "7em",
          paddingTop: "0.1em",
        }}
        align="center"
      >
        {value.format(LocalDateFormatter)}
      </Text>
    ),
    editorComponent: (
      value: LocalDate,
      onChange: (value: LocalDate) => Promise<void>
    ) => {
      return (
        <DatePicker
          key={"date-prop-edit"}
          value={value}
          onChange={async (date) =>
            await onChange(date ?? LocalDate.now(ZoneId.UTC))
          }
          variant="unstyled"
          clearable={false}
          inputFormat="dd-MMM-yyyy"
          firstDayOfWeek="sunday"
          sx={(theme) => ({
            boxShadow: "inset 0px 0px 1px 1px" + theme.colors.gray[7],
            borderRadius: "0.25em",
            paddingLeft: "0.5em",
            minWidth: "7em",
            ".mantine-DatePicker-input": {
              height: "2em",
            },
          })}
          withinPortal
        />
      );
    },
  };
}
