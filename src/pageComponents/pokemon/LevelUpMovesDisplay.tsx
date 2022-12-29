import { Pokemon } from "~/orm/entities";
import { useMemo } from "react";
import { Group, Stack, Text } from "@mantine/core";

export function LevelUpMovesDisplay({ pokemon }: { pokemon: Pokemon }) {
  const level = useMemo(
    () =>
      pokemon.levelLogs.reduce((prev, curr) => Math.max(prev, curr.value), 1),
    [pokemon]
  );

  if (!pokemon.levelUpMoves) {
    return <></>;
  }

  return (
    <Stack spacing={0}>
      {pokemon.levelUpMoves.map((m, i) => {
        const levelNum = parseInt(m.level);
        const learned = isNaN(levelNum) || levelNum <= level;

        return (
          <Group key={`${i}-${m.move}`} position="apart" noWrap>
            <Text underline={learned} key={`${i}-${m.move}-name`}>
              {m.move}
            </Text>
            <Text key={`${i}-${m.move}-level`}>{`${
              m.level === "evolve" ? "Evolve" : m.level
            }`}</Text>
          </Group>
        );
      })}
    </Stack>
  );
}
