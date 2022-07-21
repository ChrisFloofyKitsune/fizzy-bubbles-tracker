import { Column, Entity, ManyToOne } from "typeorm";
import { PokemonContestStat, PokemonMoveSourceCategory } from "~/orm/enums";
import { Pokemon } from "~/orm/entities";
import { ChangeLogBase, ShopTrackedChangeLog } from "./changeLogBase";

@Entity({
    orderBy: {
        timestamp: 'ASC'
    },
})
export class MoveLog extends ChangeLogBase {    
    @Column()
    move: string;

    @Column('text')
    category: PokemonMoveSourceCategory | string;

    @ManyToOne(() => Pokemon, (pokemon) => pokemon.moveLogs, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    pokemon: Pokemon;
}

@Entity({
    orderBy: {
        timestamp: 'ASC'
    },
})
export class LevelLog extends ChangeLogBase {
    @Column('integer')
    newValue: number;

    @ManyToOne(() => Pokemon, (pokemon) => pokemon.levelLogs, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    pokemon: Pokemon;
}

@Entity({
    orderBy: {
        timestamp: 'ASC'
    },
})
export class ContestStatLog extends ShopTrackedChangeLog {
    @Column('integer')
    statChange: number;

    @Column('text')
    stat: PokemonContestStat;

    @ManyToOne(() => Pokemon, (pokemon) => pokemon.contestStatsLogs, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    pokemon: Pokemon;
}