import { getMonthsNames } from "./get-months-names";

describe("@mantine/dates/get-months-names", () => {
  it("returns months names with given locale and format", () => {
    expect(getMonthsNames("en", "MMMM")).toStrictEqual([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]);

    expect(getMonthsNames("en")).toStrictEqual([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]);
  });
});
