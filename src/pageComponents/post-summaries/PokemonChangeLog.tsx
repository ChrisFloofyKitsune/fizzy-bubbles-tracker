import {
  BondLog,
  ChangeLogBase,
  ContestStatLog,
  EggMoveLog,
  LevelLog,
  MachineMoveLog,
  MoveLog,
  OtherMoveLog,
  Pokemon,
  TutorMoveLog,
} from "~/orm/entities";
import { PokemonContestStat } from "~/orm/enums";
import { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { LocalDate, ZoneId } from "@js-joda/core";

export enum PokemonChangeOption {
  Obtained = "Obtained New Pokemon",
  Level = "Level Change",
  Bond = "Bond Change",
  Pokeball = "Gave Pokeball",
  HeldItem = "Gave Held Item",
  EvolutionStage2 = "Evolved into Stage 2",
  EvolutionStage3 = "Evolved into Stage 3",
  EggMove = "Learned Egg Move",
  TutorMove = "Learned Tutor Move",
  MachineMove = "Learned Machine Move",
  OtherMove = "Learned Other Move",
  BoutiqueVisit = "Boutique Visit",
  ContestStat = "Contest Stat Change",
}

export interface ChangeOptionProps {
  group: string;
  dataType: "string" | "number";
  allowMultiple: unknown;
  dataLabel: ReactNode;
  noteLabel?: ReactNode;
  contestStatLabel?: "Contest Stat";
  singleton?: boolean;
}

export interface ChangeOptionPropsField extends ChangeOptionProps {
  allowMultiple: false;
  keys: {
    array?: never;
    logClass?: never;
    url: Extract<keyof Pokemon, `${string}Link`>;
    data: keyof Pokemon;
    note?: keyof Pokemon;
  };
}

export interface ChangeOptionPropsValueLog extends ChangeOptionProps {
  allowMultiple: false;
  keys: {
    array: keyof Pick<Pokemon, "levelLogs" | "bondLogs">;
    logClass: typeof LevelLog | typeof BondLog;
    data: "value";
  };
}

export interface ChangeOptionPropsMoveLog extends ChangeOptionProps {
  allowMultiple: true;
  keys: {
    array: keyof Pick<
      Pokemon,
      "eggMoveLogs" | "tutorMoveLogs" | "machineMoveLogs" | "otherMoveLogs"
    >;
    logClass:
      | typeof EggMoveLog
      | typeof TutorMoveLog
      | typeof MachineMoveLog
      | typeof OtherMoveLog;
    data: "move";
  };
}

export interface ChangeOptionPropsContestStatLog extends ChangeOptionProps {
  allowMultiple: true;
  keys: {
    array: keyof Pick<Pokemon, "contestStatsLogs">;
    logClass: typeof ContestStatLog;
    data: "statChange";
  };
}

export const ChangeOptionPropsMap: Record<
  PokemonChangeOption,
  | ChangeOptionPropsField
  | ChangeOptionPropsValueLog
  | ChangeOptionPropsMoveLog
  | ChangeOptionPropsContestStatLog
> = {
  [PokemonChangeOption.Obtained]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Obtained",
    singleton: true,
    keys: { url: "obtainedLink", data: "obtained" },
  },
  [PokemonChangeOption.Level]: {
    group: "Stats",
    dataType: "number",
    allowMultiple: false,
    dataLabel: "New Level",
    noteLabel: "Source",
    keys: { array: "levelLogs", logClass: LevelLog, data: "value" },
  },
  [PokemonChangeOption.Bond]: {
    group: "Stats",
    dataType: "number",
    allowMultiple: false,
    dataLabel: "Bond Change",
    noteLabel: "Source",
    keys: { array: "bondLogs", logClass: BondLog, data: "value" },
  },
  [PokemonChangeOption.Pokeball]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Pokeball",
    keys: { url: "pokeballLink", data: "pokeball" },
  },
  [PokemonChangeOption.HeldItem]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Held Item",
    keys: { url: "heldItemLink", data: "heldItem" },
  },
  [PokemonChangeOption.EvolutionStage2]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Evo Stage 2",
    noteLabel: "Method",
    singleton: true,
    keys: {
      url: "evolutionStageTwoMethodLink",
      data: "evolutionStageTwo",
      note: "evolutionStageTwoMethod",
    },
  },
  [PokemonChangeOption.EvolutionStage3]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Evo Stage 3",
    noteLabel: "Method",
    singleton: true,
    keys: {
      url: "evolutionStageThreeMethodLink",
      data: "evolutionStageThree",
      note: "evolutionStageThreeMethod",
    },
  },
  [PokemonChangeOption.EggMove]: {
    group: "Moves",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Move",
    noteLabel: "Source",
    keys: { array: "eggMoveLogs", logClass: EggMoveLog, data: "move" },
  },
  [PokemonChangeOption.TutorMove]: {
    group: "Moves",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Move",
    noteLabel: "Source",
    keys: { array: "tutorMoveLogs", logClass: TutorMoveLog, data: "move" },
  },
  [PokemonChangeOption.MachineMove]: {
    group: "Moves",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Move",
    noteLabel: "Source",
    keys: { array: "machineMoveLogs", logClass: MachineMoveLog, data: "move" },
  },
  [PokemonChangeOption.OtherMove]: {
    group: "Moves",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Move",
    noteLabel: "Source",
    keys: { array: "otherMoveLogs", logClass: OtherMoveLog, data: "move" },
  },
  [PokemonChangeOption.BoutiqueVisit]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Boutique Mods",
    keys: { url: "boutiqueModsLink", data: "boutiqueMods" },
  },
  [PokemonChangeOption.ContestStat]: {
    group: "Stats",
    dataType: "number",
    allowMultiple: true,
    dataLabel: "Stat Change",
    noteLabel: "Source",
    contestStatLabel: "Contest Stat",
    keys: {
      array: "contestStatsLogs",
      logClass: ContestStatLog,
      data: "statChange",
    },
  },
};

export class PokemonChangeLog {
  public dataValue: string | number | null = null;
  public noteValue: string | null = null;
  public contestStat: PokemonContestStat | null;
  public readonly uuid = uuidv4();

  public constructor(
    public readonly changeOption: PokemonChangeOption,
    private pokemon: Pokemon,
    public idInArray: number | null,
    private url: string | null,
    private date: LocalDate | null,
    private defaultNote: string = ""
  ) {
    const { keys, dataType } = ChangeOptionPropsMap[changeOption];

    if (keys.array) {
      const log = this.getLog(pokemon[keys.array] as ChangeLogBase[]) as
        | (LevelLog & BondLog & MoveLog & ContestStatLog)
        | null;
      this.dataValue = log?.[keys.data] ?? (dataType === "string" ? "" : 0);
      this.noteValue = log?.sourceNote ?? this.defaultNote;
      if (changeOption === PokemonChangeOption.ContestStat) {
        this.contestStat = log?.stat ?? PokemonContestStat.ALL;
      }
    } else {
      this.dataValue = pokemon[keys.data] ?? (dataType === "string" ? "" : 0);
      if (keys.note) {
        this.noteValue = pokemon[keys.note];
      }
    }
  }

  private getLog<T extends ChangeLogBase>(array: T[]) {
    return this.idInArray === null
      ? null
      : array.find((entry) => entry.id === this.idInArray) ?? null;
  }

  public updateInfo(
    url: string,
    date: LocalDate | null,
    defaultNote: string
  ): PokemonChangeLog {
    this.url = url.trim();
    this.date = date;

    if (this.noteValue?.trim() === this.defaultNote.trim()) {
      this.noteValue = defaultNote.trim();
    }
    this.defaultNote = defaultNote;

    return this;
  }

  public updateIdInArray(updatedPokemon: Pokemon) {
    const { keys } = ChangeOptionPropsMap[this.changeOption];
    if (!keys.array) return;

    const array = updatedPokemon[keys.array] as InstanceType<
      typeof keys.logClass
    >[];

    this.idInArray =
      array.find(
        (log) =>
          log.sourceUrl === this.url &&
          log.sourceNote === this.noteValue &&
          log[keys.data as keyof typeof log] === this.dataValue &&
          (!(this.changeOption === PokemonChangeOption.ContestStat) ||
            (log as ContestStatLog).stat === this.contestStat)
      )?.id ?? null;

    if (this.idInArray === null) {
      throw new Error(
        `Could not find PokemonChangeLog's values in array of updated pokemon
${this.changeOption}, ${this.url}, ${this.dataValue}${
          this.changeOption === PokemonChangeOption.ContestStat
            ? `, ${this.contestStat}`
            : ""
        }`
      );
    }

    this.pokemon = updatedPokemon;
  }

  public applyChanges(targetPokemon: Partial<Pokemon> = this.pokemon) {
    const { keys } = ChangeOptionPropsMap[this.changeOption];

    if (keys.array) {
      let logArray = targetPokemon[keys.array] as
        | InstanceType<typeof keys.logClass>[]
        | undefined;
      if (typeof logArray === "undefined") {
        logArray = targetPokemon[keys.array] = [];
      }

      let log = logArray.find((l) => l.id === this.idInArray);
      if (typeof log === "undefined") {
        console.debug(
          `log ${this.changeOption} adding itself to ${
            targetPokemon.name || targetPokemon.species
          }`
        );
        log = new keys.logClass();
        logArray.push(log);
      }

      (log as any)[keys.data] = this.dataValue;
      log.sourceNote = this.noteValue || this.defaultNote;
      log.sourceUrl = this.url;
      if (this.changeOption === PokemonChangeOption.Bond) {
        (log as BondLog).date = this.date ?? LocalDate.now(ZoneId.UTC);
      } else if (this.changeOption === PokemonChangeOption.ContestStat) {
        (log as ContestStatLog).stat =
          this.contestStat ?? PokemonContestStat.ALL;
      }
    } else {
      targetPokemon[keys.url] = this.url;
      (targetPokemon as any)[keys.data] = this.dataValue;
      if (keys.note) {
        (targetPokemon as any)[keys.note] = this.noteValue;
      }
    }
  }

  public deleteChanges(targetPokemon: Pokemon = this.pokemon) {
    const { keys } = ChangeOptionPropsMap[this.changeOption];
    if (keys.array) {
      targetPokemon[keys.array] = (targetPokemon[keys.array] as any[]).filter(
        (log) => log.id !== this.idInArray
      );
    } else {
      targetPokemon[keys.url] = null;
      (targetPokemon as any)[keys.data] = null;
      if (keys.note) {
        (targetPokemon as any)[keys.note] = null;
      }
    }
  }
}

export function canCreateSingletonOption(
  pokemon: Pokemon,
  changeOption: PokemonChangeOption
): boolean {
  if (!ChangeOptionPropsMap[changeOption].singleton) {
    throw new Error(`"${changeOption}" is not a singleton option`);
  }

  switch (changeOption) {
    case PokemonChangeOption.Obtained:
      return !pokemon.obtained && !pokemon.obtained;
    case PokemonChangeOption.EvolutionStage2:
      return (
        !pokemon.evolutionStageTwoMethodLink && !!pokemon.evolutionStageTwo
      );
    case PokemonChangeOption.EvolutionStage3:
      return (
        !pokemon.evolutionStageTwoMethodLink && !!pokemon.evolutionStageThree
      );
    default:
      return false;
  }
}
