import FizzyDex, { Form, Pokemon } from "fizzydex.js";
import { createContext, ReactNode, useContext, useRef, useState } from "react";
import { useAsyncEffect } from "use-async-effect";
import { LevelUpMove, Pokemon as PokemonEntity } from "~/orm/entities";

const FizzyDexContext = createContext<typeof FizzyDex | null>(null);

export class FizzyDexService {
  public static FizzyDex: typeof FizzyDex | null;

  private constructor() {}

  public static async initialize() {
    if (this.FizzyDex) return;

    console.log("Downloading FizzyDex data files...");
    await Promise.all([
      FizzyDex.DownloadPokemonInfoList(
        "https://fizzydex.s3.us-west-1.amazonaws.com/pokemonList.json"
      ),
      FizzyDex.DownloadPokemonMoveList(
        "https://fizzydex.s3.us-west-1.amazonaws.com/pokemonMoveList.json"
      ),
      FizzyDex.DownloadMoveDex(
        "https://fizzydex.s3.us-west-1.amazonaws.com/moveDex.json"
      ),
      FizzyDex.DownloadAbilityDex(
        "https://fizzydex.s3.us-west-1.amazonaws.com/abilityDex.json"
      ),
    ]);
    console.log("FizzyDex data download complete!");
    console.log(
      `Loaded ${FizzyDex.Data.PokemonList?.length} Pokemon
       ${FizzyDex.Data.PokemonMoveList?.length} Move Lists
       ${FizzyDex.Data.MoveDex?.length} Moves
       ${FizzyDex.Data.AbilityDex?.length} Abilities`
    );
    this.FizzyDex = FizzyDex;
  }
}

export function FizzyDexProvider({
  children,
}: {
  children: ReactNode[] | ReactNode;
}) {
  const startedInit = useRef(false);
  const [fizzyDex, setFizzyDex] = useState<typeof FizzyDex | null>(null);
  useAsyncEffect(async () => {
    if (!!FizzyDexService.FizzyDex) {
      setFizzyDex(FizzyDexService.FizzyDex);
    } else if (!startedInit.current) {
      startedInit.current = true;
      await FizzyDexService.initialize();
      setFizzyDex(FizzyDexService.FizzyDex);
    }
  }, []);

  return (
    <FizzyDexContext.Provider value={fizzyDex}>
      {children}
    </FizzyDexContext.Provider>
  );
}

export function useFizzyDex() {
  return useContext(FizzyDexContext);
}

export function dexMoveLevelToString(level: number): LevelUpMove["level"] {
  if (level === 0) {
    return "evolve";
  } else if (level === 1) {
    return "-";
  } else {
    return level.toString(10) as `${number}`;
  }
}

export function formatFormName(form?: Form) {
  let result = form?.Pokemon.Name ?? "";

  if (form && form.Pokemon.DefaultFormName !== form.FormName) {
    if (form.FormName.match(/Fizzytopian|Alolan|Galarian|Hisuian|Paldean/)) {
      result = `${form.FormName} ${result}`;
    } else {
      result = `${result} (${form.FormName})`;
    }
  }

  return result;
}

export function FindFizzyDexPokemon(
  pokemonInfo: Pick<PokemonEntity, "dexNum" | "species">
): { pokemon: Pokemon; form: Form } | null {
  if (!FizzyDexService.FizzyDex || !pokemonInfo?.dexNum) {
    return null;
  }
  const fizzyDexPokemon = FizzyDexService.FizzyDex.GetPokemon(
    pokemonInfo.dexNum
  );
  const speciesEntry = pokemonInfo.species?.toLowerCase();
  const fizzyDexForm = !speciesEntry
    ? null
    : fizzyDexPokemon.Forms.find((f) =>
        speciesEntry?.includes(f.FormName.toLowerCase())
      );
  return {
    pokemon: fizzyDexPokemon,
    form: fizzyDexForm ?? fizzyDexPokemon.GetForm()!,
  };
}
