import { CellObject, read, utils, WorkBook } from "xlsx";
import { ItemLog, ItemDefinition } from "~/orm/entities";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
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

  // logResults = logResults.filter((l) => !!l.itemDefinition);
  // definitionResults = definitionResults
  //   .filter((r) => !!r.category)
  //   .filter(uniqueOnProp("name"));

  return {
    logs: logResults,
    definitions: definitionResults,
  };
}
