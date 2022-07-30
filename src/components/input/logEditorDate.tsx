import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { PropToEditorComponentPair } from "~/components/input/logEditor";
import { ShopTrackedChangeLog } from "~/orm/entities";
import { Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
dayjs.extend(utc);

export const DatePropEditor: PropToEditorComponentPair<
  ShopTrackedChangeLog,
  "date"
> = {
  prop: "date",
  toComponent: (log, isEditMode, onChange) => {
    const date = log.date;
    if (!isEditMode) {
      return (
        <Text
          sx={{
            height: "2em",
            width: "6.5em",
            paddingTop: "0.1em",
          }}
          align="center"
        >
          {date.format("DD-MM-YYYY")}
        </Text>
      );
    } else {
      return (
        <DatePicker
          value={date.toDate()}
          onChange={async (date) => {
            await onChange(dayjs(date).utc(false));
          }}
          variant="unstyled"
          clearable={false}
          inputFormat="DD-MM-YYYY"
          firstDayOfWeek="sunday"
          sx={(theme) => ({
            boxShadow: "inset 0px 0px 1px 1px" + theme.colors.gray[7],
            borderRadius: "0.25em",
            paddingLeft: "0.5em",
            width: "6.5em",
            ".mantine-DatePicker-input": {
              height: "2em",
            },
          })}
        />
      );
    }
  },
};
