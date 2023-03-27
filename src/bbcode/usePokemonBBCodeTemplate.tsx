import { useMultipleSettingValues } from "~/services";
import { SettingEnum } from "~/settingEnum";
import { useBBCodeTemplate } from "~/components/useBBCodeTemplate";
import { useCallback } from "react";
import { BBCodeReplacementConfig, Pokemon } from "~/orm/entities";

export function usePokemonBBCodeTemplate(
  templateConfigs?: BBCodeReplacementConfig[]
) {
  const applyBBCodeTemplate = useBBCodeTemplate("Pokemon", templateConfigs);

  const settings = useMultipleSettingValues(
    SettingEnum.PokemonFormatTextColor,
    SettingEnum.PokemonFormatAlign,
    SettingEnum.PokemonFormatIncludeUnlearnedLevelUpMoves,
    SettingEnum.PokemonFormatTextFont,
    SettingEnum.PokemonFormatTextSize
  );

  return useCallback(
    (pokemon?: Pokemon) => {
      if (!pokemon) return "";
      let result = applyBBCodeTemplate(pokemon, {
        textSize: settings.PokemonFormatTextSize,
        includeUnlearnedMoves:
          settings.PokemonFormatIncludeUnlearnedLevelUpMoves,
      });

      if (result) {
        function wrapWith(tag: string, value?: any) {
          result = `[${tag.toUpperCase()}${
            value ? `=${value}` : ""
          }]${result}[/${tag.toUpperCase()}]`;
        }

        if (settings.PokemonFormatTextSize !== "")
          wrapWith("size", settings.PokemonFormatTextSize);

        if (settings.PokemonFormatTextColor !== "")
          wrapWith("color", settings.PokemonFormatTextColor);

        if (settings.PokemonFormatTextFont !== "")
          wrapWith("font", settings.PokemonFormatTextFont);

        wrapWith(settings.PokemonFormatAlign as string);
      }

      return result ?? "";
    },
    [
      applyBBCodeTemplate,
      settings.PokemonFormatAlign,
      settings.PokemonFormatIncludeUnlearnedLevelUpMoves,
      settings.PokemonFormatTextColor,
      settings.PokemonFormatTextFont,
      settings.PokemonFormatTextSize,
    ]
  );
}
