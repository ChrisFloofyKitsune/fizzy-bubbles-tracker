import { ItemDefinition, ItemLog } from "~/orm/entities";
import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { v4 as uuid } from "uuid";
import { AvatarIconImage } from "~/components";
import { AddIcon } from "~/appIcons";
import { Group, Select, Text } from "@mantine/core";
import { OpenCreateItemDefModal } from "~/page-components/post-summaries/CreateItemDefModal";
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";

export function createItemDefinitionSelectConfig(
  availableItemDefs: ItemDefinition[],
  headerLabel: string,
  order?: number
): PropConfigEntry<ItemLog, "itemDefinition"> {
  const createItemDefValue = uuid();
  const selectItems: ItemDefSelectItemProps[] = availableItemDefs.map(
    (def) => ({
      label: def.name,
      group: def.category ?? "Uncategorized",
      imageComponent: !!def.imageLink ? (
        <AvatarIconImage imageLink={def.imageLink} />
      ) : null,
      value: def.id.toString(),
    })
  );
  selectItems.unshift({
    label: "Create new Item Definition",
    group: " ",
    imageComponent: (
      <AddIcon
        style={{
          verticalAlign: "text-bottom",
          marginRight: "0.5em",
        }}
      />
    ),
    value: createItemDefValue,
  });

  return {
    headerLabel,
    order,
    viewComponent: (value) => (
      <Text>
        {value?.imageLink && <AvatarIconImage imageLink={value.imageLink} />}
        {value?.name ?? "Select an Item Def"}
      </Text>
    ),
    editorComponent: (value, onChange) => (
      <Select
        searchable
        placeholder="Select Or Create Item Definition"
        itemComponent={ItemDefSelectItem}
        data={selectItems}
        icon={
          value?.imageLink && <AvatarIconImage imageLink={value.imageLink} />
        }
        value={value?.id.toString()}
        onChange={async (selectValue) => {
          if (selectValue === createItemDefValue) {
            OpenCreateItemDefModal({
              onSubmit: onChange,
            });
          } else {
            await onChange(
              availableItemDefs.find(
                (def) => def.id.toString() === selectValue
              ) ?? null
            );
          }
        }}
        withinPortal
        styles={{
          separator: {
            "&:first-of-type": {
              display: "none",
            },
          },
          dropdown: {
            width: "max(200px, 30vw) !important",
          },

          input: {
            minHeight: "unset",
            height: "2em",
          },
        }}
        creatable
        getCreateLabel={(query) => (
          <Group spacing="xs">
            <AddIcon
              style={{
                verticalAlign: "text-bottom",
                marginRight: "0.5em",
              }}
            />
            {`Create Item "${query}"`}
          </Group>
        )}
        onCreate={(query) => {
          OpenCreateItemDefModal({
            onSubmit: onChange,
            startingName: query,
          });
          return undefined;
        }}
      />
    ),
  };
}

interface ItemDefSelectItemProps extends ComponentPropsWithoutRef<"div"> {
  label: string;
  group: string;
  imageComponent: ReactNode;
  value: string;
}
const ItemDefSelectItem = forwardRef<HTMLDivElement, ItemDefSelectItemProps>(
  ({ label, imageComponent, ...others }: ItemDefSelectItemProps, ref) => (
    <div ref={ref} {...others}>
      <Text>
        {imageComponent}
        {label}
      </Text>
    </div>
  )
);
ItemDefSelectItem.displayName = "ItemDefSelectItem";
