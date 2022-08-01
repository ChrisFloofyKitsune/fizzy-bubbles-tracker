import { CellObject, read, utils, WorkBook } from "xlsx";
import { ItemLog, ItemDefinition } from "~/orm/entities";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { uniqueOnProp } from "~/util";
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

export function cellToUTC(cellValue: number): Dayjs {
  return dayjs.utc("1900").add(cellValue - 2, "day");
}

export function getItemLogsFromWorkBook(
  workBook: WorkBook
): { logs: ItemLog[]; definitions: ItemDefinition[] } | null {
  const namedRangeRef = workBook.Workbook?.Names?.find((n) =>
    n.Name.toLowerCase().includes("itemlog")
  )?.Ref;
  if (!namedRangeRef) return null;
  let [sheetName, range] = namedRangeRef.split("!");
  sheetName = sheetName.slice(1, -1);
  const sheet = workBook.Sheets[sheetName];
  const { s: start, e: end } = utils.decode_range(range);
  const idx = {
    quantity: start.c,
    itemName: start.c + 1,
    category: start.c + 2,
    description: start.c + 3,
    source: start.c + 4,
    date: start.c + 5,
    link: start.c + 6,
  };

  let logResults: ItemLog[] = [];
  let definitionResults: ItemDefinition[] = [];

  for (let row = start.r; row <= end.r; row++) {
    function cell<R extends T, T = undefined>(
      c: number,
      defaultValue?: T
    ): T extends undefined ? CellObject["v"] : R {
      return sheet[utils.encode_cell({ r: row, c })]?.v ?? defaultValue;
    }
    const log = new ItemLog();
    const definition = new ItemDefinition();

    log.quantityChange = cell(idx.quantity, 0);
    definition.name = log.itemDefinitionId = cell(idx.itemName, "");
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

    log.sourceNote = cell(idx.source, "");
    log.date = cellToUTC(cell(idx.date) as number);
    log.sourceUrl = cell(idx.link, "");

    logResults.push(log);
    definitionResults.push(definition);
  }

  logResults = logResults.filter((l) => !!l.itemDefinitionId);
  definitionResults = definitionResults
    .filter(uniqueOnProp("name"))
    .filter((r) => !!r.category);
  logResults.forEach(
    (l) =>
      (l.itemDefinition =
        definitionResults.find((d) => d.name === l.itemDefinitionId) ?? null)
  );
  return {
    logs: logResults,
    definitions: definitionResults,
  };
}
