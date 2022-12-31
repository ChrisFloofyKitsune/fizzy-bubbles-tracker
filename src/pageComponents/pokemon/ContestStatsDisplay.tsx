import { Pokemon } from "~/orm/entities";
import { SimpleGrid, Text } from "@mantine/core";
import { PokemonContestStat } from "~/orm/enums";

export function ContestStatsDisplay({
  pokemon,
}: {
  pokemon: Pokemon | undefined;
}) {
  return (
    <SimpleGrid cols={5}>
      <Text>
        <span>
          {`Cute: `}
          {pokemon?.compileContestStat(PokemonContestStat.CUTE).total}
        </span>
      </Text>
      <Text>
        <span>
          {`Beautiful: `}
          {pokemon?.compileContestStat(PokemonContestStat.BEAUTIFUL).total}
        </span>
      </Text>
      <Text>
        <span>
          {`Tough: `}
          {pokemon?.compileContestStat(PokemonContestStat.TOUGH).total}
        </span>
      </Text>
      <Text>
        <span>
          {`Smart: `}
          {pokemon?.compileContestStat(PokemonContestStat.CLEVER).total}
        </span>
      </Text>
      <Text>
        <span>
          {`Cool: `}
          {pokemon?.compileContestStat(PokemonContestStat.COOL).total}
        </span>
      </Text>
    </SimpleGrid>
  );
}
