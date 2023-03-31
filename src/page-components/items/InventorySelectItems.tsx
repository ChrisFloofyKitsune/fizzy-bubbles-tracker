import { ComponentPropsWithoutRef, forwardRef } from "react";
import { ItemDefinition } from "~/orm/entities";
import { InventoryLine } from "~/page-components/items/InventoryLine";
import { InventoryCategoryLabel } from "~/page-components/items/InventoryCategoryLabel";
import { IconType } from "react-icons";

interface ItemCategorySelectItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  label: string;
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
  label: string;
  itemDefinition: ItemDefinition;
}

const ItemDefSelectItem = forwardRef<HTMLDivElement, ItemDefSelectItemProps>(
  ({ itemDefinition, ...others }, ref) => (
    <div ref={ref} {...others}>
      <InventoryLine
        data={{
          itemDefId: 0,
          name: itemDefinition?.name ?? "Unnamed Item",
          description: itemDefinition?.description ?? "",
          imageLink: itemDefinition?.imageLink ?? null,
        }}
      />
    </div>
  )
);
ItemDefSelectItem.displayName = "ItemDefSelectItem";

export type { ItemDefSelectItemProps, ItemCategorySelectItemProps };
export { ItemDefSelectItem, ItemCategorySelectItem };
