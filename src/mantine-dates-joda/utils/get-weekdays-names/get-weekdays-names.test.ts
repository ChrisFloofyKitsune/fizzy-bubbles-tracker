import { getWeekdaysNames } from "./get-weekdays-names";

describe("@mantine/dates/get-weekdays-names", () => {
  it("returns correct weekday names for given locale", () => {
    expect(getWeekdaysNames("en", "monday")).toStrictEqual([
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa",
      "Su",
    ]);

    expect(getWeekdaysNames("en")).toStrictEqual([
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa",
    ]);
  });
});
