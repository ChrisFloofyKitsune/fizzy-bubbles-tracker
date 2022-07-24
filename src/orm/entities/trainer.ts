import { Entity, Column, PrimaryColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemLog, Pokemon } from "~/orm/entities";

export const bbcodeProfileDefault: string = '' +
`[img]https://archives.bulbagarden.net/media/upload/thumb/a/a6/XY_Youngster.png/200px-XY_Youngster.png[/img]

Trainer Name: {{name}}

Starter Pokemon: Ratataa (MT Super Fang)

Background: Once upon a time there was a trainer who wanted to be the best like no one ever was!
[spoiler]To catch them is my real test, to train them is my caaauuseeee~ POKEMON![/spoiler]
`

@Entity()
export class Trainer {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    name: string;

    @Column({
        nullable: true,
        default: bbcodeProfileDefault
    })
    bbcodeProfile: string;

    @OneToMany(() => Pokemon, (pokemon) => pokemon.trainer, {
        onDelete: "SET NULL",
        eager: false,
    })
    pokemon: Pokemon[];
}
