import { NextPage } from "next";
import { Calendar, DatePicker, Month } from "~/mantine-dates-joda";
import { YearMonth, ZoneId } from "@js-joda/core";

const TestPage: NextPage = () => {
  return (
    <>
      <Calendar />
      <DatePicker />
      <Month month={YearMonth.now(ZoneId.UTC)} />
    </>
  );
};
// noinspection JSUnusedGlobalSymbols
export default TestPage;
