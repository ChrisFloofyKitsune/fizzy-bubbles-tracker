import { InventoryCurrentProps } from "~/page-components/items/InventoryCurrent";
import { useMemo } from "react";
import { BBCodeArea } from "~/components";

export type InventoryBBCodeOutputProps = {
  data: InventoryCurrentProps["data"];
};
export function InventoryBBCodeOutput({ data }: InventoryBBCodeOutputProps) {
  const categories = useMemo(() => Object.keys(data), [data]);

  const bbcodeData: Record<string, string[]> = useMemo(() => {
    const result: typeof bbcodeData = {};

    for (const category of categories) {
      const categoryResult: string[] = [];

      for (const line of Object.values(data[category])) {
        const isShortForm = line.quantityChanges?.length === 1;

        let lineResult = `- ${
          !isShortForm || line.quantity! > 1 ? `x${line.quantity} ` : ""
        }${isShortForm ? `[URL=${line.quantityChanges?.[0].link}]` : ``}${
          line.name
        }${isShortForm ? "[/URL]" : ""}`;

        if (!isShortForm) {
          lineResult += ` (${line.quantityChanges
            ?.map(
              (qc) =>
                `${qc.link ? `[URL=${qc.link}]` : ""}${
                  qc.change > 0 ? "+" : ""
                }${qc.change}${qc.link ? "[/URL]" : ""}`
            )
            .join(", ")})`;
        }

        if (line.imageLink || line.description) {
          lineResult += `:${
            line.imageLink ? ` [IMG]${line.imageLink}[/IMG]` : ""
          }${line.description ? ` ${line.description}` : ""}`;
        }

        categoryResult.push(lineResult);
      }

      result[category] = categoryResult;
    }

    return result;
  }, [categories, data]);

  const bbCode = useMemo(
    () =>
      Object.entries(bbcodeData)
        .map(([category, lines]) =>
          [`[B]${category}[/B]:\n`]
            .concat(
              category === "Depleted" ? "[spoiler]" : "",
              lines.join("\n"),
              category === "Depleted" ? "[/spoiler]" : ""
            )
            .filter((l) => !!l)
            .join("")
        )
        .join("\n\n"),
    [bbcodeData]
  );

  return <BBCodeArea label={"Inventory"} bbCode={bbCode} />;
}
