import { NextPage } from "next";
import { Calendar, DatePicker, Month } from "~/mantine-dates-joda";
import { Stack } from "@mantine/core";
import { YearMonth, ZoneId } from "@js-joda/core";

const TestPage: NextPage = () => {
  return (
    <Stack>
      <div>
        <Calendar />
        <DatePicker />
        <Month month={YearMonth.now(ZoneId.UTC)} />
      </div>
    </Stack>
  );
};
// noinspection JSUnusedGlobalSymbols
export default TestPage;
