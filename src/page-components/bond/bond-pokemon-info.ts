import { BondLog, BondStylingConfig, Pokemon } from "~/orm/entities";
import { sha1 } from "object-hash";
import { LocalDateFormatter } from "~/util";

export class BondPokemonInfo {
  public readonly pokemon: Pick<Pokemon, "uuid" | "name" | "species">;

  private _startBond: number = 0;
  private _endBond: number = 0;
  private _startLink: string | null = null;
  private _endLink: string | null = null;
  private _bondLogs: BondLog[] = [];

  get startBond(): number {
    return this._startBond;
  }

  get endBond(): number {
    return this._endBond;
  }

  get startLink(): string | null {
    return this._startLink;
  }

  get endLink(): string | null {
    return this._endLink;
  }

  get bondLogs(): BondLog[] {
    return this._bondLogs;
  }

  private bondLogsHash: string = "";

  public bondStylingConfig: BondStylingConfig;

  private bbCodeHeader: string = "";
  private bbCodeContents: string = "";
  private bbCodeFooter: string = "";

  private _hasBBCodeOutput = false;

  public get hasBBCodeOutput() {
    return this._hasBBCodeOutput;
  }

  constructor(
    pokemon: Pick<Pokemon, "uuid" | "name" | "species">,
    bondStylingConfig: BondStylingConfig,
    bondLogs: BondLog[]
  ) {
    this.pokemon = pokemon;
    this.bondStylingConfig = bondStylingConfig;

    this.updateBondLogs(bondLogs);
  }

  private clearInfo(): void {
    this.bondLogsHash = "";
    this._hasBBCodeOutput = false;

    this._bondLogs = [];
    this._startBond = 0;
    this._startLink = null;
    this._endBond = 0;
    this._endLink = null;

    this.bbCodeHeader = "";
    this.bbCodeContents = "";
    this.bbCodeFooter = "";
  }

  public updateBondLogs(bondLogs: BondLog[]) {
    if (bondLogs.length === 0) {
      this.clearInfo();
      return;
    }

    let newHash = sha1(bondLogs);
    if (this.bondLogsHash === newHash) return;
    this.bondLogsHash = newHash;
    this._bondLogs = bondLogs;

    let { pastLogs, currentLogs } = bondLogs
      .filter((l) => l.pokemonUuid === this.pokemon.uuid)
      .reduce(
        (result, log) => {
          if (log.verifiedInShopUpdate) {
            result.pastLogs.push(log);
          } else {
            result.currentLogs.push(log);
          }
          return result;
        },
        { pastLogs: [] as BondLog[], currentLogs: [] as BondLog[] }
      );

    this._startBond = Math.min(
      30,
      pastLogs.reduce((sum, l) => sum + l.value, 0)
    );

    this._startLink =
      pastLogs.reduce(
        (latestPastLog, log) =>
          !latestPastLog || log.date.compareTo(latestPastLog.date) >= 0
            ? log
            : latestPastLog,
        null as BondLog | null
      )?.sourceUrl ?? null;

    this._endBond = Math.min(
      30,
      currentLogs.reduce((sum, l) => sum + l.value, this._startBond)
    );

    this._endLink =
      currentLogs.reduce(
        (latestCurrentLog, log) =>
          !latestCurrentLog || log.date.compareTo(latestCurrentLog.date) >= 0
            ? log
            : latestCurrentLog,
        null as BondLog | null
      )?.sourceUrl ?? null;

    this._hasBBCodeOutput = currentLogs.length !== 0;

    this.bbCodeHeader = `Starting Bond: ${
      this._startLink ? `[url=${this._startLink}]` : ""
    }${this._startBond}${this._startLink ? "[/url]" : ""}`;

    this.bbCodeContents = currentLogs
      .map(
        (l) =>
          `${l.sourceUrl ? `[url=${l.sourceUrl}]` : ""}${
            l.value > 0 ? "+" : ""
          }${l.value} - ${l.sourceNote} (${l.date.format(LocalDateFormatter)})${
            l.sourceUrl ? "[/url]" : ""
          }\n`
      )
      .join("");

    this.bbCodeFooter = `Ending Bond: [B]${this._endBond}[/B]`;
  }

  public getOutput() {
    const config = this.bondStylingConfig;

    if (!config || !this.hasBBCodeOutput) return null;

    return `[size=1]${config.colorCode ? `[color=${config.colorCode}]` : ""}${
      config.preHeaderBBCode ?? ""
    }${`${this.pokemon.name || "(Unnamed)"} the ${
      this.pokemon.species || "(Unknown Pokemon)"
    }`}${config.iconImageLink ? `[img]${config.iconImageLink}[/img]` : ""}\n${
      this.bbCodeHeader
    }${config.postHeaderBBCode ?? ""}\n${this.bbCodeContents}${
      config.preFooterBBCode ?? ""
    }${this.bbCodeFooter}${config.postFooterBBCode ?? ""}${
      config.colorCode ? "[/color]" : ""
    }[/size]`;
  }
}
