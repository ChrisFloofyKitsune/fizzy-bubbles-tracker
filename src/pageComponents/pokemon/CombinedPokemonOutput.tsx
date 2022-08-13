import { Pokemon, Trainer } from "~/orm/entities";
import { usePokemonBBCodeTemplate } from "~/usePokemonBBCodeTemplate";
import { useListState } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import { sha1 } from "object-hash";
import { Select, SelectItem } from "@mantine/core";
import { BBCodeArea } from "~/components";

export interface CombinedPokemonOutputProps {
  pokemonList: Pokemon[];
  trainerOptions: Pick<Trainer, "uuid" | "name">[];
}
export function CombinedPokemonOutput({
  pokemonList,
  trainerOptions,
}: CombinedPokemonOutputProps) {
  const applyPokemonTemplate = usePokemonBBCodeTemplate();

  const [profiles, profilesHandler] = useListState<{
    pokemonId: string;
    trainerId: string | null;
    bbcode: string;
    pokemonHash: string;
  }>([]);

  useEffect(
    () =>
      profilesHandler.setState((prevState) => {
        const newState: typeof profiles = [];
        for (const pkm of pokemonList) {
          const pokemonId = pkm.uuid;
          const trainerId = pkm.trainerId;
          const pokemonHash = sha1(pkm);
          const existing = prevState.find(
            (entry) => entry.pokemonId === pokemonId
          );
          if (!existing || existing.pokemonHash !== pokemonHash) {
            newState.push({
              pokemonId,
              trainerId,
              bbcode: applyPokemonTemplate(pkm),
              pokemonHash,
            });
          } else {
            newState.push({
              ...existing,
              bbcode: existing.bbcode || applyPokemonTemplate(pkm),
            });
          }
        }

        return newState;
      }),
    [applyPokemonTemplate, pokemonList]
  );

  const trainerSelectOptions: SelectItem[] = useMemo(
    () =>
      [
        { label: "(All)", value: "(All)" },
        { label: "(Unassigned)", value: "(Unassigned)" },
      ].concat(trainerOptions.map((t) => ({ label: t.name, value: t.uuid }))),
    [trainerOptions]
  );

  const [selectOpt, setSelectOpt] = useState<string | null>("(All)");

  const filteredProfilesBBCode: string = useMemo(() => {
    let filteredProfiles: typeof profiles;

    switch (selectOpt) {
      case "(All)":
        filteredProfiles = profiles;
        break;
      case "(Unassigned)":
        filteredProfiles = profiles.filter((p) => p.trainerId === null);
        break;
      default:
        filteredProfiles = profiles.filter((p) => p.trainerId === selectOpt);
        break;
    }

    return filteredProfiles.map((p) => p.bbcode).join("\n\n") || "No Profiles";
  }, [selectOpt, profiles]);

  return (
    <>
      {trainerSelectOptions.length > 2 && (
        <Select
          label="Select Owning Trainer"
          data={trainerSelectOptions}
          value={selectOpt}
          onChange={setSelectOpt}
        />
      )}
      <BBCodeArea
        bbCode={filteredProfilesBBCode}
        label={"Combined Pokemon Output"}
      />
    </>
  );
}
