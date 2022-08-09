import { CellObject, read, utils, WorkBook } from "xlsx";
import {
  BondLog,
  ContestStatLog,
  EggMoveLog,
  ItemDefinition,
  ItemLog,
  LevelLog,
  LevelUpMove,
  MachineMoveLog,
  OtherMoveLog,
  Pokemon,
  TutorMoveLog,
  WalletLog,
} from "~/orm/entities";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { CurrencyType, PokemonContestStat } from "~/orm/enums";
import { findLastIndex } from "~/util";

dayjs.extend(utc);

export async function fileToWorkBook(
  fileInput: File | null
): Promise<WorkBook | null> {
  if (!fileInput) return null;
  try {
    return read(await fileInput.arrayBuffer(), { type: "array" });
  } catch {
    return null;
  }
}

export function cellToUTC(
  cellValue: number | string | null | undefined
): Dayjs {
  if (typeof cellValue === "undefined" || cellValue === null) {
    return dayjs().utc();
  }
  if (typeof cellValue === "string") {
    return dayjs.utc(cellValue, "D/M/YYYY");
  }
  return dayjs.utc("1900").add(cellValue - 2, "day");
}

export function extractInventory(
  workBook: WorkBook
): { logs: ItemLog[]; definitions: ItemDefinition[] } | null {
  const namedRangeRef = workBook.Workbook?.Names?.find((n) =>
    n.Name.toLowerCase().includes("itemlog")
  )?.Ref;
  if (!namedRangeRef) return null;
  let [sheetName, range] = namedRangeRef.split("!");
  sheetName = sheetName.slice(1, -1);
  const sheet = workBook.Sheets[sheetName];
  const { s, e } = utils.decode_range(range);
  const idx = {
    quantity: s.c,
    itemName: s.c + 1,
    category: s.c + 2,
    description: s.c + 3,
    source: s.c + 4,
    date: s.c + 5,
    link: s.c + 6,
  };

  let logResults: ItemLog[] = [];
  let definitionResults: ItemDefinition[] = [];

  for (let row = s.r; row <= e.r; row++) {
    function cell<R extends T, T = undefined>(
      c: number,
      defaultValue?: T
    ): T extends undefined ? CellObject["v"] : R {
      return sheet[utils.encode_cell({ r: row, c })]?.v ?? defaultValue;
    }

    const itemName = cell(idx.itemName, "");
    if (!itemName) continue;

    let definition = definitionResults.find((d) => d.name === itemName);
    if (!definition) {
      definition = new ItemDefinition();
      definition.name = itemName;
      definition.category = cell(idx.category, "");
      definition.description = cell(idx.description, "");

      let match = definition.description.match(
        /\[IMG](?<link>.+?)\[\/IMG](?<desc>.+)$/i
      );
      if (!!match?.groups) {
        const imageLink = match.groups["link"];
        const description = match.groups["desc"];
        definition.imageLink = imageLink;
        definition.description = description.trim();
      }

      definitionResults.push(definition);
    }

    const log = new ItemLog();
    log.itemDefinition = definition;
    log.quantityChange = cell(idx.quantity, 0);
    log.sourceNote = cell(idx.source, "");
    log.date = cellToUTC(cell(idx.date) as number);
    log.sourceUrl = cell(idx.link, "");

    logResults.push(log);
  }

  return {
    logs: logResults,
    definitions: definitionResults,
  };
}

export function sheetRefToNameAndRange(
  sheetRef: string
): [sheet: string, range: string] {
  let [sheet, range] = sheetRef.split("!");
  return [sheet.slice(1, -1), range];
}

export function extractNamedRange(workBook: WorkBook, regex: RegExp) {
  const namedRangeRef = workBook.Workbook?.Names?.find((n) =>
    n.Name.match(regex)
  )?.Ref;
  if (!namedRangeRef) return null;
  let [sheetName, range] = sheetRefToNameAndRange(namedRangeRef);
  return extractRange(workBook, sheetName, range);
}

export function extractRange(
  workBook: WorkBook,
  sheetName: string,
  range: string
) {
  const sheet = workBook.Sheets[sheetName];
  if (!sheet) return null;

  const { s, e } = utils.decode_range(range);
  let results = [];
  for (let row = s.r; row <= e.r; row++) {
    let rowResult = [];
    for (let col = s.c; col <= e.c; col++) {
      rowResult.push(
        sheet[utils.encode_cell({ r: row, c: col })]?.v as CellObject["v"]
      );
    }
    results.push(rowResult);
  }

  return results.filter((row) => row.some((v) => !!v));
}

export function extractWallet(workBook: WorkBook) {
  let results: WalletLog[] = [];

  const pokedollarLogs = extractNamedRange(workBook, /^TrainerWallet$/);
  const wattLogs = extractNamedRange(workBook, /^TrainerWatts$/);
  const rareCandyLogs = extractNamedRange(workBook, /^TrainerRareCandies$/);

  function extractRows(rows: CellObject["v"][][], currencyType: CurrencyType) {
    let rowResults = [];
    for (const row of rows) {
      const log = new WalletLog();
      log.currencyType = currencyType;
      log.quantityChange = row[0] as number;
      log.sourceNote = (row[1] ?? "") as string;
      log.date = cellToUTC(row[2] as number);
      log.sourceUrl = (row[3] ?? "") as string;
      log.verifiedInShopUpdate = !!row[4];
      rowResults.push(log);
    }
    const lastVerifiedIdx = findLastIndex(
      rowResults,
      (l) => l.verifiedInShopUpdate
    );

    for (let i = 0; i < lastVerifiedIdx; i++) {
      rowResults[i].verifiedInShopUpdate = true;
    }

    return rowResults;
  }

  if (pokedollarLogs) {
    results = results.concat(
      extractRows(pokedollarLogs, CurrencyType.POKE_DOLLAR)
    );
  }

  if (wattLogs) {
    results = results.concat(extractRows(wattLogs, CurrencyType.WATTS));
  }

  if (rareCandyLogs) {
    results = results.concat(
      extractRows(rareCandyLogs, CurrencyType.RARE_CANDY)
    );
  }

  return results;
}

export function extractPokemonSheet(workBook: WorkBook, sheetName: string) {
  const sheet = workBook.Sheets[sheetName];
  if (!sheet) return null;
  try {
    function cell(ref: string): string {
      const value = sheet[ref]?.v;
      return value ? String(value) : "";
    }
    const pkm = new Pokemon();

    pkm.name = cell("A2");
    pkm.species = cell("B2");
    pkm.dexNum = cell("C2");

    pkm.type = cell("A4");
    pkm.ability = cell("B4");
    pkm.obtained = cell("C4");
    pkm.pokeball = cell("D4");
    pkm.heldItem = cell("E4");

    pkm.nature = cell("A6");
    pkm.ability = cell("B6");
    pkm.obtainedLink = cell("C6");
    pkm.pokeballLink = cell("D6");
    pkm.heldItemLink = cell("E6");

    pkm.evolutionStageOne = cell("A8");
    pkm.evolutionStageTwoMethod = cell("B8");
    pkm.evolutionStageTwo = cell("C8");
    pkm.evolutionStageThreeMethod = cell("D8");
    pkm.evolutionStageThree = cell("E8");

    pkm.evolutionStageTwoMethodLink = cell("B10");
    pkm.evolutionStageThreeMethodLink = cell("D10");

    pkm.boutiqueMods = cell("A12");
    pkm.boutiqueModsLink = cell("D12");
    pkm.imageLink = cell("E12");

    pkm.bbcodeDescription = cell("A18");

    function range(range: string) {
      return extractRange(workBook, sheetName, range);
    }

    const levelLogRows = range("G3:H200");
    pkm.levelLogs = levelLogRows
      ? levelLogRows.map((row) => {
          const log = new LevelLog();
          log.pokemon = pkm;
          log.value = row[0] as number;
          log.sourceUrl = row[1] as string;
          return log;
        })
      : [];

    const contestStatLogRows = range("I3:K200");
    pkm.contestStatsLogs = contestStatLogRows
      ? contestStatLogRows.map((row) => {
          const log = new ContestStatLog();
          log.pokemon = pkm;
          log.stat =
            Object.values(PokemonContestStat).find(
              (stat) => stat.toLowerCase() === (row[0] as string).toLowerCase()
            ) ?? PokemonContestStat.ALL;
          log.statChange = row[1] as number;
          log.sourceUrl = row[2] as string;
          return log;
        })
      : [];

    const levelUpMoveRows = range("L3:M200");
    pkm.levelUpMoves = levelUpMoveRows
      ? levelUpMoveRows.map((row) => {
          const move = new LevelUpMove();
          move.move = row[0] as string;
          const levelText = String(row[1]);
          const levelNum = parseInt(levelText);
          move.level = isNaN(levelNum)
            ? levelText.toLowerCase() === "evolve"
              ? "evolve"
              : "-"
            : `${levelNum}`;
          return move;
        })
      : [];

    const eggMoveRows = range("N3:O200");
    pkm.eggMoveLogs = eggMoveRows
      ? eggMoveRows.map((row) => {
          const log = new EggMoveLog();
          log.pokemon = pkm;
          log.move = row[0] as string;
          log.sourceUrl = row[1] as string;
          return log;
        })
      : [];

    const machineMoveRows = range("P3:Q200");
    pkm.machineMoveLogs = machineMoveRows
      ? machineMoveRows.map((row) => {
          const log = new MachineMoveLog();
          log.pokemon = pkm;
          log.move = row[0] as string;
          log.sourceUrl = row[1] as string;
          return log;
        })
      : [];

    const tutorMoveRows = range("R3:S200");
    pkm.tutorMoveLogs = tutorMoveRows
      ? tutorMoveRows.map((row) => {
          const log = new TutorMoveLog();
          log.pokemon = pkm;
          log.move = row[0] as string;
          log.sourceUrl = row[1] as string;
          return log;
        })
      : [];

    const otherMoveRows = range("T3:U200");
    pkm.otherMoveLogs = otherMoveRows
      ? otherMoveRows.map((row) => {
          const log = new OtherMoveLog();
          log.pokemon = pkm;
          log.move = row[0] as string;
          log.sourceUrl = row[1] as string;
          return log;
        })
      : [];

    try {
      const bondLogs = extractRange(workBook, "Bond Tracker", "H1:M1000");
      if (bondLogs) {
        const currentBondPost = (
          workBook.Sheets["Bond Tracker"]["M1"] as CellObject
        ).v as string;

        pkm.bondLogs = bondLogs
          .map((log) => {
            const forPokemon = log[0] as string;
            if (!(pkm.name && forPokemon.includes(pkm.name))) return null;
            const newLog = new BondLog();

            newLog.pokemon = pkm;
            newLog.value = log[1] as number;
            newLog.sourceNote = log[2] as string;
            newLog.date = cellToUTC(log[3] as any);
            newLog.sourceUrl = log[4] as string;
            newLog.verifiedInShopUpdate =
              (log[5] as string) !== currentBondPost;

            return newLog;
          })
          .filter((l) => l !== null) as BondLog[];
      }
    } catch (err) {
      console.warn("Could not load bond logs for ", pkm.name, err);
    }

    return pkm;
  } catch (err) {
    console.error("Could not extract pokemon sheet!", err);
    return null;
  }
}

export function findPokemonSheets(workBook: WorkBook) {
  const sheetNameList = extractRange(
    workBook,
    "Pokemon Sheets Output",
    "C2:C200"
  );
  return sheetNameList?.flat() as string[];
}
