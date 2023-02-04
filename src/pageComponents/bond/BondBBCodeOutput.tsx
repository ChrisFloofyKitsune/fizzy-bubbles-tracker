import { BondLog, BondStylingConfig } from "~/orm/entities";
import { Pokemon } from "~/orm/entities";
import { useMemo } from "react";
import { BBCodeArea } from "~/components";
import { LocalDateFormatter } from "~/util";

export interface BondBbCodeOutputProps {
  bondLogs: BondLog[];
  bondConfigs: BondStylingConfig[];
  pokemonList: Pick<Pokemon, "uuid" | "name" | "species">[];
}
export function BondBbCodeOutput({
  bondLogs,
  bondConfigs,
  pokemonList,
}: BondBbCodeOutputProps) {
  const uuidToLabel: Record<string, string> = useMemo(
    () =>
      Object.assign(
        {},
        ...pokemonList.map((pkm) => ({
          [pkm.uuid]: `${pkm.name || "(Unnamed)"} the ${
            pkm.species || "(Unknown Pokemon)"
          }`,
        }))
      ),
    [pokemonList]
  );

  const bbCode: string = useMemo(() => {
    const results: (string | null)[] = bondConfigs.map((c) => {
      const pastLogs: BondLog[] = [];
      const currentLogs: BondLog[] = [];

      bondLogs
        .filter((l) => (l.pokemon as any) === c.pokemonUuid)
        .forEach((l) => {
          if (l.verifiedInShopUpdate) {
            pastLogs.push(l);
          } else {
            currentLogs.push(l);
          }
        });

      if (currentLogs.length === 0) {
        return null;
      }

      const label = uuidToLabel[c.pokemonUuid];
      const startBond = pastLogs.reduce(
        (total, log) => Math.min(30, total + log.value),
        0
      );

      const endBond = currentLogs.reduce(
        (total, log) => Math.min(30, total + log.value),
        startBond
      );

      const startLink =
        pastLogs.length > 0
          ? pastLogs.reduce((latestLog, log) =>
              log.date.valueOf() >= latestLog.date.valueOf() ? log : latestLog
            ).sourceUrl
          : null;

      const lines = currentLogs.map(
        (l) =>
          `${l.sourceUrl ? `[url=${l.sourceUrl}]` : ""}${
            l.value > 0 ? "+" : ""
          }${l.value} - ${l.sourceNote} (${l.date.format(LocalDateFormatter)})${
            l.sourceUrl ? "[/url]" : ""
          }\n`
      );

      return `${c.colorCode ? `[color=${c.colorCode}]` : ""}${
        c.preHeaderBBCode ?? ""
      }${label}${
        c.iconImageLink ? `[img]${c.iconImageLink}[/img]` : ""
      }\nStarting Bond: ${startLink ? `[url=${startLink}]` : ""}${startBond}${
        startLink ? "[/url]" : ""
      }${c.postHeaderBBCode ?? ""}\n${lines.join("")}${
        c.preFooterBBCode ?? ""
      }Ending Bond: [B]${endBond}[/B]${c.postFooterBBCode ?? ""}${
        c.colorCode ? "[/color]" : ""
      }`;
    });

    return `[size=1]${results.filter((r) => !!r).join("\n\n") || ""}[/size]`;
  }, [bondConfigs, bondLogs, uuidToLabel]);

  return <BBCodeArea label="Bond Output" bbCode={bbCode} />;
}
