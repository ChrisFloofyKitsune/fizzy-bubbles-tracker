import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { ActionIcon, ThemeIcon, Center } from "@mantine/core";
import { TbCheck, TbX } from "react-icons/tb";

export function createBooleanPropConfig<
  Object extends {},
  Property extends keyof Object
>(
  prop: Property,
  headerLabel: string,
  order?: number
): PropConfigEntry<Object, Property, boolean> {
  return {
    headerLabel,
    order,
    viewComponent: (value: boolean) => (
      <Center key={"bool-prop-view"}>
        <ThemeIcon
          key={"bool-prop-icon"}
          variant="outline"
          color={value ? "green" : "red"}
        >
          {value ? <TbCheck key={"check"} /> : <TbX key={"x"} />}
        </ThemeIcon>
      </Center>
    ),
    editorComponent: (
      value: any,
      onChange: (value: boolean) => Promise<void>
    ) => (
      <Center key={"bool-prop-edit"}>
        <ActionIcon
          key={"bool-prop-action-icon"}
          variant="filled"
          color={value ? "green" : "red"}
          size={26}
          onClick={async () => await onChange(!value)}
        >
          {value ? <TbCheck key={"check"} /> : <TbX key={"x"} />}
        </ActionIcon>
      </Center>
    ),
  };
}
