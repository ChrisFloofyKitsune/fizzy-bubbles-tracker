import { BondStylingConfig } from "~/orm/entities";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Box, Divider, Group, Stack, TextInput } from "@mantine/core";

export interface BondConfigEditorProps {
  bondConfigs: BondStylingConfig[];
  onChange: (
    config: BondStylingConfig,
    prop: keyof BondStylingConfig,
    value: BondStylingConfig[typeof prop]
  ) => void;
}
export function BondConfigEditor({
  bondConfigs,
  onChange,
}: BondConfigEditorProps) {
  const rowPropList: BondConfigEditorRowProps[] = useMemo(
    () =>
      bondConfigs.map((config) => ({
        bondConfig: config,
        onChange: (prop, value) => onChange(config, prop, value),
      })),
    [bondConfigs, onChange]
  );

  return (
    <Box
      px="1em"
      sx={{
        width: "max-content",
        display: "grid",
        gridAutoFlow: "row",
        gridAutoRows: "60px",
      }}
    >
      {rowPropList.map((rowProps, index) => (
        <BondConfigEditorRow key={index} {...rowProps} />
      ))}
    </Box>
  );
}

const propList: [keyof BondStylingConfig, string][] = [
  ["colorCode", "Color Code"],
  ["iconImageLink", "Icon Image Link"],
  ["preHeaderBBCode", "Pre-Header BBCode"],
  ["postHeaderBBCode", "Post-Header BBCode"],
  ["preFooterBBCode", "Pre-Footer BBCode"],
  ["postFooterBBCode", "Post-Footer BBCode"],
];
interface BondConfigEditorRowProps {
  bondConfig: BondStylingConfig;
  onChange: (
    prop: keyof BondStylingConfig,
    value: BondStylingConfig[typeof prop]
  ) => void;
}
function BondConfigEditorRow({
  bondConfig,
  onChange,
}: BondConfigEditorRowProps) {
  const propToState: Record<
    string,
    [string, Dispatch<SetStateAction<string>>]
  > = {};
  for (const [prop, _] of propList) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    propToState[prop] = useState<string>(
      (bondConfig[prop as keyof BondStylingConfig] as string | null) ?? ""
    );
  }

  return (
    <Stack spacing={0}>
      <Group spacing="0.5em">
        {propList.map(([prop, label], i) => (
          <>
            <TextInput
              key={prop}
              size="xs"
              my={0}
              label={label}
              value={propToState[prop][0]}
              onChange={(event) => {
                const value = event.currentTarget.value;
                propToState[prop][1](value);
                onChange(prop, value);
              }}
            />
            {i === 1 && <Divider key={"divider"} orientation="vertical" />}
          </>
        ))}
      </Group>
    </Stack>
  );
}
