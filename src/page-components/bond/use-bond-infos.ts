import { useCallback, useRef } from "react";
import { BondPokemonInfo } from "~/page-components/bond/bond-pokemon-info";
import { BondLog, BondStylingConfig, Pokemon } from "~/orm/entities";

export function useBondInfos(
  pokemonList: Pick<Pokemon, "uuid" | "name" | "species">[],
  bondConfigs: BondStylingConfig[],
  bondLogs: BondLog[]
): [
  BondPokemonInfo[],
  (newBondConfig: BondStylingConfig) => void,
  (pokemonUuid: string, bondLogs: BondLog[]) => void
] {
  const savedBondInfos = useRef<BondPokemonInfo[]>([]);

  if (savedBondInfos.current.length === 0) {
    savedBondInfos.current = pokemonList.map(
      (p) =>
        new BondPokemonInfo(
          p,
          bondConfigs.find((c) => c.pokemonUuid === p.uuid)!,
          bondLogs.filter((l) => l.pokemonUuid === p.uuid)
        )
    );
  }

  const updateBondConfig = useCallback((newBondConfig: BondStylingConfig) => {
    const info = savedBondInfos.current.find(
      (info) => info.pokemon.uuid === newBondConfig.pokemonUuid
    );
    if (info) {
      info.bondStylingConfig = newBondConfig;
      savedBondInfos.current = Array.from(savedBondInfos.current);
    } else {
      console.error(
        "Missing pokemon bond info when trying to update Bond Config somehow"
      );
    }
  }, []);

  const updateBondLogsForPokemon = useCallback(
    (pokemonUuid: string, bondLogs: BondLog[]) => {
      const info = savedBondInfos.current.find(
        (info) => info.pokemon.uuid === pokemonUuid
      )!;
      if (info) {
        info.updateBondLogs(bondLogs);
        savedBondInfos.current = Array.from(savedBondInfos.current);
      } else {
        console.error(
          "Missing pokemon bond info when trying to update Bond Logs somehow"
        );
      }
    },
    []
  );

  return [savedBondInfos.current, updateBondConfig, updateBondLogsForPokemon];
}
