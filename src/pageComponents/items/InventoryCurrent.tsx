import { Stack, Tabs, Box, Group, ActionIcon } from "@mantine/core";
import {
  InventoryLine,
  InventoryLineProps,
} from "~/pageComponents/items/InventoryLine";
import { IconType } from "react-icons";
import { ItemDefinition } from "~/orm/entities";
import { useMemo, useState } from "react";
import { InventoryCategoryLabel } from "~/pageComponents/items/InventoryCategoryLabel";
import { EditIcon } from "~/appIcons";

export type InventoryCurrentProps = {
  categories: string[];
  categoryIcons: Record<string, IconType>;
  data: Record<
    string,
    Record<ItemDefinition["name"], InventoryLineProps["data"]>
  >;
  isEditMode: boolean;
  onEditClick?: (itemDefId: number) => void;
};

export function InventoryCurrent({
  categories,
  categoryIcons,
  data,
  isEditMode,
  onEditClick,
}: InventoryCurrentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]
  );
  const categoryData = useMemo(
    () => (selectedCategory && data[selectedCategory]) || null,
    [data, selectedCategory]
  );
  return (
    <Tabs
      orientation="vertical"
      variant="outline"
      radius="xl"
      value={selectedCategory}
      onTabChange={(value) => setSelectedCategory(value ?? categories[0])}
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
          <Tabs.Tab key={`tab-${c}`} value={c}>
            <InventoryCategoryLabel
              key={`tab-label-${c}`}
              category={c}
              categoryIcons={categoryIcons}
            />
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Box
        sx={(theme) => ({
          width: "100%",
          border: "1px solid" + theme.colors.dark[4],
          borderLeft: "none",
          zIndex: 0,
        })}
      >
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
          {categoryData &&
            Object.values(categoryData).map((lineData) => (
              <Group
                key={`inv-group-${selectedCategory}-${lineData.itemDefId}`}
                position="apart"
                noWrap
              >
                <InventoryLine
                  key={`inv-line-${selectedCategory}-${lineData.itemDefId}`}
                  data={lineData}
                />
                {isEditMode && (
                  <ActionIcon
                    variant="default"
                    onClick={() => onEditClick?.(lineData.itemDefId)}
                  >
                    <EditIcon />
                  </ActionIcon>
                )}
              </Group>
            ))}
        </Stack>
      </Box>
    </Tabs>
  );
}
