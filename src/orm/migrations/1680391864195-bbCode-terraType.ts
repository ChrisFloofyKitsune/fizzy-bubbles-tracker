import { MigrationInterface, QueryRunner } from "typeorm";
import { BBCodeReplacementConfig } from "~/orm/entities";

const config: BBCodeReplacementConfig = {
  specifier: "Pokemon",
  customTemplateDefault: `[B]{{nameBBCode}}[/B]
{{subHeading}}
[img]{{imageLink}}[/img]
{{specialStatusesBBCode}}
[B]Species[/B]: {{species}} | [B]Gender[/B]: {{gender}} | [B]Obtained[/B]: {{obtainedBBCode}}
[B]Type[/B]: {{type}} | [B]Terra Type[/B]: {{terraType}} | [B]Ability[/B]: {{ability}} | [B]Nature[/B]: {{nature}}
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
};

export class bbCodeTerraType1680391864195 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.manager.getRepository(BBCodeReplacementConfig);
    const bbcodeConfig = repo.create();
    Object.assign(bbcodeConfig, config);
    await repo.save(bbcodeConfig);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
