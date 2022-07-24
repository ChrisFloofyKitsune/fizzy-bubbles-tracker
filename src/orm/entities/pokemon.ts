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
    evolutionStageOneLink?: string;
    @Column({ nullable: true })
    evolutionStageTwoLink?: string;
    
    @Column()
    obtained: string;
    @Column()
    obtainedLink: string;

    @Column({
        default: 'Pokeball',
        nullable: true
    })
    pokeball?: string;
    @Column({ nullable: true })
    pokeballLink?: string;
    @Column({ nullable: true })
        
    heldItem?: string;
    @Column({ nullable: true })
    heldItemLink?: string;
    
    @Column({ nullable: true })
    boutiqueMods?: string;
    @Column({ nullable: true })
    boutiqueModsLink: string;

    @Column({ nullable: true })
    imageLink?: string;
    
    @Column('simple-json', { nullable: true })
    levelUpMoves?: LevelUpMove[];
    
    @OneToMany(() => LevelLog, (log) => log.pokemon, {
        cascade: true,
        eager: true
    })
    levelLogs: LevelLog[];
    
    @OneToMany(() => LevelLog, (log) => log.pokemon, {
        cascade: true,
        eager: true
    })
    moveLogs: MoveLog[];

    @OneToMany(() => ContestStatLog, (log) => log.pokemon, {
        cascade: true,
        eager: true
    })
    contestStatsLogs: ContestStatLog[];

    @Column({
        nullable: true
    })
    bbcodeDescription?: string;

    get levelNum() {
        return this.levelLogs.reduce((level, log) => Math.max(level, log.newValue), 0);
    }

    get levelLink() {
        return this.levelLogs.reduce((prev, current) => current.newValue >= prev.newValue ? current : prev).sourceUrl;
    }

}
