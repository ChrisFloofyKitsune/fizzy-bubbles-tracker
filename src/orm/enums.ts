import { SelectItem } from "@mantine/core";

export enum PokemonGenderOptions {
  MALE = "Male",
  FEMALE = "Female",
  GENDERLESS = "Genderless",
  UNDECIDED = "",
}

export enum PokemonContestStat {
  ALL = "all",
  CUTE = "cute",
  BEAUTIFUL = "beautiful",
  TOUGH = "tough",
  CLEVER = "clever",
  COOL = "cool",
}

export enum PokemonMoveSourceCategory {
  EGG = "egg",
  MACHINE = "machine",
  TUTOR = "tutor",
  OTHER = "other",
}

export enum CurrencyType {
  POKE_DOLLAR = "pokedollar",
  WATTS = "watts",
  RARE_CANDY = "rarecandy",
}

export const CurrencyTypeDisplayName = {
  [CurrencyType.POKE_DOLLAR]: ["Pokédollar", "Pokédollars"],
  [CurrencyType.RARE_CANDY]: ["Rare Candy", "Rare Candies"],
  [CurrencyType.WATTS]: ["Watt", "Watts"],
} as {
  [value in CurrencyType]: [singular: string, plural: string];
};

export const CurrencyTypeSelectItems: SelectItem[] = [
  {
    label: CurrencyTypeDisplayName[CurrencyType.POKE_DOLLAR][1],
    value: CurrencyType.POKE_DOLLAR,
  },
  {
    label: CurrencyTypeDisplayName[CurrencyType.RARE_CANDY][1],
    value: CurrencyType.RARE_CANDY,
  },
  {
    label: CurrencyTypeDisplayName[CurrencyType.WATTS][1],
    value: CurrencyType.WATTS,
  },
];
