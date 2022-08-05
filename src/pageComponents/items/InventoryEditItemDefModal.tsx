import { ContextModalProps } from "@mantine/modals";
import { ItemDefinition } from "~/orm/entities";
import { Group, Button, Stack, Select } from "@mantine/core";
import { ComponentPropsWithoutRef, forwardRef, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { InventoryCategoryLabel } from "~/pageComponents/items/InventoryCategoryLabel";
import { InventoryLine } from "~/pageComponents/items/InventoryLine";
import { CancelIcon, SaveIcon } from "~/appIcons";
import { uniqueOnProp } from "~/util";
import { ItemDefinitionImage } from "~/pageComponents/items/ItemDefinitionImage";

interface ItemCategorySelectItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  categoryIcons: Record<string, IconType>;
}

const ItemCategorySelectItem = forwardRef<
  HTMLDivElement,
  ItemCategorySelectItemProps
>(({ value, categoryIcons, ...others }, ref) => (
  <div ref={ref} {...others}>
    <InventoryCategoryLabel category={value} categoryIcons={categoryIcons} />
  </div>
));
ItemCategorySelectItem.displayName = "ItemCategorySelectItem";

interface ItemDefSelectItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  itemDefinition: ItemDefinition;
}

const ItemDefSelectItem = forwardRef<HTMLDivElement, ItemDefSelectItemProps>(
  ({ itemDefinition, ...others }, ref) => (
    <div ref={ref} {...others}>
      <InventoryLine
        data={{
          id: 0,
          name: itemDefinition?.name ?? "Unnamed Item",
          description: itemDefinition?.description ?? "",
          imageLink: itemDefinition?.imageLink ?? null,
        }}
      />
    </div>
  )
);
ItemDefSelectItem.displayName = "ItemDefSelectItem";

type SelectedDefImageProps = {
  def?: ItemDefinition;
};
function SelectedDefImage({ def }: SelectedDefImageProps) {
  return def && def.imageLink ? (
    <ItemDefinitionImage imageSource={def.imageLink} />
  ) : (
    <></>
  );
}

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
        nothingFound="No matches"
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
        filter={(value, item) => true}
      />
      <Select
        itemComponent={ItemDefSelectItem}
        data={filteredDefs}
        searchable
        nothingFound="No matches"
        value={selectedDef}
        onChange={setSelectedDef}
        filter={(value, item) => true}
        icon={
          <SelectedDefImage
            def={selectedDef ? defsMap.get(selectedDef) : undefined}
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
