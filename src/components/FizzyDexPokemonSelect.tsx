import { Group, Select, SelectItem } from "@mantine/core";
import { Pokemon, Form } from "fizzydex.js";
import { useFizzyDex } from "~/services/FizzyDexService";
import { useEffect, useMemo, useState } from "react";

export interface FizzyDexPokemonSelectProps {
  pokemonSelection?: Pokemon | string | null;
  formSelection?: Form | string | null;
  onPokemonSelect?: (pokemon: Pokemon | null) => any;
  onFormSelect?: (form: Form | null) => any;
  clearable?: boolean;
}
export function FizzyDexPokemonSelect({
  pokemonSelection,
  formSelection,
  onPokemonSelect,
  onFormSelect,
  clearable = false,
}: FizzyDexPokemonSelectProps) {
  const fizzyDex = useFizzyDex();

  const [selectedPokemonName, setSelectedPokemonName] = useState<string | null>(
    null
  );
  const [selectedPokemonForm, setSelectedPokemonForm] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (pokemonSelection) {
      setSelectedPokemonName(
        typeof pokemonSelection === "string"
          ? pokemonSelection
          : pokemonSelection.Name
      );
    }
  }, [pokemonSelection]);

  useEffect(() => {
    if (formSelection) {
      setSelectedPokemonForm(
        typeof formSelection === "string"
          ? formSelection
          : formSelection.FormName
      );
    }
  }, [formSelection]);

  const pokemon = useMemo(() => {
    if (fizzyDex && selectedPokemonName) {
      return fizzyDex.GetPokemon(selectedPokemonName);
    } else {
      return null;
    }
  }, [fizzyDex, selectedPokemonName]);

  const pokemonNameList: SelectItem[] = useMemo(() => {
    if (fizzyDex) {
      return (
        fizzyDex.Data.PokemonList?.map((pkm) => ({
          label: `${pkm.Name} #${pkm.DexNum}`,
          value: pkm.Name,
        })) ?? []
      );
    } else {
      return [];
    }
  }, [fizzyDex]);

  const formNameList: string[] = useMemo(() => {
    if (fizzyDex && selectedPokemonName) {
      return fizzyDex
        .GetPokemon(selectedPokemonName)
        .Forms.map((f) => f.FormName);
    } else {
      return [];
    }
  }, [fizzyDex, selectedPokemonName]);

  useEffect(() => {
    if (!fizzyDex) {
      return;
    }

    if (selectedPokemonForm && !formNameList.includes(selectedPokemonForm)) {
      if (formNameList.length > 0) {
        setSelectedPokemonForm(formNameList[0]);
      } else {
        setSelectedPokemonForm(null);
      }
    }
  }, [fizzyDex, formNameList, selectedPokemonForm]);

  useEffect(() => {
    onPokemonSelect?.(pokemon);
  }, [onPokemonSelect, pokemon]);

  const pokemonForm = useMemo(() => {
    if (pokemon) {
      return pokemon.GetForm(selectedPokemonForm);
    } else {
      return null;
    }
  }, [pokemon, selectedPokemonForm]);

  useEffect(() => {
    onFormSelect?.(pokemonForm ?? null);
  }, [onFormSelect, pokemonForm]);

  return (
    <Group>
      <Select
        label="Select Pokemon"
        placeholder="Search"
        data={pokemonNameList}
        value={selectedPokemonName}
        onChange={setSelectedPokemonName}
        clearable={clearable}
        searchable
      />
      <Select
        label="Select Form"
        placeholder="No Pokemon Selected"
        data={formNameList}
        value={selectedPokemonForm}
        onChange={setSelectedPokemonForm}
        searchable
      />
    </Group>
  );
}
