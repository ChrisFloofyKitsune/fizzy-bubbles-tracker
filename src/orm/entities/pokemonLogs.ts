import { Column, Entity, ManyToOne } from "typeorm";
import { PokemonContestStat } from "~/orm/enums";
import { Pokemon } from "~/orm/entities";
import { ChangeLogBase, ShopTrackedChangeLog } from "./changeLogBase";

export abstract class MoveLog extends ChangeLogBase {
  @Column()
  move: string;

  @ManyToOne(() => Pokemon, {
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
export class EggMoveLog extends MoveLog {}

@Entity({
  orderBy: {
    id: "ASC",
  },
})
export class MachineMoveLog extends MoveLog {}

@Entity({
  orderBy: {
    id: "ASC",
  },
})
export class TutorMoveLog extends MoveLog {}

@Entity({
  orderBy: {
    id: "ASC",
  },
})
export class OtherMoveLog extends MoveLog {}

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
