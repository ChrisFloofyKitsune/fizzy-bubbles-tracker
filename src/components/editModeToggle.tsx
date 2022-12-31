import { Center, Switch, SwitchProps, Text } from "@mantine/core";
import { EditIcon } from "~/appIcons";

export type EditModeToggleProps = {
  onToggle: (value: boolean) => void;
} & SwitchProps;
export function EditModeToggle({ onToggle, ...props }: EditModeToggleProps) {
  const switchProps: SwitchProps = Object.assign(
    {},
    {
      size: "lg",
      label: (
        <Center>
          <EditIcon />
          <Text weight="bold">Edit Mode</Text>
        </Center>
      ),
      offLabel: "OFF",
      onLabel: "ON",
    },
    props,
    {
      onChange: (event) => {
        onToggle(event.currentTarget.checked);
        props?.onChange?.(event);
      },
    } as SwitchProps
  );
  return (
    <Switch
      styles={{
        root: {
          width: "11em",
        },
      }}
      sx={{
        userSelect: "none",
        cursor: "pointer",
        "& *": {
          cursor: "inherit",
        },
      }}
      {...switchProps}
    />
  );
}
