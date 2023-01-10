import dayjs from "dayjs";
import {
  BondLog,
  ChangeLogBase,
  ContestStatLog,
  EggMoveLog,
  LevelLog,
  MachineMoveLog,
  OtherMoveLog,
  Pokemon,
  TutorMoveLog,
} from "~/orm/entities";
import { PokemonContestStat } from "~/orm/enums";
import { ReactNode } from "react";

export enum PokemonChangeOption {
  Obtained = "Obtained New&nbsp;Pokemon",
  Level = "Level Change",
  Bond = "Bond Change",
  Pokeball = "Gave Pokeball",
  HeldItem = "Gave Held Item",
  EvolutionStage2 = "Evolved&nbsp;into Stage&nbsp;2",
  EvolutionStage3 = "Evolved&nbsp;into Stage&nbsp;3",
  EggMove = "Learned Egg&nbsp;Move",
  TutorMove = "Learned Tutor&nbsp;Move",
  MachineMove = "Learned Machine&nbsp;Move",
  OtherMove = "Learned Other&nbsp;Move",
  BoutiqueVisit = "Boutique Visit",
  ContestStat = "Contest&nbsp;Stat Change",
}

export const ChangeOptionPropsMap: Record<
  PokemonChangeOption,
  {
    group: string;
    dataType: "string" | "number";
    allowMultiple: boolean;
    dataLabel: ReactNode;
    noteLabel?: ReactNode;
    contestStatLabel?: "Contest Stat";
  }
> = {
  [PokemonChangeOption.Obtained]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Obtained",
  },
  [PokemonChangeOption.Level]: {
    group: "Stats",
    dataType: "number",
    allowMultiple: false,
    dataLabel: "New Level",
    noteLabel: "Source",
  },
  [PokemonChangeOption.Bond]: {
    group: "Stats",
    dataType: "number",
    allowMultiple: false,
    dataLabel: "Bond Change",
    noteLabel: "Source",
  },
  [PokemonChangeOption.Pokeball]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Pokeball",
  },
  [PokemonChangeOption.HeldItem]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Held Item",
  },
  [PokemonChangeOption.EvolutionStage2]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Evo Stage 2",
    noteLabel: "Method",
  },
  [PokemonChangeOption.EvolutionStage3]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Evo Stage 3",
    noteLabel: "Method",
  },
  [PokemonChangeOption.EggMove]: {
    group: "Moves",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Move",
    noteLabel: "Source",
  },
  [PokemonChangeOption.TutorMove]: {
    group: "Moves",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Move",
    noteLabel: "Source",
  },
  [PokemonChangeOption.MachineMove]: {
    group: "Moves",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Move",
    noteLabel: "Source",
  },
  [PokemonChangeOption.OtherMove]: {
    group: "Moves",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Move",
    noteLabel: "Source",
  },
  [PokemonChangeOption.BoutiqueVisit]: {
    group: "Info",
    dataType: "string",
    allowMultiple: false,
    dataLabel: "Boutique Mods",
  },
  [PokemonChangeOption.ContestStat]: {
    group: "Stats",
    dataType: "string",
    allowMultiple: true,
    dataLabel: "Stat Change",
    noteLabel: "Source",
    contestStatLabel: "Contest Stat",
  },
};

export class PokemonChangeLog {
  public dataValue: string | number | null = null;
  public noteValue: string | null = null;
  public contestStat: PokemonContestStat | null;

  public constructor(
    public readonly changeOption: PokemonChangeOption,
    private readonly pokemon: Pokemon,
    public readonly idInArray: number | null,
    private url: string | null,
    private date: dayjs.Dayjs | null,
    private defaultNote: string = ""
  ) {
    function getLog<T extends ChangeLogBase>(array: T[]) {
      return idInArray === null
        ? null
        : array.find((entry) => entry.id === idInArray);
    }

    switch (changeOption) {
      case PokemonChangeOption.Obtained:
        this.dataValue = pokemon.obtained ?? "";
        break;
      case PokemonChangeOption.Level:
        const levelLog = getLog(pokemon.levelLogs);
        this.dataValue = levelLog?.value ?? 0;
        this.noteValue = levelLog?.sourceNote ?? defaultNote;
        break;
      case PokemonChangeOption.Bond:
        const bondLog = getLog(pokemon.bondLogs);
        this.dataValue = bondLog?.value ?? 0;
        this.noteValue = bondLog?.sourceNote ?? defaultNote;
        break;
      case PokemonChangeOption.Pokeball:
        this.dataValue = pokemon.pokeball ?? "";
        break;
      case PokemonChangeOption.HeldItem:
        this.dataValue = pokemon.heldItem ?? "";
        break;
      case PokemonChangeOption.EvolutionStage2:
        this.dataValue = pokemon.evolutionStageTwo ?? "";
        this.noteValue = pokemon.evolutionStageTwoMethod ?? "";
        break;
      case PokemonChangeOption.EvolutionStage3:
        this.dataValue = pokemon.evolutionStageThree ?? "";
        this.noteValue = pokemon.evolutionStageThreeMethod ?? "";
        break;
      case PokemonChangeOption.EggMove:
        const eggMoveLog = getLog(pokemon.eggMoveLogs);
        this.dataValue = eggMoveLog?.move ?? "";
        this.noteValue = eggMoveLog?.sourceNote ?? defaultNote;
        break;
      case PokemonChangeOption.TutorMove:
        const tutorMoveLog = getLog(pokemon.tutorMoveLogs);
        this.dataValue = tutorMoveLog?.move ?? "";
        this.noteValue = tutorMoveLog?.sourceNote ?? defaultNote;
        break;
      case PokemonChangeOption.MachineMove:
        const machineMoveLog = getLog(pokemon.machineMoveLogs);
        this.dataValue = machineMoveLog?.move ?? "";
        this.noteValue = machineMoveLog?.sourceNote ?? defaultNote;
        break;
      case PokemonChangeOption.OtherMove:
        const otherMoveLog = getLog(pokemon.otherMoveLogs);
        this.dataValue = otherMoveLog?.move ?? "";
        this.noteValue = otherMoveLog?.sourceNote ?? defaultNote;
        break;
      case PokemonChangeOption.BoutiqueVisit:
        this.dataValue = pokemon.boutiqueMods ?? "";
        break;
      case PokemonChangeOption.ContestStat:
        const contestStatLog = getLog(pokemon.contestStatsLogs);
        this.dataValue = contestStatLog?.statChange ?? 0;
        this.noteValue = contestStatLog?.sourceNote ?? defaultNote;
        this.contestStat = contestStatLog?.stat ?? PokemonContestStat.ALL;
        break;
      default:
        throw new Error(
          "invalid change option: " + PokemonChangeOption[changeOption] ??
            changeOption
        );
    }
  }

  public updateInfo(
    url: string,
    date: dayjs.Dayjs | null,
    defaultNote: string
  ): PokemonChangeLog {
    defaultNote.trim();
    this.url = url.trim();
    this.date = date;

    if (this.noteValue?.trim() === this.defaultNote.trim()) {
      this.noteValue = defaultNote.trim();
    }

    this.defaultNote = defaultNote;

    return this;
  }

  public updateValues(
    dataValue: typeof this.dataValue,
    noteValue?: typeof this.noteValue,
    contestStat?: typeof this.contestStat
  ) {
    this.dataValue = dataValue;
    this.noteValue = noteValue ?? this.noteValue;
    this.contestStat = contestStat ?? this.contestStat;
  }

  public applyChanges(targetPokemon: Partial<Pokemon> = {}) {
    const getOrMakeLog = <T extends ChangeLogBase>(
      arrayProp: keyof Pokemon,
      logType: new () => T
    ): T => {
      let array: T[] | undefined = targetPokemon[arrayProp];
      if (typeof array === "undefined") {
        array = (targetPokemon as any)[arrayProp] = [];
      } else if (!Array.isArray(array)) {
        throw new Error("bad arrayProp: " + arrayProp);
      }

      let entry: T | undefined = array.find((log) => log.id === this.idInArray);
      if (typeof entry === "undefined") {
        entry = new logType();
        array.push(entry);
      }

      return entry;
    };

    switch (this.changeOption) {
      case PokemonChangeOption.Obtained:
        targetPokemon.obtained = this.dataValue as string;
        targetPokemon.obtainedLink = this.url;
        break;
      case PokemonChangeOption.Level:
        const levelLog = getOrMakeLog("levelLogs", LevelLog);
        levelLog.value = this.dataValue as number;
        levelLog.sourceNote = this.noteValue || this.defaultNote;
        levelLog.sourceUrl = this.url;
        break;
      case PokemonChangeOption.Bond:
        const bondLog = getOrMakeLog("bondLogs", BondLog);
        bondLog.value = this.dataValue as number;
        bondLog.sourceNote = this.noteValue || this.defaultNote;
        bondLog.sourceUrl = this.url;
        bondLog.date = this.date ?? dayjs.utc();
        break;
      case PokemonChangeOption.Pokeball:
        targetPokemon.pokeball = this.dataValue as string;
        targetPokemon.pokeballLink = this.url;
        break;
      case PokemonChangeOption.HeldItem:
        targetPokemon.heldItem = this.dataValue as string;
        targetPokemon.heldItemLink = this.url;
        break;
      case PokemonChangeOption.EvolutionStage2:
        targetPokemon.evolutionStageTwo = this.dataValue as string;
        targetPokemon.evolutionStageTwoMethod = this.noteValue;
        targetPokemon.evolutionStageTwoMethodLink = this.url;
        break;
      case PokemonChangeOption.EvolutionStage3:
        targetPokemon.evolutionStageThree = this.dataValue as string;
        targetPokemon.evolutionStageThreeMethod = this.noteValue;
        targetPokemon.evolutionStageThreeMethodLink = this.url;
        break;
      case PokemonChangeOption.EggMove:
        const eggMoveLog = getOrMakeLog("eggMoveLogs", EggMoveLog);
        eggMoveLog.move = this.dataValue as string;
        eggMoveLog.sourceNote = this.noteValue || this.defaultNote;
        eggMoveLog.sourceUrl = this.url;
        break;
      case PokemonChangeOption.TutorMove:
        const tutorMoveLog = getOrMakeLog("tutorMoveLogs", TutorMoveLog);
        tutorMoveLog.move = this.dataValue as string;
        tutorMoveLog.sourceNote = this.noteValue || this.defaultNote;
        tutorMoveLog.sourceUrl = this.url;
        break;
      case PokemonChangeOption.MachineMove:
        const machineMoveLog = getOrMakeLog("machineMoveLogs", MachineMoveLog);
        machineMoveLog.move = this.dataValue as string;
        machineMoveLog.sourceNote = this.noteValue || this.defaultNote;
        machineMoveLog.sourceUrl = this.url;
        break;
      case PokemonChangeOption.OtherMove:
        const otherMoveLog = getOrMakeLog("otherMoveLogs", OtherMoveLog);
        otherMoveLog.move = this.dataValue as string;
        otherMoveLog.sourceNote = this.noteValue || this.defaultNote;
        otherMoveLog.sourceUrl = this.url;
        break;
      case PokemonChangeOption.BoutiqueVisit:
        targetPokemon.boutiqueMods = this.dataValue as string;
        targetPokemon.boutiqueModsLink = this.url;
        break;
      case PokemonChangeOption.ContestStat:
        const contestStatLog = getOrMakeLog("contestStatsLogs", ContestStatLog);
        contestStatLog.statChange = this.dataValue as number;
        contestStatLog.sourceNote = this.noteValue || this.defaultNote;
        contestStatLog.sourceUrl = this.url;
        contestStatLog.stat = this.contestStat ?? PokemonContestStat.ALL;
        break;
      default:
        throw new Error("invalid change option: " + this.changeOption);
    }
  }
}
