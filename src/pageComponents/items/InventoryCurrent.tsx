import {
  Stack,
  Tabs,
  Box,
  Group,
  ActionIcon,
  Title,
  Badge,
  Center,
  Text,
} from "@mantine/core";
import {
  InventoryLine,
  InventoryLineProps,
} from "~/pageComponents/items/InventoryLine";
import { IconType } from "react-icons";
import { ItemDefinition } from "~/orm/entities";
import { useMemo, useState } from "react";
import { InventoryCategoryLabel } from "~/pageComponents/items/InventoryCategoryLabel";
import { DeleteIcon, EditIcon } from "~/appIcons";
import { openConfirmModal } from "@mantine/modals";

export type InventoryCurrentProps = {
  categories: string[];
  categoryIcons: Record<string, IconType>;
  data: Record<
    string,
    Record<ItemDefinition["name"], InventoryLineProps["data"]>
  >;
  isEditMode: boolean;
  onEditClick?: (itemDefId: number) => void;
  onConfirmedDelete?: (itemDefId: number) => Promise<void>;
};

export function InventoryCurrent({
  categories,
  categoryIcons,
  data,
  isEditMode,
  onEditClick,
  onConfirmedDelete,
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
        {Object.keys(data).map((c) => (
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
          spacing={0}
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
                  <Group
                    key={`inv-buttons-${selectedCategory}-${lineData.itemDefId}`}
                    noWrap
                  >
                    <ActionIcon
                      variant="default"
                      onClick={() => onEditClick?.(lineData.itemDefId)}
                    >
                      <EditIcon />
                    </ActionIcon>
                    <ActionIcon
                      variant="filled"
                      color="red"
                      onClick={() =>
                        openConfirmModal({
                          title: (
                            <Badge color="red" size="xl" sx={{ height: "4em" }}>
                              <Title>Confirm Item Deletion</Title>
                            </Badge>
                          ),
                          children: (
                            <Center>
                              <Text size="xl" weight="bold">
                                Deletion cannot be undone!
                              </Text>
                            </Center>
                          ),
                          withCloseButton: false,
                          styles: {
                            modal: {
                              width: "min-content",
                            },
                          },
                          centered: true,
                          labels: {
                            cancel: "Cancel",
                            confirm: "DELETE",
                          },
                          groupProps: {
                            position: "center",
                          },
                          cancelProps: {
                            size: "lg",
                            variant: "outline",
                            color: "yellow",
                          },
                          confirmProps: {
                            size: "lg",
                            color: "red",
                          },
                          onConfirm: async () =>
                            await onConfirmedDelete?.(lineData.itemDefId),
                        })
                      }
                    >
                      <DeleteIcon />
                    </ActionIcon>
                  </Group>
                )}
              </Group>
            ))}
        </Stack>
      </Box>
    </Tabs>
  );
}
