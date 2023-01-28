import { Dayjs } from "dayjs";
import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text } from "@mantine/core";
import { UTCDatePicker } from "~/components/input/UTCDatePicker";
import { toUTCDate, toUTCDayjs } from "~/toUTCDate";

export function createDayjsPropConfig<T extends {}, P extends keyof T>(
  prop: P,
  headerLabel: string,
  order?: number
): PropConfigEntry<T, P> {
  return {
    headerLabel,
    order,
    viewComponent: (value: any) => (
      <Text
        key={"date-prop-view"}
        sx={{
          height: "2em",
          minWidth: "7em",
          paddingTop: "0.1em",
        }}
        align="center"
      >
        {(value as Dayjs).format("DD-MMM-YYYY")}
      </Text>
    ),
    editorComponent: (value: any, onChange: (value: any) => Promise<void>) => {
      return (
        <UTCDatePicker
          key={"date-prop-edit"}
          value={toUTCDate(value as Dayjs)}
          onChange={async (date) => await onChange(toUTCDayjs(date))}
          variant="unstyled"
          clearable={false}
          inputFormat="DD-MMM-YYYY"
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
