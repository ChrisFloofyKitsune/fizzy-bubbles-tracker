import {Stack, Tabs, Text} from "@mantine/core";
import {
  InventoryLine,
  InventoryLineProps,
} from "~/pageComponents/InventoryLine";
import {IconType} from "react-icons";
import {ItemDefinition} from "~/orm/entities";

export type InventoryCurrentProps = {
  categories: string[];
  categoryIcons: Record<string, IconType>;
  data: Record<ItemDefinition["category"],
    Record<ItemDefinition["name"], InventoryLineProps["data"]>>;
};

export function InventoryCurrent({
  categories,
  categoryIcons,
  data,
}: InventoryCurrentProps) {
  return (
    <Tabs
      orientation="vertical"
      variant="outline"
      radius="xl"
      defaultValue={categories[0]}
      styles={(theme) => ({
        tab: {
          "&[data-active]": {
            backgroundColor: theme.colors.dark[6],
            "::before": {
              backgroundColor: theme.colors.dark[6],
            },
          },
        },
        panel: {
          backgroundColor: theme.colors.dark[7],
          border: "1px solid" + theme.colors.dark[4],
          borderLeft: "none",
        },
      })}
    >
      <Tabs.List>
        {categories.map((c) => (
          <Tabs.Tab
            icon={categoryIcons[c]?.({size: 30}) ?? null}
            key={`tab-${c}`}
            value={c}
          >
            <Text size="1.125em" weight={500}>
              {c}
            </Text>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {categories.map((c) => (
        <Tabs.Panel key={`panel-${c}`} value={c}>
          <Stack
            spacing="0"
            sx={(theme) => ({
              ">.mantine-Group-root": {
                padding: "0.1em 0.5em",
              },
              ">:nth-of-type(2n)": {
                backgroundColor: theme.colors.dark[6],
              },
            })}
          >
            {!data[c]
              ? "loading?"
              : Object.values(data[c]).map((lineData) => (
                <InventoryLine
                  key={`inv-line-${lineData.name}`}
                  data={lineData}
                />
              ))}
          </Stack>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}