import dayjs, { Dayjs } from "dayjs";
import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";

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
    editorComponent: (value: any, onChange: (value: any) => Promise<void>) => (
      <DatePicker
        key={"date-prop-edit"}
        value={(value as Dayjs).toDate()}
        onChange={async (date) => {
          await onChange(dayjs(date).utc(false));
        }}
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
    ),
  };
}
