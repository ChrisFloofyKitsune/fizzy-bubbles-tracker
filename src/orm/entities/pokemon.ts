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
import {
  BondLog,
  ContestStatLog,
  EggMoveLog,
  LevelLog,
  MachineMoveLog,
  MoveLog,
  OtherMoveLog,
  TutorMoveLog,
} from "~/orm/entities";
import { wrapUrlIfLink } from "~/orm/ormUtil";

import { Trainer } from "./trainer";

export class LevelUpMove {
  move: string;
  level: "-" | "evolve" | `${number}`;
}

export class PokemonSpecialStatus {
  status: string;
  statusLink: string;
  statusColor: string;
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
  })
  trainer: Trainer | null;

  @Column("text", { nullable: true })
  name: string | null = "";
  @Column("text", { nullable: true })
  subHeading: string | null = "";

  @Column("text", { nullable: true })
  species: string | null = "";
  @Column("text", { nullable: true })
  dexNum: string | null = "";
  @Column("text", { nullable: true })
  ability: string | null = "";

  @Column("text", { nullable: true })
  type: string | null = "";
  @Column("text", { nullable: true })
  terraType: string | null = "";

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

  @OneToMany(() => EggMoveLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  eggMoveLogs: EggMoveLog[];

  @OneToMany(() => MachineMoveLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  machineMoveLogs: MachineMoveLog[];

  @OneToMany(() => TutorMoveLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  tutorMoveLogs: TutorMoveLog[];

  @OneToMany(() => OtherMoveLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  otherMoveLogs: OtherMoveLog[];

  @OneToMany(() => ContestStatLog, (log) => log.pokemon, {
    cascade: true,
    eager: true,
  })
  contestStatsLogs: ContestStatLog[];

  @Column({ nullable: true })
  description?: string = "";

  @Column("simple-json", { nullable: true })
  specialStatuses: PokemonSpecialStatus[] | null;

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

    type LogResult = { latestLog: BondLog | null; total: number };
    const result = this.bondLogs.reduce(
      (result: LogResult, current) => {
        let log: BondLog;
        if (
          result.latestLog === null ||
          current.date.isAfter(result.latestLog.date)
        ) {
          log = current;
        } else {
          log = result.latestLog;
        }

        return {
          latestLog: log,
          total: Math.min(30, Math.max(0, result.total + current.value)),
        };
      },
      { latestLog: null, total: 0 }
    );
    return wrapUrlIfLink(result.total, result.latestLog?.sourceUrl);
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
  nameBBCode({ textSize }: { textSize?: number }) {
    return `[size=${textSize ? +textSize + 1 : "+1"}]${this.name}[/size]`;
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
  levelUpMovesBBCode({
    includeUnlearnedMoves = false,
  }: {
    includeUnlearnedMoves: boolean;
  }): string {
    if (!this.levelLogs) return "";

    const currentLevel = this.levelLogs.reduce(
      (current, log) => Math.max(current, log.value),
      1
    );
    return !this.levelUpMoves
      ? ""
      : this.levelUpMoves
          .map((m) => {
            const levelNum = parseInt(m.level, 10);
            return Object.assign(
              { learned: isNaN(levelNum) || levelNum <= currentLevel },
              m
            );
          })
          .filter((m) => includeUnlearnedMoves || m.learned)
          .map(
            (m) =>
              `${includeUnlearnedMoves && m.learned ? "[u]" : ""}${m.move} (${
                m.level === "evolve" ? "Evolve" : m.level
              })${includeUnlearnedMoves && m.learned ? "[/u]" : ""}`
          )
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
            total: Math.min(
              50,
              total +
                (statLog.stat === PokemonContestStat.ALL ||
                statLog.stat === stat
                  ? statLog.statChange
                  : 0)
            ),
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

  getMovesOfCategory(category: PokemonMoveSourceCategory): MoveLog[] {
    switch (category) {
      case PokemonMoveSourceCategory.EGG:
        return this.eggMoveLogs;
      case PokemonMoveSourceCategory.MACHINE:
        return this.machineMoveLogs;
      case PokemonMoveSourceCategory.TUTOR:
        return this.tutorMoveLogs;
      case PokemonMoveSourceCategory.OTHER:
        return this.otherMoveLogs;
    }
  }

  getMovesBBCodeOfCategory(category: PokemonMoveSourceCategory) {
    const list = this.getMovesOfCategory(category);
    return !list || list.length === 0
      ? ""
      : list.map((m) => wrapUrlIfLink(m.move, m.sourceUrl)).join(", ");
  }

  get specialStatusesBBCode() {
    if (!this.specialStatuses || this.specialStatuses.length === 0) return "";

    return `${this.specialStatuses
      .map(
        (s) =>
          `${s.statusLink ? `[url=${s.statusLink}]` : ""}${
            s.statusColor ? `[color=${s.statusColor}]` : ""
          }${s.status}${s.statusColor ? "[/color]" : ""}${
            s.statusLink ? "[/url]" : ""
          }`
      )
      .join(" ")}`;
  }
}
