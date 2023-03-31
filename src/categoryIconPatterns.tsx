import {
  TbApple,
  TbBallon,
  TbCandy,
  TbCircleDotted,
  TbDiamond,
  TbDisc,
  TbKey,
  TbMedicineSyrup,
  TbPaw,
  TbPokeball,
  TbSoup,
  TbSwords,
  TbTriangleSquareCircle,
} from "react-icons/tb";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { ItemDefinition } from "~/orm/entities";
import { useMemo } from "react";
import { filterUnique } from "./util";
import { IconType } from "react-icons";

export const CategoryIconPatterns = {
  "^depleted$": TbCircleDotted,
  "^uncategorized$": HiOutlineQuestionMarkCircle,
  "key|unique": TbKey,
  ball: TbPokeball,
  medic: TbMedicineSyrup,
  held: TbBallon,
  "battle|combat": TbSwords,
  "stuffed animal|doll|plush": TbPaw,
  "ingredient|cook": TbSoup,
  berr: TbApple,
  "treasure|valuable": TbDiamond,
  "tm|tr|hm|move": TbDisc,
  item: TbCandy,
  ".": TbTriangleSquareCircle,
};

export function getIconForCategory(category: string) {
  return Object.entries(CategoryIconPatterns).find(
    (entry) => !!category.match(new RegExp(entry[0], "i"))
  )?.[1];
}

export function useItemCategoryMap(
  itemDefs?: ItemDefinition[]
): [categories: string[], categoryIcons: Record<string, IconType>] {
  itemDefs ||= [];

  const categories: string[] | null = useMemo(() => {
    if (!itemDefs || itemDefs.length === 0)
      return ["Depleted", "Uncategorized"];
    return itemDefs
      .filter((d) => !!d.category)
      .map((d) => d.category)
      .filter(filterUnique)
      .concat("Depleted", "Uncategorized") as string[];
  }, [itemDefs]);

  const categoryIcons: Record<string, IconType> = useMemo(() => {
    if (!categories) return {};

    const results = categories.map(getIconForCategory);

    return Object.assign({}, ...results);
  }, [categories]);

  return [categories, categoryIcons];
}
