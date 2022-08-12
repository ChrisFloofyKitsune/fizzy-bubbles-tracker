import { MigrationInterface, QueryRunner } from "typeorm";
import { BBCodeReplacementConfig } from "../entities";

const configs: BBCodeReplacementConfig[] = [
  {
    specifier: "Trainer",
    replaceWithProperty: "bbcodeProfile",
  },
  {
    specifier: "Pokemon",
    customTemplateDefault: `[B]{{nameBBCode}}[/B]
{{subHeading}}
[img]{{imageLink}}[/img]
[B]Species[/B]: {{species}} | [B]Gender[/B]: {{gender}} | [B]Obtained[/B]: {{obtainedBBCode}}
[B]Type[/B]: {{type}} | [B]Ability[/B]: {{ability}} | [B]Nature[/B]: {{nature}}
[B]Evolution Line[/B]: {{evolutionLineBBCode}}

[B]Level[/B]: {{levelBBCode}} | [B]Bond[/B]: {{bondBBCode}} | [B]Pokeball[/B]: {{pokeballBBCode}} | [B]Held Item[/B]: {{heldItemBBCode}}
[B]Contest Stats[/B]: {{contestStatsBBCode}}
[B]Boutique Modifications[/B]: {{boutiqueModsBBCode}}

[B]Moves[/B]
[spoiler][B]Level-Up:[/B] {{levelUpMovesBBCode}}

[B]Egg Moves[/B]: {{eggMovesBBCode}}

[B]TM/TR Moves[/B]: {{machineMovesBBCode}}

[B]Move Tutor[/B]: {{tutorMovesBBCode}}

[B]Other Moves[/B]: {{otherMovesBBCode}}[/spoiler]
[B]Description[/B]
[spoiler]{{description}}[/spoiler]`,
    replaceWithProperty: null,
  },
  {
    specifier: "Pokemon.contestStatsBBCode",
    customTemplateDefault: [
      `[color=#FA92B2]Cute: {{cuteBBCode}}[/color]`,
      `[color=#9DB7F5]Beautiful: {{beautifulBBCode}}[/color]`,
      `[color=#FAE078]Tough: {{toughBBCode}}[/color]`,
      `[color=#A7DB8D]Smart: {{cleverBBCode}}[/color]`,
      `[color=#F5AC78]Cool: {{coolBBCode}}[/color]`,
    ].join(", "),
    replaceWithProperty: null,
  },
];

export class SeedBBCodeConfig_1658802129887 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.manager.getRepository(BBCodeReplacementConfig);
    for (const config of configs) {
      const bbcodeConfig = repo.create();
      Object.assign(bbcodeConfig, config);
      await repo.save(bbcodeConfig);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.manager.getRepository(BBCodeReplacementConfig);
    for (const config of configs) {
      const bbcodeConfig = await repo.findOne({
        where: { specifier: config.specifier },
      });

      if (bbcodeConfig) {
        await repo.remove(bbcodeConfig);
      }
    }
  }
}
