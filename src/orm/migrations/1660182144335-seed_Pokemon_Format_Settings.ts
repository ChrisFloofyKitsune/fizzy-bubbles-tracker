import { In, MigrationInterface, QueryRunner } from "typeorm";
import { Setting } from "~/orm/entities";
import { SettingEnum } from "~/settingEnum";

const settings: Setting[] = [
  {
    id: SettingEnum.PokemonFormatAlign,
    group: "PokemonFormat",
    name: "Alignment",
    description: "The default alignment of the profiles.",
    defaultValue: "center",
    type: "enum",
    enumValues: ["left", "center", "right"],
  },
  {
    id: SettingEnum.PokemonFormatTextSize,
    group: "PokemonFormat",
    name: "Text Size",
    description:
      "The default text size of the profiles. Same as UPN's BBCode.\n(+- a number, just a number, or blank)",
    defaultValue: "",
    type: "string",
  },
  {
    id: SettingEnum.PokemonFormatTextColor,
    group: "PokemonFormat",
    name: "Color",
    description:
      "The default text color of the profiles. Same as UPN's BBCode.\n(Any valid CSS color or blank.)",
    defaultValue: "",
    type: "string",
  },
  {
    id: SettingEnum.PokemonFormatTextFont,
    group: "PokemonFormat",
    name: "Font",
    description:
      "The default text font of the profiles. Same as UPN's BBCode.\n(Any valid CSS font or blank.)",
    defaultValue: "",
    type: "string",
  },
  {
    id: SettingEnum.PokemonFormatIncludeUnlearnedLevelUpMoves,
    group: "PokemonFormat",
    name: "Include Unlearned Level Up Moves",
    description:
      "Whether or not to include unlearned level up moves in the profiles.\nIf enabled, learned moves will be underlined.",
    defaultValue: false,
    type: "boolean",
  },
  {
    id: SettingEnum.AdvancedUsePokemonTemplates,
    group: "Advanced",
    name: "Allow Editing of Pokemon Profile Templates",
    description:
      "If the default template is not to your liking and the options provided aren't enough, " +
      "then enable this to be able to edit the BBCode templates that the Pokemon profiles " +
      "are generated with.",
    defaultValue: false,
    type: "boolean",
  },
];

export class seedPokemonFormatSettings1660182144335
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(Setting).save(settings);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const idsToRemove = settings.map((s) => s.id);
    await queryRunner.manager
      .getRepository(Setting)
      .delete({ id: In(idsToRemove) });
  }
}
