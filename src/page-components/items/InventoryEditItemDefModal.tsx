import { ContextModalProps } from "@mantine/modals";
import { ItemDefinition } from "~/orm/entities";
import { Button, Group, Select, Stack } from "@mantine/core";
import { useMemo, useState } from "react";
import { IconType } from "react-icons";
import { CancelIcon, SaveIcon } from "~/appIcons";
import { uniqueOnProp } from "~/util";
import { AvatarIconImage } from "~/components/AvatarIconImage";
import {
  ItemCategorySelectItem,
  ItemCategorySelectItemProps,
  ItemDefSelectItem,
  ItemDefSelectItemProps,
} from "~/page-components/items/InventorySelectItems";

export type InventoryEditItemDefModalContext = {
  existingItemDef?: ItemDefinition;
  availableItemDefs: ItemDefinition[];
  categoryIcons: Record<string, IconType>;
  onSaveCallback: (itemDefinition?: ItemDefinition) => Promise<void>;
};
export function InventoryEditItemDefModal({
  context,
  id: modalId,
  innerProps,
}: ContextModalProps<InventoryEditItemDefModalContext>) {
  const categoryData: ItemCategorySelectItemProps[] = useMemo(
    () =>
      innerProps.availableItemDefs
        .map((def) => ({
          value: def.category || "Uncategorized",
          label: def.category || "Uncategorized",
          categoryIcons: innerProps.categoryIcons,
        }))
        .filter(uniqueOnProp("value")),
    [innerProps.availableItemDefs, innerProps.categoryIcons]
  );

  const defsMap: Map<string, ItemDefinition> = useMemo(
    () =>
      new Map(
        innerProps.availableItemDefs.map((def) => [def.id.toString(), def])
      ),
    [innerProps.availableItemDefs]
  );

  const defData: ItemDefSelectItemProps[] = useMemo(
    () =>
      innerProps.availableItemDefs.map((def) => ({
        value: def.id.toString(),
        label: def.name,
        itemDefinition: def,
      })),
    [innerProps.availableItemDefs]
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    innerProps.existingItemDef?.category
      ? innerProps.existingItemDef.category || "Uncategorized"
      : null
  );
  const [selectedDef, setSelectedDef] = useState<string | null>(
    innerProps.existingItemDef?.id?.toString() ?? null
  );

  const filteredDefs = useMemo(
    () =>
      defData.filter(
        (d) =>
          (d.itemDefinition.category || "Uncategorized") === selectedCategory
      ),
    [selectedCategory, defData]
  );

  return (
    <Stack>
      <Select
        itemComponent={ItemCategorySelectItem}
        data={categoryData}
        searchable
        nothingFound="No matching categories"
        value={selectedCategory}
        onChange={(category) => {
          setSelectedCategory(category);
          if (selectedDef && defsMap.get(selectedDef)?.category !== category) {
            setSelectedDef(
              defData.find((def) => def.itemDefinition.category == category)
                ?.value ?? null
            );
          }
        }}
        icon={
          selectedCategory &&
          innerProps.categoryIcons[selectedCategory]({ size: 24 })
        }
        filter={(value, item: ItemCategorySelectItemProps) =>
          item.value.toLowerCase().includes(value.toLowerCase().trim())
        }
      />
      <Select
        itemComponent={ItemDefSelectItem}
        data={filteredDefs}
        searchable
        nothingFound="No matching items"
        value={selectedDef}
        onChange={setSelectedDef}
        filter={(value, item: ItemDefSelectItemProps) =>
          item.itemDefinition.name
            .toLowerCase()
            .includes(value.toLowerCase().trim()) ||
          (item.itemDefinition.description
            ?.toLowerCase()
            .includes(value.toLowerCase().trim()) ??
            false)
        }
        icon={
          <AvatarIconImage
            imageLink={
              selectedDef ? defsMap.get(selectedDef)?.imageLink : undefined
            }
          />
        }
        styles={{
          icon: {
            margin: "0 0.25em",
          },
        }}
      />
      <Group position="right">
        <Button
          variant="outline"
          color="yellow"
          onClick={() => context.closeModal(modalId)}
          leftIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          color="green"
          onClick={async () => {
            await innerProps.onSaveCallback?.(
              selectedDef ? defsMap.get(selectedDef) : undefined
            );
            context.closeModal(modalId);
          }}
          leftIcon={<SaveIcon />}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
}
