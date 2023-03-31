import { MoveLog } from "~/orm/entities";
import { Stack, Text } from "@mantine/core";

export function MovesTextStack({ moves }: { moves: MoveLog[] | undefined }) {
  return (
    <Stack spacing={0}>
      {moves?.map((l) => <Text key={l.move}>{l.move}</Text>) ?? ""}
    </Stack>
  );
}
