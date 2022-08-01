import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import {
  PokemonContestStat,
  PokemonGenderOptions,
  PokemonMoveSourceCategory,
} from "~/orm/enums";
import { BondLog, ContestStatLog, LevelLog, MoveLog } from "~/orm/entities";
import { wrapUrlIfLink } from "~/orm/ormUtil";

import { Trainer } from "./trainer";

export class LevelUpMove {
  move: string;
  level: "-" | "evolve" | `${number}`;
}

@Entity()
export class Pokemon {
  // COLUMNS
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column("text", { nullable: true })
  trainerId: string | null;

  @ManyToOne(() => Trainer, (trainer) => trainer.pokemon, {
    nullable: true,
    onDelete: "SET NULL",
  })
  trainer: Trainer | null;

  @Column("text", { nullable: true })
  name: string | null = "";

  @Column("text", { nullable: true })
  species: string | null = "";
  @Column("text", { nullable: true })
  dexNum: string | null = "";
  @Column("text", { nullable: true })
  ability: string | null = "";

  @Column("text", { nullable: true })
  type: string | null = "";

  @Column("text", { nullable: true })
  nature: string | null = "";
  @Column("text", { default: PokemonGenderOptions.UNDECIDED })
  gender: PokemonGenderOptions;

  @Column("text", { nullable: true })
  evolutionStageOne: string | null;
  @Column("text", { nullable: true })
  evolutionStageTwoMethod: string | null;
  @Column("text", { nullable: true })
  evolutionStageTwoMethodLink: string | null;
  @Column("text", { nullable: true })
  evolutionStageTwo: string | null;
  @Column("text", { nullable: true })
  evolutionStageThreeMethod: string | null;
  @Column("text", { nullable: true })
  evolutionStageThreeMethodLink: string | null;
  @Column("text", { nullable: true })
  evolutionStageThree: string | null;

  @Column("text", { nullable: true })
  obtained: string | null;
  @Column("text", { nullable: true })
  obtainedLink: string | null;

  @Column("text", {
    default: "Pokeball",
    nullable: true,
  })
  pokeball: string | null = "Pokeball";
  @Column("text", { nullable: true })
  pokeballLink: string | null;

  @Column("text", { nullable: true })
  heldItem: string | null;
  @Column("text", { nullable: true })
  heldItemLink: string | null;

  @Column("text", { nullable: true })
  boutiqueMods: string | null;
  @Column("text", { nullable: true })
  boutiqueModsLink: string | null;

  @Column("text", { nullable: true })
  imageLink: string | null = "";

  @Column("simple-json", { nullable: true })
  levelUpMoves: LevelUpMove[] | null;

  @OneToMany(() => LevelLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  levelLogs: LevelLog[];

  @OneToMany(() => BondLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  bondLogs: BondLog[];

  @OneToMany(() => LevelLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  moveLogs: MoveLog[];

  @OneToMany(() => ContestStatLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  contestStatsLogs: ContestStatLog[];

  @Column({ nullable: true })
  bbcodeDescription?: string = "";

  // GETTER FUNCTIONS
  // noinspection JSUnusedGlobalSymbols
  get levelBBCode() {
    if (!this.levelLogs || this.levelLogs.length == 0) {
      return "1";
    }

    const activeLog = this.levelLogs.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    );
    return wrapUrlIfLink(activeLog.value, activeLog.sourceUrl);
  }

  // noinspection JSUnusedGlobalSymbols
  get bondBBCode() {
    if (!this.bondLogs || this.bondLogs.length == 0) {
      return "0";
    }

    const activeLog = this.bondLogs.reduce((prev, current) =>
      current.date >= prev.date ? current : prev
    );
    return wrapUrlIfLink(activeLog.value, activeLog.sourceUrl);
  }

  // noinspection JSUnusedGlobalSymbols
  get evolutionLineBBCode() {
    if (!this.evolutionStageOne) {
      return " - ";
    }

    if (!this.evolutionStageTwo) {
      return this.evolutionStageOne;
    }

    function arrow(method: string | null, link: string | null) {
      return `-(${wrapUrlIfLink(method ?? " ", link)})->`;
    }

    let result = `${this.evolutionStageOne} ${arrow(
      this.evolutionStageTwoMethod,
      this.evolutionStageTwoMethodLink
    )} ${this.evolutionStageTwo}`;
    if (!this.evolutionStageThree) {
      return result;
    }

    return (
      result +
      ` ${arrow(
        this.evolutionStageThreeMethod,
        this.evolutionStageThreeMethodLink
      )} ${this.evolutionStageThree}`
    );
  }

  // noinspection JSUnusedGlobalSymbols
  get obtainedBBCode() {
    return wrapUrlIfLink(this.obtained ?? "", this.obtainedLink);
  }

  // noinspection JSUnusedGlobalSymbols
  get pokeballBBCode() {
    return wrapUrlIfLink(this.pokeball ?? "", this.pokeballLink);
  }

  // noinspection JSUnusedGlobalSymbols
  get heldItemBBCode() {
    return wrapUrlIfLink(this.heldItem ?? "", this.heldItemLink);
  }

  // noinspection JSUnusedGlobalSymbols
  get boutiqueModsBBCode() {
    return wrapUrlIfLink(this.boutiqueMods ?? "", this.boutiqueModsLink);
  }

  // noinspection JSUnusedGlobalSymbols
  get cuteBBCode() {
    const { total, link } = this.compileContestStat(PokemonContestStat.CUTE);
    return wrapUrlIfLink(total, link);
  }

  // noinspection JSUnusedGlobalSymbols
  get beautifulBBCode() {
    const { total, link } = this.compileContestStat(
      PokemonContestStat.BEAUTIFUL
    );
    return wrapUrlIfLink(total, link);
  }

  // noinspection JSUnusedGlobalSymbols
  get toughBBCode() {
    const { total, link } = this.compileContestStat(PokemonContestStat.TOUGH);
    return wrapUrlIfLink(total, link);
  }

  // noinspection JSUnusedGlobalSymbols
  get cleverBBCode() {
    const { total, link } = this.compileContestStat(PokemonContestStat.CLEVER);
    return wrapUrlIfLink(total, link);
  }

  // noinspection JSUnusedGlobalSymbols
  get coolBBCode() {
    const { total, link } = this.compileContestStat(PokemonContestStat.COOL);
    return wrapUrlIfLink(total, link);
  }

  // noinspection JSUnusedGlobalSymbols
  get levelUpMovesBBCode() {
    if (!this.levelLogs) return "";

    const currentLevel = this.levelLogs.reduce(
      (current, log) => Math.max(current, log.value),
      1
    );
    return !this.levelUpMoves
      ? ""
      : this.levelUpMoves
          .map((m) => Object.assign({ levelNum: parseInt(m.level, 10) }, m))
          .filter((m) => isNaN(m.levelNum) || m.levelNum <= currentLevel)
          .map((m) => `${m.move} (${m.level})`)
          .join(", ");
  }

  // noinspection JSUnusedGlobalSymbols
  get eggMovesBBCode() {
    return this.getMovesBBCodeOfCategory(PokemonMoveSourceCategory.EGG);
  }

  // noinspection JSUnusedGlobalSymbols
  get machineMovesBBCode() {
    return this.getMovesBBCodeOfCategory(PokemonMoveSourceCategory.MACHINE);
  }

  // noinspection JSUnusedGlobalSymbols
  get tutorMovesBBCode() {
    return this.getMovesBBCodeOfCategory(PokemonMoveSourceCategory.TUTOR);
  }

  // noinspection JSUnusedGlobalSymbols
  get otherMovesBBCode() {
    return this.getMovesBBCodeOfCategory(PokemonMoveSourceCategory.OTHER);
  }

  compileContestStat(stat: PokemonContestStat) {
    return (
      this.contestStatsLogs?.reduce(
        ({ total, link, id }, statLog) => {
          return {
            total:
              total +
              (statLog.stat === PokemonContestStat.ALL || statLog.stat === stat
                ? statLog.statChange
                : 0),
            link: !id
              ? statLog.sourceUrl
              : statLog.id > id
              ? statLog.sourceUrl
              : link,
            id: !id ? statLog.id : statLog.id > id ? statLog.id : id,
          };
        },
        {
          total: 0,
          link: null,
          id: 0,
        } as { total: number; link: string | null; id: number }
      ) ?? { total: 0, link: null, id: -1 }
    );
  }

  getMovesOfCategory(category: PokemonMoveSourceCategory) {
    return !this.moveLogs
      ? []
      : this.moveLogs.filter((m) => m.category === category);
  }

  getMovesBBCodeOfCategory(category: PokemonMoveSourceCategory) {
    const list = this.getMovesOfCategory(category);
    return !list || list.length === 0
      ? ""
      : list.map((m) => wrapUrlIfLink(m.move, m.sourceUrl));
  }
}
