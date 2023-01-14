import { useEffect, useState } from "react";
import { Title, Text } from "@mantine/core";
import dayjs from "dayjs";

export const UtcClock = () => {
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedTime(dayjs().format("DD-MMM-YYYY, HH:mm"));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
