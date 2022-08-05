import { IconType } from "react-icons";
import { Group, Text } from "@mantine/core";

export type InventoryCategoryLabelProps = {
  category: string;
  categoryIcons: Record<string, IconType>;
};
export function InventoryCategoryLabel({
  category,
  categoryIcons,
}: InventoryCategoryLabelProps) {
  return (
    <Group noWrap spacing="xs">
      {categoryIcons[category]?.({ size: 30 }) ?? null}
      <Text size="1.125em" weight={500}>
        {category}
      </Text>
    </Group>
  );
}
