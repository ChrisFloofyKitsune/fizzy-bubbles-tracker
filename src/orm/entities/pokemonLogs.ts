import { Column, Entity, ManyToOne } from "typeorm";
import { PokemonContestStat, PokemonMoveSourceCategory } from "~/orm/enums";
import { Pokemon } from "~/orm/entities";
import { ChangeLogBase, ShopTrackedChangeLog } from "./changeLogBase";

@Entity({
  orderBy: {
    id: "ASC",
  },
})
export class MoveLog extends ChangeLogBase {
  @Column()
  move: string;

  @Column("text")
  category: PokemonMoveSourceCategory;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.moveLogs, {
    nullable: false,
    orphanedRowAction: "delete",
  })
  pokemon: Pokemon;
}

@Entity({
  orderBy: {
    id: "ASC",
  },
})
export class LevelLog extends ChangeLogBase {
  @Column("integer")
  value: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.levelLogs, {
    nullable: false,
    orphanedRowAction: "delete",
  })
  pokemon: Pokemon;
}

@Entity({
  orderBy: {
    date: "ASC",
    id: "ASC",
  },
})
export class BondLog extends ShopTrackedChangeLog {
  @Column("integer")
  value: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.levelLogs, {
    nullable: false,
    orphanedRowAction: "delete",
  })
  pokemon: Pokemon;
}

@Entity({
  orderBy: {
    id: "ASC",
  },
})
export class ContestStatLog extends ChangeLogBase {
  @Column("integer")
  statChange: number;

  @Column("text")
  stat: PokemonContestStat;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.contestStatsLogs, {
    nullable: false,
    orphanedRowAction: "delete",
  })
  pokemon: Pokemon;
}
