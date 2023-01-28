import { useCallback, useEffect, useState } from "react";
import { Title, Text } from "@mantine/core";
import {
  ChronoField,
  DateTimeFormatter,
  LocalDateTime,
  ZoneId,
} from "@js-joda/core";
import { Locale } from "@js-joda/locale_en-us";

const formatter = DateTimeFormatter.ofPattern("dd-MMM-YYYY, HH:mm").withLocale(
  Locale.ENGLISH
);
export const UtcClock = () => {
  const [formattedTime, setFormattedTime] = useState("");

  const updateClock = useCallback(() => {
    const newTime = LocalDateTime.now(ZoneId.UTC);
    setFormattedTime(newTime.format(formatter));

    const newTimeoutMillis =
      60000 -
      newTime.second() * 1000 -
      newTime.get(ChronoField.MILLI_OF_SECOND);
    setTimeout(updateClock, newTimeoutMillis);
  }, []);

  useEffect(() => {
    updateClock();
  }, [updateClock]);

  return (
    <Title order={6} align="center">
      <Text>Current UTC Time</Text>
      <Text
        sx={{ border: "solid white 1px", borderRadius: "1em" }}
        py={2}
        px={8}
      >
        {formattedTime}
      </Text>
    </Title>
  );
};
