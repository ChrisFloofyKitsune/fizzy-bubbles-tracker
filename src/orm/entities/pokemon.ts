import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Trainer } from "./trainer";
import { PokemonGenderOptions } from "~/orm/enums";
import { ContestStatLog, LevelLog, MoveLog } from "~/orm/entities";

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
    @Column({ default: "Undecided" })
        
    ability: string;
    @Column({
        default: "Undecided",
        nullable: true
    })
    nature?: string;
    @Column('text', { default: PokemonGenderOptions.UNDECIDED })
    gender: PokemonGenderOptions;
    
    @Column({ nullable: true })
    evolutionStageOneSource?: string;
    @Column({ nullable: true })
    evolutionStageTwoSource?: string;
    
    @Column()
    obtained: string;
    @Column()
    obtainedSourceLink: string;

    @Column({
        default: 'Pokeball',
        nullable: true
    })
    pokeball?: string;
    @Column({ nullable: true })
    pokeballSourceLink?: string;
    @Column({ nullable: true })
        
    heldItem?: string;
    @Column({ nullable: true })
    heldItemSourceLink?: string;
    
    @Column({ nullable: true })
    boutiqueMods?: string;
    @Column({ nullable: true })
    boutiqueModsSourceLink: string;

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
