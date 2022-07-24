import { MigrationInterface, QueryRunner } from "typeorm";
import { BBCodeReplacementConfig } from '../entities';

const configs: BBCodeReplacementConfig[] = [
    {
        specifier: 'Trainer',
        replaceWithProperty: 'bbcodeProfile'
    },
    {
        specifier: 'Pokemon',
        customTemplate: 
`
[center][SIZE=""4""][B]{{name}}[/B][/SIZE]
[img]{{imageLink}}[/img]
[B]Species[/B]: {{species}} #{{dexNum}} | [B]Gender[/B]: {{gender}} | [B]Obtained[/B]: {{obtainedBBCode}}
[B]Type[/B]: {{type}} | [B]Ability[/B]: {{ability}} | [B]Nature[/B]: {{nature}}
[B]Evolution Line[/B]: {{evolutionLineBBCode}}

[B]Level[/B]: {{levelBBCode}} | [B]Bond[/B]: {{bondBBCode}} | [B]Pokeball[/B]: {{pokeballBBCode}} | [B]Held Item[/B]: {{heldItemBBCode}}
[B]Contest Stats[/B]: {{contestStatsBBCode}}
[B]Boutique Modifications[/B]: {{boutiqueModsBBCode}}

[B]Moves[/B]
[spoiler][B]Level-Up:[/B] {{levelUpMoves}}
[B]Egg Moves[/B]: {{eggMoves}}
[B]TM/TR Moves[/B]: {{machineMoves}}
[B]Move Tutor[/B]: {{tutorMoves}}
[B]Other Moves[/B]: {{otherMoves}}[/spoiler]
[B]Description[/B]
[spoiler]{{bbcodeDescription}}[/spoiler][/center]
`,
        replaceWithProperty: null
    },
    {
        specifier: 'Pokemon.levelBBCode',
        customTemplate: '[url={{levelLink}}]{{levelNum}}[/url]',
        replaceWithProperty: null
    },
    {
        specifier: 'Pokemon.obtainedBBCode',
        customTemplate: '[url={{obtainedLink}}]{{obtained}}[/url]',
        replaceWithProperty: null
    },
    {
        specifier: 'Pokemon.pokeballBBCode',
        customTemplate: '[url={{pokeballLink}}]{{pokeball}}[/url]',
        replaceWithProperty: null
    },
    {
        specifier: 'Pokemon.heldItemBBCode',
        customTemplate: '[url={{heldItemLink}}]{{heldItem}}[/url]',
        replaceWithProperty: null
    },
    {
        specifier: 'Pokemon.boutiqueModsBBCode',
        customTemplate: '[url={{boutiqueModsLink}}]{{boutiqueMods}}[/url]',
        replaceWithProperty: null
    }
]


export class InitialBBCodeConfig implements MigrationInterface {
    name = "Insert_Initial_Data";
    
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
                where: { specifier: config.specifier }
            })
            
            if (bbcodeConfig) {
                await repo.remove(bbcodeConfig);
            }
        }
    }
}
