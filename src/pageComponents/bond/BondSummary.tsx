import { BondLog, BondStylingConfig, Pokemon } from "~/orm/entities";
import { Anchor, Box, Group, Paper, Text } from "@mantine/core";
import { AvatarIconImage } from "~/components/AvatarIconImage";
import { WrapIf } from "~/util";
import { useMemo } from "react";

export interface BondSummaryProps {
  bondLogs: BondLog[];
  bondConfigs: BondStylingConfig[];
  pokemonList: Pick<Pokemon, "uuid" | "name" | "species">[];
}
export function BondSummary({
  bondLogs,
  bondConfigs,
  pokemonList,
}: BondSummaryProps) {
  const rowData: BondSummaryRowProps[] = useMemo(() => {
    const result: typeof rowData = [];

    bondConfigs.map((config) => {
      const pkm = pokemonList.find((p) => p.uuid === config.pokemonUuid);
      const label = pkm
        ? `${pkm.name || "(Unnamed)"} the ${pkm.species || "(Unknown Pokemon)"}`
        : "ERR: Pokemon Missing!";
      const bondTotal = bondLogs
        .filter((log) => (log.pokemon as any) === config.pokemonUuid)
        .reduce((total, log) => Math.min(30, total + log.value), 0);
      const bondLink = bondLogs[bondLogs.length - 1]?.sourceUrl ?? null;

      result.push({
        label,
        color: config.colorCode,
        iconImageLink: config.iconImageLink,
        bondTotal,
        bondLink,
      });
    });

    return result;
  }, [bondLogs, bondConfigs, pokemonList]);

  return (
    <Paper
      sx={{
        backgroundColor: "#252525",
        color: "#ccc",
      }}
    >
      <Box
        px="1em"
        pt="0.5em"
        sx={{
          display: "grid",
          gridAutoFlow: "row",
          gridAutoRows: "60px",
        }}
      >
        {rowData
          ? rowData.map((data) => <BondSummaryRow key={data.label} {...data} />)
          : "No Pokemon"}
      </Box>
    </Paper>
  );
}

interface BondSummaryRowProps {
  label: string;
  color: string | null;
  iconImageLink: string | null;
  bondTotal: number;
  bondLink: string | null;
}
function BondSummaryRow({
  label,
  color,
  iconImageLink,
  bondTotal,
  bondLink,
}: BondSummaryRowProps) {
  return (
    <Group key={`${label}-group`} spacing="sm" noWrap>
      {iconImageLink && (
        <AvatarIconImage
          key={`${label}-icon-image`}
          imageLink={iconImageLink}
        />
      )}
      <Text
        key={`${label}-text`}
        sx={{
          color: color ? color : undefined,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Text>
      <Text ml="auto">
        {
          <WrapIf
            key={`${label}-wrap-if`}
            wrapIf={!!bondLink}
            wrap={(wrapped) => (
              <Anchor key={`${label}-link`} href={bondLink!}>
                {wrapped}
              </Anchor>
            )}
          >
            <>{bondTotal}</>
          </WrapIf>
        }
      </Text>
    </Group>
  );
}
