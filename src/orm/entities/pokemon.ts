import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Trainer } from "./trainer";
import type { TextWithSource } from '~/orm/ormUtil';
import { PokemonGenderOptions } from "~/orm/enums";
import { ContestStatLog, LevelLog, MoveLog } from "~/orm/entities";

const PokeballDefault: TextWithSource = { value: 'Pokeball' };

export class LevelUpMove {
    move: string;
    level: '-' | 'evolve' | number;
}

@Entity()
export class Pokemon {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @ManyToOne(() => Trainer, (trainer) => trainer.pokemon, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    trainer?: Trainer;

    @Column({ nullable: true })
    name?: string;

    @Column()
    species: string;
    @Column({ nullable: true})
    dexNum?: string;
    @Column({
        default: "Undecided",
    })
    ability: string;
    @Column({
        default: "Undecided",
        nullable: true
    })
    nature?: string;
    @Column('text', {
        default: PokemonGenderOptions.GENDERLESS
    })
    gender: PokemonGenderOptions;
    
    @Column({ nullable: true })
    evolutionStageOneSource?: string;
    @Column({ nullable: true })
    evolutionStageTwoSource?: string;
    
    @Column('simple-json')
    obtained: TextWithSource;
    @Column('simple-json', {
        transformer: {
            to: (value) => value ?? PokeballDefault,
            from: (value) => value
        },
        nullable: true
    })
    pokeball?: TextWithSource;
    @Column('simple-json', { nullable: true })
    heldItem?: TextWithSource;
    
    @Column('simple-json', { nullable: true })
    boutiqueMods?: TextWithSource;
    @Column({ nullable: true })
    imageLink?: string;
    
    @Column('simple-json', { nullable: true })
    levelUpMoves?: LevelUpMove[];
    
    @OneToMany(() => LevelLog, (log) => log.pokemon, {
        cascade: true
    })
    levelLogs: LevelLog[];
    
    @OneToMany(() => LevelLog, (log) => log.pokemon, {
        cascade: true
    })
    moveLogs: MoveLog[];

    @OneToMany(() => ContestStatLog, (log) => log.pokemon, {
        cascade: true
    })
    contestStatsLogs: ContestStatLog[];

    @Column({
        nullable: true
    })
    bbcodeProfile?: string;
}
